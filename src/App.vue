<template>
  <div class="h-screen flex flex-col bg-white text-slate-800 font-sans overflow-hidden" @dragover.prevent
    @drop.prevent="handleDrop">

    <TheHeader :title="appTitle" :version="appVersion" :is-loading="isLoading && !isNavigating"
      :loading-text="loadingText" v-model:view-mode="viewMode" @toggle-sidebar="showSidebar = !showSidebar"
      @upload="handleFileUpload" />

    <div class="flex-1 flex overflow-hidden relative">
      <TheSidebar :is-open="showSidebar" v-model:filters="filters" v-model:search-query="searchInput"
        :file-tree="fileTree" :is-empty="files.length === 0" :visible-count="visibleFiles.length"
        :additions="totalAdditions" :deletions="totalDeletions" @close="showSidebar = false" @select-file="selectFile"
        @toggle-folder="toggleFolder" />

      <main class="flex-1 flex flex-col min-w-0 bg-gray-100 relative h-full w-full overflow-hidden">

        <div v-if="isNavigating"
          class="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-300">
          <div class="relative w-12 h-12 mb-4">
            <div class="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div
              class="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent">
            </div>
          </div>
          <div class="text-blue-600 font-semibold text-sm animate-pulse">{{ loadingText }}</div>
        </div>

        <EmptyState v-if="files.length === 0 && !isLoading" v-model="rawInput" />

        <div v-else class="flex-1 flex flex-col h-full overflow-hidden">

          <div class="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-4 scroll-smooth" id="main-scroll">

            <div class="flex justify-between items-center mb-4 sticky top-0 z-10 pointer-events-none">
              <div
                class="bg-white/90 backdrop-blur border border-gray-200 shadow-sm text-xs text-gray-600 font-mono px-3 py-1.5 rounded-full pointer-events-auto">
                Page <b>{{ currentPage }}</b> of <b>{{ totalPages }}</b>
              </div>

              <div
                class="bg-white/90 backdrop-blur border border-gray-200 p-1 rounded shadow-sm pointer-events-auto flex gap-2">
                <button @click="toggleAll(false)"
                  class="text-[10px] px-2 py-1 hover:bg-gray-100 rounded text-gray-600 transition">Collapse All</button>
                <span class="w-px bg-gray-200"></span>
                <button @click="toggleAll(true)"
                  class="text-[10px] px-2 py-1 hover:bg-gray-100 rounded text-gray-600 transition">Expand All</button>
              </div>
            </div>

            <DiffFile v-for="file in paginatedFiles" :key="file.id" :ref="(el) => setFileRef(el, file.id)" :file="file"
              :view-mode="viewMode" :force-collapse="globalCollapseState" />

            <div class="h-24"></div>
          </div>

          <ThePagination :current-page="currentPage" :total-pages="totalPages" :total-results="visibleFiles.length"
            :items-per-page="ITEMS_PER_PAGE" @change-page="changePage" />

        </div>

        <TheFooter />
      </main>
    </div>
  </div>

  <SpeedInsights />
  <Analytics />
</template>

<script setup>
import { ref, computed, watch, nextTick, shallowRef } from 'vue';
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { Analytics } from '@vercel/analytics/vue';
import PatchWorker from './workers/patch.worker.js?worker';

// Import Components
import TheHeader from './components/TheHeader.vue';
import TheSidebar from './components/TheSidebar.vue';
import EmptyState from './components/EmptyState.vue';
import DiffFile from './components/DiffFile.vue';
import ThePagination from './components/ThePagination.vue';
import TheFooter from './components/TheFooter.vue';

// --- CONFIG ---
const SLEEP_TIME = 300;
const ITEMS_PER_PAGE = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || 20);
const appTitle = import.meta.env.VITE_APP_TITLE || 'Simple Git Patch Viewer';
const appVersion = import.meta.env.VITE_APP_VERSION || 'v0.0.1';

// --- STATE ---
const rawInput = ref('');
const files = shallowRef([]);
const isLoading = ref(false);
const isNavigating = ref(false);
const loadingText = ref('');
const showSidebar = ref(false); // State for Mobile Sidebar

const searchInput = ref('');
const searchQuery = ref('');
const filters = ref(['added', 'modified', 'deleted']);
const viewMode = ref('unified');
const expandedPaths = ref({});
const globalCollapseState = ref(null); // State to control Collapse/Expand All
const currentPage = ref(1);

// --- COMPUTED ---
const totalAdditions = computed(() => files.value.reduce((s, f) => s + f.additions, 0));
const totalDeletions = computed(() => files.value.reduce((s, f) => s + f.deletions, 0));

const visibleFiles = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return files.value.filter(f => f.name.toLowerCase().includes(q) && filters.value.includes(f.status));
});

const totalPages = computed(() => Math.ceil(visibleFiles.value.length / ITEMS_PER_PAGE) || 1);

const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return visibleFiles.value.slice(start, end);
});

// FileTree logic (Compatible with FileTree.vue component)
const fileTree = computed(() => {
  const root = [];
  const add = (parts, level, file, parentPath = '') => {
    const part = parts[0];
    const curPath = parentPath ? `${parentPath}/${part}` : part;
    let node = level.find(n => n.name === part);
    if (!node) {
      node = {
        name: part,
        path: curPath,
        isFile: parts.length === 1, // Use isFile flag
        children: [],
        isOpen: expandedPaths.value[curPath] !== undefined ? expandedPaths.value[curPath] : true,
        fileId: parts.length === 1 ? file.id : null,
        status: parts.length === 1 ? file.status : null
      };
      level.push(node);
      level.sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    }
    if (parts.length > 1) add(parts.slice(1), node.children, file, curPath);
  };
  visibleFiles.value.forEach(f => add(f.name.split('/'), root, f));
  return root;
});

const toggleFolder = (node) => {
  const path = node.path || node;
  const current = expandedPaths.value[path] !== undefined ? expandedPaths.value[path] : true;
  expandedPaths.value = { ...expandedPaths.value, [path]: !current };
};

// --- WATCHERS ---
let timeout;
watch(searchInput, (val) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => { searchQuery.value = val; }, 300);
});

watch([searchQuery, filters], () => {
  currentPage.value = 1;
});

watch(rawInput, (val) => {
  if (val) processContent(val);
});

// --- WORKER LOGIC ---
const processContent = (content) => {
  isLoading.value = true;
  loadingText.value = 'Parsing in background...';

  const worker = new PatchWorker();

  worker.onmessage = (e) => {
    // Support receiving results from Worker
    if (e.data.status === 'success' || e.data.type === 'done') {
      const data = e.data.data;
      files.value = Object.freeze(data);
      currentPage.value = 1;
    } else {
      alert('Error parsing');
    }
    isLoading.value = false;
    worker.terminate();
  };

  // Send parse command (Support both old {text} and new {type, content} format)
  worker.postMessage({ type: 'parse', content: content, text: content });
};

// --- ACTIONS ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const changePage = async (page) => {
  let p = parseInt(page);
  if (isNaN(p)) p = 1;
  if (p < 1) p = 1;
  if (p > totalPages.value) p = totalPages.value;

  isNavigating.value = true;
  loadingText.value = 'Loading page...';
  await sleep(SLEEP_TIME);

  currentPage.value = p;
  document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  isNavigating.value = false;
};

// Scroll & Highlight
const fileRefs = ref({});
const setFileRef = (el, id) => { if (el) fileRefs.value[id] = el; };

const selectFile = async (id) => {
  showSidebar.value = false; // Close Sidebar on Mobile

  const index = visibleFiles.value.findIndex(f => f.id === id);
  if (index === -1) return;

  const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;

  if (targetPage !== currentPage.value) {
    isNavigating.value = true;
    loadingText.value = `Jumping to page ${targetPage}...`;
    await sleep(SLEEP_TIME);

    currentPage.value = targetPage;
    await nextTick();
    scrollToElement(id);
    isNavigating.value = false;
  } else {
    scrollToElement(id);
  }
};

const scrollToElement = (id) => {
  const fileComp = fileRefs.value[id];
  if (fileComp) fileComp.highlight(); // Call highlight method of child component

  nextTick(() => {
    const el = document.getElementById('file-' + id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

const handleFileUpload = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = (ev) => processContent(ev.target.result);
  r.readAsText(f);
};

const handleDrop = (e) => {
  const f = e.dataTransfer.files[0];
  if (f) handleFileUpload({ target: { files: [f] } });
};

const toggleAll = (expand) => {
  globalCollapseState.value = !expand; // Reverse logic: true = expand all
  setTimeout(() => globalCollapseState.value = null, 100);
};
</script>

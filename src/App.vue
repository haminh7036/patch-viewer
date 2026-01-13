<template>
  <div class="flex flex-col h-screen" @dragover.prevent @drop.prevent="handleDrop">

    <header
      class="sticky top-0 bg-gray-900 text-white px-3 py-2 shadow-md flex justify-between items-center z-40 shrink-0 h-14">
      <div class="flex items-center gap-3">
        <button @click="toggleSidebar" class="md:hidden p-1 rounded hover:bg-gray-700">
          <Menu class="w-5 h-5 text-gray-300" />
        </button>

        <div class="flex items-center gap-2">
          <GitCompare class="text-blue-400 w-5 h-5 hidden sm:block" />
          <h1 class="font-bold text-base leading-none">{{ appTitle }} <span
              class="text-[10px] font-normal text-gray-400 bg-gray-800 px-1 py-0.5 rounded">{{ appVersion }}</span>
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-4">
        <div v-if="isLoading && !isNavigating"
          class="flex items-center gap-2 bg-blue-600/30 px-2 py-1 rounded text-[10px] text-blue-200">
          <div class="spinner"></div>
          <span class="hidden sm:inline">{{ loadingText }}</span>
        </div>

        <div class="flex bg-gray-800 rounded p-0.5 border border-gray-700">
          <button @click="viewMode = 'unified'"
            :class="viewMode === 'unified' ? 'bg-gray-600 text-white' : 'text-gray-400'"
            class="p-1.5 rounded transition" title="Unified View">
            <AlignJustify class="w-4 h-4" />
          </button>
          <button @click="viewMode = 'split'" :class="viewMode === 'split' ? 'bg-gray-600 text-white' : 'text-gray-400'"
            class="p-1.5 rounded transition" title="Split View">
            <Columns class="w-4 h-4" />
          </button>
        </div>

        <label
          class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded transition shadow flex items-center gap-1.5">
          <Upload class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Upload</span>
          <input type="file" @change="handleFileUpload" accept=".patch,.diff,.txt" class="hidden">
        </label>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative">

      <div v-if="showSidebar" @click="showSidebar = false" class="fixed inset-0 bg-black/50 z-20 md:hidden"></div>

      <div :class="[
        'absolute md:static top-0 bottom-0 left-0 w-3/4 max-w-[300px] md:w-1/4 md:min-w-[250px] bg-white border-r border-gray-200 flex flex-col z-20 shadow-xl md:shadow-none transition-transform duration-300',
        showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]">

        <div class="p-3 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
          <div class="flex gap-1 justify-between">
            <label v-for="status in ['added', 'modified', 'deleted']" :key="status"
              class="flex flex-1 justify-center items-center gap-1 text-[10px] uppercase font-bold py-1.5 rounded border cursor-pointer select-none transition"
              :class="getFilterClass(status)">
              <input type="checkbox" v-model="filters" :value="status" class="hidden">
              {{ status }}
            </label>
          </div>
          <div class="relative group">
            <input v-model="searchInput" @input="debouncedSearch" type="text" placeholder="File search..."
              class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none">
            <Search class="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
          <div v-if="files.length === 0" class="text-center text-gray-400 text-xs mt-10">File not found</div>
          <FileTree :nodes="fileTree" :depth="0" @select-file="selectFile" @toggle-folder="toggleFolder" />
        </div>

        <div class="p-2 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500 flex justify-between">
          <span>{{ visibleFiles.length }} files</span>
          <span class="font-mono"><span class="text-green-600">+{{ totalAdditions }}</span> <span
              class="text-red-600">-{{ totalDeletions }}</span></span>
        </div>
      </div>

      <div class="flex-1 bg-gray-100 relative overflow-hidden flex flex-col w-full">

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

        <div v-if="files.length === 0 && !isLoading"
          class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-slate-50 p-4">
          <div
            class="border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-10 flex flex-col items-center max-w-lg w-full bg-white">
            <FileDiff class="w-12 h-12 mb-4 text-gray-300" />
            <h3 class="text-base font-semibold text-gray-600 text-center">Upload file .patch / .diff</h3>
            <p class="text-xs text-gray-400 mb-4 text-center">Or paste content into this textarea below</p>
            <textarea v-model="rawInput" @input="debouncedPaste" placeholder="Diff content here..."
              class="w-full h-32 p-3 text-xs bg-gray-50 border rounded resize-none focus:ring-1 focus:ring-blue-500 outline-none code-font"></textarea>
          </div>
        </div>

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

            <div v-for="file in paginatedFiles" :key="file.id" :id="'file-' + file.id"
              class="mb-6 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-300 scroll-mt-20"
              :class="{
                'ring-2 ring-blue-500': fileStates[file.id]?.highlighted
              }">

              <div @click="toggleFile(file.id)"
                class="px-3 py-2 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none bg-gray-50 hover:bg-gray-100 transition">
                <div class="flex items-center gap-2 overflow-hidden w-full">
                  <ChevronRight v-if="fileStates[file.id]?.collapsed" class="w-4 h-4 text-gray-500 shrink-0" />
                  <ChevronDown v-else class="w-4 h-4 text-gray-500 shrink-0" />
                  <span class="font-mono text-xs md:text-sm font-semibold text-gray-700 truncate" :title="file.name">{{
                    file.name }}</span>
                  <span :class="getStatusBadge(file.status)"
                    class="text-[9px] font-bold px-1.5 rounded border uppercase shrink-0">{{ file.status }}</span>
                </div>
              </div>

              <div v-if="!fileStates[file.id]?.collapsed" class="overflow-x-auto">
                <div v-if="file.isGenerated && !fileStates[file.id]?.showGenerated"
                  class="py-10 flex flex-col items-center justify-center bg-gray-50/30">
                  <button @click="forceUpdateFile(file.id)"
                    class="text-blue-600 text-sm font-semibold hover:underline mb-1">Load Diff</button>
                  <p class="text-xs text-gray-500">Some generated files are not rendered by default.</p>
                </div>

                <template v-else>
                  <table v-if="viewMode === 'unified'"
                    class="w-full text-left border-collapse code-font min-w-[600px] md:min-w-full">
                    <tbody v-for="(chunk, idx) in file.chunks" :key="idx">
                      <tr class="bg-blue-50/50 text-blue-500">
                        <td colspan="3" class="px-2 py-1 border-y border-blue-100/50 text-[10px] font-mono select-none">
                          {{
                            chunk.header }}</td>
                      </tr>
                      <tr v-for="line in chunk.lines" :key="line.id" class="hover:bg-gray-50">
                        <td
                          class="w-8 md:w-12 px-1 text-right text-gray-400 select-none border-r border-gray-100 bg-gray-50/50 text-[10px] pt-1">
                          {{ line.oldNo }}</td>
                        <td
                          class="w-8 md:w-12 px-1 text-right text-gray-400 select-none border-r border-gray-100 bg-gray-50/50 text-[10px] pt-1">
                          {{ line.newNo }}</td>
                        <td class="px-2 whitespace-pre pr-2 relative pt-0.5 pb-0.5" :style="getLineStyle(line.type)">
                          <span v-if="line.type === 'add'" class="absolute left-1 text-green-700 select-none">+</span>
                          <span v-else-if="line.type === 'del'"
                            class="absolute left-1 text-red-700 select-none">-</span>
                          <span class="pl-4 block">{{ line.content }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table v-else class="w-full text-left border-collapse code-font table-fixed min-w-[800px]">
                    <colgroup>
                      <col class="w-[40px]">
                      <col class="w-[calc(50%-40px)]">
                      <col class="w-[40px]">
                      <col class="w-[calc(50%-40px)]">
                    </colgroup>
                    <tbody v-for="(chunk, idx) in file.splitChunks" :key="idx">
                      <tr class="bg-blue-50/50 text-blue-500">
                        <td colspan="4" class="px-2 py-1 border-y border-blue-100/50 text-[10px] font-mono select-none">
                          {{
                            chunk.header }}</td>
                      </tr>
                      <tr v-for="row in chunk.rows" :key="row.id" class="border-b border-gray-50 group">
                        <td
                          class="px-1 text-right text-gray-400 select-none border-r border-gray-200 bg-gray-50 text-[10px] pt-1">
                          {{ row.left ? row.left.no : '' }}</td>
                        <td class="whitespace-pre overflow-hidden relative pt-0.5 pb-0.5"
                          :class="!row.left ? 'empty-cell' : ''" :style="row.left ? getLineStyle(row.left.type) : {}">
                          <span v-if="row.left && row.left.type === 'del'"
                            class="absolute left-1 text-red-700 select-none">-</span>
                          <span v-if="row.left" class="pl-3 block">{{ row.left.content }}</span>
                        </td>
                        <td
                          class="px-1 text-right text-gray-400 select-none border-l border-r border-gray-200 bg-gray-50 text-[10px] pt-1">
                          {{ row.right ? row.right.no : '' }}</td>
                        <td class="whitespace-pre overflow-hidden relative pt-0.5 pb-0.5"
                          :class="!row.right ? 'empty-cell' : ''"
                          :style="row.right ? getLineStyle(row.right.type) : {}">
                          <span v-if="row.right && row.right.type === 'add'"
                            class="absolute left-1 text-green-700 select-none">+</span>
                          <span v-if="row.right" class="pl-3 block">{{ row.right.content }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </template>
              </div>
            </div>

            <div class="h-24"></div>
          </div>

          <div
            class="border-t border-gray-200 bg-white px-4 py-2 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 shrink-0 h-12">

            <div class="flex flex-1 justify-between sm:hidden">
              <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
                Previous
              </button>
              <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                class="relative ml-3 inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
                Next
              </button>
            </div>

            <div class="hidden sm:flex flex-1 items-center justify-between">
              <div>
                <p class="text-xs text-gray-700">
                  <template v-if="visibleFiles.length > 0">
                    Showing
                    <span class="font-medium">{{ (currentPage - 1) * ITEMS_PER_PAGE + 1 }}</span>
                    to
                    <span class="font-medium">{{ Math.min(currentPage * ITEMS_PER_PAGE, visibleFiles.length) }}</span>
                    of
                    <span class="font-medium">{{ visibleFiles.length }}</span>
                    results
                  </template>
                  <template v-else>
                    <span class="text-gray-500 italic">No results found</span>
                  </template>
                </p>
              </div>
              <div>
                <nav class="isolate inline-flex -space-x-px rounded shadow-sm" aria-label="Pagination">
                  <button @click="changePage(currentPage - 1)"
                    :disabled="currentPage === 1 || visibleFiles.length === 0"
                    class="relative inline-flex items-center rounded-l px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition">
                    <span class="sr-only">Previous</span>
                    <ChevronDown class="h-3.5 w-3.5 rotate-90" aria-hidden="true" />
                  </button>

                  <div
                    class="relative inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 bg-white">
                    Page
                    <input type="number" :value="currentPage" @change="changePage($event.target.value)"
                      :disabled="visibleFiles.length === 0"
                      class="w-8 mx-1.5 text-center border-b border-gray-300 focus:border-blue-500 outline-none p-0 text-xs bg-transparent disabled:opacity-50 transition-colors"
                      min="1" :max="totalPages">
                    of {{ totalPages }}
                  </div>

                  <button @click="changePage(currentPage + 1)"
                    :disabled="currentPage === totalPages || visibleFiles.length === 0"
                    class="relative inline-flex items-center rounded-r px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition">
                    <span class="sr-only">Next</span>
                    <ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>

    <footer
      class="bg-white border-t border-gray-200 px-4 py-1.5 flex justify-end items-center text-[11px] text-gray-500 shrink-0 z-30 select-none">
      <a href="https://github.com/haminh7036/patch-viewer" target="_blank" rel="noopener noreferrer"
        class="flex items-center gap-1.5 hover:text-gray-900 transition py-0.5">
        <span>View source on</span>
        <Github class="w-3.5 h-3.5" />
        <span class="font-semibold">GitHub</span>
      </a>
    </footer>

  </div>

  <SpeedInsights />
  <Analytics />
</template>

<script setup>
import { ref, computed, nextTick, shallowRef, reactive, watch } from 'vue';
import { Menu, GitCompare, AlignJustify, Columns, Upload, Search, FileDiff, ChevronDown, ChevronRight, Github } from 'lucide-vue-next';
import FileTree from './components/FileTree.vue';
import PatchWorker from './workers/patch.worker.js?worker';
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { Analytics } from '@vercel/analytics/vue';

// --- CONFIGURATION ---
const SLEEP_TIME = 300;
const ITEMS_PER_PAGE = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || 20);

const appTitle = import.meta.env.VITE_APP_TITLE;
const appVersion = import.meta.env.VITE_APP_VERSION;

const rawInput = ref('');
const files = shallowRef([]); // Data frozen
const fileStates = reactive({}); // UI State

const searchInput = ref('');
const searchQuery = ref('');
const filters = ref(['added', 'modified', 'deleted']);
const viewMode = ref('unified');

const isLoading = ref(false);
const isNavigating = ref(false);
const loadingText = ref('');
const showSidebar = ref(false);

const expandedPaths = ref({});

// --- PAGINATION ---
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

watch([searchQuery, filters], () => {
  currentPage.value = 1;
});

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
        type: parts.length === 1 ? 'file' : 'folder',
        children: [],
        expanded: expandedPaths.value[curPath] !== undefined ? expandedPaths.value[curPath] : true,
        fileData: parts.length === 1 ? file : null
      };
      level.push(node);
      level.sort((a, b) => (a.type === 'folder' ? -1 : 1));
    }
    if (parts.length > 1) add(parts.slice(1), node.children, file, curPath);
  };
  visibleFiles.value.forEach(f => add(f.name.split('/'), root, f));
  return root;
});

const toggleFolder = (path) => {
  const current = expandedPaths.value[path] !== undefined ? expandedPaths.value[path] : true;
  expandedPaths.value = { ...expandedPaths.value, [path]: !current };
};

// --- WORKER ---

const processWithWorker = (content) => {
  isLoading.value = true;
  loadingText.value = 'Parsing in background...';

  Object.keys(fileStates).forEach(key => delete fileStates[key]);

  const worker = new PatchWorker();

  worker.onmessage = (e) => {
    if (e.data.status === 'success') {
      const rawData = e.data.data;

      rawData.forEach(f => {
        fileStates[f.id] = { collapsed: false, showGenerated: false, highlighted: false };
      });

      files.value = Object.freeze(rawData);
      currentPage.value = 1;

      console.log(`Parsed in ${e.data.time?.toFixed(2)}ms`);
    } else {
      console.error(e.data.error);
      alert('Error parsing patch file');
    }
    isLoading.value = false;
    worker.terminate();
  };

  worker.onerror = (err) => {
    console.error(err);
    isLoading.value = false;
    worker.terminate();
  };

  worker.postMessage({ text: content });
};

// --- NAVIGATION ---

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

const selectFile = async (id) => {
  showSidebar.value = false;

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
  if (fileStates[id]) fileStates[id].collapsed = false;

  nextTick(() => {
    const el = document.getElementById('file-' + id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Apply Highlight Logic
      if (fileStates[id]) {
        fileStates[id].highlighted = true;
        setTimeout(() => {
          if (fileStates[id]) fileStates[id].highlighted = false;
        }, 2000); // Remove after 2s
      }
    }
  });
};

// --- EVENTS ---

let timeout;
const debouncedPaste = () => {
  isLoading.value = true;
  loadingText.value = 'Waiting...';
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    processWithWorker(rawInput.value);
  }, 800);
};

const debouncedSearch = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => { searchQuery.value = searchInput.value; }, 300);
};

const handleFileUpload = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  isLoading.value = true; loadingText.value = 'Reading...';
  const r = new FileReader();
  r.onload = (ev) => {
    processWithWorker(ev.target.result);
    rawInput.value = '';
  };
  r.readAsText(f);
};

const handleDrop = (e) => {
  const f = e.dataTransfer.files[0];
  if (f) handleFileUpload({ target: { files: [f] } });
};

const toggleSidebar = () => showSidebar.value = !showSidebar.value;

const toggleFile = (id) => {
  if (fileStates[id]) {
    fileStates[id].collapsed = !fileStates[id].collapsed;
  }
};

const forceUpdateFile = (id) => {
  if (fileStates[id]) {
    fileStates[id].showGenerated = true;
  }
}

const toggleAll = (collapse) => {
  Object.keys(fileStates).forEach(id => {
    fileStates[id].collapsed = !collapse;
  });
};

const getStatusBadge = (s) => s === 'added' ? 'bg-green-100 text-green-800 border-green-200' : (s === 'deleted' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200');
const getFilterClass = (s) => filters.value.includes(s) ? (s === 'added' ? 'bg-green-100 border-green-300 text-green-800' : (s === 'deleted' ? 'bg-red-100 border-red-300 text-red-800' : 'bg-blue-100 border-blue-300 text-blue-800')) : 'bg-white border-gray-200 text-gray-400 grayscale opacity-60';
const getLineStyle = (type) => {
  if (type === 'add') return { backgroundColor: 'var(--bg-add)', color: 'var(--text-add)' };
  if (type === 'del') return { backgroundColor: 'var(--bg-del)', color: 'var(--text-del)' };
  return { color: '#24292f' };
};
</script>

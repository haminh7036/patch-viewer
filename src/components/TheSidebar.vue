<template>
    <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 bg-black/50 z-20 md:hidden"></div>

    <div :class="[
        'absolute md:static top-0 bottom-0 left-0 w-3/4 max-w-[300px] md:w-1/4 md:min-w-[250px] bg-white border-r border-gray-200 flex flex-col z-20 shadow-xl md:shadow-none transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]">
        <div class="p-3 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
            <div class="flex gap-1 justify-between">
                <label v-for="status in ['added', 'modified', 'deleted']" :key="status"
                    class="flex flex-1 justify-center items-center gap-1 text-[10px] uppercase font-bold py-1.5 rounded border cursor-pointer select-none transition"
                    :class="getFilterClass(status, filters)">
                    <input type="checkbox" :value="status" v-model="localFilters" class="hidden">
                    {{ status }}
                </label>
            </div>
            <div class="relative group">
                <input :value="searchQuery" @input="$emit('update:searchQuery', $event.target.value)" type="text"
                    placeholder="File search..."
                    class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none">
                <Search class="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
            <div v-if="isEmpty" class="text-center text-gray-400 text-xs mt-10">File not found</div>
            <FileTree :nodes="fileTree" :depth="0" @select-file="$emit('select-file', $event)"
                @toggle-folder="$emit('toggle-folder', $event)" />
        </div>

        <div class="p-2 border-t border-gray-200 bg-gray-50 text-[10px] text-gray-500 flex justify-between">
            <span>{{ visibleCount }} files</span>
            <span class="font-mono">
                <span class="text-green-600">+{{ additions }}</span>
                <span class="text-red-600">-{{ deletions }}</span>
            </span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { Search } from 'lucide-vue-next';
import FileTree from './FileTree.vue'; // Use FileTree component
import { getFilterClass } from '../utils/uiHelpers';

const props = defineProps({
    isOpen: Boolean,
    filters: Array,
    searchQuery: String,
    fileTree: Array,
    isEmpty: Boolean,
    visibleCount: Number, // Renamed prop for clarity
    additions: Number,
    deletions: Number
});

const emit = defineEmits(['close', 'update:filters', 'update:searchQuery', 'select-file', 'toggle-folder']);

const localFilters = computed({
    get: () => props.filters,
    set: (val) => emit('update:filters', val)
});
</script>

<template>
    <header
        class="sticky top-0 bg-gray-900 text-white px-3 py-2 shadow-md flex justify-between items-center z-40 shrink-0 h-14">
        <div class="flex items-center gap-3">
            <button @click="$emit('toggle-sidebar')" class="md:hidden p-1 rounded hover:bg-gray-700">
                <Menu class="w-5 h-5 text-gray-300" />
            </button>

            <div class="flex items-center gap-2">
                <GitCompare class="text-blue-400 w-5 h-5 hidden sm:block" />
                <h1 class="font-bold text-base leading-none">{{ title }}
                    <span class="text-[10px] font-normal text-gray-400 bg-gray-800 px-1 py-0.5 rounded">
                        {{ version }}
                    </span>
                </h1>
            </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
            <div v-if="isLoading"
                class="flex items-center gap-2 bg-blue-600/30 px-2 py-1 rounded text-[10px] text-blue-200">
                <div class="spinner"></div>
                <span class="hidden sm:inline">{{ loadingText }}</span>
            </div>

            <div class="flex bg-gray-800 rounded p-0.5 border border-gray-700">
                <button @click="$emit('update:viewMode', 'unified')"
                    :class="viewMode === 'unified' ? 'bg-gray-600 text-white' : 'text-gray-400'"
                    class="p-1.5 rounded transition" title="Unified View">
                    <AlignJustify class="w-4 h-4" />
                </button>
                <button @click="$emit('update:viewMode', 'split')"
                    :class="viewMode === 'split' ? 'bg-gray-600 text-white' : 'text-gray-400'"
                    class="p-1.5 rounded transition" title="Split View">
                    <Columns class="w-4 h-4" />
                </button>
            </div>

            <label
                class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded transition shadow flex items-center gap-1.5">
                <Upload class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Upload</span>
                <input type="file" @change="$emit('upload', $event)" accept=".patch,.diff,.txt" class="hidden">
            </label>
        </div>
    </header>
</template>

<script setup>
import { Menu, GitCompare, AlignJustify, Columns, Upload } from 'lucide-vue-next';

defineProps({
    title: String,
    version: String,
    isLoading: Boolean,
    loadingText: String,
    viewMode: String
});

defineEmits(['toggle-sidebar', 'update:viewMode', 'upload']);
</script>

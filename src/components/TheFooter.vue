<template>
    <footer
        class="bg-white border-t border-gray-200 px-4 py-1.5 flex justify-end items-center text-[11px] text-gray-500 shrink-0 z-30 select-none">
        <a href="https://github.com/haminh7036/patch-viewer" target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-1.5 hover:text-gray-900 transition py-0.5">
            <span>View source on</span>
            <Github class="w-3.5 h-3.5" />
            <span class="font-semibold">GitHub</span>
        </a>
    </footer>
</template>

<script setup>
import { Github } from 'lucide-vue-next';
</script>

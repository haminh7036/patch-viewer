<template>
    <ul class="text-sm">
        <li v-for="node in nodes" :key="node.path" class="select-none">
            <div v-if="!node.isFile" class="group">
                <div @click="$emit('toggle-folder', node)"
                    class="flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-gray-100 text-gray-700 rounded transition-colors">
                    <component :is="node.isOpen ? FolderOpen : Folder"
                        class="w-4 h-4 text-blue-400 shrink-0 fill-current" />
                    <span class="truncate font-medium text-xs">{{ node.name }}</span>
                </div>

                <div v-show="node.isOpen" class="pl-3 border-l border-gray-100 ml-2">
                    <FileTree :nodes="node.children" :depth="depth + 1" @select-file="$emit('select-file', $event)"
                        @toggle-folder="$emit('toggle-folder', $event)" />
                </div>
            </div>

            <div v-else @click="$emit('select-file', node.fileId)"
                class="flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded transition-colors group">
                <span :class="getStatusDot(node.status)" class="w-1.5 h-1.5 rounded-full shrink-0"></span>
                <span class="truncate text-xs">{{ node.name }}</span>
            </div>
        </li>
    </ul>
</template>

<script setup>
import { Folder, FolderOpen } from 'lucide-vue-next';
import { getStatusDot } from '../utils/uiHelpers'; // Import helper function

defineProps({
    nodes: Array,
    depth: Number
});

defineEmits(['select-file', 'toggle-folder']);
</script>

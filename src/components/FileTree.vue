<template>
    <ul class="pl-2">
        <li v-for="node in nodes" :key="node.path">
            <div class="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                @click="(e) => handleClick(node, e)">
                <FolderOpen v-if="node.type === 'folder' && node.expanded"
                    class="w-3.5 h-3.5 text-blue-400 fill-current opacity-80" />
                <Folder v-else-if="node.type === 'folder'" class="w-3.5 h-3.5 text-blue-400 fill-current opacity-80" />
                <FileCode v-else class="w-3.5 h-3.5 text-gray-400" />

                <span class="text-xs truncate flex-1"
                    :class="node.type === 'folder' ? 'font-medium text-gray-700' : 'text-gray-600 font-mono'">
                    {{ node.name }}
                </span>

                <span v-if="node.type === 'file'" class="w-1.5 h-1.5 rounded-full mr-1"
                    :class="getStatusDot(node.fileData.status)"></span>
            </div>

            <div v-if="node.type === 'folder' && node.expanded" class="border-l border-gray-200 ml-2">
                <FileTree :nodes="node.children" :depth="depth + 1" @select-file="$emit('select-file', $event)"
                    @toggle-folder="$emit('toggle-folder', $event)" />
            </div>
        </li>
    </ul>
</template>

<script setup>
import { Folder, FolderOpen, FileCode } from 'lucide-vue-next';

const props = defineProps(['nodes', 'depth']);
const emit = defineEmits(['select-file', 'toggle-folder']);

const handleClick = (node, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (node.type === 'folder') {
        emit('toggle-folder', node.path);
    } else {
        emit('select-file', node.fileData.id);
    }
};

const getStatusDot = (s) => {
    if (s === 'added') return 'bg-green-500';
    if (s === 'deleted') return 'bg-red-500';
    return 'bg-blue-400';
};
</script>

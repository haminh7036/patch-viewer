<template>
    <div :id="'file-' + file.id"
        class="mb-6 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-300 scroll-mt-20"
        :class="{ 'ring-2 ring-blue-500': isHighlighted }">

        <div @click="isCollapsed = !isCollapsed"
            class="px-3 py-2 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none bg-gray-50 hover:bg-gray-100 transition">
            <div class="flex items-center gap-2 overflow-hidden w-full">
                <component :is="isCollapsed ? ChevronRight : ChevronDown" class="w-4 h-4 text-gray-500 shrink-0" />
                <span class="font-mono text-xs md:text-sm font-semibold text-gray-700 truncate" :title="file.name">
                    {{ file.name }}
                </span>
                <span :class="getStatusBadge(file.status)"
                    class="text-[9px] font-bold px-1.5 rounded border uppercase shrink-0">
                    {{ file.status }}
                </span>
            </div>
            <div class="text-[9px] text-gray-500 shrink-0 font-mono ml-2">
                <span class="text-green-600">+{{ file.additions }}</span>
                <span class="text-red-600 ml-1">-{{ file.deletions }}</span>
            </div>
        </div>

        <div v-if="!isCollapsed" class="overflow-x-auto">
            <!-- Large file diff (> 400 lines) hidden by default -->
            <div v-if="file.isLargeFile && !showLargeDiff"
                class="py-10 flex flex-col items-center justify-center bg-amber-50/30">
                <button @click="showLargeDiff = true"
                    class="text-amber-600 text-sm font-semibold hover:underline mb-1">Load Diff</button>
                <p class="text-xs text-gray-500">Large diff not rendered by default ({{ file.totalLines }} lines).</p>
            </div>

            <!-- Generated file diff hidden by default -->
            <div v-else-if="file.isGenerated && !showGenerated"
                class="py-10 flex flex-col items-center justify-center bg-gray-50/30">
                <button @click="showGenerated = true"
                    class="text-blue-600 text-sm font-semibold hover:underline mb-1">Load Diff</button>
                <p class="text-xs text-gray-500">Some generated files are not rendered by default.</p>
            </div>

            <template v-else>
                <table v-if="viewMode === 'unified'"
                    class="w-full text-left border-collapse code-font min-w-[600px] md:min-w-full">
                    <tbody v-for="(chunk, idx) in file.chunks" :key="idx">
                        <tr class="bg-blue-50/50 text-blue-500">
                            <td colspan="3"
                                class="px-2 py-1 border-y border-blue-100/50 text-[10px] font-mono select-none">
                                {{ chunk.header }}
                            </td>
                        </tr>
                        <tr v-for="line in chunk.lines" :key="line.id" class="hover:bg-gray-50">
                            <td
                                class="w-8 md:w-12 px-1 text-right text-gray-400 select-none border-r border-gray-100 bg-gray-50/50 text-[10px] pt-1">
                                {{ line.oldNo }}</td>
                            <td
                                class="w-8 md:w-12 px-1 text-right text-gray-400 select-none border-r border-gray-100 bg-gray-50/50 text-[10px] pt-1">
                                {{ line.newNo }}</td>
                            <td class="px-2 whitespace-pre pr-2 relative pt-0.5 pb-0.5"
                                :style="getLineStyle(line.type)">
                                <span v-if="line.type === 'add'"
                                    class="absolute left-1 text-green-700 select-none">+</span>
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
                            <td colspan="4"
                                class="px-2 py-1 border-y border-blue-100/50 text-[10px] font-mono select-none">
                                {{ chunk.header }}
                            </td>
                        </tr>
                        <tr v-for="row in chunk.rows" :key="row.id" class="border-b border-gray-50 group">
                            <td
                                class="px-1 text-right text-gray-400 select-none border-r border-gray-200 bg-gray-50 text-[10px] pt-1">
                                {{ row.left ? row.left.no : '' }}</td>
                            <td class="whitespace-pre overflow-hidden relative pt-0.5 pb-0.5"
                                :class="!row.left ? 'empty-cell' : ''"
                                :style="row.left ? getLineStyle(row.left.type) : {}">
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
</template>

<script setup>
import { ref, watch } from 'vue';
import { ChevronDown, ChevronRight } from 'lucide-vue-next';
import { getStatusBadge, getLineStyle } from '../utils/uiHelpers';

const props = defineProps(['file', 'viewMode', 'forceCollapse']);

// Local state for component
const isCollapsed = ref(false);
const showGenerated = ref(false);
const showLargeDiff = ref(false);  // For large diffs (> 400 lines)
const isHighlighted = ref(false);

// Watch forceCollapse from parent (to implement Expand/Collapse All button)
watch(() => props.forceCollapse, (val) => {
    if (val !== null) isCollapsed.value = val;
});

// Method for parent to call (when clicking from Sidebar)
const highlight = () => {
    isCollapsed.value = false;
    isHighlighted.value = true;
    setTimeout(() => isHighlighted.value = false, 2000);
};

defineExpose({ highlight });
</script>

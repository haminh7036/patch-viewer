<template>
    <div
        class="border-t border-gray-200 bg-white px-4 py-2 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 shrink-0 h-12">

        <div class="flex flex-1 justify-between sm:hidden">
            <button @click="$emit('change-page', currentPage - 1)" :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
                Previous
            </button>
            <button @click="$emit('change-page', currentPage + 1)" :disabled="currentPage === totalPages"
                class="relative ml-3 inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
                Next
            </button>
        </div>

        <div class="hidden sm:flex flex-1 items-center justify-between">
            <div>
                <p class="text-xs text-gray-700">
                    <template v-if="totalResults > 0">
                        Showing
                        <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                        to
                        <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalResults) }}</span>
                        of
                        <span class="font-medium">{{ totalResults }}</span>
                        results
                    </template>
                    <template v-else>
                        <span class="text-gray-500 italic">No results found</span>
                    </template>
                </p>
            </div>
            <div>
                <nav class="isolate inline-flex -space-x-px rounded shadow-sm" aria-label="Pagination">
                    <button @click="$emit('change-page', currentPage - 1)"
                        :disabled="currentPage === 1 || totalResults === 0"
                        class="relative inline-flex items-center rounded-l px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition">
                        <span class="sr-only">Previous</span>
                        <ChevronDown class="h-3.5 w-3.5 rotate-90" aria-hidden="true" />
                    </button>

                    <div
                        class="relative inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 bg-white">
                        Page
                        <input type="number" :value="currentPage" @change="$emit('change-page', $event.target.value)"
                            :disabled="totalResults === 0"
                            class="w-8 mx-1.5 text-center border-b border-gray-300 focus:border-blue-500 outline-none p-0 text-xs bg-transparent disabled:opacity-50 transition-colors"
                            min="1" :max="totalPages">
                        of {{ totalPages }}
                    </div>

                    <button @click="$emit('change-page', currentPage + 1)"
                        :disabled="currentPage === totalPages || totalResults === 0"
                        class="relative inline-flex items-center rounded-r px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition">
                        <span class="sr-only">Next</span>
                        <ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ChevronDown, ChevronRight } from 'lucide-vue-next';

defineProps({
    currentPage: Number,
    totalPages: Number,
    totalResults: Number,
    itemsPerPage: Number
});

defineEmits(['change-page']);
</script>

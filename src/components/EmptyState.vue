<template>
    <div class="flex-1 w-full h-full flex flex-col items-center justify-center text-gray-400 bg-slate-50 p-4">
        <div
            class="border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-10 flex flex-col items-center max-w-lg w-full bg-white">
            <FileDiff class="w-12 h-12 mb-4 text-gray-300" />
            <h3 class="text-base font-semibold text-gray-600 text-center">Upload file .patch / .diff</h3>
            <p class="text-xs text-gray-400 mb-4 text-center">Or paste content into this textarea below</p>
            <textarea :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
                placeholder="Diff content here..."
                class="w-full h-32 p-3 text-xs bg-gray-50 border rounded resize-none focus:ring-1 focus:ring-blue-500 outline-none code-font"></textarea>
        </div>
    </div>
</template>

<script setup>
import { FileDiff } from 'lucide-vue-next';
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>

import { parsePatch } from '../utils/patchParser.js';

self.onmessage = (e) => {
    // Support both old and new message format for safety
    const text = e.data.text || e.data.content;

    if (!text) {
        self.postMessage({ status: 'error', error: 'No content received' });
        return;
    }

    try {
        const start = performance.now();
        const result = parsePatch(text);
        const time = performance.now() - start;

        self.postMessage({
            status: 'success', // Or 'done'
            type: 'done',      // Add type for easy handling in App.vue
            data: result,
            time
        });
    } catch (error) {
        self.postMessage({
            status: 'error',
            type: 'error',
            error: error.message
        });
    }
};

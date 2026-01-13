import { parsePatch } from '../utils/patchParser.js';

self.onmessage = (e) => {
    const { text } = e.data;
    try {
        // Run parsePatch
        const start = performance.now();
        const result = parsePatch(text);
        const time = performance.now() - start;

        // Send result into App.vue
        self.postMessage({
            status: 'success',
            data: result,
            time
        });
    } catch (error) {
        self.postMessage({
            status: 'error',
            error: error.message
        });
    }
};

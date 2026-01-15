// Thresholds for large diff detection (inspired by GitHub's approach)
const LARGE_FILE_THRESHOLD = 400;  // Total lines in file
const LARGE_CHUNK_THRESHOLD = 200; // Lines per chunk

const alignSplitChunks = (file) => {
    // Calculate total lines and mark large chunks
    let totalLines = 0;

    file.chunks.forEach(chunk => {
        const chunkLineCount = chunk.lines.length;
        totalLines += chunkLineCount;
        chunk.isLargeChunk = chunkLineCount > LARGE_CHUNK_THRESHOLD;
    });

    file.totalLines = totalLines;
    file.isLargeFile = totalLines > LARGE_FILE_THRESHOLD;

    file.splitChunks = file.chunks.map(chunk => {
        const rows = [];
        let delBuffer = [];
        let addBuffer = [];

        const flushBuffers = () => {
            const len = Math.max(delBuffer.length, addBuffer.length);
            for (let i = 0; i < len; i++) {
                const delLine = delBuffer[i];
                const addLine = addBuffer[i];
                rows.push({
                    left: delLine ? { no: delLine.oldNo, content: delLine.content, type: 'del' } : null,
                    right: addLine ? { no: addLine.newNo, content: addLine.content, type: 'add' } : null
                });
            }
            delBuffer = [];
            addBuffer = [];
        };

        chunk.lines.forEach(line => {
            if (line.type === 'ctx') {
                flushBuffers();
                rows.push({
                    left: { no: line.oldNo, content: line.content, type: 'ctx' },
                    right: { no: line.newNo, content: line.content, type: 'ctx' }
                });
            } else if (line.type === 'del') {
                delBuffer.push(line);
            } else if (line.type === 'add') {
                addBuffer.push(line);
            }
        });
        flushBuffers();
        return { ...chunk, rows };
    });
};

// Logic to detect generated/minified files
const isGeneratedFile = (path) => {
    const patterns = [
        /(^|\/)dist\//,         // Dist directory
        /(^|\/)build\//,        // Build directory
        /(^|\/)node_modules\//, // Node modules
        /^public\/assets\//,    // Built/public assets
        /\.min\.(js|css)$/,     // Minified file
        /\.map$/,               // Source map
        /package-lock\.json$/,  // NPM Lock file
        /yarn\.lock$/,          // Yarn Lock file
        /pnpm-lock\.yaml$/,     // PNPM Lock file
        /composer\.lock$/       // Composer Lock file
    ];
    return patterns.some(regex => regex.test(path));
};

export const parsePatch = (text) => {
    const newFiles = [];
    const lines = text.split('\n');
    let cur = null;
    let id = 0;

    for (let line of lines) {
        if (line.startsWith('diff --git')) {
            if (cur) { alignSplitChunks(cur); newFiles.push(cur); }
            const parts = line.split(' ');
            const rawPath = parts[parts.length - 1];
            // Process path (remove b/ prefix if present)
            const cleanName = rawPath.startsWith('b/') ? rawPath.substring(2) : rawPath;
            const generated = isGeneratedFile(cleanName);

            cur = {
                id: id++,
                name: cleanName,
                status: 'modified', additions: 0, deletions: 0,
                chunks: [], splitChunks: [], collapsed: false,
                // Flag to mark generated file
                isGenerated: generated,
                showGenerated: false
            };
        } else if (cur) {
            if (line.startsWith('new file')) cur.status = 'added';
            else if (line.startsWith('deleted file')) cur.status = 'deleted';
            else if (line.startsWith('@@')) {
                const m = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
                cur.chunks.push({
                    header: line, lines: [],
                    oldStart: parseInt(m[1]), oldLines: m[2] || 1, oldCur: parseInt(m[1]),
                    newStart: parseInt(m[3]), newLines: m[4] || 1, newCur: parseInt(m[3])
                });
            } else if (cur.chunks.length && !line.startsWith('---') && !line.startsWith('+++') && !line.startsWith('index')) {
                const chunk = cur.chunks[cur.chunks.length - 1];
                const p = line[0];
                if (['+', '-', ' '].includes(p)) {
                    const type = p === '+' ? 'add' : (p === '-' ? 'del' : 'ctx');
                    let oldNo = type !== 'add' ? chunk.oldCur++ : null;
                    let newNo = type !== 'del' ? chunk.newCur++ : null;
                    if (type === 'add') cur.additions++;
                    if (type === 'del') cur.deletions++;
                    chunk.lines.push({ type, content: line.substring(1), oldNo, newNo });
                }
            }
        }
    }
    if (cur) { alignSplitChunks(cur); newFiles.push(cur); }
    return newFiles;
};

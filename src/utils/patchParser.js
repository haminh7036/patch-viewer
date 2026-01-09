const alignSplitChunks = (file) => {
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

export const parsePatch = (text) => {
    const newFiles = [];
    const lines = text.split('\n');
    let cur = null;
    let id = 0;

    for (let line of lines) {
        if (line.startsWith('diff --git')) {
            if (cur) { alignSplitChunks(cur); newFiles.push(cur); }
            const parts = line.split(' ');
            const path = parts[parts.length - 1];
            cur = {
                id: id++,
                name: path.startsWith('b/') ? path.substring(2) : path,
                status: 'modified', additions: 0, deletions: 0,
                chunks: [], splitChunks: [], collapsed: false
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

export const getStatusBadge = (s) => {
    if (s === 'added') return 'bg-green-100 text-green-800 border-green-200';
    if (s === 'deleted') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
};

export const getStatusDot = (s) => {
    if (s === 'added') return 'bg-green-500';
    if (s === 'deleted') return 'bg-red-500';
    return 'bg-blue-400';
};

export const getFilterClass = (status, currentFilters) => {
    return currentFilters.includes(status)
        ? (status === 'added' ? 'bg-green-100 border-green-300 text-green-800' : (status === 'deleted' ? 'bg-red-100 border-red-300 text-red-800' : 'bg-blue-100 border-blue-300 text-blue-800'))
        : 'bg-white border-gray-200 text-gray-400 grayscale opacity-60';
};

export const getLineStyle = (type) => {
    if (type === 'add') return { backgroundColor: 'var(--bg-add)', color: 'var(--text-add)' };
    if (type === 'del') return { backgroundColor: 'var(--bg-del)', color: 'var(--text-del)' };
    return { color: '#24292f' };
};

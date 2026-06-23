import { useState, useCallback } from 'react';

export function useReports() {
    const [rows, setRows] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [dateCol, setDateCol] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchData = useCallback(async (filterType, filterDate, customStart, customEnd) => {
        setLoading(true);
        try {
            let url = `/api/data?type=${filterType}`;
            if (filterType === 'week' || filterType === 'month') {
                url += `&start=${filterDate}`;
            } else if (filterType === 'custom') {
                url += `&start=${customStart}&end=${customEnd}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch data');
            setRows(data.rows);
            if (data.rows.length) {
                const first = data.rows[0];
                const h = Object.keys(first.data);
                setHeaders(h);
                // Keep existing dateCol; do not override
            } else {
                setHeaders([]);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadFile = useCallback(async (file) => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            setHeaders(data.headers);
            setDateCol(data.dateCol);   // ✅ store the actual column name
            setMessage({ type: 'success', text: data.message });
            return data;
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
            throw err;
        } finally {
            setUploading(false);
        }
    }, []);

    const exportData = useCallback(async (format, filterType, filterDate, customStart, customEnd, dateCol) => {
        if (!dateCol) {
            setMessage({ type: 'error', text: 'Date column not detected. Please re-upload.' });
            return;
        }
        try {
            let url = `/api/export/${format}?type=${filterType}&dateCol=${encodeURIComponent(dateCol)}`;
            if (filterType === 'week' || filterType === 'month') {
                url += `&start=${filterDate}`;
            } else if (filterType === 'custom') {
                url += `&start=${customStart}&end=${customEnd}`;
            }
            const res = await fetch(url);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Export failed');
            }
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            a.click();
            URL.revokeObjectURL(a.href);
            setMessage({ type: 'success', text: `Exported as ${format.toUpperCase()}` });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    }, []);

    const deleteData = useCallback(async (filterType, filterDate, customStart, customEnd, count) => {
        if (!count) {
            setMessage({ type: 'error', text: 'No data to delete.' });
            return false;
        }
        if (!confirm(`Delete ${count} rows? Cannot be undone.`)) return false;
        try {
            let url = `/api/data?type=${filterType}`;
            if (filterType === 'week' || filterType === 'month') {
                url += `&start=${filterDate}`;
            } else if (filterType === 'custom') {
                url += `&start=${customStart}&end=${customEnd}`;
            }
            const res = await fetch(url, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            setMessage({ type: 'success', text: data.message });
            return true;
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
            return false;
        }
    }, []);

    const clearMessage = useCallback(() => setMessage(null), []);

    return {
        rows,
        headers,
        dateCol,
        loading,
        uploading,
        message,
        fetchData,
        uploadFile,
        exportData,
        deleteData,
        clearMessage,
        setMessage,
    };
}
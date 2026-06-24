'use client';

import { useState, useEffect, useCallback } from 'react';
import UploadZone from '@/app/components/UploadZone';
import DateRangePicker from '@/app/components/DateRangePicker';
import ActionButtons from '@/app/components/ActionButtons';
import DataTable from '@/app/components/DataTable';
import LoginModal from '@/app/components/LoginModal';
import MonthCalendar from '@/app/components/MonthCalendar';
import { Calendar as CalendarIcon } from 'lucide-react';
export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [exporting, setExporting] = useState(false);

    const [reportDate, setReportDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rows, setRows] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [dateCol, setDateCol] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    // ── Check login status on mount ──────────────────────────────
    useEffect(() => {
        fetch('/api/auth')
            .then(res => res.json())
            .then(data => {
                if (data.loggedIn) setIsLoggedIn(true);
            })
            .catch(() => setIsLoggedIn(false));
    }, []);

    const handleDateSelect = (dateStr) => {
    setStartDate(dateStr);
    setEndDate(dateStr);
    // fetchData will be triggered by useEffect
};


    // ── Login handler ────────────────────────────────────────────
    const handleLogin = async (username, password) => {
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid credentials');
            setIsLoggedIn(true);
            setShowLogin(false);
            setLoginError('');
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' }),
        });
        setIsLoggedIn(false);
        setReportDate('');
        setMessage(null);
    };

    // ── Fetch data ──────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setMessage(null);
        if (!startDate || !endDate) {
            setRows([]);
            setHeaders([]);
            setDateCol(null);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/data?start=${startDate}&end=${endDate}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch');
            setRows(data.rows);
            if (data.rows.length) {
                const h = Object.keys(data.rows[0].data);
                setHeaders(h);
                setDateCol(h.find(col => /date/i.test(col)) || null);
            } else {
                setHeaders([]);
                setDateCol(null);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]); // ✅ dependencies only what's used inside

    // ── Auto‑fetch when date range changes ──────────────────────
    useEffect(() => {
        fetchData();
    }, [startDate, endDate]); // ✅ no `fetchData` in deps to avoid size change

    // ── Upload ──────────────────────────────────────────────────
    const handleUpload = async (file) => {
        if (!reportDate) {
            setMessage({ type: 'error', text: 'Please select a report date before uploading.' });
            return;
        }
        setUploading(true);
        setMessage(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('reportDate', reportDate);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            setMessage({ type: 'success', text: data.message });
            setStartDate(reportDate);
            setEndDate(reportDate);
            setReportDate('');
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setUploading(false);
        }
    };

    // ── Export ──────────────────────────────────────────────────
    const handleExport = async (format) => {
        if (!startDate || !endDate) {
            setMessage({ type: 'error', text: 'Select date range first.' });
            return;
        }
        setExporting(true);
        try {
            const res = await fetch(`/api/export/${format}?start=${startDate}&end=${endDate}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Export failed');
            }
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Report_${startDate}_to_${endDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            a.click();
            URL.revokeObjectURL(a.href);
            setMessage({ type: 'success', text: `Exported as ${format.toUpperCase()}` });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
        finally {
        setExporting(false);
    }
    };

    // ── Delete ──────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!startDate || !endDate) {
            setMessage({ type: 'error', text: 'Select date range first.' });
            return;
        }
        if (!confirm(`Delete all data from ${startDate} to ${endDate}?`)) return;
        try {
            const res = await fetch(`/api/data?start=${startDate}&end=${endDate}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            setMessage({ type: 'success', text: data.message });
            setRows([]);
            setHeaders([]);
            setDateCol(null);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans antialiased">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                   <h1 className="text-3xl font-light text-gray-800 tracking-tight flex items-center gap-2">
    <img src="/fn_logo.png" alt="Line bars" className="h-8 w-auto" />
    Daily Report Manager
</h1>
                    {isLoggedIn ? (
    <button
        onClick={handleLogout}
        className="flex items-center justify-center p-0 text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
        title="Logout"
    >
        <img
            src="/logout.gif"
            alt="Logout"
            className="h-9 w-auto rounded-md"
        />
        <span className="sr-only">Logout</span>
    </button>
) : (
    <button
        onClick={() => setShowLogin(true)}
        className="flex items-center justify-center rounded-full border border-gray-200 hover:border-green-300  transition-colors "
        title="Login"
    >
        <img
            src="/login.png"
            alt="Login"
            className="h-10 w-auto rounded-sm"
        />
        <span className="sr-only">Login</span>
    </button>
)}
                </div>

                {isLoggedIn ? (
                    <UploadZone
                        onUpload={handleUpload}
                        uploading={uploading}
                        message={message}
                        reportDate={reportDate}
                        setReportDate={setReportDate}
                    />
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-0 mb-0 text-center text-gray-400">
                        
                    </div>
                )}
 {rows.length > 0 && (
                    <ActionButtons
                        onExport={handleExport}
                        onDelete={handleDelete}
                        count={rows.length}
                         exporting={exporting}
                         isLoggedIn={isLoggedIn}
                    />
                )}
                <DateRangePicker
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    onFetch={fetchData}
                />

              

               

 <div className="flex items-center gap-3 mb-4 relative">
    {/* Calendar toggle button */}
    {!showCalendar && (
        <button
            onClick={() => setShowCalendar(true)}
            className="inline-flex items-center justify-center transition-colors"
            title="Open calendar"
        >
            <img src="/calendar.gif" alt="calendar" className="h-10 w-auto" />
        </button>
    )}

    {/* Calendar popover with slide animation */}
    <div
        className={`absolute top-full left-0 mt-2 z-50 transition-all duration-300 ease-in-out origin-top ${
            showCalendar
                ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
        }`}
    >
        <MonthCalendar
            onDateSelect={handleDateSelect}
            selectedDate={startDate}
            onClose={() => setShowCalendar(false)}
        />
    </div>
</div>
                <DataTable
                    rows={rows}
                    headers={headers}
                    dateCol={dateCol}
                    loading={loading}
                />

                <LoginModal
                    isOpen={showLogin}
                    onClose={() => setShowLogin(false)}
                    onLogin={handleLogin}
                    error={loginError}
                />
            </div>
        </div>
    );
}
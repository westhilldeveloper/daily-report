/**
 * Format a date string (YYYY-MM-DD) to DD-MMM-YYYY
 * e.g., "2026-05-12" → "12-May-2026"
 */
export function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    // If it's already in DD-MMM-YYYY format, return as-is
    if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dateStr)) return dateStr;
    // Try parsing
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d)) return dateStr; // fallback
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * Format a time string (HH:MM:SS) to HH:MM
 * e.g., "13:00:00" → "13:00"
 */
export function formatTimeDisplay(timeStr) {
    if (!timeStr) return '';
    // If it's already HH:MM, return
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    // If it's HH:MM:SS, strip seconds
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr.slice(0, 5);
    }
    // Try parsing as date and extract time
    const d = new Date(timeStr);
    if (!isNaN(d)) {
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }
    return timeStr;
}

/**
 * Determine if a header is a date column
 */
export function isDateColumn(header) {
    const lower = header.toLowerCase();
    return lower.includes('date') || lower.includes('enroll') || lower.includes('auction') || lower.includes('due');
}

/**
 * Determine if a header is a time column
 */
export function isTimeColumn(header) {
    const lower = header.toLowerCase();
    return lower.includes('time') || (lower.includes('next auction') && lower.includes('time'));
}

/**
 * Format a cell value based on its header
 */
export function formatCellValue(value, header) {
    if (value === undefined || value === null) return '';
    if (isDateColumn(header)) {
        return formatDateDisplay(value);
    }
    if (isTimeColumn(header)) {
        return formatTimeDisplay(value);
    }
    return value;
}

export function formatNumber(value) {
    if (value === undefined || value === null) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US'); // comma as thousand separator
}
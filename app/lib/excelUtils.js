import * as XLSX from 'xlsx';

export function parseExcelBuffer(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet);
    if (!json.length) throw new Error('File is empty');

    const rawHeaders = Object.keys(json[0]);
    const headers = rawHeaders.map(h => h.trim());

    // Detect primary date column (for filtering)
    let dateCol = null;
    const dateKeywords = ['date', 'day', 'dt', 'report', 'entry', 'created', 'updated', 'timestamp'];
    for (const key of headers) {
        if (dateKeywords.some(kw => key.toLowerCase().includes(kw))) {
            dateCol = key;
            break;
        }
    }
    if (!dateCol) {
        for (const key of headers) {
            const sample = json.find(row => row[key] !== undefined && row[key] !== null && row[key] !== '');
            if (sample && parseDate(sample[key])) {
                dateCol = key;
                break;
            }
        }
    }
    if (!dateCol) throw new Error('Could not detect a date column');

    // Detect all columns that should be treated as date/time
    const dateTimeColumns = headers.filter(h =>
        /date|time|enroll|auction/i.test(h)
    );

    const rows = json.map(row => {
        const data = {};
        headers.forEach(h => {
            let val = row[h] !== undefined ? row[h] : '';
            if (dateTimeColumns.includes(h)) {
                const parsed = parseDateTime(val);
                if (parsed !== null) val = parsed;
            }
            data[h] = val;
        });

        // Primary date as YYYY-MM-DD
        let primaryDateObj = parseDate(row[dateCol]);
        if (!primaryDateObj) {
            const d = new Date(row[dateCol]);
            if (!isNaN(d)) primaryDateObj = d;
        }
        if (!primaryDateObj) throw new Error(`Invalid date in "${dateCol}": ${row[dateCol]}`);
        const dateStr = primaryDateObj.toISOString().split('T')[0];

        return { date: dateStr, data };
    });

    return { rows, headers, dateCol };
}

function parseDate(val) {
    if (!val) return null;
    if (typeof val === 'number' && val > 59) {
        const d = new Date((val - 25569) * 86400 * 1000);
        if (!isNaN(d)) return d;
    }
    const d = new Date(val);
    if (!isNaN(d)) return d;
    const str = String(val).trim();
    const parts = str.split(/[\/\-.,\s]+/);
    if (parts.length >= 3) {
        let y = parseInt(parts[2]);
        let m = parseInt(parts[1]) - 1;
        let day = parseInt(parts[0]);
        if (y < 100) y += 2000;
        const d2 = new Date(y, m, day);
        if (!isNaN(d2)) return d2;
    }
    return null;
}

function parseDateTime(val) {
    if (val === undefined || val === null || val === '') return null;
    let d = parseDate(val);
    if (d) {
        return d.toISOString().split('T')[0];
    }
    if (typeof val === 'string') {
        const trimmed = val.trim();
        const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (timeMatch) {
            const h = timeMatch[1].padStart(2, '0');
            const m = timeMatch[2].padStart(2, '0');
            const s = timeMatch[3] ? timeMatch[3].padStart(2, '0') : '00';
            return `${h}:${m}:${s}`;
        }
        const dateMatch = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
        if (dateMatch) {
            const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
                             jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
            const month = months[dateMatch[2].toLowerCase()];
            if (month) {
                return `${dateMatch[3]}-${month}-${dateMatch[1].padStart(2, '0')}`;
            }
        }
        const dateTimeMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s/);
        if (dateTimeMatch) {
            return dateTimeMatch[1];
        }
    }
    if (typeof val === 'number' && val > 0 && val < 1) {
        const totalSeconds = val * 86400;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return null;
}

export function generateExcelBuffer(rows) {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
}
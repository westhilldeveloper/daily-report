import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Helper: format any date value to DD/MM/YYYY ──────────────────
function formatDateValue(value) {
    if (!value) return '';
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB');
    }
    return value;
}

// ─── Helper: wrap header text to save space ──────────────────────
const headerWraps = {
    'Chit No.': 'Chit\nNo.',
    'Chit Value': 'Chit\nValue',
    'Subscriber Name': 'Subscriber\nName',
    'Auction Date': 'Auction\nDate',
    'Due Date': 'Due\nDate',
    'Due Months': 'Due\nMonths',
    'Subscription Due': 'Subscription\nDue',
    'Amt Pd': 'Amt\nPd',
    'Discount': 'Discount',
    'Total Due': 'Total\nDue',
    'Pending Cheque Amount': 'Pending\nAmount',
    'Current Installment No.': 'Current Install\nNo.',
    'Current Installment Amount': 'Current Install\nAmount',
    'Subscriber Area': 'Subscriber\nArea',
};

function wrapHeader(header) {
    if (headerWraps[header]) return headerWraps[header];
    if (header.length > 12) {
        const idx = header.indexOf(' ');
        if (idx > 0) return header.slice(0, idx) + '\n' + header.slice(idx + 1);
    }
    return header;
}

// ─── Desired column order (without excluded columns) ──────────────
const desiredOrder = [
    'Chit No.',
    'Chit Value',
    'Subscriber Name',
    'Auction Date',
    'Due Date',
    'Due Months',
    'Subscription Due',
    'Amt Pd',                // <-- from uploaded file
    'Discount',
    'Total Due',
    'Pending Cheque Amount',
    'Current Installment No.',
    'Current Installment Amount',
    'Status',
    'Subscriber Area'
];

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (!start || !end) {
            return NextResponse.json({ error: 'Date range required' }, { status: 400 });
        }

        // Simple query – no paid amount computation
        const result = await query(
            `SELECT date, data, uploaded_at
             FROM reports
             WHERE uploaded_at::date >= $1::date AND uploaded_at::date <= $2::date
             ORDER BY uploaded_at`,
            [start, end]
        );
        const rows = result.rows;
        if (!rows.length) {
            return NextResponse.json({ error: 'No data for this range' }, { status: 404 });
        }

        const first = rows[0];
        const allDataKeys = Object.keys(first.data);
        const dateCol = allDataKeys.find(h => /date/i.test(h)) || allDataKeys[0];

        // ─── Columns to EXCLUDE from PDF ──────────────────────────────
        const excludedKeywords = [
            'branch',
            'mobile',
            'enroll date',
            'incharge',
            'next auction date',
            'next auction time',
            'uploaded'
        ];

        // ─── Filter headers ──────────────────────────────────────────────
        let dataKeys = allDataKeys.filter(h => {
            const lower = h.toLowerCase().trim();
            if (h === dateCol) return true;
            return !excludedKeywords.some(keyword => lower.includes(keyword));
        });

        // ─── Reorder columns according to desiredOrder ───────────────────
        const orderedKeys = [];
        const used = new Set();
        desiredOrder.forEach(d => {
            const found = dataKeys.find(k => k.toLowerCase() === d.toLowerCase());
            if (found && !used.has(found)) {
                orderedKeys.push(found);
                used.add(found);
            }
        });
        // Append any remaining columns not in desiredOrder
        dataKeys.forEach(k => {
            if (!used.has(k)) {
                orderedKeys.push(k);
                used.add(k);
            }
        });
        dataKeys = orderedKeys;

        // ─── Date columns that need formatting ──────────────────────────
        const dateColumnsToFormat = ['Auction Date', 'Due Date', 'Enroll Date'];

        // ─── Build PDF ──────────────────────────────────────────────────
        const doc = new jsPDF('landscape', 'pt', 'a4');

        doc.setFillColor(30, 58, 138);
        doc.rect(30, 25, 782, 4, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(30, 58, 138);
        doc.text('Construction ERP System Report', 30, 55);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Date Range: ${start} to ${end}`, 30, 72);
        doc.text(`Total Generated Records: ${rows.length}`, 812, 72, { align: 'right' });

        // ─── Table Headers & Rows ──────────────────────────────────────
        const tableHeaders = dataKeys.map(h => wrapHeader(h === dateCol ? 'Date' : h));
        const tableRows = rows.map(row => {
            const formattedData = {};
            dataKeys.forEach(key => {
                let val = row.data[key] ?? '';
                if (dateColumnsToFormat.includes(key)) {
                    val = formatDateValue(val);
                }
                formattedData[key] = val;
            });
            return dataKeys.map(key => {
                if (key === dateCol) return formatDateValue(row.date);
                return formattedData[key];
            });
        });

        autoTable(doc, {
            head: [tableHeaders],
            body: tableRows,
            startY: 95,
            margin: { left: 10, right: 10 },
            styles: {
                fontSize: 7.5,
                cellPadding: 4,
                font: 'helvetica',
                textColor: [51, 65, 85],
                overflow: 'ellipsis'
            },
            columnStyles: { 0: { cellWidth: 50 } },
            headStyles: {
                fillColor: [30, 58, 138],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 7.5,
                halign: 'center'
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            theme: 'striped'
        });

        const buffer = doc.output('arraybuffer');
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=Report_${start}_to_${end}.pdf`,
            },
        });
    } catch (err) {
        console.error('PDF export error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
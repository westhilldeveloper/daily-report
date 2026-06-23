import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generatePDFBuffer(rows, headers, dateCol, filterLabel) {
    // ── Columns to EXCLUDE from PDF ──────────────────────────────
    const excludedKeywords = [
        'branch',
        'mobile',           // catches "Subscriber MobileNo."
        'discount',
        'pending',          // catches "Pending Cheque Amount"
        'enroll date',
        'incharge',         // catches "Incharge Name"
        'next auction date',
        'next auction time'
    ];

    // ── Filter headers ─────────────────────────────────────────────
    const filteredHeaders = headers.filter(h => {
        const lower = h.toLowerCase().trim();
        // Keep the primary date column (even if it matches a keyword)
        if (h === dateCol) return true;
        return !excludedKeywords.some(keyword => lower.includes(keyword));
    });

    // ── Build table rows from filtered headers ────────────────────
    const tableHeaders = filteredHeaders.map(h => (h === dateCol ? 'Date' : h));
    const tableRows = rows.map(row => {
        return filteredHeaders.map(h => {
            if (h === dateCol) return row.date;
            const val = row.data[h];
            return val !== undefined && val !== null ? String(val) : '';
        });
    });

    // ── Generate PDF ──────────────────────────────────────────────
    const doc = new jsPDF('landscape', 'pt', 'a4');

    const title = `Daily Report - ${new Date().toISOString().slice(0,10)}`;
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(title, 40, 50);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Filter: ${filterLabel}  •  ${rows.length} rows`, 40, 70);

    doc.autoTable({
        head: [tableHeaders],
        body: tableRows,
        startY: 85,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 41, 59], fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [250, 252, 255] },
        tableLineColor: [233, 237, 242],
        margin: { left: 30, right: 30 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Generated on ${new Date().toLocaleString()}  •  Page ${i} of ${pageCount}`, 40, doc.internal.pageSize.height - 20);
    }

    return doc.output('arraybuffer');
}
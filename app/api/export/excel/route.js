import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { generateExcelBuffer } from '@/app/lib/excelUtils';

function findAmtPdKey(keys) {
    const normalizedKeys = keys.map(k => ({ original: k, lower: k.trim().toLowerCase() }));

    const exactMatches = ['amt pd', 'amt pd.', 'amtpd', 'amount paid', 'paid amount'];
    for (const match of exactMatches) {
        const found = normalizedKeys.find(({ lower }) => lower === match);
        if (found) return found.original;
    }

    const patterns = [
        /^amt\s*pd$/i,
        /^amt\s*pd\.$/i,
        /^amtpd$/i,
        /amt\s*pd/i,
        /amtpd/i,
        /pd\s*amt/i,
        /pd.*amt/i,
        /amt.*pd/i,
        /amount\s*paid/i,
        /paid\s*amount/i,
    ];
    for (const pattern of patterns) {
        const found = normalizedKeys.find(({ lower }) => pattern.test(lower));
        if (found) return found.original;
    }

    const fallback = normalizedKeys.find(({ lower }) => lower.includes('amt') && lower.includes('pd'));
    if (fallback) return fallback.original;

    return null;
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (!start || !end) {
            return NextResponse.json({ error: 'Date range required' }, { status: 400 });
        }

       const result = await query(
    `SELECT date, data, uploaded_at
     FROM reports
     WHERE report_date >= $1::date AND report_date <= $2::date
     ORDER BY report_date`,
    [start, end]
);
        const rows = result.rows;
        if (!rows.length) {
            return NextResponse.json({ error: 'No data for this range' }, { status: 404 });
        }

        const first = rows[0];
        let allDataKeys = Object.keys(first.data);
        const dateCol = allDataKeys.find(h => /date/i.test(h)) || allDataKeys[0];

        // ─── Exclude unwanted columns ────────────────────────────────
        const excludedColumns = ['Subscriber MobileNo.'];
        let dataKeys = allDataKeys.filter(h => !excludedColumns.includes(h));

        // ─── Find "Amt Pd" ──────────────────────────────────────────
        let amtPdKey = findAmtPdKey(dataKeys);
        if (!amtPdKey) {
            amtPdKey = 'Amt Pd';
            rows.forEach(row => {
                if (!row.data[amtPdKey]) row.data[amtPdKey] = '';
            });
            if (!dataKeys.includes(amtPdKey)) {
                dataKeys.push(amtPdKey);
            }
        }

        const exportRows = rows.map(row => {
            const obj = {};
            dataKeys.forEach(key => {
                if (key === dateCol) {
                    obj[key] = row.date;
                } else {
                    obj[key] = row.data[key] ?? '';
                }
            });
            obj['Uploaded At'] = new Date(row.uploaded_at).toLocaleString();
            return obj;
        });

        const desiredOrder = [
            'Branch', 'Chit No.', 'Chit Value', 'Subscriber Name',
            'Auction Date', 'Due Date', 'Due Months',
            'Subscription Due',
            amtPdKey,
            'Discount', 'Total Due',
            'Pending Cheque Amount', 'Current Installment No.',
            'Current Installment Amount', 'Status',
            'Subscriber Area', 'Uploaded At'
        ];

        const orderedKeys = desiredOrder.filter(k => Object.keys(exportRows[0]).includes(k));
        Object.keys(exportRows[0]).forEach(k => {
            if (!orderedKeys.includes(k)) orderedKeys.push(k);
        });

        const finalRows = exportRows.map(row => {
            const newRow = {};
            orderedKeys.forEach(k => { newRow[k] = row[k]; });
            return newRow;
        });

        const buffer = generateExcelBuffer(finalRows);
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=Report_${start}_to_${end}.xlsx`,
            },
        });
    } catch (err) {
        console.error('Excel export error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
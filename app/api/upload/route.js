import { NextResponse } from 'next/server';
import { parseExcelBuffer } from '@/app/lib/excelUtils';
import { query } from '@/app/lib/db';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const reportDate = formData.get('reportDate'); // ✅ this comes from your UI

        if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        if (!reportDate) return NextResponse.json({ error: 'Report date is required' }, { status: 400 });

        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(ext)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const { rows, headers, dateCol } = parseExcelBuffer(buffer);

        // ─── Insert each row with report_date ──────────────────────
        for (const row of rows) {
            await query(
                `INSERT INTO reports (date, data, report_date) VALUES ($1, $2, $3)`,
                [row.date, row.data, reportDate]
            );
        }

        return NextResponse.json({
            message: `Uploaded ${rows.length} rows for ${reportDate}`,
            headers,
            dateCol,
        });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
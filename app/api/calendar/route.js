import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');
        const months = searchParams.get('months');

        // ─── Return distinct months (YYYY-MM) ──────────────────────
        if (months === 'true') {
            const result = await query(`
                SELECT DISTINCT TO_CHAR(report_date, 'YYYY-MM') AS month
                FROM reports
                WHERE report_date IS NOT NULL
                ORDER BY month DESC
            `);
            return NextResponse.json({ months: result.rows.map(r => r.month) });
        }

        // ─── Return dates with data for a specific month ───────────
        if (month) {
            const result = await query(`
                SELECT DISTINCT TO_CHAR(report_date, 'YYYY-MM-DD') AS date
                FROM reports
                WHERE report_date IS NOT NULL
                  AND TO_CHAR(report_date, 'YYYY-MM') = $1
                ORDER BY date
            `, [month]);
            const dates = result.rows.map(r => r.date);
            return NextResponse.json({ dates });
        }

        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    } catch (err) {
        console.error('Calendar error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
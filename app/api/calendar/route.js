import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET /api/calendar?month=YYYY-MM  → returns list of dates that have data
// GET /api/calendar?months=true   → returns distinct months with data
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');
        const months = searchParams.get('months');

        // ─── Return distinct months ──────────────────────────────
        if (months === 'true') {
            const result = await query(`
                SELECT DISTINCT TO_CHAR(report_date, 'YYYY-MM') AS month
                FROM reports
                WHERE report_date IS NOT NULL
                ORDER BY month DESC
            `);
            return NextResponse.json({ months: result.rows.map(r => r.month) });
        }

        // ─── Return dates with data for a given month ─────────────
        if (month) {
            const result = await query(`
                SELECT DISTINCT report_date
                FROM reports
                WHERE TO_CHAR(report_date, 'YYYY-MM') = $1
                ORDER BY report_date
            `, [month]);
            const dates = result.rows.map(r => r.report_date);
            return NextResponse.json({ dates });
        }

        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
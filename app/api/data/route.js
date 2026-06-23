import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (!start || !end) {
            return NextResponse.json({ rows: [] });
        }

        const result = await query(
            `SELECT id, date, data, report_date FROM reports
             WHERE report_date >= $1::date AND report_date <= $2::date
             ORDER BY date`,
            [start, end]
        );
        return NextResponse.json({ rows: result.rows });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        if (!start || !end) {
            return NextResponse.json({ error: 'Start and end dates required' }, { status: 400 });
        }

        const result = await query(
            'DELETE FROM reports WHERE report_date >= $1::date AND report_date <= $2::date',
            [start, end]
        );
        return NextResponse.json({ message: `Deleted ${result.rowCount} rows` });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
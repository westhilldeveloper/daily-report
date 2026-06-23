// app/api/changes/route.js
import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const column = searchParams.get('column') || 'Subscription Due';

        if (!start || !end) {
            return NextResponse.json({ error: 'Start and end dates required' }, { status: 400 });
        }

        // Fetch all data for the date range
        const res = await query(
            `SELECT date, unique_id, data
             FROM reports
             WHERE date >= $1 AND date <= $2
             ORDER BY unique_id, date`,
            [start, end]
        );

        const rows = res.rows;

        // Group by unique_id
        const grouped = {};
        rows.forEach(row => {
            if (!grouped[row.unique_id]) grouped[row.unique_id] = [];
            grouped[row.unique_id].push(row);
        });

        const changes = [];

        for (const [id, entries] of Object.entries(grouped)) {
            for (let i = 1; i < entries.length; i++) {
                const prev = entries[i-1];
                const curr = entries[i];
                const oldVal = prev.data[column] || '';
                const newVal = curr.data[column] || '';
                if (oldVal !== newVal) {
                    changes.push({
                        unique_id: id,
                        date: curr.date,
                        column,
                        old_value: oldVal,
                        new_value: newVal,
                    });
                }
            }
        }

        return NextResponse.json({ changes });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
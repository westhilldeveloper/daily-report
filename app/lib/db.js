import { Pool } from '@neondatabase/serverless';

let pool = null;

function getPool() {
    if (!pool) {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL not set');
        pool = new Pool({ connectionString: url, max: 10 });
    }
    return pool;
}

// Ensure the reports table has the report_date column
async function ensureColumn() {
    const client = await getPool().connect();
    try {
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'reports' AND column_name = 'report_date'
                ) THEN
                    ALTER TABLE reports ADD COLUMN report_date DATE;
                    CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date);
                END IF;
            END $$;
        `);
    } finally {
        client.release();
    }
}

export async function query(sql, params = []) {
    await ensureColumn(); // ensures the column exists before any query
    const client = await getPool().connect();
    try {
        const res = await client.query(sql, params);
        return res;
    } finally {
        client.release();
    }
}
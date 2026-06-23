CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    data JSONB NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_date ON reports(date);
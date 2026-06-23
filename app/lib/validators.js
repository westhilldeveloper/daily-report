export function validateDateRange(start, end) {
    if (!start && !end) return { valid: true };
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    if (s && isNaN(s)) return { valid: false, error: 'Invalid start date' };
    if (e && isNaN(e)) return { valid: false, error: 'Invalid end date' };
    if (s && e && s > e) return { valid: false, error: 'Start date must be before end date' };
    return { valid: true };
}
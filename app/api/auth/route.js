import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'your-secret-key-change-this';

function verifyCredentials(username, password) {
    const validUser = process.env.ADMIN_USERNAME || 'admin';
    const validPass = process.env.ADMIN_PASSWORD || 'password';
    return username === validUser && password === validPass;
}

function createToken(username) {
    const payload = { username, exp: Date.now() + 24 * 60 * 60 * 1000 };
    const data = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
    return Buffer.from(data + '|' + signature).toString('base64');
}

function verifyToken(token) {
    try {
        const decoded = Buffer.from(token, 'base64').toString();
        const [data, signature] = decoded.split('|');
        const expected = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
        if (signature !== expected) return null;
        const payload = JSON.parse(data);
        if (payload.exp < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}

// ─── POST: Login or Logout ──────────────────────────────────────────
export async function POST(req) {
    try {
        const { username, password, action } = await req.json();

        // Logout
        if (action === 'logout') {
            const cookieStore = await cookies();  // ✅ await here
            cookieStore.delete('auth_token');
            return NextResponse.json({ success: true });
        }

        // Login
        if (username && password) {
            if (!verifyCredentials(username, password)) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }
            const token = createToken(username);
            const cookieStore = await cookies();  // ✅ await here
            cookieStore.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// ─── GET: Check login status ─────────────────────────────────────────
export async function GET() {
    try {
        const cookieStore = await cookies();  // ✅ await here
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ loggedIn: false });
        }

        const payload = verifyToken(token);
        if (!payload) {
            const cookieStore = await cookies();  // ✅ await here
            cookieStore.delete('auth_token');
            return NextResponse.json({ loggedIn: false });
        }

        return NextResponse.json({ loggedIn: true, username: payload.username });
    } catch {
        return NextResponse.json({ loggedIn: false });
    }
}
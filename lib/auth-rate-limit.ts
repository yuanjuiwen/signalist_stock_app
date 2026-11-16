import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { connectToDatabase } from '@/database/mongoose';

const WINDOW_MS = 15 * 60 * 1000;

type Attempt = { _id: string; count: number; expiresAt: Date };

export async function checkSignInLimits(requestHeaders: Headers, email: string) {
    // Vercel overwrites this header at its edge. Never trust arbitrary forwarded headers.
    // Other deployments share a conservative limit until a trusted proxy is configured.
    const forwarded = process.env.VERCEL === '1'
        ? requestHeaders.get('x-vercel-forwarded-for')?.trim()
        : undefined;
    const client = forwarded && isIP(forwarded) ? forwarded : 'unknown';
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');
    const attempts = db.collection<Attempt>('signInAttempts');
    await attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    const window = Math.floor(Date.now() / WINDOW_MS);
    const consume = async (scope: string, identifier: string, limit: number) => {
        const digest = createHash('sha256').update(identifier).digest('hex');
        const attempt = await attempts.findOneAndUpdate(
            { _id: `${scope}:${digest}:${window}` },
            {
                $inc: { count: 1 },
                $setOnInsert: { expiresAt: new Date((window + 1) * WINDOW_MS) },
            },
            { upsert: true, returnDocument: 'after' },
        );
        return !!attempt && attempt.count <= limit;
    };
    const [clientAllowed, accountAllowed] = await Promise.all([
        consume('client', client, 30),
        consume('account', email.trim().toLowerCase(), 10),
    ]);
    return clientAllowed && accountAllowed;
}

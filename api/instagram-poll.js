// Reads our own Instagram inbox for replies from people waiting on their gift.
// Meta only pushes DM webhooks with Advanced Access, so this is the fallback.
// Hit it every minute from a scheduler (Vercel cron, cron-job.org, ...) with
//   Authorization: Bearer <ADMIN_PASSWORD>   (or CRON_SECRET if you set one)
import { pollInbox, refreshToken, housekeeping, isAdmin, safeEqual, log } from '../lib/instagram.js';

export default async function handler(req, res) {
    const auth = req.headers.authorization || '';
    const cron = process.env.CRON_SECRET && safeEqual(auth, `Bearer ${process.env.CRON_SECRET}`);
    if (!isAdmin(req) && !cron) return res.status(401).json({ error: 'unauthorized' });
    try {
        if (req.query?.task === 'weekly') {
            await refreshToken().catch((e) => log('error', `token refresh: ${e.message}`));
            await housekeeping();
            return res.status(200).json({ ok: true, task: 'weekly' });
        }
        return res.status(200).json({ ok: true, ...(await pollInbox()) });
    } catch (e) {
        await log('error', `inbox poll: ${e.message}`);
        return res.status(500).json({ error: e.message });
    }
}

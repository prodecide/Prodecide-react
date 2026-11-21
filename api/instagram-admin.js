// Admin API for the Instagram automation page. Every call needs
//   Authorization: Bearer <ADMIN_PASSWORD>
// Routed with ?action=state|campaign|delete|toggle|token|connect|poll|csv
import { ObjectId } from 'mongodb';
import {
    cols, ensureIndexes, getSetting, hasToken, isAdmin, saveToken, connect, pollInbox, log,
} from '../lib/instagram.js';

const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const oid = (id) => { try { return new ObjectId(String(id)); } catch { return null; } };
const str = (v) => String(v ?? '');

function cleanCampaign(b) {
    const keyword = str(b.keyword).trim();
    return {
        name: str(b.name || keyword || 'Campaign').trim().slice(0, 80),
        keyword: keyword.slice(0, 60),
        media_id: str(b.media_id).trim(),
        active: !!b.active,
        follow_gate: !!b.follow_gate,
        public_replies: (Array.isArray(b.public_replies) ? b.public_replies : []).map((s) => str(s).trim()).filter(Boolean).slice(0, 20),
        opener: str(b.opener),
        gift: str(b.gift),
        not_following: str(b.not_following),
        button_label: str(b.button_label || 'Done, send it').slice(0, 20),
        opener_button: str(b.opener_button || 'Send it 📩').slice(0, 20),
    };
}

export default async function handler(req, res) {
    if (!isAdmin(req)) return bad(res, 'unauthorized', 401);
    const action = req.query?.action || 'state';
    try {
        await ensureIndexes();
        const { campaigns, leads, events } = await cols();

        if (action === 'state' && req.method === 'GET') {
            const [camps, recent, evs, stats] = await Promise.all([
                campaigns.find({}).sort({ _id: 1 }).toArray(),
                leads.find({}).sort({ updated_at: -1 }).limit(100).toArray(),
                events.find({}).sort({ ts: -1 }).limit(40).toArray(),
                leads.aggregate([{ $group: { _id: { c: '$campaign_id', s: '$status' }, n: { $sum: 1 } } }]).toArray(),
            ]);
            const kw = Object.fromEntries(camps.map((c) => [String(c._id), c.keyword]));
            const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
            return res.status(200).json({
                campaigns: camps.map((c) => ({ ...c, id: String(c._id) })),
                leads: recent.map((l) => ({ ...l, id: String(l._id), campaign_id: String(l.campaign_id), keyword: kw[String(l.campaign_id)] || '—' })),
                events: evs.map((e) => ({ id: String(e._id), ts: e.ts, level: e.level, msg: e.msg })),
                stats: stats.map((s) => ({ campaign_id: String(s._id.c), status: s._id.s, n: s.n })),
                account: {
                    username: await getSetting('ig_username'),
                    id: await getSetting('ig_user_id'),
                    token: await hasToken(),
                    token_expires: Number(await getSetting('ig_token_expires')) || null,
                },
                now: Date.now(),
                webhook_url: `${origin}/api/instagram-webhook`,
                verify_token_set: !!process.env.IG_VERIFY_TOKEN,
                app_secret_set: !!process.env.IG_APP_SECRET,
            });
        }

        if (action === 'campaign' && req.method === 'POST') {
            const b = req.body || {};
            const f = cleanCampaign(b);
            if (!f.keyword || !f.gift) return bad(res, 'keyword and gift message are required');
            if (f.follow_gate && !f.opener) return bad(res, 'the follow check needs an opener message');
            if (b.id) {
                const id = oid(b.id);
                if (!id) return bad(res, 'invalid campaign id');
                await campaigns.updateOne({ _id: id }, { $set: f });
            } else {
                await campaigns.insertOne({ ...f, created_at: Date.now() });
            }
            return res.status(200).json({ ok: true });
        }

        if (action === 'toggle' && req.method === 'POST') {
            const id = oid(req.body?.id);
            if (!id) return bad(res, 'invalid campaign id');
            await campaigns.updateOne({ _id: id }, { $set: { active: !!req.body.active } });
            return res.status(200).json({ ok: true });
        }

        if (action === 'delete' && req.method === 'POST') {
            const id = oid(req.body?.id);
            if (!id) return bad(res, 'invalid campaign id');
            await campaigns.deleteOne({ _id: id });
            return res.status(200).json({ ok: true });
        }

        if (action === 'token' && req.method === 'POST') {
            const t = str(req.body?.token).trim();
            if (!t) return bad(res, 'token missing');
            const ig = await saveToken(t);
            return res.status(200).json({ ok: true, username: ig.username });
        }

        if (action === 'connect' && req.method === 'POST') {
            const ig = await connect();
            return res.status(200).json({ ok: true, username: ig.username });
        }

        if (action === 'poll' && req.method === 'POST') {
            return res.status(200).json({ ok: true, ...(await pollInbox()) });
        }

        if (action === 'clear-log' && req.method === 'POST') {
            await events.deleteMany({});
            return res.status(200).json({ ok: true });
        }

        if (action === 'csv' && req.method === 'GET') {
            const [all, camps] = await Promise.all([leads.find({}).sort({ created_at: 1 }).toArray(), campaigns.find({}).toArray()]);
            const kw = Object.fromEntries(camps.map((c) => [String(c._id), c.keyword]));
            // Prefix formula-looking cells so spreadsheets don't execute usernames as formulas.
            const esc = (v) => {
                let s = String(v ?? '');
                if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
                return `"${s.replace(/"/g, '""')}"`;
            };
            const rows = all.map((l) => [l.username, l.ig_user_id, kw[String(l.campaign_id)], l.source, l.status, l.followed, new Date(l.created_at).toISOString()].map(esc).join(','));
            res.setHeader('content-type', 'text/csv');
            res.setHeader('content-disposition', 'attachment; filename=instagram-leads.csv');
            return res.status(200).send(['username,ig_user_id,keyword,source,status,followed,created_at', ...rows].join('\n'));
        }

        return bad(res, 'not found', 404);
    } catch (e) {
        console.error('instagram-admin failed:', e);
        await log('error', `admin ${action}: ${e.message}`);
        return bad(res, e.message, 500);
    }
}

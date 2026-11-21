// Instagram comment -> DM automation engine.
// Ported from itsbelalai/dm-drop (Cloudflare Worker + D1) to Node + MongoDB.
// Uses the official Instagram API (Meta Graph API).
import crypto from 'crypto';
import clientPromise from './mongodb.js';

const DB_NAME = 'prodecide';
const now = () => Date.now();

export const GRAPH_BASE = () => process.env.IG_GRAPH_BASE || 'https://graph.facebook.com/v23.0';
export const REFRESH_BASE = () => process.env.IG_REFRESH_BASE || 'https://graph.instagram.com';

// ---------- storage ----------

export async function cols() {
    const db = (await clientPromise).db(DB_NAME);
    return {
        campaigns: db.collection('ig_campaigns'),
        leads: db.collection('ig_leads'),
        events: db.collection('ig_events'),
        settings: db.collection('ig_settings'),
    };
}

let indexesReady = null;
export function ensureIndexes() {
    if (!indexesReady) {
        indexesReady = cols().then(async (c) => {
            await c.leads.createIndex({ ig_user_id: 1, campaign_id: 1 }, { unique: true });
            await c.leads.createIndex({ updated_at: -1 });
            await c.events.createIndex({ ts: -1 });
        }).catch((e) => { indexesReady = null; throw e; });
    }
    return indexesReady;
}

export async function getSetting(key) {
    const { settings } = await cols();
    const r = await settings.findOne({ _id: key });
    return r ? r.value : null;
}
export async function setSetting(key, value) {
    const { settings } = await cols();
    await settings.updateOne({ _id: key }, { $set: { value } }, { upsert: true });
}

export async function log(level, msg) {
    try {
        const { events } = await cols();
        await events.insertOne({ ts: now(), level, msg: String(msg).slice(0, 500) });
    } catch { /* logging must never throw */ }
}

// ---------- security ----------

export function safeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export function validSignature(raw, header) {
    const secret = process.env.IG_APP_SECRET;
    if (!secret || !header || !header.startsWith('sha256=')) return false;
    const hex = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    return safeEqual(hex, header.slice(7));
}

export function isAdmin(req) {
    const h = req.headers.authorization || '';
    return !!process.env.ADMIN_PASSWORD && safeEqual(h, `Bearer ${process.env.ADMIN_PASSWORD}`);
}

// ---------- Graph API ----------

async function token() {
    return (await getSetting('ig_token')) || process.env.IG_TOKEN || '';
}

async function graph(method, path, body) {
    const t = await token();
    if (!t) throw new Error('no Instagram token saved yet');
    const res = await fetch(GRAPH_BASE() + path, {
        method,
        headers: { authorization: `Bearer ${t}`, ...(body ? { 'content-type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw new Error(data.error?.message || `HTTP ${res.status}`);
    return data;
}

function sendMessage(igId, recipient, message) {
    const body = { recipient, message };
    if (recipient.id) body.messaging_type = 'RESPONSE';
    return graph('POST', `/${igId}/messages`, body);
}

// ---------- helpers ----------

export function matches(text, keyword) {
    const kw = String(keyword || '').trim().toLowerCase();
    if (!kw) return false;
    const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^\\p{L}\\p{N}])${esc}($|[^\\p{L}\\p{N}])`, 'iu').test(String(text || '').toLowerCase());
}

const activeCampaigns = async () => (await cols()).campaigns.find({ active: true }).sort({ _id: 1 }).toArray();

async function setStatus(uid, cid, status, followed = null) {
    const { leads } = await cols();
    const set = { status, updated_at: now() };
    if (followed !== null) set.followed = followed;
    await leads.updateOne({ ig_user_id: uid, campaign_id: cid }, { $set: set });
}

// Insert once per (user, campaign). Returns true only if newly created.
async function createLead(doc) {
    const { leads } = await cols();
    try {
        await leads.insertOne({ followed: null, username: null, comment_id: null, ...doc });
        return true;
    } catch (e) {
        if (e.code === 11000) return false;
        throw e;
    }
}

// ---------- webhook ----------

export function verifyWebhook(query) {
    const expected = process.env.IG_VERIFY_TOKEN;
    return query['hub.mode'] === 'subscribe' && !!expected && safeEqual(String(query['hub.verify_token'] || ''), expected)
        ? String(query['hub.challenge'])
        : null;
}

export async function handleBody(body) {
    if (body.object !== 'instagram') return;
    await ensureIndexes();
    for (const entry of body.entry || []) {
        const igId = entry.id;
        for (const ch of entry.changes || []) {
            const v = ch.value || {};
            await log('debug', `event: ${ch.field} from @${v.from?.username || v.from?.id || v.sender?.id || '?'}: "${String(v.text || v.message?.text || v.postback?.title || '').slice(0, 60)}"`);
            if (ch.field === 'comments') await onComment(igId, v);
            // Unified login can deliver DMs and button taps as `changes` instead of `messaging`
            else if (ch.field === 'messages' || ch.field === 'messaging_postbacks') await onMessaging(igId, v);
        }
        for (const m of entry.messaging || []) {
            if (!m.message?.is_echo && !m.read) {
                await log('debug', `event: dm from ${m.sender?.id}: "${String(m.message?.text || m.postback?.title || '').slice(0, 60)}"`);
            }
            await onMessaging(igId, m);
        }
    }
}

// ---------- comments ----------

async function onComment(igId, v) {
    const from = v.from || {};
    if (!from.id || from.id === igId || from.id === (await getSetting('ig_user_id'))) return; // our own replies
    const text = v.text || '';
    const campaigns = await activeCampaigns();
    const c = campaigns.find((x) => matches(text, x.keyword) && (!x.media_id || x.media_id === v.media?.id));
    if (!c) return;

    const t = now();
    const commentId = v.comment_id || v.id;
    const created = await createLead({
        ig_user_id: from.id, username: from.username || null, campaign_id: c._id,
        comment_id: commentId, source: 'comment', status: 'opened', created_at: t, updated_at: t,
    });
    if (!created) {
        await log('info', `@${from.username} commented "${c.keyword}" again, already handled`);
        return;
    }

    const first = c.follow_gate ? c.opener : c.gift;
    try {
        if (c.follow_gate) {
            // Try a tap-to-answer button; Meta documents private replies as text-only, so fall back if refused.
            try {
                await sendMessage(igId, { comment_id: commentId }, {
                    text: first,
                    quick_replies: [{ content_type: 'text', title: (c.opener_button || 'Send it 📩').slice(0, 20), payload: `CHECK:${c._id}` }],
                });
            } catch (e) {
                await log('debug', `button in first DM refused (${e.message}), sent as text`);
                await sendMessage(igId, { comment_id: commentId }, { text: `${first}\n\n(Reply YES 👇)` });
            }
        } else {
            await sendMessage(igId, { comment_id: commentId }, { text: first });
        }
        await setStatus(from.id, c._id, c.follow_gate ? 'opened' : 'sent');
        await log('info', `@${from.username}: ${c.follow_gate ? 'opener' : 'gift'} sent for "${c.keyword}"`);
    } catch (e) {
        await setStatus(from.id, c._id, 'error');
        await log('error', `@${from.username}: private reply failed: ${e.message}`);
        return; // don't say "check your DMs" if nothing was sent
    }

    const replies = (c.public_replies || []).filter(Boolean);
    if (replies.length) {
        const msg = replies[Math.floor(Math.random() * replies.length)];
        await graph('POST', `/${commentId}/replies`, { message: msg }).catch((e) =>
            log('warn', `@${from.username}: public reply failed: ${e.message}`));
    }
}

// ---------- DMs, quick replies, buttons ----------

async function onMessaging(igId, m) {
    const sender = m.sender?.id;
    if (!sender || sender === igId || m.message?.is_echo || m.message?.is_deleted) return;
    if (m.read || m.reaction) return;

    const { leads } = await cols();
    const payload = m.message?.quick_reply?.payload || m.postback?.payload || '';
    const text = m.message?.text || m.postback?.title || '';
    const campaigns = await activeCampaigns();
    const byId = (id) => campaigns.find((x) => String(x._id) === String(id));

    let c = null;
    let lead = null;
    const pm = payload.match(/^CHECK:(.+)$/);
    if (pm) c = byId(pm[1]);
    const kwMatch = campaigns.find((x) => matches(text, x.keyword));

    if (c) lead = await leads.findOne({ ig_user_id: sender, campaign_id: c._id });
    if (!c) {
        lead = await leads.find({ ig_user_id: sender, status: { $in: ['opened', 'gated'] } }).sort({ updated_at: -1 }).limit(1).next();
        if (lead) c = byId(lead.campaign_id);
    }
    if (!c && kwMatch) {
        c = kwMatch;
        lead = await leads.findOne({ ig_user_id: sender, campaign_id: c._id });
        if (lead && lead.status === 'sent') {
            // they asked again by keyword: send the gift again, nothing else
            await sendMessage(igId, { id: sender }, { text: c.gift });
            await log('info', `${lead.username ? '@' + lead.username : sender}: asked again, gift re-sent`);
            return;
        }
        if (!lead) {
            const t = now();
            await createLead({ ig_user_id: sender, campaign_id: c._id, source: 'dm', status: 'opened', created_at: t, updated_at: t });
            lead = await leads.findOne({ ig_user_id: sender, campaign_id: c._id });
        }
    }
    if (!c || !lead || lead.status === 'sent') return; // a normal DM: leave it for a human

    const who = lead.username ? '@' + lead.username : sender;
    if (!c.follow_gate) return deliver(igId, sender, c, who, null);

    let follows = null;
    try {
        const p = await graph('GET', `/${sender}?fields=username,is_user_follow_business`);
        follows = !!p.is_user_follow_business;
        if (p.username && !lead.username) await leads.updateOne({ _id: lead._id }, { $set: { username: p.username } });
    } catch (e) {
        await log('warn', `${who}: follow check failed (${e.message}), sending anyway`);
        return deliver(igId, sender, c, who, null);
    }
    if (follows) return deliver(igId, sender, c, who, true);

    await sendMessage(igId, { id: sender }, {
        text: c.not_following || 'Follow first, then tap the button 👇',
        quick_replies: [{ content_type: 'text', title: (c.button_label || 'Done').slice(0, 20), payload: `CHECK:${c._id}` }],
    });
    await setStatus(sender, c._id, 'gated', false);
    await log('info', `${who}: not following yet, asked to follow`);
}

async function deliver(igId, sender, c, who, followed) {
    await sendMessage(igId, { id: sender }, { text: c.gift });
    await setStatus(sender, c._id, 'sent', followed);
    await log('info', `${who}: gift sent for "${c.keyword}"`);
}

// ---------- inbox polling (works without Advanced Access) ----------

export async function pollInbox() {
    await ensureIndexes();
    const { leads } = await cols();
    // Only spend API calls when someone is waiting for their gift (Meta allows replies for 24 h).
    const waiting = await leads.find({ status: { $in: ['opened', 'gated'] }, updated_at: { $gt: now() - 24 * 3600e3 } }).toArray();
    if (!waiting.length) return { checked: 0 };
    const igId = await getSetting('ig_user_id');
    const me = await getSetting('ig_username');
    if (!igId) return { checked: 0 };
    const r = await graph('GET', `/${igId}/conversations?platform=instagram&limit=8&fields=messages.limit(3){id,from,message,created_time}`);
    let handled = 0;
    for (const conv of r.data || []) {
        for (const m of (conv.messages?.data || []).slice().reverse()) { // oldest first
            const from = m.from || {};
            if (from.id === igId || (me && from.username === me)) continue;
            const lead = waiting.find((l) => l.ig_user_id === from.id || (l.username && l.username === from.username));
            if (!lead) continue;
            const fresh = await leads.findOne({ _id: lead._id });
            if (!fresh || !['opened', 'gated'].includes(fresh.status)) continue;
            if (Date.parse(m.created_time) <= fresh.updated_at) continue; // already answered
            await log('debug', `inbox: reply from @${from.username || from.id}: "${String(m.message || '').slice(0, 40)}"`);
            await onMessaging(igId, { sender: { id: lead.ig_user_id }, message: { mid: m.id, text: m.message || '' } });
            handled++;
        }
    }
    return { checked: waiting.length, handled };
}

// ---------- token + connection ----------

export async function refreshToken() {
    const t = await token();
    if (!t || !String(GRAPH_BASE()).includes('graph.instagram.com')) return; // system-user tokens don't expire
    const res = await fetch(`${REFRESH_BASE()}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(t)}`);
    const d = await res.json();
    if (!d.access_token) throw new Error(d.error?.message || 'no token returned');
    await setSetting('ig_token', d.access_token);
    await setSetting('ig_token_expires', now() + (d.expires_in || 5184000) * 1000);
    await log('info', 'Instagram token refreshed');
}

// Check the token, remember the account, subscribe it to webhooks.
export async function connect() {
    let ig = null;
    try {
        const r = await graph('GET', '/me/assigned_instagram_accounts?fields=id,username');
        if (r.data && r.data.length) ig = { id: r.data[0].id, username: r.data[0].username };
    } catch { /* fall through to /me */ }
    if (!ig) {
        const me = await graph('GET', '/me?fields=user_id,username');
        ig = { id: me.user_id || me.id, username: me.username };
    }
    if (!ig.id) throw new Error('no Instagram account found for this token');
    await setSetting('ig_user_id', ig.id);
    await setSetting('ig_username', ig.username || '');
    await graph('POST', `/${ig.id}/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks`);
    await log('info', `connected @${ig.username} and subscribed to comments + messages`);
    return ig;
}

export async function saveToken(t) {
    await setSetting('ig_token', String(t).trim());
    await setSetting('ig_token_expires', GRAPH_BASE().includes('graph.instagram.com') ? now() + 60 * 864e5 : 0);
    return connect();
}

export async function hasToken() { return !!(await token()); }

// Trim old logs/leads (call occasionally).
export async function housekeeping() {
    const { events, leads } = await cols();
    await events.deleteMany({ ts: { $lt: now() - 14 * 864e5 } });
    await leads.deleteMany({ updated_at: { $lt: now() - 365 * 864e5 } });
}

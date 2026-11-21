import { useCallback, useEffect, useRef, useState } from 'react';
import './AdminInstagram.css';

const API = '/api/instagram-admin';
const PW_KEY = 'prodecide_admin_pw';

const EMPTY = {
    id: '', name: '', keyword: '', media_id: '', active: true, follow_gate: true,
    public_replies: '', opener: '', opener_button: 'Send it 📩',
    not_following: '', button_label: 'Done, send it', gift: '',
};

const STATUS_LABEL = { sent: 'Gift sent', gated: 'Needs follow', opened: 'Waiting', error: 'Error' };

const readPw = () => { try { return sessionStorage.getItem(PW_KEY) || ''; } catch { return ''; } };

const toForm = (c) => ({
    ...EMPTY, ...c,
    id: c.id || '',
    media_id: c.media_id || '',
    public_replies: (c.public_replies || []).join('\n'),
    opener_button: c.opener_button || EMPTY.opener_button,
    button_label: c.button_label || EMPTY.button_label,
});

const timeAgo = (ts, now) => {
    const s = Math.max(1, Math.round((now - ts) / 1000));
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.round(s / 60)}m ago`;
    if (s < 86400) return `${Math.round(s / 3600)}h ago`;
    return `${Math.round(s / 86400)}d ago`;
};

const AdminInstagram = () => {
    const [pw, setPw] = useState(readPw);
    const [pwInput, setPwInput] = useState('');
    const [loginErr, setLoginErr] = useState('');
    const [state, setState] = useState(null);
    const [form, setForm] = useState(null); // null = editor closed
    const [token, setToken] = useState('');
    const [busy, setBusy] = useState('');
    const [toast, setToast] = useState('');
    const [copied, setCopied] = useState(false);
    const toastTimer = useRef(null);
    const editorRef = useRef(null);

    const notify = useCallback((msg) => {
        setToast(msg);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 2800);
    }, []);

    const call = useCallback(async (action, { method = 'GET', body } = {}) => {
        const r = await fetch(`${API}?action=${action}`, {
            method,
            headers: { authorization: `Bearer ${pw}`, 'content-type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (r.status === 401) {
            setPw('');
            try { sessionStorage.removeItem(PW_KEY); } catch { /* ignore */ }
            setLoginErr('Wrong password');
            throw new Error('unauthorized');
        }
        if (action === 'csv') return r;
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        return d;
    }, [pw]);

    const load = useCallback(async () => {
        if (!pw) return;
        try { setState(await call('state')); }
        catch (e) { if (e.message !== 'unauthorized') notify(e.message); }
    }, [pw, call, notify]);

    // Initial fetch (state is set asynchronously, after the request resolves)
    useEffect(() => {
        if (!pw) return undefined;
        let alive = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- setState runs after the fetch resolves, not synchronously
        call('state').then((d) => { if (alive) setState(d); }).catch((e) => { if (alive && e.message !== 'unauthorized') notify(e.message); });
        return () => { alive = false; };
    }, [pw, call, notify]);

    // Live refresh while the editor is closed
    useEffect(() => {
        if (!pw || form) return undefined;
        const t = setInterval(() => { if (!document.hidden) load(); }, 15000);
        return () => clearInterval(t);
    }, [pw, form, load]);

    useEffect(() => { if (form && editorRef.current) editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [form?.id, form === null]); // eslint-disable-line react-hooks/exhaustive-deps

    const run = async (key, fn) => {
        setBusy(key);
        try { await fn(); } catch (e) { if (e.message !== 'unauthorized') notify(e.message); }
        setBusy('');
    };

    const login = (e) => {
        e.preventDefault();
        setLoginErr('');
        try { sessionStorage.setItem(PW_KEY, pwInput); } catch { /* ignore */ }
        setPw(pwInput);
        setPwInput('');
    };

    const logout = () => {
        try { sessionStorage.removeItem(PW_KEY); } catch { /* ignore */ }
        setPw(''); setState(null); setForm(null);
    };

    const save = (e) => {
        e.preventDefault();
        run('save', async () => {
            await call('campaign', {
                method: 'POST',
                body: {
                    ...form,
                    id: form.id || undefined,
                    public_replies: form.public_replies.split('\n').map((s) => s.trim()).filter(Boolean),
                },
            });
            setForm(null); notify('Campaign saved'); await load();
        });
    };

    const remove = () => {
        if (!window.confirm('Delete this campaign? People already in the list stay.')) return;
        run('delete', async () => {
            await call('delete', { method: 'POST', body: { id: form.id } });
            setForm(null); notify('Campaign deleted'); await load();
        });
    };

    const toggle = (c) => run(`toggle-${c.id}`, async () => {
        await call('toggle', { method: 'POST', body: { id: c.id, active: !c.active } });
        await load();
    });

    const saveToken = () => run('token', async () => {
        const d = await call('token', { method: 'POST', body: { token } });
        setToken(''); notify(`Connected @${d.username}`); await load();
    });

    const recheck = () => run('connect', async () => {
        const d = await call('connect', { method: 'POST' });
        notify(`Connected @${d.username}`); await load();
    });

    const poll = () => run('poll', async () => {
        const d = await call('poll', { method: 'POST' });
        notify(d.checked ? `Checked ${d.checked} waiting · ${d.handled || 0} replied` : 'Nobody is waiting');
        await load();
    });

    const exportCsv = () => run('csv', async () => {
        const r = await call('csv');
        const url = URL.createObjectURL(await r.blob());
        const a = document.createElement('a');
        a.href = url; a.download = 'instagram-leads.csv'; a.click();
        URL.revokeObjectURL(url);
    });

    const copyHook = async () => {
        try { await navigator.clipboard.writeText(state.webhook_url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
        catch { notify('Copy failed, select it manually'); }
    };

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    // ---------- login ----------
    if (!pw) {
        return (
            <section className="ig-login premium-container">
                <div className="ig-card ig-login-card">
                    <div className="ig-badge">Admin</div>
                    <h1 className="ig-title">Instagram <span>Automation</span></h1>
                    <form onSubmit={login} className="ig-form">
                        <div className="ig-field">
                            <label htmlFor="ig-pw">Admin password</label>
                            <input id="ig-pw" type="password" autoComplete="current-password" autoFocus
                                value={pwInput} onChange={(e) => setPwInput(e.target.value)} />
                        </div>
                        {loginErr && <p className="ig-error">{loginErr}</p>}
                        <button className="cta-button ig-cta" type="submit" disabled={!pwInput}>Open</button>
                    </form>
                </div>
            </section>
        );
    }

    if (!state) return <section className="ig-page"><p className="ig-muted ig-center">Loading…</p>{toast && <div className="ig-toast">{toast}</div>}</section>;

    // ---------- derived ----------
    const { account, campaigns, leads, events, stats } = state;
    const by = {};
    stats.forEach((s) => { by[s.status] = (by[s.status] || 0) + s.n; });
    const total = Object.values(by).reduce((a, b) => a + b, 0);
    const count = (id, st) => stats.filter((s) => s.campaign_id === id && (!st || s.status === st)).reduce((a, s) => a + s.n, 0);
    const days = account.token_expires ? Math.round((account.token_expires - state.now) / 864e5) : null;
    const connected = !!account.username;
    const steps = [
        { ok: state.app_secret_set && state.verify_token_set, label: 'Server keys', hint: 'Set IG_APP_SECRET and IG_VERIFY_TOKEN in your environment' },
        { ok: connected, label: 'Account connected', hint: 'Paste an access token below' },
        { ok: campaigns.some((c) => c.active), label: 'Active campaign', hint: 'Create and switch on a campaign' },
    ];

    const tiles = [
        ['Triggered', total, false],
        ['Gifts sent', by.sent || 0, true],
        ['Waiting to follow', by.gated || 0, false],
        ['Waiting for reply', by.opened || 0, false],
        ['Errors', by.error || 0, false],
    ];

    return (
        <section className="ig-page premium-container">
            {/* Header */}
            <div className="ig-head">
                <div>
                    <div className="ig-badge">Admin</div>
                    <h1 className="ig-title">Instagram <span>Automation</span></h1>
                    <p className="ig-sub">Someone comments your keyword. We reply publicly, DM them, check they follow you, and drop your link.</p>
                </div>
                <div className="ig-head-actions">
                    <span className={`ig-conn ${connected ? 'on' : ''}`}>
                        <i />{connected ? `@${account.username}${days !== null && days > 0 ? ` · token ${days}d` : ''}` : 'Not connected'}
                    </span>
                    <button className="ig-btn ghost" onClick={() => run('refresh', async () => { await load(); notify('Updated'); })} disabled={busy === 'refresh'}>Refresh</button>
                    <button className="ig-btn ghost" onClick={exportCsv} disabled={busy === 'csv'}>Export leads</button>
                    <button className="ig-btn ghost" onClick={logout}>Lock</button>
                </div>
            </div>

            {/* Stats */}
            <div className="ig-stats">
                {tiles.map(([label, n, hl]) => (
                    <div key={label} className={`ig-stat ${hl ? 'hl' : ''}`}>
                        <div className="ig-stat-n">{n}</div>
                        <div className="ig-stat-l">{label}</div>
                    </div>
                ))}
            </div>

            {/* Setup */}
            <div className="ig-card">
                <div className="ig-card-head">
                    <h2>Connection</h2>
                    <div className="ig-steps">
                        {steps.map((s, i) => (
                            <span key={s.label} className={`ig-step ${s.ok ? 'ok' : ''}`} title={s.ok ? '' : s.hint}>
                                <b>{s.ok ? '✓' : i + 1}</b>{s.label}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="ig-field">
                    <label>Webhook URL <small>paste in Meta dashboard → Instagram → Webhooks (subscribe to comments, messages, messaging_postbacks)</small></label>
                    <div className="ig-row">
                        <code className="ig-code ig-grow">{state.webhook_url}</code>
                        <button className="ig-btn ghost" onClick={copyHook}>{copied ? 'Copied ✓' : 'Copy'}</button>
                    </div>
                </div>
                <div className="ig-field">
                    <label htmlFor="ig-token">Access token <small>from the Meta app dashboard. Refreshes itself weekly once saved</small></label>
                    <div className="ig-row">
                        <input id="ig-token" className="ig-grow" type="password" autoComplete="off" placeholder={account.token ? '••••••••••••  (saved, paste to replace)' : 'Paste token'}
                            value={token} onChange={(e) => setToken(e.target.value)} />
                        <button className="ig-btn" onClick={saveToken} disabled={!token || busy === 'token'}>{busy === 'token' ? 'Connecting…' : 'Save & connect'}</button>
                        <button className="ig-btn ghost" onClick={recheck} disabled={!account.token || busy === 'connect'}>Re-check</button>
                    </div>
                </div>
            </div>

            {/* Campaigns */}
            <div className="ig-card">
                <div className="ig-card-head">
                    <h2>Campaigns</h2>
                    <button className="ig-btn" onClick={() => setForm({ ...EMPTY })}>+ New campaign</button>
                </div>
                {campaigns.length === 0 && <p className="ig-muted">No campaigns yet. Create one to start catching comments.</p>}
                {campaigns.map((c) => (
                    <div className="ig-camp" key={c.id}>
                        <div className="ig-camp-main">
                            <span className="ig-kw">{c.keyword}</span>
                            <span className="ig-muted"> · {c.name} · {c.media_id ? 'one post' : 'all posts'}{c.follow_gate ? ' · follow check' : ''}</span>
                            <div className="ig-muted ig-small">{count(c.id)} triggered · {count(c.id, 'sent')} gifts sent</div>
                        </div>
                        <div className="ig-row">
                            <button type="button" role="switch" aria-checked={c.active} aria-label={`${c.active ? 'Pause' : 'Activate'} ${c.keyword}`}
                                className={`ig-switch ${c.active ? 'on' : ''}`} onClick={() => toggle(c)} disabled={busy === `toggle-${c.id}`}><i /></button>
                            <span className={`ig-pill ${c.active ? 'sent' : ''}`}>{c.active ? 'Active' : 'Paused'}</span>
                            <button className="ig-btn ghost" onClick={() => setForm(toForm(c))}>Edit</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor */}
            {form && (
                <form className="ig-card ig-editor" onSubmit={save} ref={editorRef}>
                    <div className="ig-card-head"><h2>{form.id ? 'Edit campaign' : 'New campaign'}</h2></div>
                    <div className="ig-editor-grid">
                        <div className="ig-editor-fields">
                            <div className="ig-two">
                                <div className="ig-field"><label htmlFor="f-kw">Keyword <small>whole word, any case</small></label>
                                    <input id="f-kw" value={form.keyword} onChange={set('keyword')} placeholder="guide" required /></div>
                                <div className="ig-field"><label htmlFor="f-name">Name</label>
                                    <input id="f-name" value={form.name} onChange={set('name')} placeholder="Guide reel" /></div>
                            </div>
                            <div className="ig-field"><label htmlFor="f-media">Only this post / reel ID <small>empty = every post</small></label>
                                <input id="f-media" value={form.media_id} onChange={set('media_id')} /></div>
                            <div className="ig-toggles">
                                <label className="ig-check"><input type="checkbox" checked={form.active} onChange={set('active')} /> Active</label>
                                <label className="ig-check"><input type="checkbox" checked={form.follow_gate} onChange={set('follow_gate')} /> Ask them to follow before the gift</label>
                            </div>
                            <div className="ig-field"><label htmlFor="f-pub">Public replies under the comment <small>one per line, picked at random</small></label>
                                <textarea id="f-pub" value={form.public_replies} onChange={set('public_replies')} placeholder={'Sent! Check your DMs 📩\nJust DMed you 🔥'} /></div>
                            {form.follow_gate && (
                                <>
                                    <div className="ig-field"><label htmlFor="f-open">First DM <small>sent with a tap button; falls back to text + “Reply YES” if Meta refuses the button</small></label>
                                        <textarea id="f-open" value={form.opener} onChange={set('opener')} required /></div>
                                    <div className="ig-two">
                                        <div className="ig-field"><label htmlFor="f-ob">First DM button <small>max 20</small></label>
                                            <input id="f-ob" maxLength={20} value={form.opener_button} onChange={set('opener_button')} /></div>
                                        <div className="ig-field"><label htmlFor="f-bl">“Done” button <small>max 20</small></label>
                                            <input id="f-bl" maxLength={20} value={form.button_label} onChange={set('button_label')} /></div>
                                    </div>
                                    <div className="ig-field"><label htmlFor="f-nf">If they’re not following yet</label>
                                        <textarea id="f-nf" value={form.not_following} onChange={set('not_following')} placeholder="Follow me first, then tap the button 👇" /></div>
                                </>
                            )}
                            <div className="ig-field"><label htmlFor="f-gift">Gift message <small>include your link</small></label>
                                <textarea id="f-gift" className="tall" value={form.gift} onChange={set('gift')} required /></div>
                        </div>

                        {/* Live preview */}
                        <aside className="ig-preview" aria-label="DM preview">
                            <div className="ig-preview-title">Live preview</div>
                            <div className="ig-phone">
                                <div className="ig-bubble them">{form.keyword || 'keyword'}</div>
                                {form.public_replies.split('\n').find(Boolean) && <div className="ig-reply">↳ {form.public_replies.split('\n').find(Boolean)}</div>}
                                {form.follow_gate ? (
                                    <>
                                        <div className="ig-bubble me">{form.opener || 'First DM…'}</div>
                                        <div className="ig-chip">{form.opener_button || 'Send it'}</div>
                                        <div className="ig-bubble me">{form.not_following || 'Follow first, then tap the button 👇'}</div>
                                        <div className="ig-chip">{form.button_label || 'Done'}</div>
                                    </>
                                ) : null}
                                <div className="ig-bubble me gift">{form.gift || 'Gift message…'}</div>
                            </div>
                        </aside>
                    </div>
                    <div className="ig-row ig-actions">
                        <button className="ig-btn" type="submit" disabled={busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save'}</button>
                        <button className="ig-btn ghost" type="button" onClick={() => setForm(null)}>Cancel</button>
                        <span className="ig-grow" />
                        {form.id && <button className="ig-btn danger" type="button" onClick={remove} disabled={busy === 'delete'}>Delete</button>}
                    </div>
                </form>
            )}

            {/* Leads + activity */}
            <div className="ig-two-col">
                <div className="ig-card">
                    <div className="ig-card-head"><h2>Latest people</h2>
                        <button className="ig-btn ghost" onClick={poll} disabled={busy === 'poll'}>{busy === 'poll' ? 'Checking…' : 'Check inbox'}</button>
                    </div>
                    <div className="ig-scroll">
                        <table className="ig-table">
                            <thead><tr><th>Who</th><th>Keyword</th><th>Status</th><th>When</th></tr></thead>
                            <tbody>
                                {leads.length === 0 && <tr><td colSpan="4" className="ig-muted">Nobody yet.</td></tr>}
                                {leads.map((l) => (
                                    <tr key={l.id}>
                                        <td>{l.username ? `@${l.username}` : <span className="ig-muted">{l.ig_user_id}</span>}<div className="ig-muted ig-small">{l.source}</div></td>
                                        <td>{l.keyword}</td>
                                        <td><span className={`ig-pill ${l.status}`}>{STATUS_LABEL[l.status] || l.status}</span></td>
                                        <td className="ig-muted">{timeAgo(l.updated_at, state.now)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="ig-card">
                    <div className="ig-card-head"><h2>Activity</h2>
                        <button className="ig-btn ghost" onClick={() => run('clear', async () => { await call('clear-log', { method: 'POST' }); await load(); })} disabled={!events.length}>Clear</button>
                    </div>
                    <div className="ig-log">
                        {events.length === 0 && <span className="ig-muted">Quiet so far.</span>}
                        {events.map((e) => (
                            <div key={e.id} className={e.level}>{new Date(e.ts).toLocaleTimeString()} · {e.msg}</div>
                        ))}
                    </div>
                </div>
            </div>

            {toast && <div className="ig-toast" role="status">{toast}</div>}
        </section>
    );
};

export default AdminInstagram;

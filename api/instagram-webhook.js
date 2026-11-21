// Meta webhook endpoint for the Instagram automation.
//   GET  -> verification handshake (hub.challenge)
//   POST -> comment / DM / button events (signature checked)
import { verifyWebhook, validSignature, handleBody, log } from '../lib/instagram.js';

// Signature verification needs the exact raw bytes Meta sent.
export const config = { api: { bodyParser: false } };

async function readRaw(req) {
    if (typeof req.rawBody === 'string' || Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf8');
    const chunks = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const challenge = verifyWebhook(req.query || {});
            return challenge !== null ? res.status(200).send(challenge) : res.status(403).send('forbidden');
        }
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        const raw = await readRaw(req);
        if (!validSignature(raw, req.headers['x-hub-signature-256'])) {
            await log('warn', 'webhook with bad signature rejected');
            return res.status(403).send('bad signature');
        }
        // Process before responding: serverless runtimes freeze once the response is sent.
        await handleBody(JSON.parse(raw)).catch((e) => log('error', `webhook: ${e.message}`));
        return res.status(200).send('ok');
    } catch (e) {
        console.error('instagram-webhook failed:', e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

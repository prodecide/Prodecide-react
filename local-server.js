import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables *before* importing handlers that need them
const result = dotenv.config({ path: '.env.local' });
if (result.error) {
    console.warn("Warning: .env.local file not found or could not be read.");
} else {
    console.log("Loaded environment variables from .env.local:", Object.keys(result.parsed || {}));
}

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.send("Server is working and updated!");
});

// Mount the handlers
app.all('/api/consultants', async (req, res) => {
    try {
        const { default: consultantsHandler } = await import('./api/consultants.js');
        await consultantsHandler(req, res);
    } catch (error) {
        console.error('Error in consultants handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.post('/api/analyze', async (req, res) => {
    try {
        const { default: analyzeHandler } = await import('./api/analyze.js');
        await analyzeHandler(req, res);
    } catch (error) {
        console.error('Error in analyze handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.post('/api/save-result', async (req, res) => {
    try {
        const { default: saveResultHandler } = await import('./api/save-result.js');
        await saveResultHandler(req, res);
    } catch (error) {
        console.error('Error in save-result handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.get('/api/get-result', async (req, res) => {
    try {
        const { default: getResultHandler } = await import('./api/get-result.js');
        await getResultHandler(req, res);
    } catch (error) {
        console.error('Error in get-result handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.listen(port, () => {
    console.log(`Local API server running at http://localhost:${port}`);
    console.log(`- POST /api/analyze`);
    console.log(`- POST /api/save-result`);
    console.log(`- GET  /api/get-result`);
    console.log(`- GET/POST /api/consultants`);
});

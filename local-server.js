import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import consultantsHandler from './api/consultants.js';
import analyzeHandler from './api/analyze.js';

// Load environment variables from.env.local
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

// Mock Vercel style req/res for the handlers if needed, 
// but Express req/res are largely compatible for what we are doing.

// Mount the handlers
app.all('/api/consultants', async (req, res) => {
    try {
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
        await analyzeHandler(req, res);
    } catch (error) {
        console.error('Error in analyze handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.listen(port, () => {
    console.log(`Local API server running at http://localhost:${port}`);
    console.log(`- POST /api/analyze`);
    console.log(`- GET/POST /api/consultants`);
});

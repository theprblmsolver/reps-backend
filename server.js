const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// CORS Configuration – Allow your frontend domains
// =============================================
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://theprblmsolver.github.io' // Replace with your actual GitHub Pages base URL
    // If your repo is served from a subfolder, also add:
    // 'https://theprblmsolver.github.io/your-repo-name'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors());

app.use(express.json());

// =============================================
// Health check endpoint
// =============================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// =============================================
// POST /api/apify – Start an Apify actor
// =============================================
app.post('/api/apify', async (req, res) => {
    try {
        const { endpoint } = req.query;
        if (!endpoint) {
            return res.status(400).json({ error: 'Missing endpoint parameter' });
        }

        const token = process.env.APIFY_TOKEN;
        if (!token) {
            return res.status(500).json({ error: 'APIFY_TOKEN not configured on server' });
        }

        const url = `https://api.apify.com/v2/${endpoint}?token=${token}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('POST /api/apify error:', error);
        res.status(500).json({ error: error.message });
    }
});

// =============================================
// GET /api/apify – Fetch data (e.g., dataset items)
// =============================================
app.get('/api/apify', async (req, res) => {
    try {
        const { endpoint } = req.query;
        if (!endpoint) {
            return res.status(400).json({ error: 'Missing endpoint parameter' });
        }

        const token = process.env.APIFY_TOKEN;
        if (!token) {
            return res.status(500).json({ error: 'APIFY_TOKEN not configured on server' });
        }

        let url = `https://api.apify.com/v2/${endpoint}?token=${token}`;
        // Append any additional query parameters
        Object.keys(req.query).forEach(key => {
            if (key !== 'endpoint') {
                url += `&${key}=${encodeURIComponent(req.query[key])}`;
            }
        });

        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('GET /api/apify error:', error);
        res.status(500).json({ error: error.message });
    }
});

// =============================================
// Start the server
// =============================================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
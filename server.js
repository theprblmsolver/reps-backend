const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend domains
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://yourusername.github.io'  // replace with your actual GitHub Pages URL
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Handle POST requests to start an actor
app.post('/api/apify', async (req, res) => {
    try {
        const { endpoint } = req.query;
        if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

        const token = process.env.APIFY_TOKEN;
        if (!token) return res.status(500).json({ error: 'APIFY_TOKEN not set' });

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

// Handle GET requests to fetch data (e.g., dataset items)
app.get('/api/apify', async (req, res) => {
    try {
        const { endpoint } = req.query;
        if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

        const token = process.env.APIFY_TOKEN;
        if (!token) return res.status(500).json({ error: 'APIFY_TOKEN not set' });

        let url = `https://api.apify.com/v2/${endpoint}?token=${token}`;
        // Add any additional query parameters
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

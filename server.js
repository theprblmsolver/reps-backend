const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://yourusername.github.io'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Main proxy endpoint for Apify
app.get('/api/apify', async (req, res) => {
    try {
        const { endpoint, ...params } = req.query;
        
        if (!endpoint) {
            return res.status(400).json({ error: 'Missing endpoint parameter' });
        }

        // Get token from environment variable (set in Render dashboard)
        const token = process.env.APIFY_TOKEN;
        if (!token) {
            return res.status(500).json({ error: 'APIFY_TOKEN not configured' });
        }

        // Build Apify URL
        let url = `https://api.apify.com/v2/${endpoint}?token=${token}`;
        
        // Add any additional parameters
        Object.keys(params).forEach(key => {
            url += `&${key}=${encodeURIComponent(params[key])}`;
        });

        console.log('Proxying to:', url);

        const response = await fetch(url);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
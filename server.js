const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// In-memory storage for simplicity. Replace with a database for persistence.
let thumbsUpCounts = {};

// Endpoint to increment thumbs up count
app.post('/api/thumbs-up', (req, res) => {
    const { eventId } = req.body;

    if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
    }

    if (!thumbsUpCounts[eventId]) {
        thumbsUpCounts[eventId] = 0;
    }

    thumbsUpCounts[eventId] += 1;

    res.json({ eventId, newCount: thumbsUpCounts[eventId] });
});

// Endpoint to get the current thumbs up count
app.get('/api/thumbs-up/:eventId', (req, res) => {
    const { eventId } = req.params;

    if (!thumbsUpCounts[eventId]) {
        return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ eventId, count: thumbsUpCounts[eventId] });
});

app.listen(port, () => {
    console.log(`Thumbs up API server running at http://localhost:${port}`);
});

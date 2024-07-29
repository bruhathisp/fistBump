const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Root URL route
app.get('/', (req, res) => {
    res.send('Thumbs Up API is running');
});

// Set your Glide token as an environment variable
const GLIDE_TOKEN = process.env.GLIDE_TOKEN;
const GLIDE_APP_ID = '3NS0DhxzYXaoZwaKdBxr';
const GLIDE_TABLE_ID = 'native-table-UhHK0rnmscKJImqA62m6';

// Function to get rows from Glide table
const getRows = async (query) => {
    const response = await axios.post(
        `https://api.glideapps.com/v1/tables/${GLIDE_TABLE_ID}/rows/query`,
        { query },
        {
            headers: {
                'Authorization': `Bearer ${GLIDE_TOKEN}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.rows;
};

// Function to update a row in Glide table
const updateRow = async (rowId, updateData) => {
    const response = await axios.patch(
        `https://api.glideapps.com/v1/tables/${GLIDE_TABLE_ID}/rows/${rowId}`,
        updateData,
        {
            headers: {
                'Authorization': `Bearer ${GLIDE_TOKEN}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};

// Endpoint to increment thumbs up count
app.post('/api/thumbs-up', async (req, res) => {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
        return res.status(400).json({ error: 'Event ID and User ID are required' });
    }

    try {
        // Fetch the event row by eventId
        const rows = await getRows({ filters: [{ column: 'Uet7T', value: eventId }] });
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const row = rows[0];
        const currentThumbsUpCount = parseInt(row.pO9Zw, 10) || 0;
        let thumbsUpUsers = row.MC4Bt ? row.MC4Bt.split(',') : [];

        if (!thumbsUpUsers.includes(userId)) {
            thumbsUpUsers.push(userId);
            const newThumbsUpCount = currentThumbsUpCount + 1;

            // Update the row with the new thumbs up count and users
            await updateRow(row.id, {
                pO9Zw: newThumbsUpCount.toString(),
                MC4Bt: thumbsUpUsers.join(','),
            });

            res.json({ eventId, newCount: newThumbsUpCount, users: thumbsUpUsers });
        } else {
            res.status(400).json({ error: 'User has already given a thumbs up for this event' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get the current thumbs up count and users
app.get('/api/thumbs-up/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        // Fetch the event row by eventId
        const rows = await getRows({ filters: [{ column: 'Uet7T', value: eventId }] });
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const row = rows[0];
        const currentThumbsUpCount = parseInt(row.pO9Zw, 10) || 0;
        const thumbsUpUsers = row.MC4Bt ? row.MC4Bt.split(',') : [];

        res.json({ eventId, count: currentThumbsUpCount, users: thumbsUpUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Thumbs up API server running at http://localhost:${port}`);
});


const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

const GLIDE_API_TOKEN = process.env.GLIDE_API_TOKEN;
const GLIDE_APP_ID = process.env.GLIDE_APP_ID;
const GLIDE_TABLE_ID = process.env.GLIDE_TABLE_ID;

const GLIDE_API_URL = `https://api.glideapps.com/${GLIDE_APP_ID}/tables/${GLIDE_TABLE_ID}`;

// Middleware to set headers for Glide API requests
axios.defaults.headers.common['Authorization'] = `Bearer ${GLIDE_API_TOKEN}`;

// Update thumbs-up count API
app.post('/thumbs-up', async (req, res) => {
    const { eventId, userName } = req.body;

    try {
        // Fetch the event data
        const response = await axios.get(`${GLIDE_API_URL}/rows`);
        const rows = response.data;

        const eventRow = rows.find(row => row.eventId === eventId);
        if (!eventRow) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const thumbsUpUsers = eventRow.thumbsUpUsers ? JSON.parse(eventRow.thumbsUpUsers) : [];
        if (thumbsUpUsers.includes(userName)) {
            return res.status(400).json({ message: 'User has already given thumbs up for this event' });
        }

        // Update the thumbs up count and users
        thumbsUpUsers.push(userName);
        const thumbsUpCount = parseInt(eventRow.thumbsUpCount || '0') + 1;

        await axios.patch(`${GLIDE_API_URL}/rows/${eventRow.id}`, {
            thumbsUpCount: thumbsUpCount.toString(),
            thumbsUpUsers: JSON.stringify(thumbsUpUsers)
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.json({ message: 'Thumbs up count updated successfully' });
    } catch (error) {
        console.error('Error updating thumbs up count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

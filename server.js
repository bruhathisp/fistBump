const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
import * as glide from "@glideapps/tables";
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Root URL route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Set your Glide token as an environment variable
const GLIDE_TOKEN = process.env.GLIDE_TOKEN;
const GLIDE_APP_ID = '3NS0DhxzYXaoZwaKdBxr';
const GLIDE_TABLE_ID = 'native-table-UhHK0rnmscKJImqA62m6';

// Initialize Glide table
const wistfulHospitalTable = glide.table({
    token: GLIDE_TOKEN,
    app: GLIDE_APP_ID,
    table: GLIDE_TABLE_ID,
    columns: {
        sno: { type: "string", name: "Name" },
        eventName: { type: "string", name: "HeVcI" },
        eventId: { type: "string", name: "Uet7T" },
        eventHeadline: { type: "string", name: "KOyac" },
        eventDescription: { type: "string", name: "favEH" },
        moreInformation: { type: "string", name: "3WVqe" },
        userName: { type: "string", name: "0GQOQ" },
        mailId: { type: "string", name: "CxJtT" },
        phoneNumber: { type: "string", name: "te8cn" },
        thumbsUpCount: { type: "string", name: "pO9Zw" },
        thumbsUpUsers: { type: "string", name: "MC4Bt" }
    }
});

// Function to get rows from Glide table
const getRows = async (query) => {
    const response = await wistfulHospitalTable.get(query);
    return response;
};

// Function to update a row in Glide table
const updateRow = async (rowId, updateData) => {
    const response = await wistfulHospitalTable.update(rowId, updateData);
    return response;
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
        const currentThumbsUpCount = parseInt(row.thumbsUpCount, 10) || 0;
        let thumbsUpUsers = row.thumbsUpUsers ? row.thumbsUpUsers.split(',') : [];

        if (!thumbsUpUsers.includes(userId)) {
            thumbsUpUsers.push(userId);
            const newThumbsUpCount = currentThumbsUpCount + 1;

            // Update the row with the new thumbs up count and users
            await updateRow(row.id, {
                thumbsUpCount: newThumbsUpCount.toString(),
                thumbsUpUsers: thumbsUpUsers.join(',')
            });

            res.json({ eventId, newCount: newThumbsUpCount, users: thumbsUpUsers });
        } else {
            res.status(400).json({ error: 'User has already given a thumbs up for this event' });
        }
    } catch (error) {
        console.error('Error in thumbs-up endpoint:', error.message);
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
        const currentThumbsUpCount = parseInt(row.thumbsUpCount, 10) || 0;
        const thumbsUpUsers = row.thumbsUpUsers ? row.thumbsUpUsers.split(',') : [];

        res.json({ eventId, count: currentThumbsUpCount, users: thumbsUpUsers });
    } catch (error) {
        console.error('Error in get thumbs-up endpoint:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Thumbs up API server running at http://localhost:${port}`);
});

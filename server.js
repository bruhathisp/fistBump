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

const GLIDE_API_URL = `https://api.glideapp.io/api/function/mutateTables`;

axios.defaults.headers.common['Authorization'] = `Bearer ${GLIDE_API_TOKEN}`;
axios.defaults.headers.common['Content-Type'] = 'application/json`;

// Update thumbs-up count API
app.post('/thumbs-up', async (req, res) => {
    const { eventId, userName } = req.body;

    try {
        // Fetch the event data
        const response = await axios.post(GLIDE_API_URL, {
            appID: GLIDE_APP_ID,
            mutations: [
                {
                    kind: "get-rows-from-table",
                    tableName: GLIDE_TABLE_ID
                }
            ]
        });
        const rows = response.data.results;

        const eventRow = rows.find(row => row.columnValues.Uet7T === eventId);
        if (!eventRow) {
            console.error('Event not found:', eventId);
            return res.status(404).json({ message: 'Event not found' });
        }

        const thumbsUpUsers = eventRow.columnValues.MC4Bt ? JSON.parse(eventRow.columnValues.MC4Bt) : [];
        if (thumbsUpUsers.includes(userName)) {
            console.error('User has already given thumbs up for this event:', userName);
            return res.status(400).json({ message: 'User has already given thumbs up for this event' });
        }

        // Update the thumbs up count and users
        thumbsUpUsers.push(userName);
        const thumbsUpCount = parseInt(eventRow.columnValues.pO9Zw || '0') + 1;

        await axios.post(GLIDE_API_URL, {
            appID: GLIDE_APP_ID,
            mutations: [
                {
                    kind: "update-row-in-table",
                    tableName: GLIDE_TABLE_ID,
                    rowID: eventRow.id,
                    columnValues: {
                        pO9Zw: thumbsUpCount.toString(),
                        MC4Bt: JSON.stringify(thumbsUpUsers)
                    }
                }
            ]
        });

        res.json({ message: 'Thumbs up count updated successfully' });
    } catch (error) {
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error request data:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Custom Data Endpoint
app.post('/add-custom-data', async (req, res) => {
    const { sno, eventName, eventId, eventHeadline, eventDescription, moreInformation, userName, mailId, phoneNumber } = req.body;

    try {
        const response = await axios.post(GLIDE_API_URL, {
            appID: GLIDE_APP_ID,
            mutations: [
                {
                    kind: "add-row-to-table",
                    tableName: GLIDE_TABLE_ID,
                    columnValues: {
                        Name: sno,
                        HeVcI: eventName,
                        Uet7T: eventId,
                        KOyac: eventHeadline,
                        favEH: eventDescription,
                        3WVqe: moreInformation,
                        0GQOQ: userName,
                        CxJtT: mailId,
                        te8cn: phoneNumber,
                        pO9Zw: "0",
                        MC4Bt: "[]"
                    }
                }
            ]
        });

        res.json({ message: 'Custom data added successfully', data: response.data });
    } catch (error) {
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error request data:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const bodyParser = require('body-parser');
import * as glide from "@glideapps/tables";
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const wistfulHospitalTable = glide.table({
    token: "26531c61-3158-4ff3-90c7-70b91aa829f0",
    app: "3NS0DhxzYXaoZwaKdBxr",
    table: "native-table-UhHK0rnmscKJImqA62m6",
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

// Endpoint to increment thumbs up count
app.post('/api/thumbs-up', async (req, res) => {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
        return res.status(400).json({ error: 'Event ID and User ID are required' });
    }

    try {
        // Fetch the event row by eventId
        const rows = await wistfulHospitalTable.filter({ eventId });
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
            await wistfulHospitalTable.update(row.id, {
                thumbsUpCount: newThumbsUpCount.toString(),
                thumbsUpUsers: thumbsUpUsers.join(',')
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
        const rows = await wistfulHospitalTable.filter({ eventId });
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const row = rows[0];
        const currentThumbsUpCount = parseInt(row.thumbsUpCount, 10) || 0;
        const thumbsUpUsers = row.thumbsUpUsers ? row.thumbsUpUsers.split(',') : [];

        res.json({ eventId, count: currentThumbsUpCount, users: thumbsUpUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Thumbs up API server running at http://localhost:${port}`);
});

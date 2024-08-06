const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory store to track thumbs up
const thumbsUpStore = {};

// Endpoint to get thumbs up data
app.get('/getThumbsUp/:eventId', (req, res) => {
  const { eventId } = req.params;
  const eventThumbsUp = thumbsUpStore[eventId] || { count: 0, users: [] };
  res.status(200).json(eventThumbsUp);
});

// Endpoint to handle thumbs up and additional event data
app.post('/thumbsUp', async (req, res) => {
  const { eventId, userName, eventHeadline, eventDescription, moreInformation, imageURL, url, subheaderText, headerText } = req.body;

  // Validate required fields
  if (!eventId || !userName || !eventHeadline || !eventDescription || !moreInformation) {
    return res.status(400).json({ error: 'eventId, userName, eventHeadline, eventDescription, and moreInformation are required' });
  }

  // Initialize thumbs up for the event if not present
  if (!thumbsUpStore[eventId]) {
    thumbsUpStore[eventId] = { count: 0, users: [] };
  }

  // Check if the user has already thumbs-upped the event
  if (thumbsUpStore[eventId].users.includes(userName)) {
    return res.status(400).json({ error: 'User has already thumbs-upped this event' });
  }

  // Update the thumbs up count and list of users
  thumbsUpStore[eventId].count += 1;
  thumbsUpStore[eventId].users.push(userName);

  // Update the Glide table
  const data = {
    appID: "3NS0DhxzYXaoZwaKdBxr",
    mutations: [
      {
        kind: "add-row-to-table",
        tableName: "native-table-UhHK0rnmscKJImqA62m6",
        columnValues: {
          "Name": userName, // Assuming this maps to userName
          "HeVcI": eventHeadline, // Mapping based on assumed column identifiers
          "Uet7T": eventId,
          "KOyac": headerText || eventDescription, // Assuming headerText maps to eventDescription
          "favEH": eventDescription, // As a fallback
          "3WVqe": moreInformation,
          "0GQOQ": userName, // Mapping based on assumed column identifiers
          "CxJtT": "N/A", // Placeholder for email
          "te8cn": "N/A", // Placeholder for phone number
          "pO9Zw": thumbsUpStore[eventId].count,
          "MC4Bt": thumbsUpStore[eventId].users.join(',')
        }
      }
    ]
  };

  try {
    const response = await axios.post('https://api.glideapp.io/api/function/mutateTables', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 26531c61-3158-4ff3-90c7-70b91aa829f0', // Replace with actual token
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

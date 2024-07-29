const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/mutateTables', async (req, res) => {
  const data = req.body;

  try {
    const response = await axios.post('https://api.glideapp.io/api/function/mutateTables', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization: 'Bearer 26531c61-3158-4ff3-90c7-70b91aa829f0',
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

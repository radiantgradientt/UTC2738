// server.js
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

app.post('/location', async (req, res) => {
  const { lat, lon } = req.body;
  const link = `https://www.google.com/maps?q=${lat},${lon}`;
  const message = `📍 Device Location: ${link}`;

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_NUMBER,
      to: process.env.MY_NUMBER
    });
    res.send('✅ SMS sent!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to send SMS');
  }
});

app.get('/', (req, res) => {
  res.send('🚀 GPS to SMS backend is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

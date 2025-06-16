// server.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Load Twilio credentials from your .env
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const twilioNumber = process.env.TWILIO_NUMBER;
const recipientNumber = process.env.MY_NUMBER;

const client = twilio(accountSid, authToken);
const app = express();

app.use(bodyParser.json());

// POST /send-location: receives lat/lon and sends an SMS
app.post('/send-location', async (req, res) => {
  const lat = parseFloat(req.body.lat);
  const lon = parseFloat(req.body.lon);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Invalid or missing lat/lon' });
  }

  const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
  const messageText = `📍 SIM7670 Live Location: ${mapsLink}`;

  try {
    console.log('📤 Attempting to send SMS to', recipientNumber);
    const message = await client.messages.create({
      body: messageText,
      from: twilioNumber,
      to: recipientNumber
    });

    console.log(`✅ SMS sent: ${message.sid}`);
    res.json({ success: true, sid: message.sid });
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Root route for testing
app.get('/', (req, res) => {
  res.send('✅ Server is running. POST to /send-location to send a GPS SMS.');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

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

// Store latest location in memory
let latestLocation = { lat: 1.3521, lon: 103.8198 }; // Default: Singapore

// Endpoint to receive location and send SMS (optional)
app.post('/send-location', async (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat or lon' });
  }

  latestLocation = { lat, lon };

  const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
  const messageText = `📍 SIM7670 Live Location: ${mapsLink}`;

  try {
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

// Endpoint to just update location (no SMS)
app.post('/location', (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat or lon' });
  }

  latestLocation = { lat, lon };
  console.log(`📍 Location updated: ${lat}, ${lon}`);
  res.json({ success: true, message: 'Location updated' });
});

// Webpage to display latest map location
app.get('/view', (req, res) => {
  const { lat, lon } = latestLocation;
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;

  res.send(`
    <html>
      <head><title>Live SIM7670 Location</title></head>
      <body style="font-family: sans-serif;">
        <h2>📍 Current Device Location</h2>
        <iframe width="100%" height="500" frameborder="0" src="${mapSrc}"></iframe>
        <p style="color: gray;">This map shows the most recent location sent by the device.</p>
      </body>
    </html>
  `);
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('🚀 GPS Backend is live. POST to /send-location or /location. View at /view.');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

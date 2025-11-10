const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const crypto = require('crypto'); // Import the crypto module for unique tokens
const { authenticateCoach, getClientsByCoachId } = require('./utils/authentication.js'); // Utility functions

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' folder
// Default route serves login.html instead of index.html
app.use(express.static(path.join(__dirname, 'public'), { index: 'login.html' }));

// ✅ NEW: Serve the coaching-data.json file from the utils folder (read-only access)
app.get('/data/coaching-data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'utils', 'coaching-data.json'));
});

// --- API ROUTES ---

// 1. Authentication Route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Call your utility function for authentication
    const coach = await authenticateCoach(username, password);

    // Respond with coach details and a unique session token
    res.status(200).json({
      message: "Login successful",
      coachId: coach.coachId,
      token: crypto.randomUUID() // Generate secure random token
    });

  } catch (error) {
    console.error("Login attempt failed:", error.message);

    if (error.message === 'User not found' || error.message === 'Invalid password') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
});

// 2. Client Fetching Route for Dashboard
app.get('/api/clients/:coachId', async (req, res) => {
  try {
    const coachId = req.params.coachId;

    if (!coachId) {
      return res.status(400).json({ message: 'Missing coach ID.' });
    }

    const data = await getClientsByCoachId(coachId);
    res.status(200).json(data);

  } catch (error) {
    console.error("Error fetching client data:", error.message);

    if (error.message === 'Coach ID not found') {
      return res.status(404).json({ message: 'Coach not found.' });
    }

    return res.status(500).json({ message: 'Internal server error fetching client data.' });
  }
});

// --- SERVER STARTUP ---
const server = app.listen(PORT, function () {
  const address = server.address();
  const baseUrl = `http://${address.address === "::" ? 'localhost' : address.address}:${address.port}`;
  console.log(`CoachPro server running at: ${baseUrl}`);
});

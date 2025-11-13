const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const crypto = require('crypto');
const { authenticateCoach, getClientsByCoachId } = require('./utils/authentication.js');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), { index: 'login.html' }));

// ✅ Serve coaching-data.json for read-only access
app.get('/data/coaching-data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'utils', 'coaching-data.json'));
});

// ============================================================
// 🏋️ WORKOUT ROUTES
// ============================================================

// GET a client's workout for a specific day
app.get('/api/workout', (req, res) => {
  const { client, day } = req.query;
  if (!client || !day) {
    return res.status(400).json({ error: "Missing 'client' or 'day' query parameter." });
  }

  try {
    const filePath = path.join(__dirname, 'utils', 'coaching-data.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const workout = data.workouts.find(w => w.clientId === client);
    if (!workout) return res.status(404).json({ error: 'Client workout not found.' });

    const dayData = workout.plan[day];
    if (!dayData) return res.status(404).json({ error: `No workout found for ${day}.` });

    res.json(dayData);
  } catch (error) {
    console.error("Error reading workout data:", error);
    res.status(500).json({ error: 'Internal server error reading workout data.' });
  }
});

// PUT to update a client's full weekly workout plan
app.put('/api/workout/:clientId', (req, res) => {
  const clientId = req.params.clientId;
  const { plan } = req.body; // expects full week

  if (!plan || typeof plan !== 'object') {
    return res.status(400).json({ error: "Missing or invalid 'plan' in request body." });
  }

  try {
    const filePath = path.join(__dirname, 'utils', 'coaching-data.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const workout = data.workouts.find(w => w.clientId === clientId);
    if (!workout) return res.status(404).json({ error: "Client workout not found." });

    // Overwrite the full week's plan
    workout.plan = plan;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ message: "Workout plan updated successfully!", plan });
  } catch (err) {
    console.error("Error saving workout plan:", err);
    res.status(500).json({ error: "Failed to save workout plan." });
  }
});

// ============================================================
// 🔐 AUTHENTICATION + CLIENT ROUTES
// ============================================================

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const coach = await authenticateCoach(username, password);

    res.status(200).json({
      message: "Login successful",
      coachId: coach.coachId,
      token: crypto.randomUUID()
    });

  } catch (error) {
    console.error("Login attempt failed:", error.message);

    if (error.message === 'User not found' || error.message === 'Invalid password') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
});

// Get clients for a coach
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


const server = app.listen(PORT, function () {
  const address = server.address();
  const baseUrl = `http://${address.address === "::" ? 'localhost' : address.address}:${address.port}`;
  console.log(`CoachPro server running at: ${baseUrl}`);
});

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

// Serve static files and default to login.html
app.use(express.static(path.join(__dirname, 'public'), { index: 'login.html' }));

// ✅ Serve coaching-data.json for read-only access
app.get('/data/coaching-data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'utils', 'coaching-data.json'));
});


// ============================================================
// 🏋️ WORKOUT ROUTES (REST-correct version)
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


// PUT to update (edit) a client's workout plan
app.put('/api/workout', (req, res) => {
  const { client, day, exercises } = req.body;

  if (!client || !day || !Array.isArray(exercises)) {
    return res.status(400).json({ error: "Missing or invalid request body (client, day, exercises required)." });
  }

  try {
    const filePath = path.join(__dirname, 'utils', 'coaching-data.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const workout = data.workouts.find(w => w.clientId === client);
    if (!workout) return res.status(404).json({ error: 'Client workout not found.' });

    if (!workout.plan[day]) {
      workout.plan[day] = { title: `${day} Plan`, status: "pending", exercises: [] };
    }

    workout.plan[day].exercises = exercises;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ message: 'Workout updated successfully', updatedDay: day, count: exercises.length });

  } catch (error) {
    console.error("Error saving workout:", error);
    res.status(500).json({ error: 'Internal server error saving workout.' });
  }
});


// ============================================================
// 🔐 AUTHENTICATION + CLIENT ROUTES (unchanged)
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

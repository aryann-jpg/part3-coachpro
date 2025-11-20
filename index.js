const express = require('express');
const path = require('path');
const fsSync = require('fs');               // For sync operations (workouts)
const fs = require('fs').promises;         // For async template operations
const bodyParser = require("body-parser");
const crypto = require('crypto');
const { authenticateCoach, getClientsByCoachId } = require('./utils/authentication.js'); 
const { addWorkoutForClient } = require('./utils/SufianUtil.js');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public'), { index: 'login.html' }));

app.get('/data/coaching-data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'utils', 'coaching-data.json'));
});

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
 
// Fetch clients for a coach
app.get('/api/clients/:coachId', async (req, res) => {
  try {
    const coachId = req.params.coachId;
    if (!coachId) return res.status(400).json({ message: 'Missing coach ID.' });
 
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

app.post('/add-workout', async (req, res) => {
  try {
    const { clientId, day, exercises } = req.body;
    if (!clientId || !day || !exercises)
      return res.status(400).json({ success: false, message: 'Missing fields' });

    await addWorkoutForClient({ clientId, day, exercises });
    res.json({ success: true }); 
  } catch (err) {
    console.error('Add workout error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// --- SERVER STARTUP ---
const server = app.listen(PORT, function () {
  const address = server.address();
  const baseUrl = `http://${address.address === "::" ? 'localhost' : address.address}:${address.port}`;
  console.log(`CoachPro server running at: ${baseUrl}`);
});
 
// ---------------------------
// Start Server
// ---------------------------
app.listen(PORT, () => {
  console.log(`CoachPro server running at http://localhost:${PORT}`);
});
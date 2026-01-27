const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const { loginController, getClientsController } = require('./utils/authentication.js');
const { addWorkout } = require('./utils/SufianUtil.js');
const { updateWorkoutPlan } = require('./utils/AryanUtil.js');
const { getWorkoutForDay } = require('./utils/WorkoutUtil.js');
const { addWorkoutTemplate } = require('./utils/YixuanUtil.js');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 1. SERVE STATIC FILES FIRST
// This handles CSS, JS, and Images automatically
app.use(express.static(path.join(__dirname, 'public')));

// 2. EXPLICIT ROOT ROUTE
// This prevents Jenkins from getting a 404/Timeout when it hits http://localhost:5050/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 3. OTHER ROUTES
app.get('/data/coaching-data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'utils', 'coaching-data.json'));
});

app.post('/api/login', loginController);
app.get('/api/clients/:coachId', getClientsController);
app.get('/api/workout', getWorkoutForDay);
app.put('/api/workout/:clientId', updateWorkoutPlan);
app.post('/api/add-workout-template', addWorkoutTemplate);
app.post('/add-workout', addWorkout);

// 4. CATCH-ALL FOR DEBUGGING (Optional but helpful for Jenkins)
app.use((req, res) => {
  console.log(`Missing Route: ${req.method} ${req.url}`);
  res.status(404).send("Page Not Found");
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CoachPro server running at http://localhost:${PORT}`);
  });
}

module.exports = { app };
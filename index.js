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

// Serve static files
app.use(express.static('public'), { index: 'login.html' });

// Routes
app.get('/data/coaching-data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'utils', 'coaching-data.json'));
});

app.post('/api/login', loginController);
app.get('/api/clients/:coachId', getClientsController);
app.get('/api/workout', getWorkoutForDay);
app.put('/api/workout/:clientId', updateWorkoutPlan);
app.post('/api/add-workout-template', addWorkoutTemplate);
app.post('/add-workout', addWorkout);

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CoachPro server running at http://localhost:${PORT}`);
  });
}

module.exports = { app };

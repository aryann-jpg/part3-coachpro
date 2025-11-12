// utils/SufianUtil.js
const fs = require('fs').promises;
const path = require('path');

const COACHING_FILE = path.join(__dirname, 'coaching-data.json');
// ✅ keep the helper file in /models, not /utils
const STRUCTURE_FILE = path.join(__dirname, '..', 'models', 'create-workout.json');

function generateWorkoutId() {
  const ts = Date.now();
  const r = Math.floor(Math.random() * 1000);
  return `wk${ts}${r.toString().padStart(3, '0')}`;
}

/**
 * Add (append) exercises to a client's day for a given week.
 * Expects: { clientId, week_start_date, day, exercises:[{workout_name,sets,reps,weight}] }
 */
async function addWorkoutForClient({ clientId, week_start_date, day, exercises }) {
  // --- read coaching-data.json ---
  const db = JSON.parse(await fs.readFile(COACHING_FILE, 'utf8'));
  if (!db.workouts) db.workouts = [];

  // find or create the weekly plan for this client
  let plan = db.workouts.find(
    w => w.clientId === clientId && w.week_start_date === week_start_date
  );

  if (!plan) {
    plan = {
      workoutId: generateWorkoutId(),
      clientId,
      week_start_date,
      plan: {
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
        Friday: [], Saturday: [], Sunday: []
      }
    };
    db.workouts.push(plan);
  }

  // --- append (not overwrite) into the chosen day ---
  const normalized = exercises.map(ex => ({
    workout_name: ex.workout_name ?? ex.name,
    sets: Number(ex.sets) || 0,
    reps: Number(ex.reps) || 0,
    weight: Number(ex.weight) || 0
  }));

  if (!Array.isArray(plan.plan[day])) plan.plan[day] = [];
  plan.plan[day] = plan.plan[day].concat(normalized);

  // save coaching-data.json
  await fs.writeFile(COACHING_FILE, JSON.stringify(db, null, 2), 'utf8');

  // --- helper tracker in /models/create-workout.json (safe/no throw if missing) ---
  let tracker = {};
  try {
    tracker = JSON.parse(await fs.readFile(STRUCTURE_FILE, 'utf8') || '{}');
  } catch (_) { tracker = {}; }

  if (!tracker[clientId]) tracker[clientId] = {};
  if (!tracker[clientId][week_start_date]) tracker[clientId][week_start_date] = {};
  tracker[clientId][week_start_date][day] = {
    exercisesCount: plan.plan[day].length
  };

  await fs.writeFile(STRUCTURE_FILE, JSON.stringify(tracker, null, 2), 'utf8');

  return plan; // send the updated plan back
}

module.exports = { addWorkoutForClient };

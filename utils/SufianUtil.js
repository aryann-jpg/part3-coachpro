// utils/SufianUtil.js
const fs = require("fs").promises;
const path = require("path");
const { Workout } = require("../models/create-workout.js");

const COACHING_FILE = path.join(__dirname, "coaching-data.json");

/**
 * Add (append) exercises to a client's day for a given week.
 * Expects: { clientId, week_start_date, day, exercises:[{workout_name,sets,reps,weight}] }
 */
async function addWorkoutForClient({ clientId, week_start_date, day, exercises }) {
  // read current DB
  const db = JSON.parse(await fs.readFile(COACHING_FILE, "utf8"));
  if (!db.workouts) db.workouts = [];

  // find or create the weekly plan for this client + week
  let plan = db.workouts.find(
    (w) => w.clientId === clientId && w.week_start_date === week_start_date
  );

  if (!plan) {
    // use the model class
    plan = new Workout(clientId, week_start_date);
    db.workouts.push(plan);
  }

  // normalise incoming exercises
  const normalised = (exercises || []).map((ex) => ({
    workout_name: ex.workout_name ?? ex.name,
    sets: Number(ex.sets) || 0,
    reps: Number(ex.reps) || 0,
    weight: Number(ex.weight) || 0
  }));

  if (!Array.isArray(plan.plan[day])) {
    plan.plan[day] = [];
  }
  plan.plan[day] = plan.plan[day].concat(normalised);

  // save DB back to file
  await fs.writeFile(COACHING_FILE, JSON.stringify(db, null, 2), "utf8");

  return plan;
}

module.exports = { addWorkoutForClient };

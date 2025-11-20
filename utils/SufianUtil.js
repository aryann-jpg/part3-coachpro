const fs = require("fs").promises;
const path = require("path");
const { Workout } = require("../models/create-workout.js");

const COACHING_FILE = path.join(__dirname, "coaching-data.json");

async function addWorkoutForClient({ clientId, day, exercises }) {
  const db = JSON.parse(await fs.readFile(COACHING_FILE, "utf8"));
  if (!db.workouts) db.workouts = [];

  let plan = db.workouts.find(
    (w) => w.clientId === clientId
  );

  if (!plan) {
    plan = new Workout(clientId);
    db.workouts.push(plan);
  }

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

  await fs.writeFile(COACHING_FILE, JSON.stringify(db, null, 2), "utf8");

  return plan;
}

module.exports = { addWorkoutForClient };

const fs = require("fs").promises;
const path = require("path");
const { Workout } = require("../models/create-workout.js");

const COACHING_FILE = path.join(__dirname, "coaching-data.json");

async function addWorkout(req, res) {
  try {
    const { clientId, day, exercises } = req.body;

    // Validate required fields
    if (!clientId || !day || !exercises) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Read DB file
    const db = JSON.parse(await fs.readFile(COACHING_FILE, "utf8"));
    if (!db.workouts) db.workouts = [];

    // Find or create plan
    let plan = db.workouts.find(w => w.clientId === clientId);

    if (!plan) {
      plan = new Workout(clientId);
      db.workouts.push(plan);
    }

    // Normalize exercises
    const normalised = (exercises || []).map(ex => ({
      workout_name: ex.workout_name ?? ex.name,
      sets: Number(ex.sets) || 0,
      reps: Number(ex.reps) || 0,
      weight: Number(ex.weight) || 0
    }));

    // Insert into the correct day
    if (!Array.isArray(plan.plan[day])) {
      plan.plan[day] = [];
    }
    plan.plan[day] = plan.plan[day].concat(normalised);

    // Write changes back to file
    await fs.writeFile(COACHING_FILE, JSON.stringify(db, null, 2), "utf8");

    // Success
    return res.json({ success: true });

  } catch (err) {
    console.error("Add workout error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message });
  }
}

module.exports = { addWorkout };

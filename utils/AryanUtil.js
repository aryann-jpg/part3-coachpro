const path = require('path');
const fsSync = require('fs');

async function updateWorkoutPlan(req, res) {
    const clientId = req.params.clientId;
    const { plan } = req.body;

    // --- clientId validation ---
    if (!clientId || typeof clientId !== 'string') {
        return res.status(400).json({ error: "Invalid clientId." });
    }

    // --- plan validation ---
    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
        return res.status(400).json({ error: "Missing or invalid 'plan' in request body." });
    }

    try {
        const filePath = path.join(__dirname, 'coaching-data.json');
        const data = JSON.parse(fsSync.readFileSync(filePath, 'utf8'));

        if (!Array.isArray(data.workouts)) {
            return res.status(500).json({ error: "Workout data structure invalid." });
        }

        const workout = data.workouts.find(w => w.clientId === clientId);
        if (!workout) {
            return res.status(404).json({ error: "Client workout not found." });
        }

        // --- Validate plan content ---
        for (const day in plan) {
            if (!Array.isArray(plan[day])) {
                return res.status(400).json({ error: `Invalid workout list for ${day}.` });
            }

            for (const ex of plan[day]) {
                if (
                    !ex.workout_name ||
                    typeof ex.workout_name !== 'string' ||
                    ex.workout_name.length > 30 ||
                    ex.sets <= 0 ||
                    ex.reps <= 0 ||
                    ex.weight <= 0
                ) {
                    return res.status(400).json({
                        error: `Invalid exercise data detected in ${day}.`
                    });
                }
            }
        }

        workout.plan = plan;

        fsSync.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

        return res.json({
            message: "Workout plan updated successfully!",
            plan
        });

    } catch (err) {
        // We keep this log for real-world production debugging
        console.error("Error saving workout plan:", err);
        return res.status(500).json({ error: "Failed to save workout plan." });
    }
}

module.exports = { updateWorkoutPlan };
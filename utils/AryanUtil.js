const path = require('path');
const fsSync = require('fs');

async function updateWorkoutPlan(req, res) {
    const clientId = req.params.clientId;
    const { plan } = req.body;

    // Input validation
    if (!plan || typeof plan !== 'object') {
        return res.status(400).json({ error: "Missing or invalid 'plan' in request body." });
    }

    try {
        const filePath = path.join(__dirname, 'coaching-data.json');
        const data = JSON.parse(fsSync.readFileSync(filePath, 'utf8'));

        if (!data.workouts) {
            return res.status(500).json({ error: "Workout data structure invalid." });
        }

        const workout = data.workouts.find(w => w.clientId === clientId);
        if (!workout) {
            return res.status(404).json({ error: "Client workout not found." });
        }

        // Update plan
        workout.plan = plan;

        // Save file
        fsSync.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

        return res.json({
            message: "Workout plan updated successfully!",
            plan
        });
        
    } catch (err) {
        console.error("Error saving workout plan:", err);
        return res.status(500).json({ error: "Failed to save workout plan." });
    }
}

module.exports = { updateWorkoutPlan };

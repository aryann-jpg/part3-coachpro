const path = require('path');
const fsSync = require('fs');

async function getWorkoutForDay(req, res) {
    const { client, day } = req.query;

    if (!client || !day) {
        return res.status(400).json({ error: "Missing 'client' or 'day' query parameter." });
    }

    try {
        const filePath = path.join(__dirname, 'coaching-data.json');
        const data = JSON.parse(fsSync.readFileSync(filePath, 'utf8'));

        const workout = data.workouts.find(w => w.clientId === client);
        if (!workout) {
            return res.status(404).json({ error: 'Client workout not found.' });
        }

        const dayData = workout.plan?.[day];
        if (!dayData) {
            return res.status(404).json({ error: `No workout found for ${day}.` });
        }

        return res.json(dayData);

    } catch (error) {
        console.error("Error reading workout data:", error);
        return res.status(500).json({ error: 'Internal server error reading workout data.' });
    }
}

module.exports = { getWorkoutForDay };

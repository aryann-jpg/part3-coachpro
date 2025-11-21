const path = require('path');
const fs = require('fs').promises;

/**
 * POST /api/add-workout-template
 */
async function addWorkoutTemplate(req, res) {
    try {
        const { name, exercises, coachId, clientId } = req.body;

        // Validation
        if (!name || !Array.isArray(exercises) || !coachId) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const TEMPLATE_FILE = path.join(__dirname, 'coaching-data.template.json');

        let templates = [];

        // Read existing template file
        try {
            const raw = await fs.readFile(TEMPLATE_FILE, 'utf8');
            templates = JSON.parse(raw.trim() || "[]");
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
            templates = [];
        }

        // Create new template
        const newTemplate = {
            templateId: `t_${Date.now()}`,
            name,
            exercises,
            coachId,
            clientId: clientId || null
        };

        templates.push(newTemplate);

        // Save file
        await fs.writeFile(TEMPLATE_FILE, JSON.stringify(templates, null, 2), 'utf8');

        return res.status(201).json(newTemplate);

    } catch (error) {
        console.error("Error saving template:", error);
        return res.status(500).json({ message: "Internal server error saving template." });
    }
}

module.exports = { addWorkoutTemplate };

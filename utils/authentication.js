const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE_PATH = path.join(__dirname, 'coaching-data.json');

/**
 * Reads the database JSON.
 */
async function readDatabase() {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
}

/**
 * AUTHENTICATION LOGIC
 */
async function authenticateCoach(username, password) {
    const db = await readDatabase();

    const coach = db.coaches.find(c => c.username === username);

    if (!coach) throw new Error('User not found');

    const MOCK_PASSWORD = '1234';
    if (password !== MOCK_PASSWORD) throw new Error('Invalid password');

    return coach;
}

/**
 * CLIENT FETCH LOGIC
 */
async function getClientsByCoachId(coachId) {
    const db = await readDatabase();

    const coach = db.coaches.find(c => c.coachId === coachId);
    if (!coach) throw new Error('Coach ID not found');

    const clients = db.clients.filter(cl => cl.coachId === coachId);

    return {
        coachName: coach.full_name,
        clients
    };
}

/**
 * CONTROLLER FOR POST /api/login
 * Sends JSON responses & handles errors
 */
async function loginController(req, res) {
    try {
        const { username, password } = req.body;
        const coach = await authenticateCoach(username, password);

        return res.status(200).json({
            message: "Login successful",
            coachId: coach.coachId,
            token: crypto.randomUUID()
        });

    } catch (error) {
        console.error("Login attempt failed:", error.message);

        if (error.message === 'User not found' ||
            error.message === 'Invalid password') {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        return res.status(500).json({ message: "Internal server error during authentication." });
    }
}

/**
 * CONTROLLER FOR GET /api/clients/:coachId
 */
async function getClientsController(req, res) {
    try {
        const coachId = req.params.coachId;

        if (!coachId) {
            return res.status(400).json({ message: "Missing coach ID." });
        }

        const data = await getClientsByCoachId(coachId);
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error fetching client data:", error.message);

        if (error.message === 'Coach ID not found') {
            return res.status(404).json({ message: "Coach not found." });
        }

        return res.status(500).json({ message: "Internal server error fetching client data." });
    }
}

module.exports = {
    loginController,
    getClientsController
};

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE_PATH = path.join(__dirname, 'coaching-data.json');

/**
 * Safely read the database JSON.
 */
async function readDatabase() {
    try {
        const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading database JSON:", err.message);
        throw new Error("Database read error");
    }
}

/**
 * Authenticate coach by username and password.
 * For now, password is mocked as "1234" for testing.
 */
async function authenticateCoach(username, password) {
    const db = await readDatabase();

    const coach = db.coaches.find(c => c.username === username);

    if (!coach) throw new Error('User not found');

    // MOCK PASSWORD CHECK (replace with real hashing in production)
    const MOCK_PASSWORD = '1234';
    if (password !== MOCK_PASSWORD) throw new Error('Invalid password');

    return coach;
}

/**
 * Get clients for a coach by coachId
 */
async function getClientsByCoachId(coachId) {
    const db = await readDatabase();

    const coach = db.coaches.find(c => c.coachId === coachId);
    if (!coach) throw new Error('Coach ID not found');

    // Match clients by coach's client_ids
    const clients = db.clients.filter(cl => coach.client_ids.includes(cl.clientId));

    return {
        coachName: coach.full_name,
        clients
    };
}

/**
 * Controller for POST /api/login
 */
async function loginController(req, res) {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password required" });
        }

        const coach = await authenticateCoach(username, password);

        return res.status(200).json({
            message: "Login successful",
            coachId: coach.coachId,
            token: crypto.randomUUID() // mock token
        });

    } catch (error) {
        console.error("Login attempt failed:", error.message);

        if (error.message === 'User not found' || error.message === 'Invalid password') {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (error.message === "Database read error") {
            return res.status(500).json({ message: "Internal server error reading database." });
        }

        return res.status(500).json({ message: "Internal server error during authentication." });
    }
}

/**
 * Controller for GET /api/clients/:coachId
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

        if (error.message === "Database read error") {
            return res.status(500).json({ message: "Internal server error reading database." });
        }

        return res.status(500).json({ message: "Internal server error fetching client data." });
    }
}

module.exports = {
    loginController,
    getClientsController
};

const fs = require('fs/promises');
const path = require('path');
 
// NOTE: In a real Node.js application, you would use bcrypt.compare() 
// and store real hashes. Since we are restricted to JSON and simpler JS,
// we will use a hardcoded password check for 'coach_alex'.
 
const DATA_FILE_PATH = path.join(__dirname, 'coaching-data.json');
 
/**
* Reads the coaching data from the shared JSON file.
* @returns {Promise<Object>} The parsed data object.
*/
async function readDatabase() {
    try {
        const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database file:", error);
        // Throwing a distinct error for the server route to catch as 500
        throw new Error('Failed to access coaching data source.'); 
    }
}
 
/**
* Authenticates a coach using username and password.
* This function covers the success case and the two required error cases (user not found, wrong password).
* @param {string} username - The provided username.
* @param {string} password - The provided password.
* @returns {Promise<Object>} The authenticated coach object.
*/
async function authenticateCoach(username, password) {
    const db = await readDatabase();
    // Find the coach (Success Case and Error Case 1: User not found)
    const coach = db.coaches.find(c => c.username === username);
 
    if (!coach) {
        throw new Error('User not found');
    }
 
    // Check Password (Success Case and Error Case 2: Invalid password)
    // IMPORTANT: Replace this simple check with bcrypt.compare(password, coach.hashed_password) in a real project!
    const MOCK_PASSWORD = '1234'; // Hardcoded correct password for coach_alex
    if (password === MOCK_PASSWORD) {
        // Success
        return coach;
    } else {
        throw new Error('Invalid password');
    }
}
 
/**
* NEW: Fetches the coach's details and their list of clients.
* This combines data needed for the dashboard/homepage.
* @param {string} coachId - The ID of the currently logged-in coach.
* @returns {Promise<Object>} An object containing the coach's name and their clients.
*/
async function getClientsByCoachId(coachId) {
    const db = await readDatabase();
    // Find the coach to get their full name
    const coach = db.coaches.find(c => c.coachId === coachId);
 
    if (!coach) {
        throw new Error('Coach ID not found');
    }
 
    // Filter the global client list to find clients belonging to this coach
    const clients = db.clients.filter(client => client.coachId === coachId);
 
    return {
        coachName: coach.full_name,
        clients: clients
    };
}
 
module.exports = {
    authenticateCoach,
    getClientsByCoachId // Export the new function
};
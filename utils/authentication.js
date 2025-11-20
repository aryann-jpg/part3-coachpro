const fs = require('fs/promises');
const path = require('path');
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
        throw new Error('Failed to access coaching data source.'); 
    }
}
 
/**
 * Authenticates a coach using username and password.
 * This function covers the success case and the two required error cases (user not found, wrong password).
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} 
 */
async function authenticateCoach(username, password) {
    const db = await readDatabase();
    
    const coach = db.coaches.find(c => c.username === username);
 
    if (!coach) {
        throw new Error('User not found');
    }

    const MOCK_PASSWORD = '1234'; 
    
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
 * @param {string} coachId 
 * @returns {Promise<Object>} 
 */

async function getClientsByCoachId(coachId) {
    const db = await readDatabase();
    
    const coach = db.coaches.find(c => c.coachId === coachId);
 
    if (!coach) {
        throw new Error('Coach ID not found');
    }
    const clients = db.clients.filter(client => client.coachId === coachId);
 
    return {
        coachName: coach.full_name,
        clients: clients
    };
}
 
module.exports = {
    authenticateCoach,
    getClientsByCoachId 
};
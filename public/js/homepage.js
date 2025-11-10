// --- Dashboard Client Logic ---

// NOTE: These variables are assumed to be handled by a secure auth process 
// outside of this file's scope in a real application.
const coachId = sessionStorage.getItem('coachId');
const authToken = sessionStorage.getItem('authToken');
const workoutDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// DOM Elements
const workoutPlanSection = document.getElementById('workoutPlanSection');
const clientPlanName = document.getElementById('clientPlanName');
const workoutWeekContainer = document.getElementById('workoutWeekContainer');
// NEW: Get the button reference
const createNewPlanButton = document.getElementById('createNewPlanButton'); 

// State to track the currently selected client card element
let selectedClientCard = null; 

// 1. Initial Check: If no token/ID, redirect to login
if (!coachId || !authToken) {
    // window.location.href = '/login.html';
}

// Logout function
document.getElementById('logoutButton').addEventListener('click', () => {
    // Clear session data and redirect
    sessionStorage.removeItem('coachId');
    sessionStorage.removeItem('authToken');
    // window.location.href = '/login.html';
});

/**
 * 3. Function to display the workout plan section for the selected client, 
 * showing empty boxes.
 * @param {string} clientName - The name of the client.
 * @param {string} clientId - The ID of the client. (Used for future API calls)
 */
function showClientWorkoutPlan(clientName, clientId) {
    // Update the title
    clientPlanName.textContent = clientName;
    
    // Set the client ID on the 'Create New Plan' button for future use
    if (createNewPlanButton) {
        createNewPlanButton.dataset.clientId = clientId;
    }

    // Clear existing content and populate with "Empty!" boxes
    workoutWeekContainer.innerHTML = ''; 

    workoutDays.forEach(day => {
        const dayBox = document.createElement('div');
        dayBox.className = 'day-box';
        dayBox.dataset.day = day; // Use dataset for easier identification
        
        // Always shows "Empty!" as requested
        dayBox.innerHTML = `
            <h3 class="day-title">${day}</h3>
            <div class="empty-content">
                Empty!
            </div>
        `;
        workoutWeekContainer.appendChild(dayBox);
    });
    
    // Show the section
    workoutPlanSection.classList.remove('hidden');

    // Scroll to the new section
    workoutPlanSection.scrollIntoView({ behavior: 'smooth' });
}


// 2. Function to Render a single client card
function createClientCard(client) {
    const card = document.createElement('div');
    card.className = 'client-card';
    
    // Add event listener to show workout plan on click and handle selection
    card.onclick = () => {
        // Deselect previous card if it exists
        if (selectedClientCard) {
            selectedClientCard.classList.remove('selected');
        }

        // Select the current card
        card.classList.add('selected');
        selectedClientCard = card;

        // Show workout plan
        showClientWorkoutPlan(client.name, client.clientId);
    };

    // Use the client's image URL.
    const imageUrl = client.profile_image_url || 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=PFP';

    card.innerHTML = `
        <div class="profile-placeholder">
            <img src="${imageUrl}" 
                alt="Profile photo of ${client.name}" 
                class="w-full h-full object-cover rounded-full"
                onerror="this.onerror=null; this.src='https://placehold.co/100x100/A0A0A0/FFFFFF?text=PFP';" />
        </div>
        <p class="client-name">${client.name}</p>
        <p class="client-link">View Plan</p>
    `;
    return card;
}

// 4. Main function to fetch and display data (MODIFIED TO USE JSON FILE)
async function loadDashboardData() {
    const clientGrid = document.getElementById('clientGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block'; // Show loading
    
    let data = null;

    try {
        // Fetch data from the local JSON file
        const response = await fetch('/data/coaching-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        data = await response.json();
        
        // Set Coach Name
        const coachNameDisplay = document.getElementById('coachNameDisplay');
        const firstName = data.coaches && data.coaches[0] && data.coaches[0].full_name
            ? data.coaches[0].full_name.split(' ')[0]
            : 'Coach';
        coachNameDisplay.textContent = firstName + ',';

        // Locate the "Add Client" card element
        const addClientCard = document.querySelector('.add-client-card');
        
        // Clear the grid, removing the loading indicator but keeping the Add Client card
        clientGrid.innerHTML = '';
        if (addClientCard) clientGrid.appendChild(addClientCard);

        // Render Client Cards
        if (data.clients && data.clients.length > 0) {
            data.clients.forEach(client => {
                clientGrid.insertBefore(createClientCard(client), addClientCard); 
            });
        } else {
            const noClientsMessage = document.createElement('div');
            noClientsMessage.className = 'col-span-full text-center p-8 bg-white rounded-xl shadow-md text-gray-500';
            noClientsMessage.textContent = 'No active clients found. Time to add one!';
            clientGrid.insertBefore(noClientsMessage, addClientCard);
        }

    } catch (error) {
        console.error('Dashboard Data Load Error:', error);
        clientGrid.innerHTML = `<div class="col-span-full text-center p-8 bg-red-100 rounded-xl border border-red-400 text-red-700">
            Error loading data: ${error.message}. Ensure 'coaching-data.json' is present and correctly formatted.
        </div>`;
    } finally {
        // Ensure the loading indicator is hidden
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) indicator.style.display = 'none';
    }
}

// 5. Start the data load when the page is ready
document.addEventListener('DOMContentLoaded', loadDashboardData);

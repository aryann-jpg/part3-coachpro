// --- Dashboard Client Logic ---

const coachId = sessionStorage.getItem('coachId');
const authToken = sessionStorage.getItem('authToken');
const workoutDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// DOM Elements
const workoutPlanSection = document.getElementById('workoutPlanSection');
const clientPlanName = document.getElementById('clientPlanName');
const workoutWeekContainer = document.getElementById('workoutWeekContainer');
const createNewPlanButton = document.getElementById('createNewPlanButton');

// ✅ Redirect to Create Workout page (use your actual filename)
if (createNewPlanButton) {
  createNewPlanButton.addEventListener('click', () => {
    const clientId = createNewPlanButton.dataset.clientId;
    if (clientId) {
      sessionStorage.setItem('selectedClientId', clientId);
      window.location.href = '/sufian-create.html?clientId=' + encodeURIComponent(clientId);
    } else {
      alert('Please select a client first.');
    }
  });
}

let selectedClientCard = null;

// (optional) auth redirect disabled for dev
if (!coachId || !authToken) {
  // window.location.href = '/login.html';
}

document.getElementById('logoutButton').addEventListener('click', () => {
  sessionStorage.removeItem('coachId');
  sessionStorage.removeItem('authToken');
  // window.location.href = '/login.html';
});

// Show the weekly plan scaffold then populate from file
function showClientWorkoutPlan(clientName, clientId) {
  clientPlanName.textContent = clientName;

  if (createNewPlanButton) {
    createNewPlanButton.dataset.clientId = clientId;
  }

  workoutWeekContainer.innerHTML = '';

  workoutDays.forEach(day => {
    const dayBox = document.createElement('div');
    dayBox.className = 'day-box';
    dayBox.dataset.day = day;
    dayBox.innerHTML = `
      <h3 class="day-title">${day}</h3>
      <div class="empty-content">Empty!</div>
    `;
    workoutWeekContainer.appendChild(dayBox);
  });

  workoutPlanSection.classList.remove('hidden');
  workoutPlanSection.scrollIntoView({ behavior: 'smooth' });

  populateClientWorkouts(clientId);
}

// Read coaching-data.json and fill day boxes
function populateClientWorkouts(clientId) {
  fetch('/data/coaching-data.json')
    .then(res => res.json())
    .then(data => {
      const clientWorkouts = (data.workouts || [])
        .filter(w => w.clientId === clientId)
        .sort((a,b) => new Date(b.week_start_date) - new Date(a.week_start_date))[0];
      if (!clientWorkouts || !clientWorkouts.plan) return;

      workoutDays.forEach(day => {
        const box = workoutWeekContainer.querySelector(`[data-day="${day}"] .empty-content`);
        const exercises = clientWorkouts.plan[day]; // <-- array of { workout_name, sets, reps, weight }

        if (Array.isArray(exercises) && exercises.length > 0) {
          box.innerHTML = `
            <ul class="text-sm list-disc ml-4 text-gray-700">
              ${exercises.map(ex =>
                `<li>${ex.workout_name} — ${ex.sets}x${ex.reps} (${ex.weight} kg)</li>`
              ).join('')}
            </ul>
          `;
        }
      });
    })
    .catch(err => console.error('Error loading workouts:', err));
}

function createClientCard(client) {
  const card = document.createElement('div');
  card.className = 'client-card';

  card.onclick = () => {
    if (selectedClientCard) selectedClientCard.classList.remove('selected');
    card.classList.add('selected');
    selectedClientCard = card;
    showClientWorkoutPlan(client.name, client.clientId);
  };

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

async function loadDashboardData() {
  const clientGrid = document.getElementById('clientGrid');
  const loadingIndicator = document.getElementById('loadingIndicator');
  loadingIndicator.style.display = 'block';

  try {
    const response = await fetch('/data/coaching-data.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const coachNameDisplay = document.getElementById('coachNameDisplay');
    const firstName =
      data.coaches && data.coaches[0] && data.coaches[0].full_name
        ? data.coaches[0].full_name.split(' ')[0]
        : 'Coach';
    coachNameDisplay.textContent = firstName + ',';

    const addClientCard = document.querySelector('.add-client-card');
    clientGrid.innerHTML = '';
    if (addClientCard) clientGrid.appendChild(addClientCard);

    if (data.clients && data.clients.length > 0) {
      data.clients.forEach(client => {
        clientGrid.insertBefore(createClientCard(client), addClientCard);
      });
    } else {
      const noClientsMessage = document.createElement('div');
      noClientsMessage.className =
        'col-span-full text-center p-8 bg-white rounded-xl shadow-md text-gray-500';
      noClientsMessage.textContent = 'No active clients found. Time to add one!';
      clientGrid.insertBefore(noClientsMessage, addClientCard);
    }
  } catch (error) {
    console.error('Dashboard Data Load Error:', error);
    clientGrid.innerHTML = `
      <div class="col-span-full text-center p-8 bg-red-100 rounded-xl border border-red-400 text-red-700">
        Error loading data: ${error.message}. Ensure 'coaching-data.json' is present and correctly formatted.
      </div>
    `;
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', loadDashboardData);

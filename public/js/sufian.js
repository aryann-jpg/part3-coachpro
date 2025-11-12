// public/js/sufian.js

// --- DOM elements ---
const daySelect = document.getElementById('daySelect');
const addRowBtn = document.getElementById('addRowBtn');
const saveWorkoutBtn = document.getElementById('saveWorkoutBtn');
const exerciseTbody = document.getElementById('exerciseTbody');
const savedModal = document.getElementById('savedModal');
const modalContinueBtn = document.getElementById('modalContinueBtn');
const modalDoneBtn = document.getElementById('modalDoneBtn');
const clientNameDisplay = document.getElementById('clientNameDisplay');

// --- clientId from URL ---
const params = new URLSearchParams(window.location.search);
const clientId = params.get('clientId');

// --- show client name ---
fetch('/data/coaching-data.json')
  .then(r => r.json())
  .then(db => {
    const c = (db.clients || []).find(x => x.clientId === clientId);
    clientNameDisplay.textContent = c ? c.name : 'Unknown Client';
  })
  .catch(() => { clientNameDisplay.textContent = 'Unknown Client'; });

// --- Monday of current week (ISO yyyy-mm-dd) ---
function getMondayISO(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); // use UTC day to avoid timezone drift
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday is always start
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

console.log(getMondayISO(new Date()));

// --- add one editable row ---
function addExerciseRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="exercise-name w-full border-gray-300 rounded p-1" placeholder="Workout name"></td>
    <td><input type="number" class="exercise-sets w-full border-gray-300 rounded p-1" min="1" placeholder="Sets"></td>
    <td><input type="number" class="exercise-reps w-full border-gray-300 rounded p-1" min="1" placeholder="Reps"></td>
    <td><input type="number" class="exercise-weight w-full border-gray-300 rounded p-1" min="0" placeholder="Weight"></td>
  `;
  exerciseTbody.appendChild(tr);
}

// --- wire Add More ---
if (addRowBtn) addRowBtn.addEventListener('click', (e) => {
  e.preventDefault();
  addExerciseRow();
});

// --- collect all rows ---
function collectExercises() {
  const rows = exerciseTbody.querySelectorAll('tr');
  const out = [];
  rows.forEach(r => {
    const name = r.querySelector('.exercise-name').value.trim();
    const sets = parseInt(r.querySelector('.exercise-sets').value, 10) || 0;
    const reps = parseInt(r.querySelector('.exercise-reps').value, 10) || 0;
    const weight = parseFloat(r.querySelector('.exercise-weight').value) || 0;
    if (name) out.push({ workout_name: name, sets, reps, weight });
  });
  return out;
}

// --- save workout ---
if (saveWorkoutBtn) saveWorkoutBtn.addEventListener('click', (e) => {
  e.preventDefault();

  const day = daySelect.value;
  const exercises = collectExercises();

  if (!day) return alert('Please select a day.');
  if (exercises.length === 0) return alert('Please add at least one exercise.');

  const payload = {
    clientId,
    week_start_date: getMondayISO(new Date()),
    day,
    exercises
  };

  fetch('/add-workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
    })
    .then(async res => {
        const data = await res.json().catch(() => null);
        if (data && data.success) {
        showModal();
        } else {
        alert('Workout saved to database, but server did not return success.');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error saving workout.');
    });
});

// --- modal helpers ---
function showModal() {
  savedModal.classList.remove('hidden');
}
if (modalContinueBtn) modalContinueBtn.addEventListener('click', () => {
  exerciseTbody.innerHTML = '';
  addExerciseRow();
  savedModal.classList.add('hidden');
});
if (modalDoneBtn) modalDoneBtn.addEventListener('click', () => {
  window.location.href = '/index.html';
});

// --- first row on load ---
document.addEventListener('DOMContentLoaded', () => {
  addExerciseRow();
});

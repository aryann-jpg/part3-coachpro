// public/js/sufian-helpers.js

// --- compute Monday of current week (ISO yyyy-mm-dd) ---
function getMondayISO(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = Sun ... 6 = Sat
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday is start
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

// --- add one editable row ---
function addExerciseRow() {
  const exerciseTbody = document.getElementById("exerciseTbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" class="exercise-name w-full border-gray-300 rounded p-1" placeholder="Workout name"></td>
    <td><input type="number" class="exercise-sets w-full border-gray-300 rounded p-1" min="1" placeholder="Sets"></td>
    <td><input type="number" class="exercise-reps w-full border-gray-300 rounded p-1" min="1" placeholder="Reps"></td>
    <td><input type="number" class="exercise-weight w-full border-gray-300 rounded p-1" min="0" placeholder="Weight"></td>
  `;
  exerciseTbody.appendChild(tr);
}

// --- collect all rows into an array of exercises ---
function collectExercises() {
  const exerciseTbody = document.getElementById("exerciseTbody");
  const rows = exerciseTbody.querySelectorAll("tr");
  const out = [];

  rows.forEach((r) => {
    const name = r.querySelector(".exercise-name").value.trim();
    const sets = parseInt(r.querySelector(".exercise-sets").value, 10) || 0;
    const reps = parseInt(r.querySelector(".exercise-reps").value, 10) || 0;
    const weight = parseFloat(r.querySelector(".exercise-weight").value) || 0;
    if (name) out.push({ workout_name: name, sets, reps, weight });
  });

  return out;
}

// --- modal helpers ---
function showModal() {
  const savedModal = document.getElementById("savedModal");
  savedModal.classList.remove("hidden");
}

function continueAdding() {
  const exerciseTbody = document.getElementById("exerciseTbody");
  const savedModal = document.getElementById("savedModal");
  exerciseTbody.innerHTML = "";
  addExerciseRow();
  savedModal.classList.add("hidden");
}

function doneAdding() {
  window.location.href = "/index.html";
}

// --- initial page setup (no event listeners) ---
function initWorkoutPage() {
  // first row
  addExerciseRow();

  // show client name
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get("clientId");
  const clientNameDisplay = document.getElementById("clientNameDisplay");

  fetch("/data/coaching-data.json")
    .then((r) => r.json())
    .then((db) => {
      const c = (db.clients || []).find((x) => x.clientId === clientId);
      clientNameDisplay.textContent = c ? c.name : "Unknown Client";
    })
    .catch(() => {
      clientNameDisplay.textContent = "Unknown Client";
    });
}

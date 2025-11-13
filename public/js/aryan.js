const clientId = new URLSearchParams(window.location.search).get("clientId");
const clientNameEl = document.getElementById("clientName");
const workoutDaysContainer = document.getElementById("workoutDaysContainer");
const saveStatus = document.getElementById("saveStatus");

const workoutDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let currentWorkoutPlan = {};

// Called by <body onload>
function loadClientWorkout() {
  if (!clientId) {
    alert("Missing client ID in URL!");
    return;
  }

  fetch("/data/coaching-data.json")
    .then(res => res.json())
    .then(data => {
      const client = data.clients.find(c => c.clientId === clientId);
      const clientWorkouts = (data.workouts || []).find(w => w.clientId === clientId);

      if (!client) {
        alert("Client not found!");
        return;
      }

      clientNameEl.textContent = client.name;
      currentWorkoutPlan = clientWorkouts?.plan || {};
      renderWorkoutForm();
    })
    .catch(err => {
      console.error("Error loading workout data:", err);
      alert("Error loading workout data.");
    });
}

// Generate form fields for each day
function renderWorkoutForm() {
  workoutDaysContainer.innerHTML = "";
  workoutDays.forEach(day => {
    const dayExercises = currentWorkoutPlan[day] || [];

    const daySection = document.createElement("div");
    daySection.className = "p-4 bg-white rounded-lg shadow-md";
    daySection.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-800 mb-3">${day}</h3>
      <div id="exerciseList-${day}" class="space-y-2">
        ${dayExercises.map((ex, i) => renderExerciseRow(day, i, ex)).join("")}
      </div>
    `;
    workoutDaysContainer.appendChild(daySection);
  });
}

// Helper: one exercise row
function renderExerciseRow(day, index, exercise = {}) {
  return `
    <div class="grid grid-cols-4 gap-2 items-center">
      <input type="text" placeholder="Workout name" value="${exercise.workout_name || ''}" class="border p-2 rounded" data-day="${day}" data-field="workout_name" />
      <input type="number" placeholder="Sets" value="${exercise.sets || ''}" class="border p-2 rounded" data-day="${day}" data-field="sets" />
      <input type="number" placeholder="Reps" value="${exercise.reps || ''}" class="border p-2 rounded" data-day="${day}" data-field="reps" />
      <input type="number" placeholder="Weight (kg)" value="${exercise.weight || ''}" class="border p-2 rounded" data-day="${day}" data-field="weight" />
    </div>
  `;
}

// Add exercise to a day
function addExercise(day) {
  const container = document.getElementById(`exerciseList-${day}`);
  container.insertAdjacentHTML("beforeend", renderExerciseRow(day, container.children.length));
}

// Reset form to currentWorkoutPlan
function resetForm() {
  renderWorkoutForm();
  saveStatus.textContent = "Form reset to last saved data.";
}

// Save the workout (PUT)
function saveWorkoutPlan(event) {
  event.preventDefault();

  const updatedPlan = {};

  workoutDays.forEach(day => {
    const rows = document.querySelectorAll(`[data-day="${day}"][data-field="workout_name"]`);
    const dayExercises = [];

    rows.forEach((_, i) => {
      const name = document.querySelectorAll(`[data-day="${day}"][data-field="workout_name"]`)[i].value.trim();
      const sets = document.querySelectorAll(`[data-day="${day}"][data-field="sets"]`)[i].value.trim();
      const reps = document.querySelectorAll(`[data-day="${day}"][data-field="reps"]`)[i].value.trim();
      const weight = document.querySelectorAll(`[data-day="${day}"][data-field="weight"]`)[i].value.trim();
      if (name) {
        dayExercises.push({ workout_name: name, sets, reps, weight });
      }
    });

    updatedPlan[day] = dayExercises;
  });

  fetch(`/api/workout/${clientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: updatedPlan }),
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to update workout");
      return res.json();
    })
    .then(result => {
      saveStatus.textContent = "✅ Workout plan updated successfully!";
      console.log("Updated workout:", result);
    })
    .catch(err => {
      console.error(err);
      saveStatus.textContent = "❌ Error updating workout plan.";
    });
}

// Go back to homepage
function goBack() {
  window.location.href = "/index.html";
}

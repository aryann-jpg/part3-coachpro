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

function initWorkoutPage() {
  addExerciseRow();

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

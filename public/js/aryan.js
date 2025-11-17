// public/js/aryan.js

// 1. Get parameters from the URL
const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get("clientId");
const workoutDay = urlParams.get("day"); 

// 2. DOM Elements
const clientNameEl = document.getElementById("clientName");
const currentDayTitleEl = document.getElementById("currentDayTitle");
const exerciseListContainer = document.getElementById("exerciseList"); // Use single container
const saveStatus = document.getElementById("saveStatus"); 

const workoutDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let currentWorkoutPlan = {};
let currentExercises = []; // Array to hold the exercises for the *current day*

// Called by <body onload>
function loadClientWorkout() {
    if (!clientId) {
        alert("Missing client ID in URL! Cannot load workout."); 
        saveStatus.textContent = "Error: Missing client ID."; 
        return;
    }
    if (!workoutDay) {
        alert("Missing workout day in URL! Cannot load workout.");
        saveStatus.textContent = "Error: Missing workout day.";
        return;
    }

    currentDayTitleEl.textContent = workoutDay; // Show the day name
    
    fetch("/data/coaching-data.json")
        .then(res => res.json())
        .then(data => {
            const client = data.clients.find(c => c.clientId === clientId);
            const clientWorkouts = (data.workouts || []).find(w => w.clientId === clientId);

            if (!client) {
                alert("Client not found!");
                saveStatus.textContent = "Error: Client not found in database.";
                return;
            }

            clientNameEl.textContent = client.name;
            currentWorkoutPlan = clientWorkouts?.plan || {};
            
            // Extract exercises ONLY for the current day
            currentExercises = currentWorkoutPlan[workoutDay] || [];
            
            renderExerciseForm();
            saveStatus.textContent = ""; 
        })
        .catch(err => {
            console.error("Error loading workout data:", err);
            alert("Error loading workout data from server."); 
            saveStatus.textContent = "❌ Error loading workout data from server.";
        });
}

/**
 * Renders the exercise rows ONLY for the current day, without adding an empty row.
 */
function renderExerciseForm() {
    exerciseListContainer.innerHTML = "";
    
    // Add header row for clarity
    const headerRow = `
        <div class="grid grid-cols-4 gap-2 font-semibold text-gray-600 border-b pb-2">
            <span>Workout Name</span>
            <span>Sets</span>
            <span>Reps</span>
            <span>Weight (kg)</span>
        </div>
    `;
    exerciseListContainer.insertAdjacentHTML("beforeend", headerRow);
    
    // Render existing exercises
    currentExercises.forEach((ex, i) => {
        exerciseListContainer.insertAdjacentHTML("beforeend", renderExerciseRow(i, ex));
    });
    
    // REMOVED: addExerciseRow() call is removed here.
}

// Helper: one exercise row
function renderExerciseRow(index, exercise = {}) {
    // Unique data-index is important for gathering data later
    return `
        <div class="grid grid-cols-4 gap-2 items-center" data-index="${index}">
            <input type="text" placeholder="Workout name" value="${exercise.workout_name || ''}" class="border p-2 rounded" data-field="workout_name" />
            <input type="number" placeholder="Sets" value="${exercise.sets || ''}" class="border p-2 rounded" data-field="sets" />
            <input type="number" placeholder="Reps" value="${exercise.reps || ''}" class="border p-2 rounded" data-field="reps" />
            <input type="number" placeholder="Weight (kg)" value="${exercise.weight || ''}" class="border p-2 rounded" data-field="weight" />
        </div>
    `;
}

// REMOVED: function addExerciseRow() is removed.

// Reset form to currentExercises
function resetForm() {
    renderExerciseForm();
    alert("Form reset to last saved data."); 
    saveStatus.textContent = "Form reset to last saved data.";
}

// Save the workout (PUT)
function saveWorkoutPlan(event) {
    event.preventDefault();

    const updatedExercises = [];
    
    // Select all input rows, skipping the header (first child)
    const exerciseRows = Array.from(exerciseListContainer.children).slice(1); 

    exerciseRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        
        // Ensure we have 4 inputs and the name is NOT empty (this filters out empty rows)
        const name = inputs[0]?.value.trim();
        if (inputs.length === 4 && name) { 
            const sets = inputs[1].value.trim();
            const reps = inputs[2].value.trim();
            const weight = inputs[3].value.trim();
            
            updatedExercises.push({ workout_name: name, sets, reps, weight });
        }
    });
    
    // Create the updated plan object, only changing the current day
    const updatedPlan = { ...currentWorkoutPlan };
    updatedPlan[workoutDay] = updatedExercises;

    // Perform the API call
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
            alert(`✅ Workout plan updated successfully for ${workoutDay}!`);
            saveStatus.textContent = "✅ Workout plan updated successfully!";
            console.log("Updated workout:", result);
            // After successful save, update the currentExercises state and re-render to reflect only saved exercises
            currentExercises = updatedExercises;
            renderExerciseForm(); 
        })
        .catch(err => {
            alert("❌ Error updating workout plan."); 
            console.error(err);
            saveStatus.textContent = "❌ Error updating workout plan.";
        });
}

// Go back to homepage
function goBack() {
    window.location.href = "/index.html";
}
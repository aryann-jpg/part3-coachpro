let originalExercises = [];
let clientIdGlobal = "";
let workoutDayGlobal = "";

function loadClientWorkout() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get("clientId");
    const workoutDay = urlParams.get("day");

    clientIdGlobal = clientId;
    workoutDayGlobal = workoutDay;

    const clientNameEl = document.getElementById("clientName");
    const currentDayTitleEl = document.getElementById("currentDayTitle");
    const exerciseListContainer = document.getElementById("exerciseList");
    const saveStatus = document.getElementById("saveStatus");

    if (!clientId || !workoutDay) {
        alert("Missing clientId or workout day in URL.");
        saveStatus.textContent = "Error: Missing URL parameters.";
        return;
    }

    if (!/^[a-zA-Z]+$/.test(workoutDay)) {
        alert("Invalid workout day.");
        saveStatus.textContent = "Error: Invalid workout day.";
        return;
    }

    currentDayTitleEl.textContent = workoutDay;

    // ---------------- Fetch and render ----------------
    fetch("/data/coaching-data.json")
        .then(res => {
            if (!res.ok) throw new Error("Failed to load data");
            return res.json();
        })
        .then(data => {
            const client = data.clients?.find(c => c.clientId === clientId);
            const clientWorkouts = data.workouts?.find(w => w.clientId === clientId);

            if (!client || !clientWorkouts) {
                alert("Client data not found.");
                saveStatus.textContent = "Error: Client data not found.";
                return;
            }

            // ---------------- Set client name ----------------
            clientNameEl.textContent = client.name;

            const plan = clientWorkouts.plan || {};
            const currentExercises = plan[workoutDay] || [];
            originalExercises = JSON.parse(JSON.stringify(currentExercises));

            renderExercises(currentExercises);

            // ---------------- Save workout ----------------
            window.saveWorkoutPlan = function(event) {
                event.preventDefault();
                saveStatus.textContent = "";

                const updatedExercises = [];
                const rows = Array.from(exerciseListContainer.children).slice(1);

                let hasError = false;

                rows.forEach((row, index) => {
                    const inputs = row.querySelectorAll("input");
                    const name = inputs[0].value.trim();
                    const sets = Number(inputs[1].value);
                    const reps = Number(inputs[2].value);
                    const weight = Number(inputs[3].value);

                    if (!name || !sets || !reps || !weight) {
                        alert(`All fields must be filled for exercise #${index + 1}`);
                        hasError = true;
                        return;
                    }
                    if (name.length > 30) {
                        alert(`Workout name too long for exercise #${index + 1}`);
                        hasError = true;
                        return;
                    }
                    if (sets <= 0 || reps <= 0 || weight <= 0) {
                        alert(`Numeric values must be greater than zero (exercise #${index + 1})`);
                        hasError = true;
                        return;
                    }

                    updatedExercises.push({ workout_name: name, sets, reps, weight });
                });

                if (hasError) {
                    saveStatus.textContent = "Fix validation errors before saving.";
                    return;
                }

                const updatedPlan = { ...plan, [workoutDay]: updatedExercises };

                fetch(`/api/workout/${clientId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ plan: updatedPlan })
                })
                .then(res => {
                    if (!res.ok) throw new Error("Save failed");
                    return res.json();
                })
                .then(() => {
                    alert("Workout updated successfully!");
                    saveStatus.textContent = "Saved!";
                    originalExercises = JSON.parse(JSON.stringify(updatedExercises));
                })
                .catch(() => {
                    alert("Error saving workout.");
                    saveStatus.textContent = "Error saving workout.";
                });
            };

            // ---------------- Reset ----------------
            window.resetForm = async function() {
                saveStatus.textContent = "";
                try {
                    const response = await fetch("/data/coaching-data.json");
                    const data = await response.json();
                    const clientWorkouts = data.workouts.find(w => w.clientId === clientIdGlobal);
                    const plan = clientWorkouts.plan || {};
                    const exercises = plan[workoutDayGlobal] || [];

                    originalExercises = JSON.parse(JSON.stringify(exercises));

                    renderExercises(originalExercises);

                    return Promise.resolve();
                } catch (err) {
                    console.error(err);
                    saveStatus.textContent = "Error resetting form.";
                    return Promise.reject(err);
                }
            };

            // ---------------- Back ----------------
            window.goBack = function() {
                window.location.href = "/login.html"; // updated to match Playwright test
            };
        })
        .catch(err => {
            console.error(err);
            alert("Error loading workout data.");
            saveStatus.textContent = "Error loading workout data.";
        });
}

// ---------------- Render exercises ----------------
function renderExercises(exercises) {
    const exerciseListContainer = document.getElementById("exerciseList");
    exerciseListContainer.innerHTML = `
        <div class="grid grid-cols-4 gap-2 font-semibold text-gray-600 border-b pb-2">
            <span>Workout Name</span>
            <span>Sets</span>
            <span>Reps</span>
            <span>Weight (kg)</span>
        </div>
    `;

    exercises.forEach(ex => {
        exerciseListContainer.insertAdjacentHTML("beforeend", `
            <div class="grid grid-cols-4 gap-2 items-center">
                <input type="text" value="${ex.workout_name || ''}" maxlength="30" class="border p-2 rounded" />
                <input type="number" min="1" value="${ex.sets || ''}" class="border p-2 rounded" />
                <input type="number" min="1" value="${ex.reps || ''}" class="border p-2 rounded" />
                <input type="number" min="1" value="${ex.weight || ''}" class="border p-2 rounded" />
            </div>
        `);
    });
}

// ---------------- Attach load to DOMContentLoaded ----------------
document.addEventListener("DOMContentLoaded", () => {
    loadClientWorkout();
});

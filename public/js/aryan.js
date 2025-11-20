function loadClientWorkout() {
    // --- URL Params ---
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get("clientId");
    const workoutDay = urlParams.get("day");

    // --- DOM Elements ---
    const clientNameEl = document.getElementById("clientName");
    const currentDayTitleEl = document.getElementById("currentDayTitle");
    const exerciseListContainer = document.getElementById("exerciseList");
    const saveStatus = document.getElementById("saveStatus");

    if (!clientId || !workoutDay) {
        alert("Missing clientId or day in URL.");
        saveStatus.textContent = "Error: Missing clientId or day in URL.";
        return;
    }

    currentDayTitleEl.textContent = workoutDay;

    // Load coaching-data.json
    fetch("/data/coaching-data.json")
        .then(res => res.json())
        .then(data => {
            const client = data.clients.find(c => c.clientId === clientId);
            const clientWorkouts = (data.workouts || []).find(w => w.clientId === clientId);

            if (!client || !clientWorkouts) {
                alert("Client data not found.");
                saveStatus.textContent = "Error: Client data not found.";
                return;
            }

            clientNameEl.textContent = client.name;
            const plan = clientWorkouts.plan || {};
            const currentExercises = plan[workoutDay] || [];

            // --- Render Table ---
            exerciseListContainer.innerHTML = `
                <div class="grid grid-cols-4 gap-2 font-semibold text-gray-600 border-b pb-2">
                    <span>Workout Name</span>
                    <span>Sets</span>
                    <span>Reps</span>
                    <span>Weight (kg)</span>
                </div>
            `;

            currentExercises.forEach(ex => {
                exerciseListContainer.insertAdjacentHTML("beforeend", `
                    <div class="grid grid-cols-4 gap-2 items-center">
                        <input type="text" value="${ex.workout_name || ''}" class="border p-2 rounded" />
                        <input type="number" value="${ex.sets || ''}" class="border p-2 rounded" />
                        <input type="number" value="${ex.reps || ''}" class="border p-2 rounded" />
                        <input type="number" value="${ex.weight || ''}" class="border p-2 rounded" />
                    </div>
                `);
            });

            // --- Save Workout ---
            window.saveWorkoutPlan = function(event) {
                event.preventDefault(); // Prevent form reload

                const updatedExercises = [];
                const rows = Array.from(exerciseListContainer.children).slice(1);

                let hasError = false;

                rows.forEach((r, index) => {
                    const inputs = r.querySelectorAll("input");
                    const name = inputs[0].value.trim();
                    const sets = inputs[1].value.trim();
                    const reps = inputs[2].value.trim();
                    const weight = inputs[3].value.trim();

    // --- Validation ---
                    if (!name || !sets || !reps || !weight) {
                    alert(`Please fill in ALL fields for exercise #${index}.`);
                    hasError = true;
                return;
            }

            updatedExercises.push({
                 workout_name: name,
                 sets,
                 reps,
                weight
            });
        });

    if (hasError) {
        saveStatus.textContent = "Fix the errors above.";
        return; // Stop saving
    }


                const updatedPlan = { ...plan };
                updatedPlan[workoutDay] = updatedExercises;

                fetch(`/api/workout/${clientId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ plan: updatedPlan })
                })
                .then(res => {
                    if (!res.ok) throw new Error("Failed to save workout");
                    return res.json();
                })
                .then(() => {
                    alert(" Workout Updated!");
                    saveStatus.textContent = "Saved!";
                })
                .catch(() => {
                    alert(" Error saving workout");
                    saveStatus.textContent = "Error saving workout";
                });
            };

            // --- Reset Workout ---
            window.resetForm = function() {
                loadClientWorkout(); // Reload original data
                saveStatus.textContent = "Form reset.";
            };

            // --- Back Button ---
            window.goBack = function() {
                window.location.href = "/index.html";
            };
        })
        .catch(err => {
            console.error(err);
            alert("Error loading workout data.");
            saveStatus.textContent = "Error loading workout data.";
        });
}

function viewWorkoutDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get("clientId");
    const day = urlParams.get("day");

    const clientNameEl = document.getElementById("clientName");
    const dayTitleEl = document.getElementById("currentDayTitle");
    const workoutContainer = document.getElementById("exerciseList");

    if (!clientId || !day) {
        alert("Invalid URL parameters.");
        return;
    }

    dayTitleEl.textContent = day;

    fetch("/data/coaching-data.json")
        .then(res => res.json())
        .then(data => {
            const client = data.clients.find(c => c.clientId === clientId);
            const workout = data.workouts.find(w => w.clientId === clientId);

            if (!client || !workout) {
                alert("Workout or client not found.");
                return;
            }

            clientNameEl.textContent = client.name;

            const exercises = workout.plan[day] || [];

            workoutContainer.innerHTML = `
                <div class="grid grid-cols-4 gap-2 font-semibold text-gray-600 border-b pb-2">
                    <span>Workout Name</span>
                    <span>Sets</span>
                    <span>Reps</span>
                    <span>Weight (kg)</span>
                </div>
            `;

            exercises.forEach(ex => {
                workoutContainer.insertAdjacentHTML("beforeend", `
                    <div class="grid grid-cols-4 gap-2 p-2 border-b">
                        <span>${ex.workout_name || '-'}</span>
                        <span>${ex.sets || '-'}</span>
                        <span>${ex.reps || '-'}</span>
                        <span>${ex.weight || '-'}</span>
                    </div>
                `);
            });
        })
        .catch(err => {
            console.error(err);
            alert("Error loading workout details.");
        });
}

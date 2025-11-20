function initEditWorkoutPage() {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("client");
    const day = params.get("day");

    const dayBtn = document.getElementById("day-select-button");
    const tableContainer = document.getElementById("tableContainer");

    if (dayBtn) dayBtn.textContent = day || "Unknown Day";
    document.title = `Edit Workout - ${day}`;

    fetch("./utils/coaching-data.json")
        .then(res => res.json())
        .then(data => {
            const workout = data.workouts.find(w => w.clientId === clientId);

            if (!workout) {
                alert("Workout not found!");
                return;
            }

            const dayData = workout.plan[day];
            if (!dayData) {
                alert("No data for this day.");
                return;
            }

            tableContainer.innerHTML = `
                <table class="w-full text-left border">
                    <thead>
                        <tr class="bg-gray-200">
                            <th class="p-2 border">Workout</th>
                            <th class="p-2 border">Sets</th>
                            <th class="p-2 border">Reps</th>
                            <th class="p-2 border">Weight</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dayData.exercises
                            .map(
                                ex => `
                                <tr>
                                    <td class="border p-2">${ex.workout_name}</td>
                                    <td class="border p-2">${ex.sets}</td>
                                    <td class="border p-2">${ex.reps}</td>
                                    <td class="border p-2">${ex.weight}</td>
                                </tr>
                            `
                            )
                            .join("")}
                    </tbody>
                </table>
            `;
        })
        .catch(err => console.error(err));
}

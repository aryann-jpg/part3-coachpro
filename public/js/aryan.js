document.addEventListener('DOMContentLoaded', () => {
    console.log("Edit Workout Page loaded.");

    // Simple functionality to visually represent dropdowns being selected
    const daySelect = document.getElementById('day-select');
    const typeSelect = document.getElementById('type-select');

    daySelect.addEventListener('click', () => {
        // In a real app, clicking would open a dropdown menu
        alert("Day selection clicked. (Would open a dropdown)");
    });

    typeSelect.addEventListener('click', () => {
        // In a real app, clicking would open a dropdown menu
        alert("Workout type selection clicked. (Would open a dropdown)");
    });

    // You would add more JavaScript here for:
    // 1. Loading existing workout data into the table on page load.
    // 2. Dynamically adding new exercise rows to the table.
    // 3. Validating input fields.
});

// Function called when "Save Changes" is clicked
function saveWorkoutChanges() {
    // 1. Gather all data from the table inputs
    const table = document.getElementById('workout-table');
    const rows = table.querySelectorAll('tbody tr');
    const workoutData = [];

    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length > 0 && inputs[0].value.trim() !== '') {
            // Only capture rows with an exercise name
            workoutData.push({
                exercise: inputs[0].value,
                sets: inputs[1].value,
                reps: inputs[2].value,
                weight: inputs[3].value,
                note: inputs[4].value
            });
        }
    });

    console.log('Workout Data to Save:', workoutData);
    
    // 2. Send the data to the server (Placeholder action)
    if (workoutData.length > 0) {
        alert(`Successfully saved ${workoutData.length} exercises for Monday - Push! (Check console for data)`);
        // Example: fetch('/api/save-workout', { method: 'POST', body: JSON.stringify(workoutData) })
    } else {
        alert("No workout data to save.");
    }
}
function initEditWorkoutPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('client');
    const day = urlParams.get('day');

    const dayBtn = document.getElementById('day-select-button');
    if (dayBtn) dayBtn.textContent = day || 'Unknown Day';

    // Update page title
    document.title = `Edit Workout - ${day}`;

    // Load data from JSON and populate table
    fetch('./utils/coaching-data.json')
        .then(response => response.json())
        .then(data => {
            const workout = data.workouts.find(w => w.clientId === clientId);
            if (!workout) {
                alert('No workout found for this client!');
                return;
            }

            const dayData = workout.plan[day];
            if (!dayData) {
                alert(`No data for ${day}`);
                return;
            }

            populateWorkoutTable(dayData.exercises);
        })
        .catch(err => console.error('Error loading workout:', err));
}

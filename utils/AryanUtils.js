document.addEventListener('DOMContentLoaded', () => {
    // 1. Function to get a query parameter from the URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        // The .get() method returns the value of the first matching parameter
        return urlParams.get(param); 
    }

    // Get the client and day from the URL
    const clientName = getQueryParam('client'); // e.g., 'c_sarah'
    const workoutDay = getQueryParam('day');   // e.g., 'Tuesday'
    
    // Get the DOM elements
    const daySelectButton = document.getElementById('day-select-button');
    const typeSelectButton = document.getElementById('type-select-button');

    // 2. Update the day button text
    if (workoutDay && daySelectButton) {
        daySelectButton.textContent = workoutDay;
        // Optional: Update the document title for clarity
        document.title = `Edit Workout: ${workoutDay}`;
    } else {
        daySelectButton.textContent = 'Day Not Found';
        console.error("Could not find 'day' parameter in URL.");
    }
    
    // Optional: Log the data we received (in a real app, you'd use this to fetch data)
    console.log(`Loaded Edit Page for Client ID: ${clientName}`);
    console.log(`Loaded Edit Page for Day: ${workoutDay}`);


    // --- Placeholder for fetching and loading workout data ---
    if (clientName && workoutDay) {
        // In a real application, this is where you would make an API call:
        // fetch(`/api/workout-plan?client=${clientName}&day=${workoutDay}`)
        //   .then(response => response.json())
        //   .then(data => { /* populate table with data */ });
    }
});

// Function called when "Save Changes" is clicked (same as before)
function saveWorkoutChanges() {
    alert("Saving changes for the current workout...");
    // The logic to gather and send data goes here.
}
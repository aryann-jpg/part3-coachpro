// public/js/sufian.js

// single main function, triggered by the Save button
function saveWorkout() {
  const daySelect = document.getElementById("daySelect");
  const day = daySelect.value;
  const exercises = collectExercises(); // from sufian-helpers.js

  if (!day) {
    alert("Please select a day.");
    return;
  }
  if (exercises.length === 0) {
    alert("Please add at least one exercise.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const clientId = params.get("clientId");

  const payload = {
    clientId,
    week_start_date: getMondayISO(new Date()), // helper
    day,
    exercises
  };

  fetch("/add-workout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then((res) => res.json())
    .then((data) => {
      if (data && data.success) {
        showModal(); // helper
      } else {
        alert("Workout saved to database, but server did not return success.");
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      alert("Error saving workout.");
    });
}

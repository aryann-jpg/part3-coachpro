function populateWorkoutTable(exercises) {
    const tbody = document.getElementById('workout-body');
    tbody.innerHTML = '';

    if (!exercises || exercises.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No exercises available.</td></tr>';
        return;
    }

    for (const ex of exercises) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${ex.name || ''}"></td>
            <td><input type="number" value="${ex.sets || ''}"></td>
            <td><input type="number" value="${ex.reps || ''}"></td>
            <td><input type="number" value="${ex.weight || ''}"></td>
            <td><input type="text" value="${ex.notes || ''}"></td>
        `;
        tbody.appendChild(row);
    }
}

function saveWorkoutChanges() {
    const rows = document.querySelectorAll('#workout-body tr');
    const data = [];

    for (const row of rows) {
        const inputs = row.querySelectorAll('input');
        if (inputs[0].value.trim() !== '') {
            data.push({
                exercise: inputs[0].value,
                sets: inputs[1].value,
                reps: inputs[2].value,
                weight: inputs[3].value,
                note: inputs[4].value
            });
        }
    }

    console.log('Workout Saved:', data);
    alert(`Saved ${data.length} exercises successfully (mock save).`);
}

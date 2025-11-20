function addTemplate() {
    var response = "";

    var jsonData = {
        name: document.getElementById("template-name").value.trim(),
        exercises: [
            {
                name: document.getElementById("exercise-name").value.trim(),
                sets: parseInt(document.getElementById("exercise-sets").value),
                reps: parseInt(document.getElementById("exercise-reps").value),
                notes: document.getElementById("exercise-notes").value.trim()
            }
        ]
    };

    if (!jsonData.name || !jsonData.exercises[0].name || !jsonData.exercises[0].sets || !jsonData.exercises[0].reps) {
        alert('Template name, exercise name, sets, and reps are required!');
        return;
    }

    var request = new XMLHttpRequest();
    request.open("POST", "/add-template", true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);
        console.log(response);

        if (!response.message) {
            alert('Added Workout Template: ' + jsonData.name + '!');

            document.getElementById("template-name").value = "";
            document.getElementById("exercise-name").value = "";
            document.getElementById("exercise-sets").value = "";
            document.getElementById("exercise-reps").value = "";
            document.getElementById("exercise-notes").value = "";

            $('#workoutModal').modal('hide');

            viewTemplates(); 
        } else {
            alert('Unable to add template!');
        }
    };

    request.send(JSON.stringify(jsonData));
}

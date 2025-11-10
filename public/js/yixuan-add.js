function addTemplate() {
    var response = "";

    // Gather form data
    var templateData = {};
    templateData.name = document.getElementById("templateName").value;
    templateData.exercises = []; // populate this based on your exercise input fields
    templateData.coachId = sessionStorage.getItem('coachId');
    templateData.clientId = document.getElementById("clientSelect")?.value || null; // optional

    // Validate required fields
    if (!templateData.name || templateData.exercises.length === 0) {
        alert('Template name and at least one exercise are required!');
        return;
    }

    // Configure the POST request to your server endpoint
    var request = new XMLHttpRequest();
    request.open("POST", "/api/templates", true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);
        console.log(response);

        if (!response.message) {
            alert('Added Template: ' + templateData.name + '!');

            // Clear form fields after success
            document.getElementById("templateName").value = "";
            // Clear exercises inputs if you have multiple input fields
            // e.g., reset a table or list of exercise rows

            // Optionally hide modal if using one
            $('#templateModal').modal('hide');

            // Reload templates list or client plan
            loadTemplates(); // your function to refresh template display
        } else {
            alert('Unable to add template!');
        }
    };

    // Send JSON data
    request.send(JSON.stringify(templateData));
}

// models/create-workout.js
class Workout {
  constructor(clientId, week_start_date) {
    this.clientId = clientId;
    this.week_start_date = week_start_date;

    // structure of the workout plan for the week
    this.plan = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    // generate unique workoutId (similar idea to your Resource example)
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    this.workoutId = "wk" + timestamp + random.toString().padStart(3, "0");
  }
}

module.exports = { Workout };

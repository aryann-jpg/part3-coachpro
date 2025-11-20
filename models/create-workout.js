class Workout {
  constructor(clientId, week_start_date) {
    this.clientId = clientId;
    this.week_start_date = week_start_date;

    this.plan = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    this.workoutId = "wk" + timestamp + random.toString().padStart(3, "0");
  }
}

module.exports = { Workout };

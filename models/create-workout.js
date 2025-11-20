class Workout {
  constructor(clientId) {
    this.clientId = clientId;

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

function validateWorkout(workout) {
  if (!workout || typeof workout !== 'object') {
    return false;
  }

  const { workout_name, sets, reps, weight } = workout;

  // Workout name validation
  if (
    !workout_name ||
    typeof workout_name !== 'string' ||
    workout_name.trim() === '' ||
    workout_name.length > 30
  ) {
    return false;
  }

  // Numeric validation
  if (
    typeof sets !== 'number' ||
    typeof reps !== 'number' ||
    typeof weight !== 'number' ||
    sets <= 0 ||
    reps <= 0 ||
    weight <= 0
  ) {
    return false;
  }

  return true;
}

module.exports = { validateWorkout };

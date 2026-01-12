import { describe, it, expect } from 'vitest';
import { validateWorkout } from '../utils/validation';

describe('Workout Validation', () => {
  it('returns true for valid workout data', () => {
    const workout = {
      workout_name: 'Bench Press',
      sets: 3,
      reps: 10,
      weight: 60
    };

    expect(validateWorkout(workout)).toBe(true);
  });

  it('returns false when workout name is empty', () => {
    expect(validateWorkout({
      workout_name: '',
      sets: 3,
      reps: 10,
      weight: 60
    })).toBe(false);
  });

  it('returns false for zero or negative values', () => {
    expect(validateWorkout({
      workout_name: 'Bench Press',
      sets: 0,
      reps: 10,
      weight: 60
    })).toBe(false);
  });

  it('returns false when name exceeds 30 characters', () => {
    expect(validateWorkout({
      workout_name: 'A'.repeat(31),
      sets: 3,
      reps: 10,
      weight: 60
    })).toBe(false);
  });
});

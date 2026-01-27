const fs = require('fs');
const { updateWorkoutPlan } = require('../utils/AryanUtil');

jest.mock('fs');

describe('Unit Tests for AryanUtil (Edit Workout Feature)', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { clientId: '1' },
      body: {
        plan: {
          Monday: [
            {
              workout_name: 'Bench Press',
              sets: 3,
              reps: 10,
              weight: 60,
            },
          ],
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    fs.readFileSync.mockReturnValue(
      JSON.stringify({
        workouts: [
          {
            clientId: '1',
            plan: { Monday: [] },
          },
        ],
      })
    );

    fs.writeFileSync.mockImplementation(() => {});
  });

  // ---------------- SUCCESS CASE ----------------
  it('should update the workout plan successfully', async () => {
    await updateWorkoutPlan(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Workout plan updated successfully!',
      plan: req.body.plan,
    });

    expect(fs.writeFileSync).toHaveBeenCalled();

    const writtenData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(writtenData.workouts[0].plan).toEqual(req.body.plan);
  });

  // ---------------- VALIDATION TESTS ----------------
  it('should return 400 if plan is missing', async () => {
    req.body.plan = null;

    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing or invalid 'plan' in request body.",
    });
  });

  it('should return 400 if plan is not an object', async () => {
    req.body.plan = 'invalid';

    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing or invalid 'plan' in request body.",
    });
  });

  it('should return 400 if exercise data is invalid', async () => {
    req.body.plan.Monday[0].sets = 0;

    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid exercise data detected in Monday.',
    });
  });

  it('should return 400 if workout name is too long', async () => {
    req.body.plan.Monday[0].workout_name = 'A'.repeat(40);

    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid exercise data detected in Monday.',
    });
  });

  // ---------------- DATA STRUCTURE TESTS ----------------
  it('should return 404 if client workout not found', async () => {
    req.params.clientId = '999';

    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Client workout not found.',
    });
  });

  it('should return 500 if workout data structure is invalid', async () => {
    // Adding console spy here too as this triggers a 500 log
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fs.readFileSync.mockReturnValue(JSON.stringify({}));

    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Workout data structure invalid.',
    });
    
    consoleSpy.mockRestore();
  });

  // ---------------- ERROR HANDLING ----------------
  it('should return 500 if saving the workout plan fails', async () => {
    // 1. Spy on console.error to keep the terminal clean
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // 2. Trigger the mock error
    fs.writeFileSync.mockImplementation(() => {
      throw new Error('Disk error');
    });

    await updateWorkoutPlan(req, res);

    // 3. Verify the response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to save workout plan.',
    });

    // 4. Restore the original console behavior
    consoleSpy.mockRestore();
  });
});
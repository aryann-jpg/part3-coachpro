const fs = require('fs');
const path = require('path');
const { updateWorkoutPlan } = require('../utils/AryanUtil'); // Adjust path as needed

// Mock fsSync so no real file operations happen
jest.mock('fs');

describe('Unit Tests for AryanUtil', () => {
  let req, res;
  let writeFileSyncMock;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { clientId: '1' },
      body: {
        plan: {
          Monday: [
            { workout_name: 'Bench Press', sets: '3', reps: '10', weight: '60' },
          ],
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock readFileSync and writeFileSync
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

    writeFileSyncMock = fs.writeFileSync.mockImplementation(() => {});
  });

  it('should update the workout plan successfully', async () => {
    await updateWorkoutPlan(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Workout plan updated successfully!',
      plan: req.body.plan,
    });

    // Verify file write
    expect(writeFileSyncMock).toHaveBeenCalled();
    const writtenData = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(writtenData.workouts[0].plan).toEqual(req.body.plan);
  });

  it('should return 400 if plan is missing', async () => {
    req.body.plan = null;
    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing or invalid 'plan' in request body.",
    });
  });

  it('should return 404 if client workout not found', async () => {
    req.params.clientId = '999';
    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Client workout not found.',
    });
  });

  it('should return 500 if data structure is invalid', async () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({}));
    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Workout data structure invalid.',
    });
  });

  it('should return 500 if write fails', async () => {
    fs.writeFileSync.mockImplementation(() => {
      throw new Error('Disk error');
    });

    await updateWorkoutPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to save workout plan.',
    });
  });
});

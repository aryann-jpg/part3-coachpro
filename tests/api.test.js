const request = require('supertest');
const { app } = require('../index');
const fs = require('fs');

// Mock only the functions used
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
  },
}));

let server;

// Start server before all tests
beforeAll(() => {
  server = app.listen(5050);
});

// Close server after all tests
afterAll(() => {
  if (server) server.close();
});

describe('API Tests - Edit Workout Plan', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock reading the workout JSON file
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

    // Mock writing to file successfully
    fs.writeFileSync.mockImplementation(() => {});
    fs.promises.writeFile.mockResolvedValue();
  });

  it('PUT /api/workout/:clientId should update workout plan (200)', async () => {
    const res = await request(app)
      .put('/api/workout/1')
      .send({
        plan: {
          Monday: [
            {
              workout_name: 'Bench Press',
              sets: '3',
              reps: '10',
              weight: '60',
            },
          ],
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Workout plan updated successfully!');
  });

  it('should return 400 if plan is missing', async () => {
    const res = await request(app)
      .put('/api/workout/1')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing or invalid 'plan' in request body.");
  });

  it('should return 400 if plan is not an object', async () => {
    const res = await request(app)
      .put('/api/workout/1')
      .send({ plan: 'invalid' });

    expect(res.status).toBe(400);
  });

  it('should return 404 if client workout does not exist', async () => {
    const res = await request(app)
      .put('/api/workout/999')
      .send({ plan: { Monday: [] } });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Client workout not found.');
  });

  it('should return 500 if workout data structure is invalid', async () => {
    // Simulate invalid file structure
    fs.readFileSync.mockReturnValue(JSON.stringify({}));

    const res = await request(app)
      .put('/api/workout/1')
      .send({ plan: { Monday: [] } });

    expect(res.status).toBe(500);
  });

  it('should return 500 if saving workout plan fails', async () => {
    // Simulate write error
    fs.writeFileSync.mockImplementation(() => {
      throw new Error('Disk error');
    });

    const res = await request(app)
      .put('/api/workout/1')
      .send({ plan: { Monday: [] } });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to save workout plan.');
  });
});

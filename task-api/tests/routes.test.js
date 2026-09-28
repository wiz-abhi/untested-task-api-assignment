const request = require('supertest');
const app = require('../src/app');
const service = require('../src/services/taskService');

beforeEach(() => service._reset());

describe('task routes', () => {
  test('lists, filters, paginates, and returns stats', async () => {
    await request(app).post('/tasks').send({ title: 'One', dueDate: '2000-01-01T00:00:00.000Z' }).expect(201);
    await request(app).post('/tasks').send({ title: 'Two', status: 'in_progress' }).expect(201);
    const list = await request(app).get('/tasks').expect(200);
    expect(list.body).toHaveLength(2);
    expect((await request(app).get('/tasks?status=todo')).body).toHaveLength(1);
    expect((await request(app).get('/tasks?page=1&limit=1')).body).toHaveLength(1);
    expect((await request(app).get('/tasks/stats')).body).toMatchObject({ todo: 1, in_progress: 1, overdue: 1 });
  });

  test('creates tasks and validates payloads', async () => {
    expect((await request(app).post('/tasks').send({ title: '  ' })).status).toBe(400);
    expect((await request(app).post('/tasks').send({ title: 'x', status: 'bad' })).status).toBe(400);
    expect((await request(app).post('/tasks').send({ title: 'x', dueDate: 'not-a-date' })).status).toBe(400);
    const response = await request(app).post('/tasks').send({ title: 'Valid', priority: 'high' }).expect(201);
    expect(response.body).toMatchObject({ title: 'Valid', priority: 'high' });
  });

  test('updates and handles missing tasks', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Before' });
    const id = created.body.id;
    expect((await request(app).put(`/tasks/${id}`).send({ title: 'After' })).body.title).toBe('After');
    expect((await request(app).put(`/tasks/${id}`).send({ status: 'bad' })).status).toBe(400);
    expect((await request(app).put('/tasks/missing').send({ title: 'x' })).status).toBe(404);
  });

  test('completes and deletes tasks', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Complete me' });
    const id = created.body.id;
    expect((await request(app).patch(`/tasks/${id}/complete`)).body.status).toBe('done');
    expect((await request(app).patch('/tasks/missing/complete')).status).toBe(404);
    await request(app).delete(`/tasks/${id}`).expect(204);
    expect((await request(app).delete(`/tasks/${id}`)).status).toBe(404);
  });

  test('assigns a task and preserves fields', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Assign me', priority: 'high' });
    const id = created.body.id;
    const assigned = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: '  Priya  ' }).expect(200);
    expect(assigned.body).toMatchObject({ id, title: 'Assign me', priority: 'high', assignee: 'Priya' });
    expect((await request(app).patch(`/tasks/${id}/assign`).send({ assignee: '' })).status).toBe(400);
    expect((await request(app).patch(`/tasks/${id}/assign`).send({})).status).toBe(400);
    expect((await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 42 })).status).toBe(400);
    expect((await request(app).patch('/tasks/missing/assign').send({ assignee: 'Alex' })).status).toBe(404);
    expect((await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 'Alex' })).body.assignee).toBe('Alex');
  });
});

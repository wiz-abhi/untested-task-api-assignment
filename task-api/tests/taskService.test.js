const service = require('../src/services/taskService');

beforeEach(() => service._reset());

describe('taskService', () => {
  test('creates tasks with defaults and finds them', () => {
    const task = service.create({ title: 'Write tests' });
    expect(task).toMatchObject({ title: 'Write tests', description: '', status: 'todo', priority: 'medium', dueDate: null, completedAt: null });
    expect(task.id).toEqual(expect.any(String));
    expect(task.createdAt).toEqual(expect.any(String));
    expect(service.getAll()).toEqual([task]);
    expect(service.findById(task.id)).toEqual(task);
    expect(service.findById('missing')).toBeUndefined();
  });

  test('filters by exact status and paginates from the first page', () => {
    service.create({ title: 'One', status: 'todo' });
    service.create({ title: 'Two', status: 'in_progress' });
    service.create({ title: 'Three', status: 'todo' });
    expect(service.getByStatus('todo').map((task) => task.title)).toEqual(['One', 'Three']);
    expect(service.getPaginated(1, 2).map((task) => task.title)).toEqual(['One', 'Two']);
    expect(service.getPaginated(2, 2).map((task) => task.title)).toEqual(['Three']);
  });

  test('updates and removes tasks, returning null/false for missing IDs', () => {
    const task = service.create({ title: 'Old' });
    expect(service.update(task.id, { title: 'New' })).toMatchObject({ id: task.id, title: 'New' });
    expect(service.update('missing', { title: 'Nope' })).toBeNull();
    expect(service.remove(task.id)).toBe(true);
    expect(service.remove(task.id)).toBe(false);
  });

  test('completes and assigns tasks', () => {
    const task = service.create({ title: 'Ship', priority: 'high' });
    const completed = service.completeTask(task.id);
    expect(completed).toMatchObject({ status: 'done', priority: 'medium' });
    expect(completed.completedAt).toEqual(expect.any(String));
    expect(service.assignTask(task.id, '  Alex  ')).toMatchObject({ assignee: '  Alex  ' });
    expect(service.completeTask('missing')).toBeNull();
    expect(service.assignTask('missing', 'Alex')).toBeNull();
  });

  test('calculates status and overdue statistics', () => {
    service.create({ title: 'Todo overdue', dueDate: '2000-01-01T00:00:00.000Z' });
    service.create({ title: 'Progress', status: 'in_progress' });
    service.create({ title: 'Done', status: 'done', dueDate: '2000-01-01T00:00:00.000Z' });
    expect(service.getStats()).toEqual({ todo: 1, in_progress: 1, done: 1, overdue: 1 });
  });
});

import { getTodos, createTodo, updateTodo, deleteTodo } from '../index';

const mockJson = jest.fn();
const mockFetch = jest.fn();

global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  mockJson.mockReset();
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({ json: mockJson });
});

describe('getTodos', () => {
  it('calls fetch with /api/todos and returns parsed JSON', async () => {
    const data = { data: [{ id: '1', title: 'Buy milk', status: 'PENDING' }] };
    mockJson.mockResolvedValue(data);

    const result = await getTodos();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/todos');
    expect(result).toEqual(data);
  });
});

describe('createTodo', () => {
  it('calls fetch POST /api/todos with title and returns parsed JSON', async () => {
    const data = { data: { id: '2', title: 'Buy milk', status: 'PENDING' } };
    mockJson.mockResolvedValue(data);

    const result = await createTodo('Buy milk');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Buy milk' }),
    });
    expect(result).toEqual(data);
  });
});

describe('updateTodo', () => {
  it('calls fetch PATCH /api/todos/:id with data and returns parsed JSON', async () => {
    const data = { data: { id: 'abc', title: 'Buy milk', status: 'COMPLETE' } };
    mockJson.mockResolvedValue(data);

    const result = await updateTodo('abc', { status: 'COMPLETE' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/todos/abc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETE' }),
    });
    expect(result).toEqual(data);
  });

  it('can update just the title', async () => {
    const data = { data: { id: 'abc', title: 'Updated title', status: 'PENDING' } };
    mockJson.mockResolvedValue(data);

    await updateTodo('abc', { title: 'Updated title' });

    expect(mockFetch).toHaveBeenCalledWith('/api/todos/abc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated title' }),
    });
  });
});

describe('deleteTodo', () => {
  it('calls fetch DELETE /api/todos/:id and returns parsed JSON', async () => {
    const data = { data: { id: 'abc', title: 'Buy milk', status: 'PENDING' } };
    mockJson.mockResolvedValue(data);

    const result = await deleteTodo('abc');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/todos/abc', { method: 'DELETE' });
    expect(result).toEqual(data);
  });
});

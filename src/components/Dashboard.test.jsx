// Dashboard.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Dashboard from './Dashboard';
import axios from 'axios';

// Mock modules
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('axios');

// Mock Firebase modules
vi.mock('../firebase', () => {
  return {
    auth: {
      currentUser: {
        uid: 'test-user-id'
      },
      signOut: vi.fn().mockResolvedValue()
    },
    db: {
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({
            username: 'TestUser',
            level: 1,
            xpTotal: 0,
            xpRequired: 20,
            stats: {
              tasksCompleted: 0,
              totalDamage: 0,
              streak: 0
            }
          })
        })
      }),
      collection: vi.fn().mockReturnThis(),
      getDoc: vi.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({
          username: 'TestUser',
          level: 1,
          xpTotal: 0,
          xpRequired: 20,
          stats: {
            tasksCompleted: 0,
            totalDamage: 0,
            streak: 0
          }
        })
      }),
      updateDoc: vi.fn().mockResolvedValue()
    }
  };
});

// Mock environment variables
vi.stubEnv('VITE_OPENAI_API_KEY', 'test-api-key');

// Define global mocks
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn()
};

// Mock tasks data
const mockTasks = [
  { id: 1, user_id: 'test-user-id', day: 'Monday', text: 'Test Task 1', done: false },
  { id: 2, user_id: 'test-user-id', day: 'Monday', text: 'Test Task 2', done: true },
  { id: 3, user_id: 'test-user-id', day: 'Tuesday', text: 'Test Task 3', done: false }
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Mock axios responses
    axios.get.mockResolvedValue({ data: mockTasks });
    axios.post.mockResolvedValue({ 
      data: { id: 4, user_id: 'test-user-id', day: 'Monday', text: 'New Task', done: false } 
    });
    axios.patch.mockResolvedValue({ 
      data: { id: 1, user_id: 'test-user-id', day: 'Monday', text: 'Test Task 1', done: true } 
    });
    axios.delete.mockResolvedValue({ data: { message: 'Task deleted' } });

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText('Loading...')).toBeDefined();
  });

  it('fetches user data', async () => {
    render(<Dashboard />);
    
    // This may be sufficient to just check if the component renders without errors
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});
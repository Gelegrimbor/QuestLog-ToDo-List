// Dashboard.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Dashboard from './Dashboard';
import axios from 'axios';
import { auth } from '../firebase';

// Mock the necessary modules
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('axios');

vi.mock('../firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-id'
    }
  },
  db: {
    doc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn()
  }
}));

// Mock data
const mockUserData = {
  username: 'TestUser',
  level: 1,
  xpTotal: 0,
  xpRequired: 20,
  stats: {
    tasksCompleted: 0,
    totalDamage: 0,
    streak: 0
  }
};

const mockTasks = [
  { id: 1, user_id: 'test-user-id', day: 'Monday', text: 'Task 1', done: false },
  { id: 2, user_id: 'test-user-id', day: 'Monday', text: 'Task 2', done: true },
  { id: 3, user_id: 'test-user-id', day: 'Tuesday', text: 'Task 3', done: false }
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Mock implementation for Firebase auth and Firestore
    vi.spyOn(auth, 'currentUser', 'get').mockReturnValue({ uid: 'test-user-id' });
    
    // Mock Firestore getDoc response
    const mockGetDoc = vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => mockUserData
    });
    
    vi.mock('../firebase', () => ({
      auth: {
        currentUser: { uid: 'test-user-id' },
        signOut: vi.fn().mockResolvedValue()
      },
      db: {
        doc: vi.fn().mockReturnValue({
          get: mockGetDoc
        }),
        getDoc: mockGetDoc,
        updateDoc: vi.fn().mockResolvedValue()
      }
    }));
    
    // Mock axios responses
    axios.get.mockResolvedValue({ data: mockTasks });
    axios.post.mockResolvedValue({ 
      data: { id: 4, user_id: 'test-user-id', day: 'Monday', text: 'New Task', done: false } 
    });
    axios.delete.mockResolvedValue({ data: { message: 'Task deleted' } });
    axios.patch.mockResolvedValue({ 
      data: { id: 1, user_id: 'test-user-id', day: 'Monday', text: 'Task 1', done: true } 
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('fetches tasks from API on load', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/tasks/test-user-id'));
    });
  });

  test('adds a new task', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a new quest...')).toBeInTheDocument();
    });
    
    // Type in the input and click Add
    fireEvent.change(screen.getByPlaceholderText('Add a new quest...'), {
      target: { value: 'New Task' }
    });
    
    fireEvent.click(screen.getByText('Add'));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        {
          userId: 'test-user-id',
          day: 'Monday',
          text: 'New Task'
        }
      );
    });
  });

  test('completes a task', async () => {
    render(<Dashboard />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    // Complete the first task
    const completeButtons = screen.getAllByText('✓');
    fireEvent.click(completeButtons[0]);
    
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/toggle')
      );
    });
  });

  test('deletes a task', async () => {
    render(<Dashboard />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    // Delete the first task
    const deleteButtons = screen.getAllByText('✕');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1')
      );
    });
  });

  test('changes selected day', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeInTheDocument();
    });
    
    // Change to Tuesday
    fireEvent.click(screen.getByText('Tuesday'));
    
    expect(screen.getByText("Tuesday's Quests")).toBeInTheDocument();
  });

  test('logs out user', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Logout'));
    
    await waitFor(() => {
      expect(auth.signOut).toHaveBeenCalled();
    });
  });
});
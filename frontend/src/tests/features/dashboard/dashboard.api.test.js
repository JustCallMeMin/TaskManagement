// Import directly from the mock file
import mockAxios from '../../mocks/axios';

// Mock the axios module
jest.mock('axios', () => mockAxios);

// Import the dashboard API
import { getDashboardStats } from '../../../features/dashboard/api/dashboard.api';

// Mock localStorage methods instead of replacing the entire object
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

describe('Dashboard API', () => {
  // Save original methods to restore later
  const originalGetItem = window.localStorage.getItem;
  const originalSetItem = window.localStorage.setItem;
  const originalRemoveItem = window.localStorage.removeItem;
  const originalClear = window.localStorage.clear;
  
  beforeEach(() => {
    // Setup mock localStorage methods
    window.localStorage.getItem = mockLocalStorage.getItem;
    window.localStorage.setItem = mockLocalStorage.setItem;
    window.localStorage.removeItem = mockLocalStorage.removeItem;
    window.localStorage.clear = mockLocalStorage.clear;
    
    // Clear mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore original localStorage methods
    window.localStorage.getItem = originalGetItem;
    window.localStorage.setItem = originalSetItem;
    window.localStorage.removeItem = originalRemoveItem;
    window.localStorage.clear = originalClear;
  });

  const mockToken = 'mock-jwt-token';
  const mockResponse = {
    data: {
      stats: {
        tasksCompleted: 10,
        newTasks: 5,
        projectsDone: 3
      },
      monthlyStats: [
        { month: 1, count: 5 },
        { month: 2, count: 8 },
        { month: 3, count: 10 }
      ],
      recentTasks: [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' }
      ]
    }
  };

  test('gets dashboard stats successfully with auth token', async () => {
    // Setup mocks
    window.localStorage.getItem.mockReturnValue(mockToken);
    mockAxios.get.mockResolvedValue(mockResponse);
    
    // Call the function
    const result = await getDashboardStats();
    
    // Check localStorage was queried for the token
    expect(window.localStorage.getItem).toHaveBeenCalledWith('token');
    
    // Check axios was called correctly
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard/stats'),
      {
        headers: { Authorization: `Bearer ${mockToken}` },
        params: { period: 'month' }
      }
    );
    
    // Check the result is from the response
    expect(result).toEqual(mockResponse.data);
  });

  test('passes period parameter correctly', async () => {
    // Setup mocks
    window.localStorage.getItem.mockReturnValue(mockToken);
    mockAxios.get.mockResolvedValue(mockResponse);
    
    // Call the function with period=year
    await getDashboardStats('year');
    
    // Check axios was called with period=year
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: { period: 'year' }
      })
    );
  });

  test('throws error when no auth token is found', async () => {
    // Setup mocks to return null token
    window.localStorage.getItem.mockReturnValue(null);
    
    // Call the function and expect it to throw
    await expect(getDashboardStats()).rejects.toThrow('No authentication token found');
    
    // Check localStorage.removeItem was called
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    
    // Axios should not be called
    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  test('handles 401/403 response correctly', async () => {
    // Setup mocks
    window.localStorage.getItem.mockReturnValue(mockToken);
    mockAxios.get.mockRejectedValue({
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    });
    
    // Call the function and expect it to throw
    await expect(getDashboardStats()).rejects.toThrow('Your session has expired. Please login again.');
    
    // Check localStorage.removeItem was called
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  test('handles no server response correctly', async () => {
    // Setup mocks
    window.localStorage.getItem.mockReturnValue(mockToken);
    
    // Mock a network error with request property but no response
    const networkError = new Error('Network Error');
    networkError.request = {}; // This simulates that the request was made
    mockAxios.get.mockRejectedValue(networkError);
    
    // Call the function and expect it to throw with the correct message
    await expect(getDashboardStats()).rejects.toThrow('No response from server. Please check your connection.');
  });

  test('handles server error with message correctly', async () => {
    // Setup mocks
    window.localStorage.getItem.mockReturnValue(mockToken);
    mockAxios.get.mockRejectedValue({
      response: {
        status: 500,
        data: { message: 'Internal Server Error' }
      }
    });
    
    // Call the function and expect it to throw with the correct message
    await expect(getDashboardStats()).rejects.toThrow('Internal Server Error');
  });
}); 
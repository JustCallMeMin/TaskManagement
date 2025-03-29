import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../../features/dashboard/components/Dashboard';

// Mock the dashboard API
jest.mock('../../../features/dashboard/api/dashboard.api', () => ({
  getDashboardStats: jest.fn()
}));

// Import the mocked getDashboardStats function
import { getDashboardStats } from '../../../features/dashboard/api/dashboard.api';

// Mock the Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart" />
}));

describe('Dashboard Component', () => {
  const mockDashboardData = {
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
      { 
        id: 1, 
        title: 'Task 1', 
        status: 'completed',
        priority: 'high',
        dueDate: '2024-03-15' 
      },
      { 
        id: 2, 
        title: 'Task 2', 
        status: 'in_progress',
        priority: 'medium',
        dueDate: '2024-03-20' 
      }
    ]
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    // Setup the mock to resolve after a delay
    getDashboardStats.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockDashboardData), 100);
      });
    });

    // Render with act to handle async updates
    await act(async () => {
      render(<Dashboard />);
    });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders dashboard with data after loading', async () => {
    // Setup the mock
    getDashboardStats.mockResolvedValue(mockDashboardData);
    
    // Render with act
    await act(async () => {
      render(<Dashboard />);
    });
    
    // Wait for the loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if stats cards are rendered with correct values
    expect(screen.getByText('10')).toBeInTheDocument(); // Tasks completed
    expect(screen.getByText('5')).toBeInTheDocument(); // New tasks
    expect(screen.getByText('3')).toBeInTheDocument(); // Projects done
    
    // Check if the task chart is present
    expect(screen.getByText('Task Completion Trend')).toBeInTheDocument();
    
    // Check if task list is present with tasks
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Setup the mock to reject
    getDashboardStats.mockRejectedValue(new Error('Failed to load data'));
    
    // Render with act
    await act(async () => {
      render(<Dashboard />);
    });
    
    // Wait for the loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if error alert is displayed
    expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
  });

  test('displays no data message when no task data is available', async () => {
    // Setup the mock with empty data
    getDashboardStats.mockResolvedValue({
      stats: { tasksCompleted: 0, newTasks: 0, projectsDone: 0 },
      monthlyStats: [],
      recentTasks: []
    });
    
    // Render with act
    await act(async () => {
      render(<Dashboard />);
    });
    
    // Wait for the loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if no data alert is displayed
    expect(screen.getByText(/No tasks data available/i)).toBeInTheDocument();
  });

  test('refreshes data when refresh button is clicked', async () => {
    // Setup the mock
    getDashboardStats.mockResolvedValue(mockDashboardData);
    
    // Render with act
    await act(async () => {
      render(<Dashboard />);
    });
    
    // Wait for the loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click the refresh button
    await act(async () => {
      fireEvent.click(screen.getByText('Refresh'));
    });
    
    // Check if getDashboardStats was called again
    expect(getDashboardStats).toHaveBeenCalledTimes(2);
  });

  test('changes period when period is changed in TaskChart', async () => {
    // Setup the mock
    getDashboardStats.mockResolvedValue(mockDashboardData);
    
    // Render with act
    await act(async () => {
      render(<Dashboard />);
    });
    
    // Wait for the loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on the Year toggle button
    await act(async () => {
      fireEvent.click(screen.getByText('Year'));
    });
    
    // Check if getDashboardStats was called with 'year'
    expect(getDashboardStats).toHaveBeenCalledWith('year');
  });
}); 
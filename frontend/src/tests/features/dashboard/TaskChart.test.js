import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskChart from '../../../features/dashboard/components/TaskChart';

// Mock the Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart" />
}));

describe('TaskChart Component', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [5, 8, 10],
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const mockOnPeriodChange = jest.fn();

  test('renders chart with provided data', () => {
    render(<TaskChart data={mockData} onPeriodChange={mockOnPeriodChange} currentPeriod="month" />);
    
    // Check if the title is rendered
    expect(screen.getByText('Task Completion Trend')).toBeInTheDocument();
    
    // Check if the chart is rendered (via our test id on the mock)
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    
    // Check if the period toggle buttons are rendered
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
  });

  test('calls onPeriodChange when a different period is selected', () => {
    render(<TaskChart data={mockData} onPeriodChange={mockOnPeriodChange} currentPeriod="month" />);
    
    // Click the Week button
    fireEvent.click(screen.getByText('Week'));
    
    // Check if onPeriodChange was called with 'week'
    expect(mockOnPeriodChange).toHaveBeenCalledWith('week');
    
    // Click the Year button
    fireEvent.click(screen.getByText('Year'));
    
    // Check if onPeriodChange was called with 'year'
    expect(mockOnPeriodChange).toHaveBeenCalledWith('year');
  });

  test('renders with default data when no data is provided', () => {
    render(<TaskChart onPeriodChange={mockOnPeriodChange} currentPeriod="month" />);
    
    // Check if the title is rendered
    expect(screen.getByText('Task Completion Trend')).toBeInTheDocument();
    
    // Check if the chart is rendered (via our test id on the mock)
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
  });

  test('handles noData state correctly', () => {
    render(<TaskChart noData={true} onPeriodChange={mockOnPeriodChange} currentPeriod="month" />);
    
    // Check if the no data message is displayed
    expect(screen.getByText('No task data available for this period')).toBeInTheDocument();
    expect(screen.getByText('Complete some tasks to see your statistics')).toBeInTheDocument();
    
    // The chart should not be rendered
    expect(screen.queryByTestId('mock-line-chart')).not.toBeInTheDocument();
  });

  test('highlights the current period button', () => {
    const { rerender } = render(<TaskChart data={mockData} onPeriodChange={mockOnPeriodChange} currentPeriod="month" />);
    
    // Get all toggle buttons
    const buttons = screen.getAllByRole('button');
    
    // Find the Month button (should be the middle button)
    const monthButton = buttons.find(button => button.textContent === 'Month');
    
    // Check if the Month button has the selected styling
    expect(monthButton).toHaveAttribute('aria-pressed', 'true');
    
    // Rerender with a different period
    rerender(<TaskChart data={mockData} onPeriodChange={mockOnPeriodChange} currentPeriod="week" />);
    
    // Get all toggle buttons again
    const updatedButtons = screen.getAllByRole('button');
    
    // Find the Week button
    const weekButton = updatedButtons.find(button => button.textContent === 'Week');
    
    // Check if the Week button has the selected styling
    expect(weekButton).toHaveAttribute('aria-pressed', 'true');
  });
}); 
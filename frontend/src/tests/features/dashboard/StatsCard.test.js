import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatsCard from '../../../features/dashboard/components/StatsCard';
import { CheckCircle as TaskIcon } from '@mui/icons-material';

// Mock the Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart" />
}));

describe('StatsCard Component', () => {
  const mockProps = {
    icon: <TaskIcon data-testid="task-icon" />,
    title: 'Task Completed',
    value: 10,
    trend: 15,
    trendLabel: 'from last week',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [
        {
          data: [5, 8, 10],
          borderColor: '#1a73e8',
          backgroundColor: 'rgba(26, 115, 232, 0.1)',
        },
      ],
    }
  };

  test('renders with provided props', async () => {
    await act(async () => {
      render(<StatsCard {...mockProps} />);
    });
    
    // Check if the title is rendered
    expect(screen.getByText('Task Completed')).toBeInTheDocument();
    
    // Check if the value is rendered
    expect(screen.getByText('10')).toBeInTheDocument();
    
    // Check if the icon is rendered
    expect(screen.getByTestId('task-icon')).toBeInTheDocument();
    
    // Check if the trend is rendered
    expect(screen.getByText('+15% from last week')).toBeInTheDocument();
  });

  test('renders positive trend with + sign', async () => {
    await act(async () => {
      render(<StatsCard {...mockProps} trend={20} />);
    });
    
    // Check if the trend has a + sign
    expect(screen.getByText('+20% from last week')).toBeInTheDocument();
  });

  test('renders negative trend without + sign', async () => {
    await act(async () => {
      render(<StatsCard {...mockProps} trend={-10} />);
    });
    
    // Check if the trend doesn't have a + sign
    expect(screen.getByText('-10% from last week')).toBeInTheDocument();
  });

  test('renders with default chart data when none is provided', async () => {
    const { chartData, ...propsWithoutChart } = mockProps;
    await act(async () => {
      render(<StatsCard {...propsWithoutChart} />);
    });
    
    // The component should still render with default chart data
    expect(screen.getByText('Task Completed')).toBeInTheDocument();
  });

  test('renders trend with the correct color based on value', async () => {
    let trendElement;
    
    await act(async () => {
      const { rerender } = render(<StatsCard {...mockProps} trend={15} />);
      
      // Get the trend element
      trendElement = screen.getByText('+15% from last week');
      
      // With positive trend, should have success color
      expect(trendElement.className).toContain('success');
      
      // Rerender with negative trend
      await act(async () => {
        rerender(<StatsCard {...mockProps} trend={-15} />);
      });
    });
    
    // Get the updated trend element
    const negativeElement = screen.getByText('-15% from last week');
    
    // With negative trend, should have error color
    expect(negativeElement.className).toContain('error');
  });
}); 
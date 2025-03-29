import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskChart from '../../features/dashboard/components/TaskChart';
import StatsCard from '../../features/dashboard/components/StatsCard';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">Mocked Chart</div>
}));

// Mock data
const mockChartData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      data: [10, 20, 30],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }
  ]
};

// Mock empty data
const mockEmptyData = {
  labels: [],
  datasets: [
    {
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }
  ]
};

// Mock null data - kiểm tra trường hợp lỗi
const mockNullData = null;

describe('Chart Components Rendering', () => {
  
  describe('TaskChart Component', () => {
    test('Renders correctly with valid data', () => {
      render(<TaskChart data={mockChartData} currentPeriod="month" />);
      
      // Kiểm tra title được hiển thị
      expect(screen.getByText('Task Completion Trend')).toBeInTheDocument();
      
      // Kiểm tra chart được render
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
      
      // Kiểm tra các nút thời gian
      expect(screen.getByText('Week')).toBeInTheDocument();
      expect(screen.getByText('Month')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
    });
    
    test('Renders no-data message when noData is true', () => {
      render(<TaskChart data={mockChartData} noData={true} />);
      
      // Kiểm tra thông báo không có dữ liệu
      expect(screen.getByText('No task data available for this period')).toBeInTheDocument();
      expect(screen.getByText('Complete some tasks to see your statistics')).toBeInTheDocument();
      
      // Kiểm tra chart không được render
      expect(screen.queryByTestId('mock-chart')).not.toBeInTheDocument();
    });
    
    test('Renders safely with null data', () => {
      render(<TaskChart data={mockNullData} />);
      
      // Kiểm tra không crash và vẫn hiển thị chart
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });
  
  describe('StatsCard Component', () => {
    test('Renders correctly with valid data', () => {
      render(
        <StatsCard 
          icon={<div>Icon</div>}
          title="Test Card"
          value={100}
          trend={15}
          trendLabel="from last month"
          chartData={mockChartData}
        />
      );
      
      // Kiểm tra nội dung card
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('+15% from last month')).toBeInTheDocument();
      
      // Kiểm tra chart được render
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
    
    test('Renders negative trend correctly', () => {
      render(
        <StatsCard 
          icon={<div>Icon</div>}
          title="Test Card"
          value={100}
          trend={-15}
          trendLabel="from last month"
          chartData={mockChartData}
        />
      );
      
      // Kiểm tra trend âm hiển thị đúng
      expect(screen.getByText('-15% from last month')).toBeInTheDocument();
    });
    
    test('Renders safely with null data', () => {
      render(
        <StatsCard 
          icon={<div>Icon</div>}
          title="Test Card"
          value={100}
          trend={15}
          trendLabel="from last month"
          chartData={mockNullData}
        />
      );
      
      // Kiểm tra không crash và vẫn hiển thị chart
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });
}); 
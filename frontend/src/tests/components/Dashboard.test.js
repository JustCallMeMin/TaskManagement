import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../features/dashboard/components/Dashboard';
import { getDashboardStats } from '../../features/dashboard/api/dashboard.api';

// Mock các module phụ thuộc
jest.mock('../../features/dashboard/api/dashboard.api');
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">Chart Component</div>
}));

// Mock dữ liệu trả về từ API
const mockDashboardData = {
  stats: {
    tasksCompleted: 5,
    newTasks: 10,
    projectsDone: 2
  },
  monthlyStats: [
    { month: 1, count: 5 },
    { month: 2, count: 8 },
    { month: 3, count: 12 }
  ],
  recentTasks: [
    { id: '1', title: 'Task 1', status: 'Done', dueDate: new Date() },
    { id: '2', title: 'Task 2', status: 'In Progress', dueDate: new Date() }
  ]
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    getDashboardStats.mockClear();
  });

  test('Hiển thị loading state khi đang tải dữ liệu', async () => {
    // Mock API đang tải (chưa trả về kết quả)
    getDashboardStats.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockDashboardData), 100);
    }));

    // Render component
    render(<Dashboard />);
    
    // Kiểm tra loading được hiển thị
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('Hiển thị dữ liệu khi tải thành công', async () => {
    // Mock API trả về dữ liệu thành công
    getDashboardStats.mockResolvedValue(mockDashboardData);

    // Render component trong khối act để xử lý các side effects
    await act(async () => {
      render(<Dashboard />);
    });
    
    // Kiểm tra số liệu thống kê được hiển thị
    expect(screen.getByText('Task Completed')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // tasksCompleted
    expect(screen.getByText('10')).toBeInTheDocument(); // newTasks
    expect(screen.getByText('2')).toBeInTheDocument(); // projectsDone
  });

  test('Hiển thị thông báo khi không có dữ liệu', async () => {
    // Mock API trả về dữ liệu rỗng
    getDashboardStats.mockResolvedValue({
      stats: { tasksCompleted: 0, newTasks: 0, projectsDone: 0 },
      monthlyStats: []
    });

    // Render component
    await act(async () => {
      render(<Dashboard />);
    });
    
    // Kiểm tra thông báo không có dữ liệu
    expect(screen.getByText('No tasks data available. Create some tasks to see your stats!')).toBeInTheDocument();
  });

  test('Hiển thị thông báo lỗi khi API gặp vấn đề', async () => {
    // Mock API trả về lỗi
    getDashboardStats.mockRejectedValue(new Error('Failed to fetch data'));

    // Render component
    await act(async () => {
      render(<Dashboard />);
    });
    
    // Kiểm tra thông báo lỗi
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  test('Gọi API với period khác khi thay đổi thời gian', async () => {
    // Mock API trả về dữ liệu thành công
    getDashboardStats.mockResolvedValue(mockDashboardData);

    // Render component
    await act(async () => {
      render(<Dashboard />);
    });
    
    // Ban đầu gọi với period mặc định (month)
    expect(getDashboardStats).toHaveBeenCalledWith('month');
    
    // Giả lập click vào nút chuyển đổi thời gian
    const refreshButton = screen.getByText('Refresh');
    await act(async () => {
      refreshButton.click();
    });
    
    // Kiểm tra API được gọi lại
    expect(getDashboardStats).toHaveBeenCalledTimes(2);
  });
}); 
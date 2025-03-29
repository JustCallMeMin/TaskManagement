import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Default chart configurations for dashboard charts
 */

// Default chart data for empty states
export const defaultChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Tasks Completed',
      data: [0, 0, 0, 0, 0, 0],
      fill: true,
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.2)',
      tension: 0.4,
      borderWidth: 2,
    },
  ],
};

// Configuration for mini charts in stats cards
export const miniChartData = {
  labels: ['', '', '', '', '', ''],
  datasets: [
    {
      data: [5, 10, 15, 20, 25, 30],
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.2)',
      tension: 0,
      borderWidth: 2,
      pointRadius: 0,
    }
  ]
};

// Chart colors for different charts
export const chartColors = {
  primary: {
    main: '#1976d2',
    light: 'rgba(25, 118, 210, 0.2)',
  },
  info: {
    main: '#49a3f1',
    light: 'rgba(73, 163, 241, 0.2)',
  },
  success: {
    main: '#4caf50',
    light: 'rgba(76, 175, 80, 0.2)',
  },
  warning: {
    main: '#fb8c00',
    light: 'rgba(251, 140, 0, 0.2)',
  },
  error: {
    main: '#f44335',
    light: 'rgba(244, 67, 53, 0.2)',
  },
};

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
      beginAtZero: true,
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 0,
    },
    line: {
      tension: 0.4,
      borderWidth: 2,
    },
  },
  animation: false,
}; 
import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import {
  CheckCircle as TaskIcon,
  AddCircle as NewTaskIcon,
  DoneAll as ProjectIcon,
} from '@mui/icons-material';
import MainLayout from '../../../layouts/MainLayout';
import StatsCard from '../components/StatsCard';
import TaskChart from '../components/TaskChart';
import TaskList from '../components/TaskList';
import Schedule from '../components/Schedule';
import Messages from '../components/Messages';
import { getDashboardStats } from '../api/dashboard.api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
        
        // Process monthly stats for chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = {
          labels: data.monthlyStats.map(stat => months[stat.month - 1]),
          datasets: [
            {
              label: 'Tasks Completed',
              data: data.monthlyStats.map(stat => stat.count),
              fill: true,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        };
        setChartData(chartData);
        setTasks(data.recentTasks);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handlePeriodChange = (period) => {
    // Handle period change for chart
    console.log('Period changed:', period);
  };

  if (!stats || !chartData) {
    return (
      <MainLayout>
        <Box p={3}>Loading...</Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box p={3}>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <StatsCard
              icon={<TaskIcon color="primary" />}
              title="Task Completed"
              value={stats.tasksCompleted}
              trend={10}
              trendLabel="from last week"
              chartData={{
                labels: ['1', '2', '3', '4', '5'],
                datasets: [{
                  data: [65, 75, 70, 80, 75],
                  borderColor: '#1a73e8',
                  backgroundColor: 'rgba(26, 115, 232, 0.1)',
                  fill: true,
                }]
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatsCard
              icon={<NewTaskIcon color="info" />}
              title="New Task"
              value={stats.newTasks}
              trend={10}
              trendLabel="from last week"
              chartData={{
                labels: ['1', '2', '3', '4', '5'],
                datasets: [{
                  data: [40, 45, 50, 55, 60],
                  borderColor: '#00b0ff',
                  backgroundColor: 'rgba(0, 176, 255, 0.1)',
                  fill: true,
                }]
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatsCard
              icon={<ProjectIcon color="success" />}
              title="Project Done"
              value={stats.projectsDone}
              trend={8}
              trendLabel="from last week"
              chartData={{
                labels: ['1', '2', '3', '4', '5'],
                datasets: [{
                  data: [30, 35, 40, 45, 50],
                  borderColor: '#00c853',
                  backgroundColor: 'rgba(0, 200, 83, 0.1)',
                  fill: true,
                }]
              }}
            />
          </Grid>

          {/* Main Content Grid */}
          <Grid item xs={12} lg={8}>
            {/* Task Chart */}
            <Grid item xs={12} mb={3}>
              <TaskChart data={chartData} onPeriodChange={handlePeriodChange} />
            </Grid>

            {/* Task List */}
            <Grid item xs={12}>
              <TaskList tasks={tasks} />
            </Grid>
          </Grid>

          {/* Right Sidebar Grid */}
          <Grid item xs={12} lg={4}>
            {/* Schedule Component */}
            <Grid item xs={12} mb={3}>
              <Schedule />
            </Grid>

            {/* Messages Component */}
            <Grid item xs={12}>
              <Messages />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage; 
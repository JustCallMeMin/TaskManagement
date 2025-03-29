import React, { useState, useEffect } from "react";
import { 
  Grid, 
  Alert, 
  CircularProgress 
} from "@mui/material";
import MDBox from "../components/MDBox";
import DashboardLayout from "../components/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../components/Navbars/DashboardNavbar";
import Footer from "../layouts/MainLayout/Footer";
import StatsCard from "../features/dashboard/components/StatsCard";
import { fetchDashboardData } from "../features/dashboard/api/dashboard.api";
import ProjectsTable from "../features/dashboard/components/ProjectsTable";
import ReportsBarChart from "../components/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "../components/Charts/LineCharts/ReportsLineChart";
import PieChart from "../components/Charts/PieChart";

function createWeeklyTasksData(weeklyTasks) {
  return {
    labels: weeklyTasks.map(item => item.day),
    datasets: {
      label: "Tasks",
      data: weeklyTasks.map(item => item.count)
    }
  };
}

function createMonthlyProjectsData(monthlyProjects) {
  return {
    labels: monthlyProjects.map(item => item.month),
    datasets: {
      label: "Projects",
      data: monthlyProjects.map(item => item.count)
    }
  };
}

function createTaskStatusData(tasks) {
  // Example: Transform total tasks into pie chart data
  // In a real app, you would have actual status distribution data
  if (!tasks.total) return [];
  
  // Create some mock data distribution based on total tasks
  return [
    { label: "Completed", value: Math.floor(tasks.completed || 0) },
    { label: "In Progress", value: Math.floor((tasks.total - tasks.completed) * 0.7) },
    { label: "Not Started", value: Math.floor((tasks.total - tasks.completed) * 0.3) }
  ];
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {loading ? (
          <MDBox display="flex" justifyContent="center">
            <CircularProgress />
          </MDBox>
        ) : error ? (
          <MDBox mt={5} mb={5}>
            <Grid container justifyContent="center">
              <Grid item xs={12} md={6}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            </Grid>
          </MDBox>
        ) : (
          <>
            <MDBox mb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                  <StatsCard
                    title="Tasks"
                    count={dashboardData?.tasks?.total || 0}
                    percentage={{
                      color: dashboardData?.tasks?.growth >= 0 ? "success" : "error",
                      value: `${dashboardData?.tasks?.growth || 0}%`,
                      label: "than last week"
                    }}
                    icon={{ color: "info", component: "task" }}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <StatsCard
                    title="New Projects"
                    count={dashboardData?.projects?.new || 0}
                    percentage={{
                      color: dashboardData?.projects?.newGrowth >= 0 ? "success" : "error",
                      value: `${dashboardData?.projects?.newGrowth || 0}%`,
                      label: "than last month"
                    }}
                    icon={{ color: "info", component: "leaderboard" }}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <StatsCard
                    title="Completed Tasks"
                    count={dashboardData?.tasks?.completed || 0}
                    percentage={{
                      color: dashboardData?.tasks?.completedGrowth >= 0 ? "success" : "error",
                      value: `${dashboardData?.tasks?.completedGrowth || 0}%`,
                      label: "than yesterday"
                    }}
                    icon={{ color: "info", component: "done_all" }}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <StatsCard
                    title="Active Projects"
                    count={dashboardData?.projects?.active || 0}
                    percentage={{
                      color: dashboardData?.projects?.activeGrowth >= 0 ? "success" : "error",
                      value: `${dashboardData?.projects?.activeGrowth || 0}%`,
                      label: "than yesterday"
                    }}
                    icon={{ color: "info", component: "category" }}
                  />
                </Grid>
              </Grid>
            </MDBox>

            <MDBox mb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox mb={3}>
                    <PieChart
                      title="Task Status Distribution"
                      description="Current status of all tasks"
                      date="last updated today"
                      data={createTaskStatusData(dashboardData?.tasks || {})}
                      colors={["#66BB6A", "#49a3f1", "#FFA726"]}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={8}>
                  <MDBox mb={3}>
                    <ReportsLineChart
                      color="info"
                      title="Weekly Tasks"
                      description="Number of tasks per day this week"
                      date="last updated today"
                      chart={createWeeklyTasksData(dashboardData?.weeklyTasks || [])}
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>

            <MDBox mb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12} lg={8}>
                  <MDBox mb={3}>
                    <ProjectsTable title="Recent Projects" projects={dashboardData?.recentProjects || []} />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={12} lg={4}>
                  <MDBox mb={3}>
                    <ReportsBarChart
                      color="info"
                      title="Monthly Projects"
                      description="Number of projects per month"
                      date="last updated today"
                      chart={createMonthlyProjectsData(dashboardData?.monthlyProjects || [])}
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard; 
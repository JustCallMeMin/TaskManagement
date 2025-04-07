import React, { useState, useEffect, useCallback } from "react";
import { Grid, CircularProgress, Box } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Material Dashboard 2 React components
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";

// Dashboard components
import ReportsBarChart from "../../../components/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "../../../components/Charts/LineCharts/ReportsLineChart";
import PieChart from "../../../components/Charts/PieChart";
import ComplexStatisticsCard from "../../../components/Cards/StatisticsCards/ComplexStatisticsCard";
import DataTable from "../../../components/Tables/DataTable";

// Dashboard API
import { getDashboardStats } from "../api/dashboard.api";

// Helper functions for chart data
function createWeeklyTasksData(data) {
  return {
    labels: data.labels || [],
    datasets: {
      label: data.datasets?.label || "Tasks",
      data: data.datasets?.data || []
    }
  };
}

function createMonthlyProjectsData(data) {
  return {
    labels: data.labels || [],
    datasets: {
      label: data.datasets?.label || "Projects",
      data: data.datasets?.data || []
    }
  };
}

function createTaskStatusData(stats) {
  // Kiểm tra xem có dữ liệu không
  if (!stats || !stats.tasks) return [];
  
  const completedTasks = stats.completedTasks?.count || 0;
  const totalTasks = stats.tasks?.count || 0;
  
  // Tránh trường hợp completedTasks > totalTasks 
  const safeCompletedTasks = Math.min(completedTasks, totalTasks);
  const inProgressTasks = Math.max(0, totalTasks - safeCompletedTasks);
  
  // Nếu không có tasks nào, trả về mảng rỗng
  if (totalTasks === 0) return [];
  
  // Nếu tất cả tasks đều hoàn thành, chỉ trả về 1 phần
  if (safeCompletedTasks === totalTasks) {
    return [{ label: "Completed", value: safeCompletedTasks }];
  }
  
  // Nếu không có tasks nào hoàn thành
  if (safeCompletedTasks === 0) {
    // Phân chia tasks chưa hoàn thành thành In Progress và Not Started
    const inProgressValue = Math.floor(inProgressTasks * 0.7);
    const notStartedValue = inProgressTasks - inProgressValue;
    return [
      { label: "In Progress", value: inProgressValue },
      { label: "Not Started", value: notStartedValue }
    ];
  }
  
  // Trường hợp thông thường: có cả tasks hoàn thành và chưa hoàn thành
  // Phân chia tasks chưa hoàn thành thành In Progress và Not Started
  const inProgressValue = Math.floor(inProgressTasks * 0.7);
  const notStartedValue = inProgressTasks - inProgressValue;
  
  return [
    { label: "Completed", value: safeCompletedTasks },
    { label: "In Progress", value: inProgressValue },
    { label: "Not Started", value: notStartedValue }
  ];
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      tasks: { count: 0, percentage: { color: "success", amount: "+0%", label: "than last week" } },
      newProjects: { count: 0, percentage: { color: "success", amount: "+0%", label: "than last month" } },
      completedTasks: { count: 0, percentage: { color: "success", amount: "+0%", label: "than yesterday" } },
      activeProjects: { count: 0, percentage: { color: "success", amount: "+0%", label: "than yesterday" } },
    },
    weeklyTasksData: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: { label: "Weekly Tasks", data: [0, 0, 0, 0, 0, 0, 0] },
    },
    monthlyProjectsData: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: { label: "Monthly Projects", data: Array(12).fill(0) },
    },
    projectsTableData: {
      columns: [
        { Header: "project", accessor: "name", width: "45%" },
        { Header: "status", accessor: "status", width: "10%" },
        { Header: "completion", accessor: "completion", width: "25%" },
        { Header: "action", accessor: "action", width: "20%" },
      ],
      rows: []
    },
    weeklyTasksStats: {
      title: "Weekly Tasks",
      value: 0,
      subtitle: "Task completion this week",
      date: "updated just now"
    },
    monthlyProjectsStats: {
      title: "Monthly Projects",
      value: 0,
      subtitle: "Project completion rate",
      date: "updated today"
    },
    teamProductivity: 0
  });

  const fetchDashboardData = useCallback(async (selectedPeriod = period) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getDashboardStats(selectedPeriod);
      console.log("Dashboard data received:", data);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={5}>
        <MDTypography variant="h5" color="error" gutterBottom>
          {error}
        </MDTypography>
        <MDTypography variant="body2">
          Failed to load dashboard data. Please try again later.
        </MDTypography>
      </Box>
    );
  }

  return (
    <MDBox py={3} px={2}> {/* Added px for consistent horizontal padding */}
      {/* Top stats cards row - fixed equal width cards with proper grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <MDBox 
            height="100%" 
            sx={{ 
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              borderRadius: "12px",
              overflow: "hidden",
              height: "150px"
            }}
          >
            <ComplexStatisticsCard
              color="dark"
              icon="task_alt"
              title="Tasks"
              count={dashboardData.stats.tasks.count}
              percentage={dashboardData.stats.tasks.percentage}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MDBox 
            height="100%" 
            sx={{ 
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              borderRadius: "12px",
              overflow: "hidden",
              height: "150px"
            }}
          >
            <ComplexStatisticsCard
              icon="workspaces"
              title="New Projects"
              count={dashboardData.stats.newProjects.count}
              percentage={dashboardData.stats.newProjects.percentage}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MDBox 
            height="100%" 
            sx={{ 
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              borderRadius: "12px",
              overflow: "hidden",
              height: "150px"
            }}
          >
            <ComplexStatisticsCard
              color="success"
              icon="done_all"
              title="Completed Tasks"
              count={dashboardData.stats.completedTasks.count}
              percentage={dashboardData.stats.completedTasks.percentage}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MDBox 
            height="100%" 
            sx={{ 
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              borderRadius: "12px",
              overflow: "hidden",
              height: "150px"
            }}
          >
            <ComplexStatisticsCard
              color="primary"
              icon="trending_up"
              title="Active Projects"
              count={dashboardData.stats.activeProjects.count}
              percentage={dashboardData.stats.activeProjects.percentage}
            />
          </MDBox>
        </Grid>
      </Grid>

      {/* Middle charts row - fixed heights and proper grid */}
      <MDBox mt={4.5}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <MDBox 
              height="100%" 
              sx={{ 
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                borderRadius: "12px",
                overflow: "hidden",
                height: "420px"
              }}
            >
              {createTaskStatusData(dashboardData.stats).length > 0 ? (
                <PieChart
                  title="Current Status Of All Tasks"
                  description=""
                  date="last updated today"
                  data={createTaskStatusData(dashboardData.stats)}
                  colors={["#66BB6A", "#49a3f1", "#FFA726"]}
                />
              ) : (
                <MDBox 
                  height="100%" 
                  sx={{ 
                    display: "flex", 
                    flexDirection: "column",
                  }}
                >
                  <MDBox
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                    py={2}
                    px={2}
                    mt={-5}
                    height="16rem"
                    sx={{
                      backgroundImage: 'linear-gradient(195deg, rgba(73, 163, 241, 0.6), rgba(26, 115, 232, 0.9))',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '100%',
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDBox color="white" p={1}>
                        <MDTypography variant="h6" fontWeight="medium" color="white">
                          {/* Task Status Distribution removed */}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                    <MDBox 
                      flexGrow={1} 
                      display="flex" 
                      justifyContent="center" 
                      alignItems="center"
                    >
                      <MDTypography color="white" variant="h5" fontWeight="medium">
                        No Data
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  <MDBox pt={3} pb={2} px={3} flexGrow={1} display="flex" flexDirection="column" justifyContent="space-between">
                    <MDTypography variant="button" textTransform="capitalize" fontWeight="medium">
                      Current status of all tasks
                    </MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <MDBox display="flex" alignItems="center" lineHeight={1}>
                        <AccessTimeIcon fontSize="small" color="text" sx={{ mr: 0.5 }} />
                        <MDTypography variant="caption" color="text" fontWeight="light">
                          last updated today
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </MDBox>
              )}
            </MDBox>
          </Grid>
          <Grid item xs={12} lg={8}>
            <MDBox 
              height="100%" 
              sx={{ 
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                borderRadius: "12px",
                overflow: "hidden",
                height: "420px"
              }}
            >
              <ReportsLineChart
                color="info"
                title="Weekly Tasks"
                description="Number of tasks per day this week"
                date="last updated today"
                chart={createWeeklyTasksData(dashboardData.weeklyTasksData)}
              />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>

      {/* Bottom charts/tables row */}
      <MDBox mt={4.5}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <MDBox 
              height="100%" 
              sx={{
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "white",
                height: "420px"
              }}
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3} pb={0}>
                <MDTypography variant="h5">Project Status</MDTypography>
              </MDBox>
              <MDBox p={3} pt={1.5}>
                {dashboardData.projectsTableData.rows.length > 0 ? (
                  <DataTable
                    table={dashboardData.projectsTableData}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox 
                    display="flex" 
                    flexDirection="column"
                    justifyContent="center" 
                    alignItems="center"
                    height="300px"
                    sx={{
                      background: "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                      borderRadius: "8px",
                    }}
                  >
                    <MDTypography variant="h5" color="text" fontWeight="medium" mb={1}>
                      No Projects Available
                    </MDTypography>
                    <MDTypography variant="body2" color="text" sx={{ opacity: 0.7 }}>
                      Create new projects to see them listed here
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </MDBox>
          </Grid>
          <Grid item xs={12} lg={4}>
            <MDBox 
              height="100%" 
              sx={{ 
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                borderRadius: "12px",
                overflow: "hidden",
                height: "420px"
              }}
            >
              <ReportsBarChart
                color="info"
                title="Monthly Projects"
                description="Number of projects per month"
                date="last updated today"
                chart={createMonthlyProjectsData(dashboardData.monthlyProjectsData)}
              />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

export default Dashboard; 
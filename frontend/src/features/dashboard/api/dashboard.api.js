import { API_URLS, LOCAL_STORAGE_KEYS, ERROR_MESSAGES } from "../../../shared/utils/constants";
import api from "../../../services/api.service";
import { toast } from "react-toastify";

/**
 * Get dashboard statistics
 * @param {string} period - Time period for stats (week, month, year)
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getDashboardStats = async (period = "month") => {
  try {
    // Call API to get dashboard stats
    const data = await api.get(`${API_URLS.DASHBOARD_URL}/stats`, {
      params: { period }
    });
    
    console.log("Raw API response:", data);

    // If backend doesn't return data, return empty dashboard structure
    if (!data) {
      console.warn("API returned no data, using default values");
      return getDefaultDashboardData();
    }

    // Format the data to match the dashboard component structure
    const formattedData = {
      stats: {
        tasks: {
          count: data.totalTasks || 0,
          percentage: { 
            color: (data.taskGrowth > 0) ? "success" : (data.taskGrowth < 0) ? "error" : "info",
            amount: (data.taskGrowth > 0) ? `+${data.taskGrowth}%` : `${data.taskGrowth}%`,
            label: "than last week" 
          }
        },
        newProjects: { 
          count: data.newProjects || 0,
          percentage: { 
            color: (data.projectGrowth > 0) ? "success" : (data.projectGrowth < 0) ? "error" : "info",
            amount: (data.projectGrowth > 0) ? `+${data.projectGrowth}%` : `${data.projectGrowth}%`,
            label: "than last month" 
          }
        },
        completedTasks: { 
          count: data.completedTasks || 0,
          percentage: { 
            color: (data.completionRate > 0) ? "success" : (data.completionRate < 0) ? "error" : "info",
            amount: (data.completionRate > 0) ? `+${data.completionRate}%` : `${data.completionRate}%`,
            label: "than yesterday" 
          }
        },
        activeProjects: { 
          count: data.activeProjects || 0,
          percentage: { 
            color: (data.activeProjectsGrowth > 0) ? "success" : (data.activeProjectsGrowth < 0) ? "error" : "info",
            amount: (data.activeProjectsGrowth > 0) ? `+${data.activeProjectsGrowth}%` : `${data.activeProjectsGrowth}%`,
            label: "than yesterday" 
          }
        },
      },
      weeklyTasksData: {
        labels: data.weeklyLabels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: { 
          label: "Weekly Tasks", 
          data: data.weeklyTaskCounts || Array(7).fill(0) 
        },
      },
      monthlyProjectsData: {
        labels: data.monthlyLabels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: { 
          label: "Monthly Projects", 
          data: data.monthlyProjectCounts || Array(12).fill(0) 
        },
      },
      projectsTableData: {
        columns: [
          { Header: "project", accessor: "name", width: "45%" },
          { Header: "status", accessor: "status", width: "10%" },
          { Header: "completion", accessor: "completion", width: "25%" },
          { Header: "action", accessor: "action", width: "20%" },
        ],
        rows: (data.recentProjects || []).map(project => ({
          name: project.name || "Unnamed Project",
          status: project.status || "In Progress",
          completion: {
            value: Math.round(project.progress || 0),
            display: `${Math.round(project.progress || 0)}%`
          },
          action: "Edit"
        }))
      },
      weeklyTasksStats: {
        title: "Weekly Tasks",
        value: data.weeklyTasksTotal || 0,
        subtitle: "Task completion this week",
        date: "updated just now"
      },
      monthlyProjectsStats: {
        title: "Monthly Projects",
        value: data.monthlyProjectsTotal || 0,
        subtitle: "Project completion rate",
        date: "updated today"
      },
      teamProductivity: data.teamProductivity || 0
    };

    console.log("Formatted dashboard data:", formattedData);
    return formattedData;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return default dashboard data on error
    return getDefaultDashboardData();
  }
};

/**
 * Returns default dashboard data when API fails
 */
function getDefaultDashboardData() {
  return {
    stats: {
      tasks: { 
        count: 0, 
        percentage: { color: "info", amount: "0%", label: "than last week" } 
      },
      newProjects: { 
        count: 0, 
        percentage: { color: "info", amount: "0%", label: "than last month" } 
      },
      completedTasks: { 
        count: 0, 
        percentage: { color: "info", amount: "0%", label: "than yesterday" } 
      },
      activeProjects: { 
        count: 0, 
        percentage: { color: "info", amount: "0%", label: "than yesterday" } 
      },
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
  };
} 
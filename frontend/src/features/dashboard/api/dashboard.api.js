import { API_URLS, LOCAL_STORAGE_KEYS, ERROR_MESSAGES } from "../../../shared/utils/constants";
import axios from "axios";

/**
 * Get dashboard statistics
 * @param {string} period - Time period for stats (week, month, year)
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getDashboardStats = async (period = "month") => {
  try {
    // Get token from local storage
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    
    if (!token) {
      console.error("Missing authentication token");
      throw new Error(ERROR_MESSAGES.UNAUTHENTICATED);
    }

    console.log("Using token for dashboard API:", token.substring(0, 15) + "...");

    // Call API to get dashboard stats
    const response = await axios.get(`${API_URLS.DASHBOARD_URL}/stats`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      params: { period },
      withCredentials: true
    });

    // Format data for dashboard components
    const data = response.data;
    console.log("Raw API response:", data);

    // Format the data to match the dashboard component structure
    const formattedData = {
      stats: {
        tasks: {
          count: data.totalTasks || 0,
          percentage: { 
            color: data.taskGrowth > 0 ? "success" : data.taskGrowth < 0 ? "error" : "info",
            amount: data.taskGrowth > 0 ? `+${data.taskGrowth}%` : `${data.taskGrowth}%`,
            label: "than last week" 
          }
        },
        newProjects: { 
          count: data.newProjects || 0,
          percentage: { 
            color: data.projectGrowth > 0 ? "success" : data.projectGrowth < 0 ? "error" : "info",
            amount: data.projectGrowth > 0 ? `+${data.projectGrowth}%` : `${data.projectGrowth}%`,
            label: "than last month" 
          }
        },
        completedTasks: { 
          count: data.completedTasks || 0,
          percentage: { 
            color: data.completionRate > 0 ? "success" : data.completionRate < 0 ? "error" : "info",
            amount: data.completionRate > 0 ? `+${data.completionRate}%` : `${data.completionRate}%`,
            label: "than yesterday" 
          }
        },
        activeProjects: { 
          count: data.activeProjects || 0,
          percentage: { 
            color: data.activeProjectsGrowth > 0 ? "success" : data.activeProjectsGrowth < 0 ? "error" : "info",
            amount: data.activeProjectsGrowth > 0 ? `+${data.activeProjectsGrowth}%` : `${data.activeProjectsGrowth}%`,
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle authentication errors
      console.log("Authentication error status:", error.response?.status);
      console.log("Error message:", error.response?.data?.message);
      
      // Attempt to refresh token if 401 (consider implementing this)
      // For now, throw the error
      throw new Error(error.response?.data?.message || ERROR_MESSAGES.UNAUTHENTICATED);
    }
    throw error;
  }
}; 
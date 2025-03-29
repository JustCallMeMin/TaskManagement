const Task = require('../models/task.model');
const Project = require('../models/project.model');
const mongoose = require('mongoose');
const moment = require('moment');

const getDashboardStats = async (req, res) => {
  try {
    console.log('Dashboard request from user:', req.user);
    
    // Xử lý id người dùng (hỗ trợ cả id và _id)
    const userId = req.user.id || req.user._id;
    
    console.log('Using userId for dashboard:', userId);
    
    const today = new Date();
    const period = req.query.period || 'month';
    
    // Define time ranges based on period
    const timeRanges = {
      week: {
        start: moment().subtract(7, 'days').toDate(),
        previous: {
          start: moment().subtract(14, 'days').toDate(),
          end: moment().subtract(7, 'days').toDate()
        }
      },
      month: {
        start: moment().subtract(30, 'days').toDate(),
        previous: {
          start: moment().subtract(60, 'days').toDate(),
          end: moment().subtract(30, 'days').toDate()
        }
      },
      year: {
        start: moment().subtract(1, 'year').toDate(),
        previous: {
          start: moment().subtract(2, 'years').toDate(),
          end: moment().subtract(1, 'year').toDate()
        }
      }
    };

    const timeRange = timeRanges[period];
    const startDate = timeRange.start;
    const previousStartDate = timeRange.previous.start;
    const previousEndDate = timeRange.previous.end;

    // Get current period tasks stats
    const currentTasksStats = await Task.aggregate([
      {
        $match: {
          assignedUserId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] }
          }
        }
      }
    ]);

    // Get previous period tasks stats for comparison
    const previousTasksStats = await Task.aggregate([
      {
        $match: {
          assignedUserId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
          createdAt: { $gte: previousStartDate, $lt: previousEndDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] }
          }
        }
      }
    ]);

    // Get current period projects stats
    const currentProjectsStats = await Project.aggregate([
      {
        $match: {
          ownerId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $ne: ["$status", "Done"] }, 1, 0] }
          },
          newProjects: { $sum: 1 }
        }
      }
    ]);

    // Get previous period projects stats for comparison
    const previousProjectsStats = await Project.aggregate([
      {
        $match: {
          ownerId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
          createdAt: { $gte: previousStartDate, $lt: previousEndDate }
        }
      },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $ne: ["$status", "Done"] }, 1, 0] }
          }
        }
      }
    ]);

    // Calculate growth percentages
    const currentTasks = currentTasksStats[0]?.totalTasks || 0;
    const previousTasks = previousTasksStats[0]?.totalTasks || 0;
    const taskGrowth = previousTasks === 0 ? 0 : Math.round(((currentTasks - previousTasks) / previousTasks) * 100);

    const currentCompleted = currentTasksStats[0]?.completedTasks || 0;
    const previousCompleted = previousTasksStats[0]?.completedTasks || 0;
    const completionRate = previousCompleted === 0 ? 0 : Math.round(((currentCompleted - previousCompleted) / previousCompleted) * 100);

    const currentNewProjects = currentProjectsStats[0]?.newProjects || 0;
    const previousNewProjects = previousProjectsStats[0]?.totalProjects || 0;
    const projectGrowth = previousNewProjects === 0 ? 0 : Math.round(((currentNewProjects - previousNewProjects) / previousNewProjects) * 100);

    const currentActiveProjects = currentProjectsStats[0]?.activeProjects || 0;
    const previousActiveProjects = previousProjectsStats[0]?.activeProjects || 0;
    const activeProjectsGrowth = previousActiveProjects === 0 ? 0 : Math.round(((currentActiveProjects - previousActiveProjects) / previousActiveProjects) * 100);

    // Get weekly task statistics
    const weeklyTaskStats = await Task.aggregate([
      {
        $match: {
          assignedUserId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
          createdAt: { $gte: moment().subtract(7, 'days').toDate() }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Calculate total weekly tasks
    const weeklyTasksTotal = weeklyTaskStats.reduce((total, day) => total + day.count, 0);
    console.log('weeklyTasksTotal:', weeklyTasksTotal);

    // Map day numbers to day names and fill missing days
    const daysMap = { 1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat" };
    const weeklyTaskCounts = Array(7).fill(0);
    const weeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    weeklyTaskStats.forEach(day => {
      // MongoDB $dayOfWeek returns 1 for Sunday, 2 for Monday, etc.
      // Convert to 0-based index for our array (0 = Monday, 6 = Sunday)
      const dayIndex = day._id === 1 ? 6 : day._id - 2;
      weeklyTaskCounts[dayIndex] = day.count;
    });

    // Get monthly project statistics
    const monthlyProjectStats = await Project.aggregate([
      {
        $match: {
          ownerId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
          createdAt: { $gte: moment().subtract(1, 'year').toDate() }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Calculate total monthly projects
    const monthlyProjectsTotal = monthlyProjectStats.reduce((total, month) => total + month.count, 0);
    console.log('monthlyProjectsTotal:', monthlyProjectsTotal);

    // Fill missing months
    const monthlyProjectCounts = Array(12).fill(0);
    const monthlyLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    monthlyProjectStats.forEach(month => {
      // MongoDB $month returns 1-12 for Jan-Dec
      monthlyProjectCounts[month._id - 1] = month.count;
    });

    // Get recent projects with completion percentages
    const recentProjects = await Project.aggregate([
      {
        $match: { 
          ownerId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId
        }
      },
      {
        $sort: { updatedAt: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "projectId",
          as: "tasks"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          status: 1,
          startDate: 1,
          endDate: 1,
          totalTasks: { $size: "$tasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "Done"] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          startDate: 1,
          endDate: 1,
          progress: {
            $cond: [
              { $eq: ["$totalTasks", 0] },
              0,
              { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] }
            ]
          }
        }
      }
    ]);

    // Calculate team productivity
    // For simplicity, let's use the completed tasks ratio as a productivity metric
    const teamProductivity = currentTasks === 0 
      ? 0 
      : Math.round((currentCompleted / currentTasks) * 100);

    // Prepare response
    const response = {
      totalTasks: currentTasks,
      completedTasks: currentCompleted,
      taskGrowth,
      completionRate,
      newProjects: currentNewProjects,
      projectGrowth,
      activeProjects: currentActiveProjects,
      activeProjectsGrowth,
      weeklyLabels,
      weeklyTaskCounts,
      weeklyTasksTotal,
      monthlyLabels,
      monthlyProjectCounts,
      monthlyProjectsTotal,
      recentProjects,
      teamProductivity
    };

    console.log('Dashboard data:', response);
    res.json(response);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardStats
}; 
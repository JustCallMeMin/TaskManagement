const mongoose = require('mongoose');
const Task = require('../../models/task.model');
const User = require('../../models/user.model');
const Project = require('../../models/project.model');
const { faker } = require('@faker-js/faker');
const { TASK_STATUS, TASK_PRIORITY } = require('../../utils/enums');

/**
 * Seeds the database with sample tasks for testing
 * @param {Number} count - Số lượng task cần tạo
 * @param {Boolean} clearExisting - Xóa task hiện có trước khi tạo mới
 */
async function seedTasks(count = 20, clearExisting = false) {
  try {
    console.log('Starting task seeding...');
    
    // Get all users and projects for reference
    const users = await User.find({}).select('_id');
    
    if (users.length === 0) {
      console.error('No users found. Please run user seeds first.');
      return [];
    }
    
    const projects = await Project.find({}).select('_id ownerId');
    
    if (projects.length === 0) {
      console.error('No projects found. Please run project seeds first.');
      return [];
    }
    
    // Delete existing tasks only if clearExisting is true
    if (clearExisting) {
      await Task.deleteMany({});
      console.log('Deleted existing tasks');
    } else {
      console.log('Preserving existing tasks');
    }
    
    const tasks = [];
    const statuses = Object.values(TASK_STATUS);
    const priorities = Object.values(TASK_PRIORITY);
    
    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      
      // Find projects that belong to this user
      const userProjects = projects.filter(project => 
        project.ownerId && project.ownerId.toString() === user._id.toString()
      );
      
      // Randomly decide if this task has a project
      const hasProject = userProjects.length > 0 && Math.random() > 0.3;
      const projectId = hasProject 
        ? userProjects[Math.floor(Math.random() * userProjects.length)]._id 
        : null;
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isDone = status === TASK_STATUS.DONE;
      
      // Generate random dates within the last year
      const createdAt = faker.date.past({ years: 1 });
      
      // Due date should be after created date (if not null)
      const dueDate = Math.random() > 0.2 
        ? new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 30) // Up to 30 days after creation
        : null;
      
      const task = {
        title: faker.lorem.sentence({ min: 3, max: 8 }).replace('.', ''),
        description: faker.lorem.paragraph(),
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        dueDate,
        projectId,
        assignedUserId: user._id,
        isPersonal: !projectId,
        createdAt,
        updatedAt: new Date()
      };
      
      tasks.push(task);
    }
    
    if (tasks.length > 0) {
      await Task.insertMany(tasks);
      console.log(`Successfully seeded ${tasks.length} tasks`);
    } else {
      console.log('No new tasks created');
    }
    
    return tasks;
  } catch (error) {
    console.error('Error seeding tasks:', error);
    throw error;
  }
}

module.exports = seedTasks;

// If this script is run directly (not imported), execute the seed function
if (require.main === module) {
  // Parse command line args
  const args = process.argv.slice(2);
  const count = parseInt(args[0]) || 20;
  const clearExisting = args.includes('--clear') || args.includes('-c');

  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-management')
    .then(() => {
      console.log('Connected to MongoDB');
      return seedTasks(count, clearExisting);
    })
    .then(() => {
      console.log('Task seeding completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during task seeding:', err);
      process.exit(1);
    });
} 
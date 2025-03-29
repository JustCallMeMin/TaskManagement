const mongoose = require('mongoose');
const Project = require('../../models/project.model');
const User = require('../../models/user.model');
const { faker } = require('@faker-js/faker');
const { PROJECT_STATUS } = require('../../utils/enums');

/**
 * Seeds the database with sample projects for testing
 * @param {Number} count - Số lượng project cần tạo
 * @param {Boolean} clearExisting - Xóa project hiện có trước khi tạo mới
 */
async function seedProjects(count = 15, clearExisting = false) {
  try {
    console.log('Starting project seeding...');
    
    // Get all users for reference
    const users = await User.find({}).select('_id');
    
    if (users.length === 0) {
      console.error('No users found. Please run user seeds first.');
      return [];
    }
    
    // Delete existing projects only if clearExisting is true
    if (clearExisting) {
      await Project.deleteMany({});
      console.log('Deleted existing projects');
    } else {
      console.log('Preserving existing projects');
    }
    
    const projects = [];
    const statuses = Object.values(PROJECT_STATUS);
    
    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isCompleted = status === PROJECT_STATUS.COMPLETED;
      
      // Generate random dates within the last year
      const createdAt = faker.date.past({ years: 1 });
      
      // If project is done, set completedAt date after createdAt
      const completedAt = isCompleted 
        ? new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())) 
        : null;
      
      // Due date should be after created date
      const dueDate = new Date(createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 60); // Up to 60 days after creation
      
      const project = {
        name: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        status,
        startDate: createdAt,
        endDate: dueDate, // Đổi tên từ dueDate thành endDate để phù hợp với schema
        ownerId: user._id, // Đổi tên từ userId thành ownerId để phù hợp với schema
        isPersonal: Math.random() > 0.7, // 30% chance to be personal project
        createdAt,
        updatedAt: new Date(),
      };
      
      projects.push(project);
    }
    
    if (projects.length > 0) {
      await Project.insertMany(projects);
      console.log(`Successfully seeded ${projects.length} projects`);
    } else {
      console.log('No new projects created');
    }
    
    return projects;
  } catch (error) {
    console.error('Error seeding projects:', error);
    throw error;
  }
}

module.exports = seedProjects;

// If this script is run directly (not imported), execute the seed function
if (require.main === module) {
  // Parse command line args
  const args = process.argv.slice(2);
  const count = parseInt(args[0]) || 15;
  const clearExisting = args.includes('--clear') || args.includes('-c');

  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-management')
    .then(() => {
      console.log('Connected to MongoDB');
      return seedProjects(count, clearExisting);
    })
    .then(() => {
      console.log('Project seeding completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during project seeding:', err);
      process.exit(1);
    });
} 
const Project = require("../../models/project.model");
const ProjectUser = require("../../models/project_user.model");

class ProjectRepository {
    static async findById(projectId) {
        try {
            console.log("🔍 Finding project by ID:", projectId);
            // Don't try to populate members directly since it's not in the schema
            const project = await Project.findById(projectId)
                .populate("ownerId", "fullName email");
            
            if (!project) {
                console.log("❌ Project not found with ID:", projectId);
                return null;
            }
            
            // Manually fetch members
            const members = await ProjectUser.find({ projectId: project._id })
                .populate("userId", "fullName email");
            
            // Create a new object with the project data and members
            const result = project.toObject();
            result.members = members;
            
            console.log("✅ Found project with ID:", projectId);
            return result;
        } catch (error) {
            console.error("❌ Error in findById:", error);
            throw error;
        }
    }

    static async findByOwner(userId, isPersonal = false) {
        return Project.findOne({
            ownerId: userId,
            isPersonal: isPersonal,
        });
    }

    static async findAllByUser(userId) {
        try {
            // Log the userId we're searching for
            console.log("🔍 Finding projects for userId:", userId);

            // First, get all projects where user is a member
            const projectUsers = await ProjectUser.find({ userId });
            const projectIds = projectUsers.map((pu) => pu.projectId);
            console.log("🔍 Found member projectIds:", projectIds);

            // Build the query to find:
            // 1. User's personal project (where they are owner AND isPersonal is true)
            // 2. Projects where user is a member
            // 3. Projects where user is an owner (but not personal projects)
            const query = {
                $or: [
                    { ownerId: userId, isPersonal: true },  // Personal project
                    { _id: { $in: projectIds } },          // Member of projects
                    { ownerId: userId, isPersonal: false } // Owner of non-personal projects
                ]
            };

            console.log("🔍 Executing query:", JSON.stringify(query));

            const projects = await Project.find(query)
                .populate("ownerId", "fullName email")
                .lean();

            // For each project, fetch its members
            const projectsWithMembers = await Promise.all(
                projects.map(async (project) => {
                    const members = await ProjectUser.find({ projectId: project._id })
                        .populate("userId", "fullName email")
                        .lean();
                    
                    return {
                        ...project,
                        members: members
                    };
                })
            );

            console.log("🔍 Found projects:", projectsWithMembers.map(p => ({
                id: p._id,
                name: p.name,
                isPersonal: p.isPersonal,
                ownerId: p.ownerId,
                membersCount: p.members?.length || 0
            })));

            return projectsWithMembers;
        } catch (error) {
            console.error("❌ Error in findAllByUser:", error);
            throw error;
        }
    }

    static async create(projectData) {
        try {
            const project = new Project(projectData);
            await project.save();
            console.log("✅ Created project:", {
                id: project._id,
                name: project.name,
                isPersonal: project.isPersonal,
                ownerId: project.ownerId
            });
            return project;
        } catch (error) {
            console.error("❌ Error creating project:", error);
            throw error;
        }
    }

    static async deleteMany(projectIds) {
        return Project.deleteMany({ _id: { $in: projectIds } });
    }

    static async update(projectId, projectData) {
        return Project.findByIdAndUpdate(projectId, projectData, { new: true });
    }
}

module.exports = ProjectRepository;

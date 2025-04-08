class ProjectDTO {
    constructor(project) {
        this.projectId = project._id;  
        this.name = project.name;
        this.description = project.description;
        this.startDate = project.startDate;
        this.endDate = project.endDate;
        this.status = project.status;
        this.isPersonal = project.isPersonal;
        this.owner = {
            userId: project.ownerId?._id,  
            fullName: project.ownerId?.fullName || "Không xác định",
            email: project.ownerId?.email || "Không xác định",
        };
        
        // Handle the new members format (array of ProjectUser documents)
        this.members = Array.isArray(project.members) 
            ? project.members.map(member => ({
                userId: member.userId?._id,
                fullName: member.userId?.fullName || "Không xác định",
                email: member.userId?.email || "Không xác định",
                role: member.role
            })) 
            : [];
        
        // Add taskStats for consistency with frontend expectations
        this.taskStats = {
            total: 0,
            completed: 0
        };
    }
}

module.exports = ProjectDTO;
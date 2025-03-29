class ProjectDTO {
    constructor(project) {
        this.id = project._id;
        this.name = project.name;
        this.description = project.description;
        this.startDate = project.startDate;
        this.endDate = project.endDate;
        this.status = project.status;
        this.isPersonal = project.isPersonal;
        this.owner = {
            id: project.ownerId?._id,
            fullName: project.ownerId?.fullName,
            email: project.ownerId?.email,
        };
        this.members = project.members?.map(member => ({
            id: member.userId?._id,
            fullName: member.userId?.fullName,
            email: member.userId?.email
        }));
    }
}

module.exports = ProjectDTO;
const ProjectUser = require("../models/project_user.model");

const isProjectManager = async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    const projectUser = await ProjectUser.findOne({ projectId, userId });
    if (!projectUser || projectUser.role !== "Manager") {
        return res.status(403).json({ error: "Bạn không có quyền quản lý dự án này." });
    }
    next();
};

module.exports = { isProjectManager };
exports.addComment = async (req, res) => {
    try {
        const { taskId, content } = req.body;

        const task = await Task.findByPk(taskId);

        if (!task) return res.status(404).json({ message: "Công việc không tồn tại" });

        // Kiểm tra xem User có quyền bình luận không
        if (task.assignedUserId !== req.user.id && !req.user.roles.includes("Manager")) {
            return res.status(403).json({ message: "Bạn không thể bình luận vào công việc này!" });
        }

        const comment = await Comment.create({ taskId, userId: req.user.id, content });
        res.status(201).json({ message: "Thêm bình luận thành công!", comment });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

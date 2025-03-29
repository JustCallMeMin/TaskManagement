const mongoose = require("mongoose");

const checkAssignedUser = async function (next) {
    if (this.assignedUserId) {
        const userExists = await mongoose.model("User").exists({ _id: this.assignedUserId });
        if (!userExists) {
            this.assignedUserId = null;
        }
    }
    next();
};

module.exports = { checkAssignedUser };
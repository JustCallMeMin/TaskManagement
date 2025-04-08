const Permission = require("../../models/permission.model");

/**
 * Tìm một permission theo id
 * @param {string} id - ID của permission
 * @returns {Promise<Object>} Permission object hoặc null
 */
const findById = async (id) => {
    try {
        return await Permission.findById(id);
    } catch (error) {
        console.error("Error in findById permission:", error);
        throw error;
    }
};

/**
 * Tìm một permission theo tên
 * @param {string} permissionName - Tên của permission
 * @returns {Promise<Object>} Permission object hoặc null
 */
const findByName = async (permissionName) => {
    try {
        return await Permission.findOne({ permissionName });
    } catch (error) {
        console.error("Error in findByName permission:", error);
        throw error;
    }
};

/**
 * Lấy tất cả permissions
 * @returns {Promise<Array>} Danh sách permissions
 */
const findAll = async () => {
    try {
        return await Permission.find({});
    } catch (error) {
        console.error("Error in findAll permissions:", error);
        throw error;
    }
};

/**
 * Tạo mới permission
 * @param {Object} permissionData - Dữ liệu permission
 * @returns {Promise<Object>} Permission object mới tạo
 */
const create = async (permissionData) => {
    try {
        const permission = new Permission(permissionData);
        return await permission.save();
    } catch (error) {
        console.error("Error in create permission:", error);
        throw error;
    }
};

/**
 * Cập nhật permission
 * @param {string} id - ID của permission
 * @param {Object} updates - Các thông tin cần cập nhật
 * @returns {Promise<Object>} Permission object đã cập nhật
 */
const update = async (id, updates) => {
    try {
        return await Permission.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
        console.error("Error in update permission:", error);
        throw error;
    }
};

/**
 * Xóa permission
 * @param {string} id - ID của permission
 * @returns {Promise<Object>} Kết quả xóa
 */
const remove = async (id) => {
    try {
        return await Permission.findByIdAndDelete(id);
    } catch (error) {
        console.error("Error in remove permission:", error);
        throw error;
    }
};

module.exports = {
    findById,
    findByName,
    findAll,
    create,
    update,
    remove
};

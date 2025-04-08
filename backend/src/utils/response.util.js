/**
 * Hàm trả về phản hồi thành công với định dạng nhất quán
 * @param {Object} res - Response object
 * @param {*} data - Dữ liệu trả về
 * @param {string} message - Thông báo thành công
 * @param {number} status - Mã trạng thái HTTP, mặc định là 200
 * @returns {Object} Response object
 */
const successResponse = (res, data, message = "Thành công", status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
};

/**
 * Hàm trả về phản hồi lỗi với định dạng nhất quán
 * @param {Object} res - Response object
 * @param {string} message - Thông báo lỗi
 * @param {number} status - Mã trạng thái HTTP, mặc định là 400
 * @param {*} errors - Chi tiết lỗi (tùy chọn)
 * @returns {Object} Response object
 */
const errorResponse = (res, message = "Có lỗi xảy ra", status = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(status).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};

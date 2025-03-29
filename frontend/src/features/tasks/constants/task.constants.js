/**
 * Mức độ ưu tiên của task
 * @readonly
 * @enum {string}
 */
export const TASK_PRIORITY = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT"
});

/**
 * Trạng thái của task
 * @readonly
 * @enum {string}
 */
export const TASK_STATUS = Object.freeze({
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  DONE: "DONE"
});

/**
 * Tên hiển thị cho mức độ ưu tiên
 * @readonly
 * @enum {string}
 */
export const PRIORITY_LABELS = Object.freeze({
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp"
});

/**
 * Tên hiển thị cho trạng thái task
 * @readonly
 * @enum {string}
 */
export const STATUS_LABELS = Object.freeze({
  TODO: "Cần làm",
  IN_PROGRESS: "Đang thực hiện",
  REVIEW: "Đang kiểm tra",
  DONE: "Hoàn thành"
});

/**
 * Màu sắc cho các mức độ ưu tiên
 * @readonly
 * @enum {string}
 */
export const PRIORITY_COLORS = Object.freeze({
  LOW: "#4caf50",     // green
  MEDIUM: "#2196f3",  // blue
  HIGH: "#ff9800",    // orange
  URGENT: "#f44336"   // red
});

/**
 * Màu sắc cho các trạng thái
 * @readonly
 * @enum {string}
 */
export const STATUS_COLORS = Object.freeze({
  TODO: "#9e9e9e",        // grey
  IN_PROGRESS: "#2196f3", // blue
  REVIEW: "#ff9800",      // orange
  DONE: "#4caf50"         // green
});

export const TASK_TYPE = {
  FEATURE: 'FEATURE',
  BUG: 'BUG',
  IMPROVEMENT: 'IMPROVEMENT',
  TASK: 'TASK'
};

export const TASK_LABELS = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  UI: 'UI',
  UX: 'UX',
  TESTING: 'Testing',
  DOCUMENTATION: 'Documentation'
}; 
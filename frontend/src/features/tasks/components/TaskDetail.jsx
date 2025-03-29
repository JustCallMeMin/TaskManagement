import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Description as DescriptionIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import TaskService from '../services/task.service';
import {
  TASK_STATUS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '../constants/task.constants';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const taskData = await TaskService.getTaskById(taskId);
      setTask(taskData);
      setError(null);
    } catch (error) {
      setError(error.message || 'Không thể tải thông tin công việc');
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    navigate(`/tasks/${taskId}/edit`);
  };

  const handleBack = () => {
    navigate('/tasks');
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await TaskService.deleteTask(taskId);
      setDeleteDialogOpen(false);
      navigate('/tasks', { state: { message: 'Công việc đã được xóa thành công' } });
    } catch (error) {
      console.error('Lỗi khi xóa task:', error);
      setError(error.message || 'Không thể xóa công việc');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = async (newStatus) => {
    handleMenuClose();
    setStatusLoading(true);
    try {
      const updatedTask = await TaskService.updateTaskStatus(taskId, newStatus);
      setTask(updatedTask);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      setError(error.message || 'Không thể cập nhật trạng thái công việc');
    } finally {
      setStatusLoading(false);
    }
  };

  // Xác định các trạng thái có thể chuyển đổi từ trạng thái hiện tại
  const getAvailableStatusTransitions = (currentStatus) => {
    switch (currentStatus) {
      case TASK_STATUS.TODO:
        return [TASK_STATUS.IN_PROGRESS];
      case TASK_STATUS.IN_PROGRESS:
        return [TASK_STATUS.REVIEW, TASK_STATUS.TODO];
      case TASK_STATUS.REVIEW:
        return [TASK_STATUS.DONE, TASK_STATUS.IN_PROGRESS];
      case TASK_STATUS.DONE:
        return [TASK_STATUS.REVIEW];
      default:
        return [];
    }
  };

  // Format dueDate
  const formatDate = (date) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Invalid date format:', error);
      return null;
    }
  };

  const isOverdue = () => {
    if (!task || !task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== TASK_STATUS.DONE;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Không tìm thấy thông tin công việc</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  const availableStatusTransitions = getAvailableStatusTransitions(task.status);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Quay lại
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={STATUS_LABELS[task.status]}
                sx={{
                  backgroundColor: STATUS_COLORS[task.status],
                  color: 'white',
                  fontWeight: 500,
                }}
              />
              <Chip
                label={PRIORITY_LABELS[task.priority]}
                sx={{
                  backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                  color: PRIORITY_COLORS[task.priority],
                  fontWeight: 500,
                }}
              />
              <Chip
                icon={task.isPersonal ? <PersonIcon fontSize="small" /> : <BusinessIcon fontSize="small" />}
                label={task.isPersonal ? "Cá nhân" : "Dự án"}
                variant="outlined"
              />
              {statusLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>

            <Typography variant="h4" component="h1" gutterBottom>
              {task.title}
            </Typography>
          </Grid>

          {task.description && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Mô tả
              </Typography>
              <Typography variant="body1" paragraph>
                {task.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                Ngày tạo: {formatDate(task.createdAt)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                Cập nhật lần cuối: {formatDate(task.updatedAt)}
              </Typography>
            </Box>
          </Grid>

          {task.dueDate && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon
                  sx={{ mr: 1, color: isOverdue() ? 'error.main' : 'text.secondary' }}
                />
                <Typography
                  variant="body1"
                  sx={{ color: isOverdue() ? 'error.main' : 'inherit' }}
                >
                  Hạn chót: {formatDate(task.dueDate)}
                  {isOverdue() && ' (Quá hạn)'}
                </Typography>
              </Box>
            </Grid>
          )}

          {task.assignedUserId && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  Được giao cho: {task.assignedUser ? task.assignedUser.fullName : 'N/A'}
                </Typography>
              </Box>
            </Grid>
          )}

          {task.projectId && !task.isPersonal && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  Dự án: {task.project ? task.project.name : 'N/A'}
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
              {availableStatusTransitions.length > 0 && task.status !== TASK_STATUS.DONE && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleStatusChange(TASK_STATUS.DONE)}
                  startIcon={<CheckCircleIcon />}
                  disabled={statusLoading}
                >
                  Đánh dấu hoàn thành
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Menu Tùy chọn */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Xóa
          </ListItemText>
        </MenuItem>

        {availableStatusTransitions.length > 0 && (
          <>
            <Divider />
            {availableStatusTransitions.map(status => (
              <MenuItem key={status} onClick={() => handleStatusChange(status)}>
                <ListItemIcon>
                  {status === TASK_STATUS.TODO && <ArrowBackIcon fontSize="small" color="action" />}
                  {status === TASK_STATUS.IN_PROGRESS && <ArrowForwardIcon fontSize="small" color="primary" />}
                  {status === TASK_STATUS.REVIEW && <DescriptionIcon fontSize="small" color="warning" />}
                  {status === TASK_STATUS.DONE && <CheckCircleIcon fontSize="small" color="success" />}
                </ListItemIcon>
                <ListItemText>
                  {`Chuyển sang ${STATUS_LABELS[status]}`}
                </ListItemText>
              </MenuItem>
            ))}
          </>
        )}
      </Menu>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa công việc "{task.title}" không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary" disabled={deleteLoading}>
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleteLoading}>
            {deleteLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetail; 
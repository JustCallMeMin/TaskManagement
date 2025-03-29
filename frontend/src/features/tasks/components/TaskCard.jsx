import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import TaskService from '../services/task.service';
import { 
  TASK_STATUS, 
  PRIORITY_COLORS, 
  STATUS_COLORS, 
  PRIORITY_LABELS, 
  STATUS_LABELS 
} from '../constants/task.constants';
import { usePermission } from '../../../hooks/usePermission';
import PermissionGate from '../../../components/common/PermissionGate';

const TaskCard = ({ task, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  // Kiểm tra các quyền hạn
  const canEditTask = hasPermission('Edit Task');
  const canDeleteTask = hasPermission('Delete Task');
  const canChangeStatus = hasPermission('Change Task Status');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    navigate(`/tasks/${task._id}/edit`);
  };

  const handleView = () => {
    navigate(`/tasks/${task._id}`);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await TaskService.deleteTask(task._id);
      setDeleteDialogOpen(false);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Lỗi khi xóa task:', error);
      // Hiển thị thông báo lỗi nếu cần
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = async (newStatus) => {
    handleMenuClose();
    try {
      await TaskService.updateTaskStatus(task._id, newStatus);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      // Hiển thị thông báo lỗi nếu cần
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
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    try {
      return format(new Date(dueDate), 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Invalid date format:', error);
      return null;
    }
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== TASK_STATUS.DONE;
  };

  const availableStatusTransitions = getAvailableStatusTransitions(task.status);
  
  // Kiểm tra xem có ít nhất một hành động nào (edit, delete, change status) mà người dùng có quyền thực hiện
  const hasAnyActionPermission = canEditTask || canDeleteTask || (canChangeStatus && availableStatusTransitions.length > 0);

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        cursor: 'pointer', 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        },
        borderLeft: `4px solid ${PRIORITY_COLORS[task.priority]}`,
        backgroundColor: isOverdue() ? '#fff8f8' : undefined
      }}
      onClick={handleView}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Chip 
            label={STATUS_LABELS[task.status]} 
            size="small" 
            sx={{ 
              backgroundColor: STATUS_COLORS[task.status],
              color: 'white',
              fontWeight: 500,
              mb: 1
            }}
          />
          
          {hasAnyActionPermission && (
            <Tooltip title="Tùy chọn">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e);
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 500 }}>
          {task.title}
        </Typography>

        {task.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Tooltip title={`Ưu tiên: ${PRIORITY_LABELS[task.priority]}`}>
            <Chip 
              label={PRIORITY_LABELS[task.priority]} 
              size="small" 
              sx={{ 
                backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                color: PRIORITY_COLORS[task.priority],
                fontWeight: 500,
                mr: 1
              }}
            />
          </Tooltip>
          
          <Tooltip title={task.isPersonal ? 'Công việc cá nhân' : 'Công việc dự án'}>
            <Chip 
              icon={task.isPersonal ? <PersonIcon fontSize="small" /> : <BusinessIcon fontSize="small" />}
              label={task.isPersonal ? "Cá nhân" : "Dự án"} 
              size="small" 
              variant="outlined"
              sx={{ mr: 1 }}
            />
          </Tooltip>
        </Box>
      </CardContent>

      {task.dueDate && (
        <CardActions sx={{ justifyContent: 'flex-start', pt: 0, pb: 1, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon 
              fontSize="small" 
              sx={{ mr: 0.5, color: isOverdue() ? 'error.main' : 'text.secondary' }}
            />
            <Typography 
              variant="caption" 
              sx={{ color: isOverdue() ? 'error.main' : 'text.secondary' }}
            >
              {isOverdue() ? 'Quá hạn: ' : 'Hạn chót: '}{formatDueDate(task.dueDate)}
            </Typography>
          </Box>
        </CardActions>
      )}

      {/* Menu Tùy chọn */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <PermissionGate permissions="Edit Task">
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Chỉnh sửa" />
          </MenuItem>
        </PermissionGate>
        
        <PermissionGate permissions="Delete Task">
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Xóa" primaryTypographyProps={{ color: 'error' }} />
          </MenuItem>
        </PermissionGate>
        
        <PermissionGate permissions="Change Task Status">
          {availableStatusTransitions.length > 0 && (
            <>
              <Divider />
              <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                Thay đổi trạng thái
              </Typography>
              
              {availableStatusTransitions.includes(TASK_STATUS.TODO) && (
                <MenuItem onClick={() => handleStatusChange(TASK_STATUS.TODO)}>
                  <ListItemIcon>
                    <ArrowBackIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText primary={`Chuyển về ${STATUS_LABELS[TASK_STATUS.TODO]}`} />
                </MenuItem>
              )}
              
              {availableStatusTransitions.includes(TASK_STATUS.IN_PROGRESS) && (
                <MenuItem onClick={() => handleStatusChange(TASK_STATUS.IN_PROGRESS)}>
                  <ListItemIcon>
                    <ArrowForwardIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={`Chuyển sang ${STATUS_LABELS[TASK_STATUS.IN_PROGRESS]}`} />
                </MenuItem>
              )}
              
              {availableStatusTransitions.includes(TASK_STATUS.REVIEW) && (
                <MenuItem onClick={() => handleStatusChange(TASK_STATUS.REVIEW)}>
                  <ListItemIcon>
                    <DescriptionIcon fontSize="small" color="info" />
                  </ListItemIcon>
                  <ListItemText primary={`Chuyển sang ${STATUS_LABELS[TASK_STATUS.REVIEW]}`} />
                </MenuItem>
              )}
              
              {availableStatusTransitions.includes(TASK_STATUS.DONE) && (
                <MenuItem onClick={() => handleStatusChange(TASK_STATUS.DONE)}>
                  <ListItemIcon>
                    <CheckCircleIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary={`Hoàn thành (${STATUS_LABELS[TASK_STATUS.DONE]})`} />
                </MenuItem>
              )}
            </>
          )}
        </PermissionGate>
      </Menu>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa công việc "{task.title}" không? 
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={loading}
            variant="contained"
          >
            {loading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TaskCard; 
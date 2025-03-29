import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Divider
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MDBox from '../../../components/MDBox';
import MDTypography from '../../../components/MDTypography';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'done':
      return 'success';
    case 'in progress':
      return 'info';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

const RecentTasksList = ({ tasks = [] }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Tasks" />
        <CardContent>
          <MDBox display="flex" justifyContent="center" alignItems="center" height="200px">
            <MDTypography variant="body2" color="text">
              No recent tasks found
            </MDTypography>
          </MDBox>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Recent Tasks" />
      <Divider />
      <CardContent sx={{ padding: 0 }}>
        <List>
          {tasks.map((task, index) => (
            <React.Fragment key={task.id || index}>
              <ListItem alignItems="flex-start" sx={{ px: 3, py: 1.5 }}>
                <ListItemIcon>
                  <AssignmentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MDTypography variant="body1" fontWeight="medium">
                      {task.title}
                    </MDTypography>
                  }
                  secondary={
                    <Box mt={0.5}>
                      <MDTypography variant="caption" color="text" component="span">
                        Due: {formatDate(task.dueDate)}
                      </MDTypography>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Chip
                          label={task.status}
                          color={getStatusColor(task.status)}
                          size="small"
                          variant="filled"
                          sx={{ height: 24, minWidth: 80 }}
                        />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < tasks.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

RecentTasksList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      status: PropTypes.string,
      dueDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    })
  )
};

export default RecentTasksList; 
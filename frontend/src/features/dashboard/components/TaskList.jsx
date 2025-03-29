import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as TodoIcon,
  PlayCircle as InProgressIcon,
} from '@mui/icons-material';

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'done':
      return <DoneIcon color="success" />;
    case 'in progress':
      return <InProgressIcon color="info" />;
    default:
      return <TodoIcon color="action" />;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'done':
      return 'success';
    case 'in progress':
      return 'info';
    default:
      return 'default';
  }
};

const TaskList = ({ tasks, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Recent Tasks" />
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Tasks" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No tasks found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Recent Tasks" />
      <CardContent>
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <ListItemIcon>
                {getStatusIcon(task.status)}
              </ListItemIcon>
              <ListItemText
                primary={task.title}
                secondary={
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={task.status}
                      size="small"
                      color={getStatusColor(task.status)}
                      variant="outlined"
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default React.memo(TaskList); 
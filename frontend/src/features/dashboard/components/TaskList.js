import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Link,
} from '@mui/material';
import { PlayArrow as PlayIcon, Timer as TimerIcon } from '@mui/icons-material';

const TaskList = ({ tasks }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: 2,
        padding: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h6" mb={3}>
        Task
      </Typography>
      {tasks.map((task) => (
        <Box
          key={task.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
          }}
        >
          <IconButton
            size="small"
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              marginRight: 2,
            }}
          >
            <PlayIcon fontSize="small" />
          </IconButton>

          <Box flex={1}>
            <Box display="flex" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center" mr={2}>
                <TimerIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {task.startTime}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {task.commentsCount} comments
              </Typography>
            </Box>

            <Typography variant="subtitle1" mb={1}>
              {task.title}
            </Typography>

            <Box display="flex" alignItems="center">
              <Box flex={1} mr={2}>
                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {task.progress}% complete
              </Typography>
            </Box>

            {task.url && (
              <Link
                href={task.url}
                target="_blank"
                rel="noopener"
                sx={{
                  display: 'block',
                  mt: 1,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                }}
              >
                {task.url}
              </Link>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default TaskList; 
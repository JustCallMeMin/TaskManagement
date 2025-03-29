import React from 'react';
import { Box, Typography, Button, Avatar, AvatarGroup } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

const Schedule = () => {
  const schedules = [
    {
      id: 1,
      title: "Project Discovery Call",
      time: "28:35",
      participants: [
        "/avatars/1.jpg",
        "/avatars/2.jpg",
        "/avatars/3.jpg"
      ]
    }
  ];

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: 2,
        padding: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Today's Schedule</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CalendarIcon />}
          sx={{ borderRadius: 2 }}
        >
          + Invite
        </Button>
      </Box>

      {schedules.map((schedule) => (
        <Box
          key={schedule.id}
          sx={{
            backgroundColor: '#F0F3FF',
            borderRadius: 2,
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {schedule.title}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {schedule.time}
              </Typography>
            </Box>
          </Box>
          <AvatarGroup max={3}>
            {schedule.participants.map((avatar, index) => (
              <Avatar
                key={index}
                src={avatar}
                sx={{ width: 32, height: 32 }}
              />
            ))}
          </AvatarGroup>
        </Box>
      ))}
    </Box>
  );
};

export default Schedule; 
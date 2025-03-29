import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

const Messages = () => {
  const messages = [
    {
      id: 1,
      sender: "Cris Morich",
      avatar: "/avatars/1.jpg",
      message: "Hi Angelina! How are You?",
    },
    {
      id: 2,
      sender: "Charmie",
      avatar: "/avatars/2.jpg",
      message: "Do you need that design?",
    },
    {
      id: 3,
      sender: "Jason Mandala",
      avatar: "/avatars/3.jpg",
      message: "What is the price of hourly...",
    },
    {
      id: 4,
      sender: "Charlie Chu",
      avatar: "/avatars/4.jpg",
      message: "Awsome design!!",
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
      <Typography variant="h6" mb={3}>
        Messages
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: 1,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              },
            }}
          >
            <Avatar src={message.avatar} />
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                {message.sender}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {message.message}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Messages; 
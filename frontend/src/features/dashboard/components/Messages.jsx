import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';

// Mock data - replace with real data from API
const messages = [
  {
    id: 1,
    sender: 'John Doe',
    avatar: 'JD',
    message: 'Updated the project timeline',
    time: '5 min ago',
  },
  {
    id: 2,
    sender: 'Alice Smith',
    avatar: 'AS',
    message: 'Added new task: Database optimization',
    time: '30 min ago',
  },
  {
    id: 3,
    sender: 'Bob Johnson',
    avatar: 'BJ',
    message: 'Completed the frontend design',
    time: '1 hour ago',
  },
];

const Messages = () => {
  return (
    <Card>
      <CardHeader 
        title="Recent Messages"
        subheader="Latest updates from your team"
      />
      <Divider />
      <CardContent>
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {message.avatar}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      {message.sender}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {message.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {message.time}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < messages.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default Messages; 
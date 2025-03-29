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
  Divider,
} from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

// Mock data - replace with real data from API
const scheduleItems = [
  {
    id: 1,
    title: 'Team Meeting',
    time: '10:00 AM',
    type: 'meeting',
  },
  {
    id: 2,
    title: 'Project Review',
    time: '2:00 PM',
    type: 'review',
  },
  {
    id: 3,
    title: 'Client Call',
    time: '4:30 PM',
    type: 'call',
  },
];

const Schedule = () => {
  return (
    <Card>
      <CardHeader 
        title="Today's Schedule"
        subheader={new Date().toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      />
      <Divider />
      <CardContent>
        <List>
          {scheduleItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" sx={{ color: 'text.secondary' }}>
                      {item.time}
                    </Box>
                  }
                />
              </ListItem>
              {index < scheduleItems.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default Schedule; 
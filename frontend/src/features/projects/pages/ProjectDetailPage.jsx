import React from 'react';
import { Box, Container } from '@mui/material';
import ProjectDetail from '../components/ProjectDetail';

const ProjectDetailPage = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <ProjectDetail />
      </Box>
    </Container>
  );
};

export default ProjectDetailPage; 
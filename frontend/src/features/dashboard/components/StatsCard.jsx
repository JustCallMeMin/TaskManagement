import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Box, Divider } from '@mui/material';
import MDBox from '../../../components/MDBox';
import MDTypography from '../../../components/MDTypography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * A card component for displaying statistics like "Weekly Tasks" and "Monthly Projects"
 */
const StatsCard = ({ title, count, subtitle, date, color = 'success' }) => {
  // Ensure count is rendered as a number
  const displayCount = typeof count === 'number' ? count : 0;
  
  return (
    <Card sx={{ height: '100%' }}>
      <MDBox p={3}>
        <MDBox display="flex" flexDirection="column">
          <MDBox
            mb={1}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <MDTypography
              variant="h6"
              fontWeight="medium"
              textTransform="capitalize"
            >
              {title}
            </MDTypography>
          </MDBox>
          
          <MDBox mb={1}>
            <MDTypography variant="h3" fontWeight="bold">
              {displayCount}
            </MDTypography>
          </MDBox>
          
          <MDTypography variant="caption" color="text">
            {subtitle}
          </MDTypography>
          
          <Divider sx={{ my: 1.5 }} />
          
          <MDBox display="flex" alignItems="center">
            <MDBox display="flex" alignItems="center" lineHeight={1} sx={{ mt: 0.15, mr: 0.5 }}>
              <AccessTimeIcon fontSize="small" color="text" sx={{ mr: 0.5 }} />
            </MDBox>
            <MDTypography variant="caption" color="text" fontWeight="light">
              {date}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'info', 'success', 'warning', 'error', 'dark']),
};

export default StatsCard; 
import React from "react";
import PropTypes from "prop-types";
import { Card, Icon } from "@mui/material";
import MDBox from "../../../MDBox";
import MDTypography from "../../../MDTypography";

// Import some specific icons as fallbacks
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WorkIcon from '@mui/icons-material/Work';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function ComplexStatisticsCard({ 
  color = "info", 
  title, 
  count, 
  percentage = { color: "success", amount: "", label: "" }, 
  icon 
}) {
  // Function to safely render the icon
  const renderIcon = () => {
    try {
      // For string-based Material icons
      if (typeof icon === 'string') {
        // Map common icon strings to specific components for safety
        const iconMap = {
          'task_alt': <TaskAltIcon />,
          'workspaces': <WorkIcon />,
          'done_all': <DoneAllIcon />,
          'trending_up': <TrendingUpIcon />
        };
        
        // If we have a direct mapping, use it
        if (iconMap[icon]) {
          return iconMap[icon];
        }
        
        // Otherwise try to use the icon string with Material-UI's Icon component
        return <Icon fontSize="medium" color="inherit">{icon}</Icon>;
      }
      
      // For component-based icons (React components)
      if (React.isValidElement(icon)) {
        return icon;
      }
      
      // Default fallback
      return <Icon fontSize="medium" color="inherit">dashboard</Icon>;
    } catch (error) {
      console.error("Error rendering icon:", error);
      // Ultimate fallback
      return <Icon fontSize="medium" color="inherit">dashboard</Icon>;
    }
  };

  return (
    <Card sx={{ 
      height: "100%", 
      width: "100%", 
      borderRadius: 0,
      bgcolor: "white",
      boxShadow: "none" 
    }}>
      <MDBox display="flex" justifyContent="space-between" pt={1} px={2}>
        <MDBox
          variant="gradient"
          bgColor={color}
          color={color === "light" ? "dark" : "white"}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
          mt={-3}
        >
          {renderIcon()}
        </MDBox>
        <MDBox textAlign="right" lineHeight={1.25}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {title}
          </MDTypography>
          <MDTypography variant="h4">{count}</MDTypography>
        </MDBox>
      </MDBox>
      <MDBox pb={2} px={2}>
        <MDTypography component="p" variant="button" color="text" display="flex">
          <MDTypography
            component="span"
            variant="button"
            fontWeight="bold"
            color={percentage.color}
          >
            {percentage.amount}
          </MDTypography>
          &nbsp;{percentage.label}
        </MDTypography>
      </MDBox>
    </Card>
  );
}

// Typechecking props for the ComplexStatisticsCard
ComplexStatisticsCard.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "light", "dark"]),
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark", "white"]),
    amount: PropTypes.string,
    label: PropTypes.string,
  }),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

export default ComplexStatisticsCard; 
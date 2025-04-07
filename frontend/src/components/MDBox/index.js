/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const MDBox = forwardRef(
  ({ variant, bgColor, color, opacity, borderRadius, shadow, coloredShadow, ...rest }, ref) => {
    // Background color value
    let backgroundColor = bgColor;
    
    // Opacity value
    let backgroundOpacity = opacity;

    // Border radius value
    let borderRadiusValue = borderRadius;
    
    // Box shadow value
    let boxShadow;

    // Set box shadow when needed
    if (shadow) {
      boxShadow = `0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)`;
    }
    
    // Set colored shadow when provided (removing it from props passed to Box)
    if (coloredShadow) {
      // Map of shadow colors
      const shadowColors = {
        primary: "0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(26, 115, 232, 0.4)",
        secondary: "0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(156, 39, 176, 0.4)",
        info: "0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(0, 188, 212, 0.4)",
        success: "0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76, 175, 80, 0.4)",
        warning: "0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(255, 152, 0, 0.4)",
        error: "0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(244, 67, 54, 0.4)",
        light: "0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(224, 224, 224, 0.4)",
        dark: "0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(52, 71, 103, 0.4)",
      };
      
      boxShadow = shadowColors[coloredShadow] || boxShadow;
    }

    return (
      <Box
        ref={ref}
        sx={{
          backgroundColor,
          backgroundOpacity,
          borderRadius: borderRadiusValue,
          boxShadow,
          color,
        }}
        {...rest}
      />
    );
  }
);

// Setting default values for the props of MDBox
MDBox.defaultProps = {
  variant: 'contained',
  bgColor: 'transparent',
  color: 'dark',
  opacity: 1,
  borderRadius: 'none',
  shadow: false,
  coloredShadow: null,
};

// Typechecking props for the MDBox
MDBox.propTypes = {
  variant: PropTypes.oneOf(['contained', 'gradient']),
  bgColor: PropTypes.string,
  color: PropTypes.string,
  opacity: PropTypes.number,
  borderRadius: PropTypes.string,
  shadow: PropTypes.bool,
  coloredShadow: PropTypes.oneOf(['primary', 'secondary', 'info', 'success', 'warning', 'error', 'light', 'dark', null]),
};

export default MDBox;

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
  ({ variant, bgColor, color, opacity, borderRadius, shadow, ...rest }, ref) => {
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
};

// Typechecking props for the MDBox
MDBox.propTypes = {
  variant: PropTypes.oneOf(['contained', 'gradient']),
  bgColor: PropTypes.string,
  color: PropTypes.string,
  opacity: PropTypes.number,
  borderRadius: PropTypes.string,
  shadow: PropTypes.bool,
};

export default MDBox;

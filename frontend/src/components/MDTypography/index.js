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
import { Typography } from '@mui/material';

const MDTypography = forwardRef(
  (
    {
      color,
      fontWeight,
      textTransform,
      verticalAlign,
      textGradient,
      opacity,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <Typography
        ref={ref}
        sx={{
          color,
          fontWeight,
          textTransform,
          verticalAlign,
          opacity,
          background: textGradient ? 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' : 'none',
          backgroundClip: textGradient ? 'text' : 'none',
          WebkitBackgroundClip: textGradient ? 'text' : 'none',
          WebkitTextFillColor: textGradient ? 'transparent' : 'inherit',
        }}
        {...rest}
      >
        {children}
      </Typography>
    );
  }
);

// Setting default values for the props of MDTypography
MDTypography.defaultProps = {
  color: 'dark',
  fontWeight: 'regular',
  textTransform: 'none',
  verticalAlign: 'unset',
  textGradient: false,
  opacity: 1,
};

// Typechecking props for the MDTypography
MDTypography.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'info',
    'success',
    'warning',
    'error',
    'light',
    'dark',
    'text',
    'white',
  ]),
  fontWeight: PropTypes.oneOf(['light', 'regular', 'medium', 'bold']),
  textTransform: PropTypes.oneOf(['none', 'capitalize', 'uppercase', 'lowercase']),
  verticalAlign: PropTypes.oneOf([
    'unset',
    'baseline',
    'sub',
    'super',
    'text-top',
    'text-bottom',
    'middle',
    'top',
    'bottom',
  ]),
  textGradient: PropTypes.bool,
  opacity: PropTypes.number,
  children: PropTypes.node.isRequired,
};

export default MDTypography;

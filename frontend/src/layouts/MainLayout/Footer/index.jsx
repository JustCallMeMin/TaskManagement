import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import './Footer.css';

const Footer = () => {
  return (
    <Box className="footer">
      <div className="footer-content">
        <Typography variant="caption" className="copyright">
          © 2024 TaskFlow. All rights reserved.
        </Typography>
        <div className="footer-links">
          <Link href="#" className="footer-link">Help</Link>
          <Link href="#" className="footer-link">Privacy</Link>
          <Link href="#" className="footer-link">Terms</Link>
        </div>
        <Typography variant="caption" className="version">
          v1.0.0
        </Typography>
      </div>
    </Box>
  );
};

export default Footer; 
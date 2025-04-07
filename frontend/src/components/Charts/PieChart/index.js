import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Divider } from "@mui/material";
import MDBox from "../../MDBox";
import MDTypography from "../../MDTypography";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function PieChart({ title, description = "", date, data, colors = null }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  
  // Default colors if not provided
  const defaultColors = ["#1976d2", "#49a3f1", "#66BB6A", "#FFA726", "#EF5350", "#9C27B0", "#FF9800", "#795548"];
  
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Generate pie slices
  const generatePieSlices = () => {
    let currentAngle = 0;
    
    return data.map((item, index) => {
      // Calculate slice angles
      const slicePercentage = total === 0 ? 0 : item.value / total;
      const sliceAngle = slicePercentage * 360;
      
      // SVG angles must be in range [0, 360]
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;
      
      // SVG arc requires coordinates
      const startX = Math.cos((startAngle - 90) * (Math.PI / 180)) * 80 + 100;
      const startY = Math.sin((startAngle - 90) * (Math.PI / 180)) * 80 + 100;
      const endX = Math.cos((endAngle - 90) * (Math.PI / 180)) * 80 + 100;
      const endY = Math.sin((endAngle - 90) * (Math.PI / 180)) * 80 + 100;
      
      // For the text label position
      const midAngle = startAngle + (sliceAngle / 2);
      const labelX = Math.cos((midAngle - 90) * (Math.PI / 180)) * 50 + 100;
      const labelY = Math.sin((midAngle - 90) * (Math.PI / 180)) * 50 + 100;
      
      // For tooltip positioning
      const tooltipX = Math.cos((midAngle - 90) * (Math.PI / 180)) * 40 + 100;
      const tooltipY = Math.sin((midAngle - 90) * (Math.PI / 180)) * 40 + 100;
      
      // Large arc flag is 1 if the angle is > 180 degrees
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      
      // Use provided colors or default colors
      const sliceColor = colors && colors[index] ? colors[index] : defaultColors[index % defaultColors.length];
      
      return {
        path: `M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`,
        color: sliceColor,
        label: item.label,
        value: item.value,
        percentage: (slicePercentage * 100).toFixed(1),
        labelX,
        labelY,
        tooltipX,
        tooltipY,
        index
      };
    });
  };

  const slices = generatePieSlices();

  return (
    <Card sx={{ height: "100%", width: "100%", boxShadow: "none", borderRadius: 0 }}>
      <MDBox padding="0" height="100%">
        <MDBox
          variant="gradient"
          borderRadius="lg"
          coloredShadow="info"
          py={1}
          pr={2}
          pl={2}
          pt={3}
          mt={0}
          height="16rem"
          className="MuiBox-root css-i726e9"
          sx={{ 
            background: 'linear-gradient(195deg, rgba(73, 163, 241, 0.6), rgba(26, 115, 232, 0.9))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {(data.length === 0 || total === 0) ? (
            <MDBox 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              flexDirection="column"
              flexGrow={1}
            >
              <MDTypography color="white" variant="h5" fontWeight="medium">
                No Data
              </MDTypography>
            </MDBox>
          ) : (
            <MDBox 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              height="12rem" 
              width="100%" 
              sx={{ overflow: "hidden" }}
            >
              <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="none">
                {/* Full background */}
                <rect x="0" y="0" width="200" height="200" fill="rgba(73, 163, 241, 0)" />
                
                {/* Render pie slices only if we have data */}
                {total > 0 && slices.map((slice) => (
                  <g 
                    key={`slice-${slice.index}`}
                    onMouseEnter={() => setHoveredSlice(slice.index)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    <path
                      d={slice.path}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth="1"
                      opacity={hoveredSlice === slice.index ? 1 : 0.8}
                      filter={hoveredSlice === slice.index ? "drop-shadow(0px 0px 6px rgba(255, 255, 255, 0.7))" : "none"}
                    />
                    
                    {/* Only show percentage label if slice is big enough */}
                    {parseFloat(slice.percentage) > 5 && (
                      <text
                        x={slice.labelX}
                        y={slice.labelY}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {slice.percentage}%
                      </text>
                    )}
                    
                    {/* Tooltip on hover */}
                    {hoveredSlice === slice.index && (
                      <g>
                        <rect
                          x={slice.tooltipX - 40}
                          y={slice.tooltipY - 40}
                          width="80"
                          height="40"
                          rx="5"
                          fill="white"
                          fillOpacity="0.95"
                        />
                        <text
                          x={slice.tooltipX}
                          y={slice.tooltipY - 25}
                          textAnchor="middle"
                          fill="#344767"
                          fontSize="11"
                        >
                          {slice.label}
                        </text>
                        <text
                          x={slice.tooltipX}
                          y={slice.tooltipY - 10}
                          textAnchor="middle"
                          fill="#344767"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {slice.value} ({slice.percentage}%)
                        </text>
                      </g>
                    )}
                  </g>
                ))}
                
                {/* Center circle (donut style) - only show if we have data */}
                {total > 0 && (
                  <>
                    <circle
                      cx="100"
                      cy="100"
                      r="40"
                      fill="rgba(255, 255, 255, 0.1)"
                      stroke="white"
                      strokeWidth="1"
                    />
                    
                    {/* Total in center */}
                    <text
                      x="100"
                      y="95"
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                    >
                      Total
                    </text>
                    <text
                      x="100"
                      y="115"
                      textAnchor="middle"
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {total}
                    </text>
                  </>
                )}
              </svg>
            </MDBox>
          )}
        </MDBox>
        <MDBox pt={3} pb={1} px={1}>
          <MDTypography variant="button" textTransform="capitalize" fontWeight="medium">
            {title}
          </MDTypography>
          <Divider />
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
}

// Typechecking props for the PieChart
PieChart.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })
  ).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string)
};

export default PieChart; 
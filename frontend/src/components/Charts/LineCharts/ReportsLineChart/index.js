import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Card, Divider } from "@mui/material";
import MDBox from "../../../MDBox";
import MDTypography from "../../../MDTypography";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function ReportsLineChart({ color = "info", title, description = "", date, chart }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Convert chart data for rendering
  const chartData = useMemo(() => {
    const datasets = chart?.datasets?.data || [];
    const labels = chart?.labels || [];
    
    // Find the maximum value to normalize the points
    const maxValue = Math.max(...datasets, 1);
    
    return { datasets, labels, maxValue };
  }, [chart]);

  const colors = {
    primary: "#1976d2",
    info: "#49a3f1",
    success: "#66BB6A",
    dark: "#344767",
    warning: "#FFA726",
    error: "#EF5350",
  };

  // Chart dimensions - full width and height
  const height = 190;
  const width = 600;
  const padding = { top: 40, bottom: 50, left: 0, right: 0 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Convert data points to SVG coordinates
  const getPoints = () => {
    if (chartData.datasets.length <= 1) {
      // Handle case with insufficient data points
      return chartData.datasets.length === 1 
        ? [{ x: width / 2, y: height / 2, value: chartData.datasets[0], label: chartData.labels[0] || "" }]
        : [];
    }
    
    // Adjust spacing to match the monthly chart (more centered)
    const dataPoints = chartData.datasets.map((value, index) => {
      // Create more padding on sides to match monthly chart
      const leftPadding = 50;
      const rightPadding = 50;
      const usableWidth = width - leftPadding - rightPadding;
      
      const x = leftPadding + (index * (usableWidth / (chartData.datasets.length - 1)));
      const normalizedValue = value / chartData.maxValue;
      const y = height - padding.bottom - (normalizedValue * chartHeight);
      return { x, y, value, label: chartData.labels[index] };
    });
    return dataPoints;
  };

  const points = getPoints();

  // Create SVG path for line
  const createLinePath = () => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x},${points[0].y} L ${points[0].x + 1},${points[0].y}`;
    
    return points.reduce((path, point, i) => {
      const command = i === 0 ? "M" : "L";
      return `${path} ${command} ${point.x},${point.y}`;
    }, "");
  };

  // Create SVG path for area fill (gradient)
  const createAreaPath = () => {
    if (points.length === 0) return "";
    if (points.length === 1) {
      const point = points[0];
      return `M ${point.x - 20},${height - padding.bottom} L ${point.x - 20},${point.y} L ${point.x + 20},${point.y} L ${point.x + 20},${height - padding.bottom} Z`;
    }
    
    const linePath = points.reduce((path, point, i) => {
      const command = i === 0 ? "M" : "L";
      return `${path} ${command} ${point.x},${point.y}`;
    }, "");
    
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    
    return `${linePath} L ${lastPoint.x},${height - padding.bottom} L ${firstPoint.x},${height - padding.bottom} Z`;
  };

  return (
    <Card sx={{ height: "100%", width: "100%", boxShadow: "none", borderRadius: 0 }}>
      <MDBox padding="0" height="100%">
        <MDBox
          variant="gradient"
          bgColor={color}
          borderRadius="lg"
          coloredShadow={color}
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
          {points.length === 0 ? (
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
              <svg 
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${width} ${height}`} 
                preserveAspectRatio="xMidYMid meet"
                style={{ 
                  maxHeight: "12rem",
                  marginTop: "1rem"
                }}
              >
                {/* Background gradient */}
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Full background */}
                <rect x="0" y="0" width={width} height={height} fill="rgba(73, 163, 241, 0)" />

                {/* Day dots and labels for "No Data" case */}
                {points.length === 0 && (
                  <>
                    <rect
                      x="0"
                      y={padding.top}
                      width={width}
                      height={chartHeight}
                      fill="rgba(255, 255, 255, 0.05)"
                      rx="4"
                    />

                    {/* Timeline with dots for days */}
                    <line 
                      x1="50" 
                      y1={height / 2} 
                      x2={width - 50} 
                      y2={height / 2} 
                      stroke="rgba(255, 255, 255, 0.3)" 
                      strokeWidth="1.5"
                    />
                    
                    {/* Day dots and labels */}
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const x = 50 + (i * ((width - 100) / 6));
                      return (
                        <g key={`day-${i}`}>
                          <circle
                            cx={x}
                            cy={height / 2}
                            r="5"
                            fill="white"
                          />
                          <text
                            x={x}
                            y={height - 10}
                            textAnchor="middle"
                            fill="rgba(255, 255, 255, 0.7)"
                            fontSize="12"
                          >
                            {day}
                          </text>
                        </g>
                      );
                    })}
                    
                    <text
                      x={width / 2}
                      y={height / 2 - 50}
                      textAnchor="middle"
                      fill="white"
                      fontSize="16"
                      fontWeight="medium"
                    >
                      No Data Available
                    </text>
                    <text
                      x={width / 2}
                      y={height / 2 - 25}
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.7)"
                      fontSize="12"
                    >
                      Add tasks to see weekly activity
                    </text>
                  </>
                )}
                
                {points.length > 0 && (
                  <>
                    {/* Grid lines - Horizontal */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line 
                        key={`grid-h-${i}`} 
                        x1="0" 
                        y1={padding.top + i * (chartHeight / 4)} 
                        x2={width} 
                        y2={padding.top + i * (chartHeight / 4)} 
                        stroke="rgba(255, 255, 255, 0.1)" 
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Base timeline */}
                    <line 
                      x1="50" 
                      y1={height - padding.bottom} 
                      x2={width - 50} 
                      y2={height - padding.bottom} 
                      stroke="rgba(255, 255, 255, 0.3)" 
                      strokeWidth="1.5"
                    />

                    {/* Grid lines - Vertical */}
                    {points.map((point, i) => (
                      <line 
                        key={`grid-v-${i}`} 
                        x1={point.x} 
                        y1={padding.top} 
                        x2={point.x} 
                        y2={height - padding.bottom} 
                        stroke="rgba(255, 255, 255, 0.1)" 
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Area under the line (gradient fill) */}
                    <path
                      d={createAreaPath()}
                      fill="url(#areaGradient)"
                    />
                    
                    {/* The line itself */}
                    <path
                      d={createLinePath()}
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Data points */}
                    {points.map((point, index) => (
                      <g key={`point-${index}`}>
                        {/* Outer circle (always visible) */}
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="white"
                          opacity="0.8"
                          onMouseEnter={() => setHoveredPoint(index)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        
                        {/* Inner circle (only on hover) */}
                        {hoveredPoint === index && (
                          <>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="8"
                              fill="white"
                              opacity="0.3"
                            />
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="2"
                              fill="white"
                            />
                          </>
                        )}
                        
                        {/* X-axis label */}
                        <text
                          x={point.x}
                          y={height - 10}
                          textAnchor="middle"
                          fill="rgba(255, 255, 255, 0.7)"
                          fontSize="10"
                        >
                          {point.label}
                        </text>
                        
                        {/* Tooltip on hover */}
                        {hoveredPoint === index && (
                          <g>
                            <rect
                              x={point.x - 30}
                              y={point.y - 40}
                              width="60"
                              height="30"
                              rx="5"
                              fill="white"
                              fillOpacity="0.95"
                            />
                            <text
                              x={point.x}
                              y={point.y - 20}
                              textAnchor="middle"
                              fill="#344767"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              {point.value}
                            </text>
                            <text
                              x={point.x}
                              y={point.y - 33}
                              textAnchor="middle"
                              fill="#344767"
                              fontSize="10"
                            >
                              {point.label}
                            </text>
                          </g>
                        )}
                      </g>
                    ))}
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

// Typechecking props for the ReportsLineChart
ReportsLineChart.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
  chart: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.array, PropTypes.object])).isRequired,
};

export default ReportsLineChart; 
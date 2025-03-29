import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Card, Divider } from "@mui/material";
import MDBox from "../../../MDBox";
import MDTypography from "../../../MDTypography";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function ReportsLineChart({ color, title, description, date, chart }) {
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

  const lineColor = colors[color] || colors.info;

  // Chart dimensions - full width and height
  const height = 190;
  const width = 600;
  const padding = { top: 40, bottom: 40, left: 20, right: 20 };
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
    
    const dataPoints = chartData.datasets.map((value, index) => {
      const x = padding.left + (index * (chartWidth / (chartData.datasets.length - 1)));
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
    <Card sx={{ height: "100%", width: "100%" }}>
      <MDBox padding="1rem">
        <MDBox
          variant="gradient"
          bgColor={color}
          borderRadius="lg"
          coloredShadow={color}
          py={2}
          mt={-5}
          height="16rem"
          sx={{
            backgroundImage: 'linear-gradient(195deg, rgba(73, 163, 241, 0.6), rgba(26, 115, 232, 0.9))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%'
          }}
        >
          <MDBox px={2} pt={1} display="flex" justifyContent="space-between" alignItems="center">
            <MDBox color="white" p={1}>
              <MDTypography variant="h6" fontWeight="medium" color="white">
                {title}
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox px={0} display="flex" alignItems="center" justifyContent="center" height="12rem">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              {/* Background gradient */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* No data case */}
              {points.length === 0 && (
                <text
                  x={width / 2}
                  y={height / 2}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="14"
                >
                  No Data Available
                </text>
              )}
              
              {points.length > 0 && (
                <>
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line 
                      key={`grid-${i}`} 
                      x1={padding.left} 
                      y1={padding.top + i * (chartHeight / 4)} 
                      x2={width - padding.right} 
                      y2={padding.top + i * (chartHeight / 4)} 
                      stroke="rgba(255, 255, 255, 0.1)" 
                      strokeDasharray="4 4"
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
        </MDBox>
        <MDBox pt={3} pb={1} px={1}>
          <MDTypography variant="button" textTransform="capitalize" fontWeight="medium">
            {description}
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

// Setting default values for the props of ReportsLineChart
ReportsLineChart.defaultProps = {
  color: "info",
  description: "",
};

// Typechecking props for the ReportsLineChart
ReportsLineChart.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
  chart: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.array, PropTypes.object])).isRequired,
};

export default ReportsLineChart; 
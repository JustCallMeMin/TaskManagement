import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Card, Divider } from "@mui/material";
import MDBox from "../../../MDBox";
import MDTypography from "../../../MDTypography";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function ReportsBarChart({ color = "dark", title, description = "", date, chart }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Convert chart data for rendering
  const chartData = useMemo(() => {
    const datasets = chart?.datasets?.data || [];
    const labels = chart?.labels || [];
    // Find the maximum value to normalize the bars
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

  const barColor = colors[color] || colors.info;

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
          {/* Removed title from here */}
          
          {chartData.datasets.length === 0 ? (
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
              <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Full background */}
                <rect x="0" y="0" width="600" height="200" fill="rgba(73, 163, 241, 0)" />
                
                {/* No data case */}
                {chartData.datasets.length === 0 && (
                  <>
                    <rect
                      x="0"
                      y="40"
                      width="600"
                      height="120"
                      fill="rgba(255, 255, 255, 0.05)"
                      rx="4"
                    />
                    <text
                      x="300"
                      y="90"
                      textAnchor="middle"
                      fill="white"
                      fontSize="16"
                      fontWeight="medium"
                    >
                      No Data Available
                    </text>
                    <text
                      x="300"
                      y="115"
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.7)"
                      fontSize="12"
                    >
                      Create projects to see monthly statistics
                    </text>
                  </>
                )}
                
                {chartData.datasets.length > 0 && (
                  <>
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line 
                        key={`grid-${i}`} 
                        x1="0" 
                        y1={40 + i * 30} 
                        x2="600" 
                        y2={40 + i * 30} 
                        stroke="rgba(255, 255, 255, 0.1)" 
                        strokeDasharray="4 4"
                      />
                    ))}
                    
                    {/* Bar chart */}
                    {chartData.datasets.map((value, index) => {
                      const barWidth = Math.min(40, 600 / chartData.datasets.length / 1.5);
                      const totalBars = chartData.datasets.length;
                      const spacing = (600 - (barWidth * totalBars)) / (totalBars + 1);
                      const x = (index * (barWidth + spacing)) + spacing;
                      const height = value === 0 ? 0 : (value / chartData.maxValue) * 120;
                      const y = 160 - height;
                      const label = chartData.labels[index] || '';

                      return (
                        <g 
                          key={`bar-${index}`}
                          onMouseEnter={() => setHoveredBar(index)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          {/* Bar */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={height}
                            rx={4}
                            fill="white"
                            fillOpacity={hoveredBar === index ? 1 : 0.8}
                            filter={hoveredBar === index ? "drop-shadow(0px 0px 6px rgba(255, 255, 255, 0.7))" : "none"}
                          />
                          
                          {/* X-axis label */}
                          <text
                            x={x + barWidth/2}
                            y={180}
                            textAnchor="middle"
                            fill="rgba(255, 255, 255, 0.7)"
                            fontSize="10"
                          >
                            {label}
                          </text>
                          
                          {/* Tooltip on hover */}
                          {hoveredBar === index && (
                            <g>
                              <rect
                                x={x - 10}
                                y={y - 40}
                                width={barWidth + 20}
                                height={30}
                                rx={5}
                                fill="white"
                                fillOpacity={0.95}
                              />
                              <text
                                x={x + barWidth/2}
                                y={y - 20}
                                textAnchor="middle"
                                fill="#344767"
                                fontSize="12"
                                fontWeight="bold"
                              >
                                {value}
                              </text>
                              <text
                                x={x + barWidth/2}
                                y={y - 33}
                                textAnchor="middle"
                                fill="#344767"
                                fontSize="10"
                              >
                                {label}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
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

// Typechecking props for the ReportsBarChart
ReportsBarChart.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
  chart: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.array, PropTypes.object])).isRequired,
};

export default ReportsBarChart; 
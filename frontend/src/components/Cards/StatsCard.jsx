import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, Box, Divider } from '@mui/material';
import MDBox from '../MDBox';
import MDTypography from '../MDTypography';
import DefaultLineChart from '../Charts/LineCharts/DefaultLineChart';

const StatsCard = ({ icon, title, value, trend, trendLabel, chartData }) => {
  // Ensure chart data is valid
  const safeChartData = useMemo(() => {
    if (!chartData || !chartData.datasets || !chartData.labels) {
      return {
        labels: ['', '', '', '', '', ''],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0],
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
          }
        ]
      };
    }
    return chartData;
  }, [chartData]);

  // Determine color based on trend value
  const trendColor = trend >= 0 ? 'success' : 'error';

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" pt={1} px={2}>
        <MDBox
          bgcolor="info"
          color="white"
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="4rem"
          height="4rem"
          mt={-3}
        >
          {icon}
        </MDBox>
        <MDBox textAlign="right" lineHeight={1.25}>
          <MDTypography variant="button" fontWeight="light" color="text">
            {title}
          </MDTypography>
          <MDTypography variant="h4">{value}</MDTypography>
        </MDBox>
      </MDBox>
      <Divider />
      <MDBox pt={1} pb={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography component="p" variant="button" color="text" display="flex">
          <MDTypography
            component="span"
            variant="button"
            fontWeight="bold"
            color={trendColor}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </MDTypography>
          &nbsp;{trendLabel}
        </MDTypography>
        <Box width="100px" height="32px">
          {safeChartData && safeChartData.labels && safeChartData.datasets && (
            <DefaultLineChart
              chart={{
                labels: safeChartData.labels,
                datasets: safeChartData.datasets,
              }}
              height="100%"
            />
          )}
        </Box>
      </MDBox>
    </Card>
  );
};

StatsCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.number.isRequired,
  trendLabel: PropTypes.string.isRequired,
  chartData: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.array,
  }),
};

StatsCard.defaultProps = {
  chartData: {
    labels: ['', '', '', '', '', ''],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
      }
    ]
  }
};

export default React.memo(StatsCard); 
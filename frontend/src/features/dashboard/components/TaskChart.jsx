import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, CardHeader, ToggleButton, ToggleButtonGroup } from '@mui/material';
import DefaultLineChart from '../../../components/Charts/LineCharts/DefaultLineChart';
import { defaultChartData } from '../utils/chartConfig';
import MDTypography from '../../../components/MDTypography';

const TaskChart = ({ data, onPeriodChange, currentPeriod = 'month', noData = false }) => {
  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      onPeriodChange?.(newPeriod);
    }
  };

  // Đảm bảo data luôn có định dạng đúng
  const safeData = useMemo(() => {
    if (!data || !data.datasets || !data.labels) {
      return defaultChartData;
    }
    return data;
  }, [data]);

  return (
    <Card>
      <CardHeader
        title="Task Completion Trend"
        action={
          <ToggleButtonGroup
            value={currentPeriod}
            exclusive
            onChange={handlePeriodChange}
            size="small"
            aria-label="Period selection"
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <CardContent>
        <Box height={300} width="100%" position="relative">
          {noData ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
              flexDirection="column"
            >
              <MDTypography variant="h6" color="text" gutterBottom>
                No task data available
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Complete some tasks to see your statistics
              </MDTypography>
            </Box>
          ) : (
            <DefaultLineChart
              height="100%"
              chart={{
                labels: safeData.labels || [],
                datasets: safeData.datasets || [],
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

TaskChart.defaultProps = {
  data: defaultChartData,
  currentPeriod: 'month',
  noData: false,
  onPeriodChange: () => {},
};

TaskChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.array,
  }),
  onPeriodChange: PropTypes.func,
  currentPeriod: PropTypes.oneOf(['week', 'month', 'year']),
  noData: PropTypes.bool,
};

export default React.memo(TaskChart); 
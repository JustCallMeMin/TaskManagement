import React, { useMemo, lazy } from 'react';
import PropTypes from 'prop-types';
import { Card } from '@mui/material';
import MDBox from '../../../MDBox';
import MDTypography from '../../../MDTypography';
import configs from './configs';

// Lazy load Chart.js to avoid dispatcher is null error
const Chart = React.lazy(() => import('chart.js/auto'));
const LineComponent = React.lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));

function DefaultLineChart({ title, description, height, chart }) {
  const fallbackContent = (
    <MDBox py={2} pr={2} pl={2} height={height} display="flex" justifyContent="center" alignItems="center">
      <MDTypography variant="caption" color="text">
        Loading chart...
      </MDTypography>
    </MDBox>
  );

  // Ensure chart data is valid
  const safeData = useMemo(() => {
    const validLabels = Array.isArray(chart?.labels) ? chart.labels : [];
    const validDatasets = Array.isArray(chart?.datasets) ? chart.datasets.map(dataset => ({
      ...dataset,
      tension: 0,
      pointRadius: 3,
      borderWidth: 4,
      backgroundColor: 'transparent',
      fill: true,
      pointBackgroundColor: '#1976d2',
      borderColor: '#1976d2',
      maxBarThickness: 6,
    })) : [];

    return { labels: validLabels, datasets: validDatasets };
  }, [chart]);

  const { data, options } = useMemo(() => 
    configs(safeData.labels || [], safeData.datasets || []), 
    [safeData]
  );

  // Protect against null data or dispatcher issues
  if (!safeData.labels || !safeData.datasets || safeData.labels.length === 0) {
    return (
      <MDBox py={2} pr={2} pl={2} height={height}>
        {title && <MDTypography variant="h6">{title}</MDTypography>}
        {description && (
          <MDTypography component="div" variant="button" color="text">
            {description}
          </MDTypography>
        )}
        <MDBox height={height} display="flex" alignItems="center" justifyContent="center">
          <MDTypography variant="caption" color="text">
            No data available
          </MDTypography>
        </MDBox>
      </MDBox>
    );
  }

  const renderChart = (
    <MDBox py={2} pr={2} pl={2}>
      {title || description ? (
        <MDBox mb={2}>
          {title && <MDTypography variant="h6">{title}</MDTypography>}
          {description && (
            <MDTypography component="div" variant="button" color="text">
              {description}
            </MDTypography>
          )}
        </MDBox>
      ) : null}
      <MDBox height={height}>
        <React.Suspense fallback={fallbackContent}>
          <LineComponent data={data} options={options} />
        </React.Suspense>
      </MDBox>
    </MDBox>
  );

  return title || description ? <Card>{renderChart}</Card> : renderChart;
}

// Setting default values for the props of DefaultLineChart
DefaultLineChart.defaultProps = {
  title: '',
  description: '',
  height: '19.125rem',
};

// Typechecking props for the DefaultLineChart
DefaultLineChart.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chart: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.array,
  }),
};

export default DefaultLineChart; 
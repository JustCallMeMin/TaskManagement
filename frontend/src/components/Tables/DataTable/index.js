import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  Paper,
  LinearProgress,
  Box,
} from "@mui/material";
import MDBox from "../../MDBox";
import MDTypography from "../../MDTypography";

function DataTable({
  table,
  isSorted = true,
  noEndBorder = false,
  entriesPerPage = { defaultValue: 10, entries: [5, 10, 15, 20, 25] },
  showTotalEntries = true,
}) {
  const { columns, rows } = table;
  
  const renderColumns = columns.map(({ Header, accessor, width }, key) => {
    return (
      <TableCell key={accessor} align={key === 0 ? "left" : "center"} width={width || "auto"}>
        <MDTypography variant="caption" fontWeight="medium" color="text">
          {Header}
        </MDTypography>
      </TableCell>
    );
  });

  const renderRows = rows.map((row, key) => {
    const rowKey = `row-${key}`;
    const tableRow = columns.map(({ accessor }, index) => {
      // Special handling for completion which might be an object with value and display properties
      if (accessor === 'completion' && typeof row[accessor] === 'object') {
        const completionData = row[accessor];
        return (
          <TableCell key={accessor} align={index === 0 ? "left" : "center"}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={completionData.value} 
                  color={completionData.value > 66 ? "success" : completionData.value > 33 ? "warning" : "error"}
                  sx={{ height: 8, borderRadius: 5 }}
                />
              </Box>
              <MDTypography variant="button" fontWeight="regular" color="text">
                {completionData.display}
              </MDTypography>
            </Box>
          </TableCell>
        );
      }
      
      return (
        <TableCell key={accessor} align={index === 0 ? "left" : "center"}>
          <MDTypography
            variant="button"
            fontWeight="regular"
            color="text"
            sx={{ display: "inline-block", width: "max-content" }}
          >
            {row[accessor]}
          </MDTypography>
        </TableCell>
      );
    });

    return <TableRow key={rowKey}>{tableRow}</TableRow>;
  });

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>{renderColumns}</TableRow>
        </TableHead>
        <TableBody>{renderRows}</TableBody>
      </Table>
    </TableContainer>
  );
}

// Typechecking props for the DataTable
DataTable.propTypes = {
  table: PropTypes.shape({
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        Header: PropTypes.string.isRequired,
        accessor: PropTypes.string.isRequired,
        width: PropTypes.string,
      })
    ).isRequired,
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  entriesPerPage: PropTypes.shape({
    defaultValue: PropTypes.number,
    entries: PropTypes.arrayOf(PropTypes.number),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
};

export default DataTable;
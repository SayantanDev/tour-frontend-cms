import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const DataTable = ({ rows, columns }) => {
  return (
    <div style={{ height: 550, width: "100%", overflow: "auto" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 15]}
        pagination
        autoHeight={false} // Prevents automatic resizing
      />
    </div>
  );
};

export default DataTable;

import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { updateQueries } from '../../api/queriesAPI';

const DataTable = ({ rows, columns,setEditableRowId }) => {
  const handleRowEdit = async (updatedRow) => {
    const id = updatedRow.id;
  
    let editObj = {};
  
    // Prepare update object with only changed fields
    if (updatedRow.name !== undefined) {
      editObj["guest_info.guest_name"] = updatedRow.name;
    }
    if (updatedRow.contact !== undefined) {
      editObj["guest_info.guest_phone"] = updatedRow.contact;
    }
    if (updatedRow.bookingDate !== undefined) {
      editObj["booking_date"] = updatedRow.bookingDate;
    }
    if (updatedRow.tourDate !== undefined) {
      editObj["travel_date"] = updatedRow.tourDate;
    }
    if (updatedRow.cost !== undefined) {
      editObj["cost"] = updatedRow.cost;
    }
  
    // try {
    //   const res = await updateQueries(id, editObj);
  
    //   // if (res.success === true) {
    //   //   // Optional: show toast or refresh
    //   // }
    // } catch (error) {
    // }
  
    return updatedRow; // This is important for DataGrid to finalize the edit
  };
  
  return (
    // <div >
     
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
        processRowUpdate={(newRow) => {
          setEditableRowId(null); // Stop editing after update
          handleRowEdit(newRow)
          return newRow;
        }}
        experimentalFeatures={{ newEditingApi: true }}
        editMode="row"
      />
    // </div>
  );
};

export default DataTable;

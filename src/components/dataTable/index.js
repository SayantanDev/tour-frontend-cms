import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const DataTable = ({ rows, columns,setEditableRowId }) => {
  const handleRowEdit = async (updatedRow) => {
    console.log("Updated row:", updatedRow);

    let editObj={}
    if (updatedRow.name) {
      editObj={"guest_info.guest_name":updatedRow.name}
      
    }
    else if(updatedRow.contact){
      editObj={"guest_info.guest_phone":updatedRow.contact}
    }
    else if(updatedRow.travel_date){
      editObj={"travel_date":updatedRow.travel_date}
    }
    else if(updatedRow.cost){
      editObj={"cost":updatedRow.cost}
      
    }
    
  console.log("Updated name:", editObj);


   
    // return updatedRow; // important to return the updated row
  };
  return (
    <div style={{ height: 550, width: "100%", overflow: "auto" }}>
      {/* <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 15]}
        processRowUpdate={handleRowEdit}
        experimentalFeatures={{ newEditingApi: true }}
        pagination
        autoHeight={false} // Prevents automatic resizing
      /> */}
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
        processRowUpdate={(newRow) => {
          setEditableRowId(null); // Stop editing after update
          handleRowEdit(newRow)
          // console.log("Updated row:", newRow);
          // Optionally call an API here
          return newRow;
        }}
        experimentalFeatures={{ newEditingApi: true }}
        editMode="row"
      />
    </div>
  );
};

export default DataTable;

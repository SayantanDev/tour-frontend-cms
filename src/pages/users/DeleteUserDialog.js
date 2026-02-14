import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const DeleteUserDialog = ({ open, handleDelUserSubmit, handleDelClose }) => {

    const handleDelCloseReason = (event, reason) => {
        if (reason && reason === "backdropClick") return;
        handleDelClose();
    }

    return (
        <Dialog open={open} onClose={handleDelCloseReason}>
            <DialogTitle>Delete User</DialogTitle>
            {/* <DialogTitle>{singleRowData.title}</DialogTitle> */}
            <DialogContent>
                <p>Are you sure you want to delete the user?</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDelUserSubmit} variant="contained" color="success">
                    Delete
                </Button>
                <Button onClick={handleDelClose} variant="contained" color="error">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteUserDialog;
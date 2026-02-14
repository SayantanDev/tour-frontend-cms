import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, FormHelperText } from '@mui/material';
import { useSelector } from 'react-redux';

const EditUserDialog = ({ open, userFormData, handleAddUserSubmit, handleChange, handleClose }) => {
    const fetchConfigData = useSelector((state) => state.config.configData);
    const handleCloseReason = (event, reason) => {
        if (reason && reason === "backdropClick") return;
        handleClose();
    }
    return (
        <Dialog open={open} onClose={handleCloseReason}>
            <DialogTitle>Update User</DialogTitle>
            {/* <DialogTitle>{singleRowData.title}</DialogTitle> */}
            <DialogContent>
                {/* ====================================== */}
                <form>
                    <TextField
                        label="Full Name"
                        name="fullName"
                        value={userFormData.fullName}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        margin="normal"
                        required
                    // error={userFormError.fullName}
                    // helperText={
                    //     userFormError.fullName
                    //     ? 'Enter Full name properly'
                    //     : ''
                    // }
                    />
                    {/* {userFormError.fullName && (
                        <FormHelperText size="small" sx={{ color: 'red', mt: '0' }}>
                            Enter Full name properly
                        </FormHelperText>
                    )} */}
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={userFormData.email}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                margin="normal"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Permission"
                                name="permission"
                                value={userFormData.permission}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                margin="normal"
                                required
                            >
                                {fetchConfigData.userPermission.map((usr, index) => (
                                    <MenuItem value={usr.name} key={index}>{usr.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Password"
                                name="password"
                                type="password"
                                value={userFormData.password}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                margin="normal"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={userFormData.confirmPassword}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                margin="normal"
                                required
                            />
                        </Grid>
                    </Grid>
                </form>
                {/* ====================================== */}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleAddUserSubmit} variant="contained" color="success">
                    Submit
                </Button>
                <Button onClick={handleClose} variant="contained" color="error">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditUserDialog;
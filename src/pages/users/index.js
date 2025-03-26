import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DataTable from '../../components/dataTable';
import AddUserDialog from './AddUserDialog';
import DeleteUserDialog from './DeleteUserDialog';
import { addUser, getAllUsers, deleteUser, updateUser } from '../../api/userAPI';

const Users = () => {
    const [userAdded, setUserAdded] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogDelOpen, setDialogDelOpen] = useState(false);
    const [delUserId, setDelUserId] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [userFormData, setUserFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        permission: ''
    });
    useEffect(() => {
        getAllUsers()
            .then((res) => {
                setAllUsers(res.data);
            })
            .catch((err) => {
                console.log('Get user error:', err);
            });
    }, [userAdded]);

    const handleAddUserClick = () => {
        setUserFormData({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            permission: ''
        });
        setDialogOpen(true);
    };
    const handleEditUserClick = (selectedRow) => {
        console.log("selectedRow", selectedRow);
        const data = {
            fullName: selectedRow.fullName,
            email: selectedRow.email,
            permission: selectedRow.permission,
            id: selectedRow._id
        }
        setUserFormData(selectedRow);
        setDialogOpen(true);
    };
    const handleDialogClose = () => {
        setDialogOpen(false);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserFormData({ ...userFormData, [name]: value });
    };
    const handleAddUserSubmit = (e) => {
        e.preventDefault();
        // console.log("userFormData submit : ", userFormData);
        if (userFormData.id) {
            console.log("update user:", userFormData);
            
            updateUser(userFormData,userFormData.id)
                .then((res) => {
                    setUserFormData({
                        fullName: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        permission: ''
                    });
                    setDialogOpen(false);
                    setUserAdded(true);
                })
                .catch((err) => {
                    console.log('Update user error:', err);
                    setUserFormData({
                        fullName: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        permission: ''
                    });
                    setDialogOpen(false);
                    setUserAdded(false);
                });

        } else {
            console.log("add user:", userFormData);
            
            addUser(userFormData)
                .then((res) => {
                    setUserFormData({
                        fullName: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        permission: ''
                    });
                    setDialogOpen(false);
                    setUserAdded(true);
                })
                .catch((err) => {
                    console.log('Add user error:', err);
                    setUserFormData({
                        fullName: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        permission: ''
                    });
                    setDialogOpen(false);
                    setUserAdded(false);
                });
        }

    };

    const handleDeleteUser = (userId) => {
        setDelUserId(userId);
        setDialogDelOpen(true);
    }
    const handleDelClose = () => {
        setDelUserId('');
        setDialogDelOpen(false);
    }
    const handleDelUserSubmit = () => {
        deleteUser(delUserId)
            .then((res) => {
                getAllUsers()
                    .then((res) => {
                        setAllUsers(res.data);
                    })
                    .catch((err) => {
                        console.log('Get user error:', err);
                    });
                setDelUserId('');
                setDialogDelOpen(false);
            })
            .catch((err) => {
                setDelUserId('');
                setDialogDelOpen(false);
            })
    }


    const columns = [
        { field: 'fullName', headerName: 'Name', width: 150, filterable: true },
        { field: 'email', headerName: 'Email', width: 150, filterable: true },
        { field: 'permission', headerName: 'Permission', width: 150, filterable: true },
        // { field: 'action', headerName: 'Action', width: 150 },
        {
            field: 'action',
            headerName: 'Action',
            width: 180,
            renderCell: (params) => (
                <div>
                    <IconButton
                        color="primary"
                        // onClick={() => handleEditUser(params.row.id)}
                        onClick={() => handleEditUserClick(params.row)}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(params.row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        }
    ];

    console.log('allUsers', allUsers);

    return (
        <Container>
            <Typography>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', '& button': { m: 1 } }}>
                <Button
                    variant="contained"
                    size="small"
                    color="warning"
                    sx={{ m: 1 }}
                    onClick={handleAddUserClick}
                >
                    Add User
                </Button>
            </Box>
            <DataTable rows={allUsers} columns={columns} />
            <AddUserDialog
                open={dialogOpen}
                userFormData={userFormData}
                // userFormError={userFormError}
                handleAddUserSubmit={handleAddUserSubmit}
                handleChange={handleChange}
                handleClose={handleDialogClose}
            />
            <DeleteUserDialog
                open={dialogDelOpen}
                handleDelUserSubmit={handleDelUserSubmit}
                handleDelClose={handleDelClose}
            />
        </Container>
    );
}

export default Users;
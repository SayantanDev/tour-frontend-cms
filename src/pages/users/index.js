import React, { useState, useEffect } from "react";
import {
  Container, Typography, Button, Box, IconButton, useMediaQuery, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DataTable from '../../components/dataTable';
import AddUserDialog from './AddUserDialog';
import DeleteUserDialog from './DeleteUserDialog';
import { addUser, getAllUsers, deleteUser, updateUser } from '../../api/userAPI';

const Users = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      .then((res) => setAllUsers(res.data))
      .catch((err) => console.error(err));
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
    setUserFormData(selectedRow);
    setDialogOpen(true);
  };

  const handleDialogClose = () => setDialogOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    const action = userFormData.id ? updateUser(userFormData, userFormData.id) : addUser(userFormData);

    action
      .then(() => {
        setUserFormData({ fullName: '', email: '', password: '', confirmPassword: '', permission: '' });
        setDialogOpen(false);
        setUserAdded(true);
      })
      .catch(() => {
        setUserFormData({ fullName: '', email: '', password: '', confirmPassword: '', permission: '' });
        setDialogOpen(false);
        setUserAdded(false);
      });
  };

  const handleDeleteUser = (userId) => {
    setDelUserId(userId);
    setDialogDelOpen(true);
  };

  const handleDelClose = () => {
    setDelUserId('');
    setDialogDelOpen(false);
  };

  const handleDelUserSubmit = () => {
    deleteUser(delUserId)
      .then(() => {
        getAllUsers().then((res) => setAllUsers(res.data));
        handleDelClose();
      })
      .catch(() => handleDelClose());
  };

  const columns = [
    { field: 'fullName', headerName: 'Name', width: 160, flex: 1 },
    { field: 'email', headerName: 'Email', width: 180, flex: 1 },
    { field: 'permission', headerName: 'Permission', width: 150, flex: 1 },
    {
      field: 'action',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => handleEditUserClick(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteUser(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ pt: 1, pb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'center'}
        gap={2}
        mb={3}
      >
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color="text.primary">
          Manage Users
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddUserClick}
          sx={{ width: isMobile ? '100%' : 'auto' }}
        >
          + Add User
        </Button>
      </Box>

      <DataTable rows={allUsers} columns={columns} />

      <AddUserDialog
        open={dialogOpen}
        userFormData={userFormData}
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
};

export default Users;

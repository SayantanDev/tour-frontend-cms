import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Drawer,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  createPermission,
  getAllPermission,
  deletePermission,
  updatePermission,
} from '../../api/permissionsAPI';

const AllPermissions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [allPermissions, setAllPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ module: '', value: [''] });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // ✅ Fetch all permissions
  const fetchPermissions = async () => {
    try {
      const res = await getAllPermission();
      const items = res?.items || [];
      console.log('permissions', items);
      
      setAllPermissions(items); 
      setFilteredPermissions(items);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load permissions',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // ✅ Search filter
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === '') {
      setFilteredPermissions(allPermissions);
    } else {
      const filtered = allPermissions.filter((p) =>
        p.module.toLowerCase().includes(term)
      );
      setFilteredPermissions(filtered);
    }
  };

  // ✅ Handle input changes
  const handleModuleChange = (e) => {
    setFormData((prev) => ({ ...prev, module: e.target.value }));
  };

  const handleValueChange = (index, newValue) => {
    const updated = [...formData.value];
    updated[index] = newValue;
    setFormData((prev) => ({ ...prev, value: updated }));
  };

  const handleAddValue = () => {
    setFormData((prev) => ({ ...prev, value: [...prev.value, ''] }));
  };

  const handleRemoveValue = (index) => {
    setFormData((prev) => ({
      ...prev,
      value: prev.value.filter((_, i) => i !== index),
    }));
  };

  // ✅ Handle open drawer for "Add"
  const handleAddPermission = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ module: '', value: [''] });
    setDrawerOpen(true);
  };

  // ✅ Handle open drawer for "Edit"
  const handleEditClick = (perm) => {
    setIsEditing(true);
    setCurrentId(perm._id);
    setFormData({
      module: perm.module,
      value: Array.isArray(perm.value) ? perm.value : [perm.value],
    });
    setDrawerOpen(true);
  };

  // ✅ Handle create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updatePermission(currentId, formData);
        setSnackbar({
          open: true,
          message: 'Permission updated successfully!',
          severity: 'success',
        });
      } else {
        const res = await createPermission(formData);
        setSnackbar({
          open: true,
          message: res.message || 'Permission created!',
          severity: 'success',
        });
      }
      setDrawerOpen(false);
      setFormData({ module: '', value: [''] });
      fetchPermissions();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || 'Failed to save permission',
        severity: 'error',
      });
    }
  };

  // ✅ Delete permission
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this permission?'))
      return;
    try {
      await deletePermission(id);
      setSnackbar({
        open: true,
        message: 'Permission deleted!',
        severity: 'success',
      });
      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete permission',
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 1, pb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'center'}
        gap={2}
        mb={3}
      >
        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold">
          Manage Permissions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddPermission}
        >
          + Add Permission
        </Button>
      </Box>

      {/* 🔍 Search Bar */}
      <TextField
        label="Search by Module Name"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        sx={{ mb: 3, maxWidth: 400 }}
      />

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Module</b>
              </TableCell>
              <TableCell>
                <b>Values</b>
              </TableCell>
              <TableCell align="right">
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPermissions.length > 0 ? (
              filteredPermissions.map((perm) => (
                <TableRow key={perm._id}>
                  <TableCell>{perm.module}</TableCell>
                  <TableCell>
                    {Array.isArray(perm.value)
                      ? perm.value.join(', ')
                      : perm.value}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleEditClick(perm)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(perm._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No permissions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Drawer Form */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: isMobile ? '100%' : 400, p: 3 },
        }}
      >
        <Typography variant="h6" mb={2}>
          {isEditing ? 'Update Permission' : 'Create Permission'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Module Name"
            name="module"
            value={formData.module}
            onChange={handleModuleChange}
            fullWidth
            margin="normal"
            required
          />

          {formData.value.map((val, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1} mt={1} mb={2}>
              <TextField
                label={`Value ${index + 1}`}
                value={val}
                onChange={(e) => handleValueChange(index, e.target.value)}
                fullWidth
                size="small"
                required
              />
              {formData.value.length > 1 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveValue(index)}
                >
                  -
                </Button>
              )}
            </Box>
          ))}

          <Button
            variant="outlined"
            color="secondary"
            sx={{ mt: 2 }}
            onClick={handleAddValue}
          >
            + Add Value
          </Button>

          <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
            <Button variant="outlined" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </Box>
        </form>
      </Drawer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() =>
            setSnackbar((prev) => ({
              ...prev,
              open: false,
            }))
          }
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AllPermissions;

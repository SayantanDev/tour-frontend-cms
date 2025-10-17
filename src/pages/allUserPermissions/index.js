import {
  Alert,
  Box,
  Container,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { deleteUserPermission, getAllUserPermission, updateUserPermission } from "../../api/userPermissionAPI";
import { getAllPermission } from "../../api/permissionsAPI";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import PermissionDialogBox from "./permissionDialogBox";
import DeleteIcon from '@mui/icons-material/Delete';

const AllUserPermissions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ===================== STATE =====================
  const [allUserPermissions, setAllUserPermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionDialogData, setPermissionDialogData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // ===================== FETCH FUNCTIONS =====================
  const fetchUserPermissions = async () => {
    try {
      const res = await getAllUserPermission();
      const items = res?.items || [];

      setAllUserPermissions(items);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await getAllPermission();
      const items = res?.items || [];

      setAllPermissions(items);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
    fetchPermissions();
  }, []);

  // ===================== HANDLE DIALOG =====================
  const handleOpenDialog = (id, role) => {

    setSelectedId(id);
    setSelectedRole(role);

    console.log(allUserPermissions);



    const currentUser = allUserPermissions.find((user) => user._id === id);
    const savedPermission = currentUser?.permission || [];


    // Generate permission dialog structure based on allPermissions
    const permissionData = allPermissions.map((perm) => {
      const savedModule = savedPermission.find((sp) => sp.module === perm.module);
      const savedValues = savedModule?.value || [];


      return {
        module: perm.module,
        enabled: savedModule ? true : false,
        values: perm.value.reduce((acc, item) => {
          acc[item] = savedValues.includes(item);
          return acc;
        }, {}),
      }
    })

    setPermissionDialogData(permissionData);
    setOpenDialog(true);
    setFilteredPermissions(permissionData);
    setSearchTerm("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole(null);
    setSelectedId(null);
  };

  const handleSavePermissions = async () => {
    try {
      if (!selectedId) return;
      const updatedPermissionArr = filteredPermissions.filter((mod) => mod.enabled).map((mod) => ({
        module: mod.module,
        value: Object.keys(mod.values).filter((key) => mod.values[key]),
      }));

      const payload = {
        permission: updatedPermissionArr,
      };

      await updateUserPermission(selectedId, payload);



      setAllUserPermissions((prev) =>
        prev.map((user) =>
          user._id === selectedId ? { ...user, permission: updatedPermissionArr } : user));

      setSnackbar({
        open: true,
        message: "Permissions updated successfully",
        severity: "success",
      });

      setOpenDialog(false);
      setSelectedId(null); // reset after saving
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update permissions",
        severity: "error",
      });
    }
  };


  // ===================== HANDLE CHECKBOX LOGIC =====================
  const handleModuleToggle = (moduleName) => {
    setFilteredPermissions((prev) =>
      prev.map((m) =>
        m.module === moduleName ? { ...m, enabled: !m.enabled } : m
      )
    );
  };

  const handleValueChange = (moduleName, valueName) => {
    setFilteredPermissions((prev) =>
      prev.map((m) =>
        m.module === moduleName
          ? {
            ...m,
            values: {
              ...m.values,
              [valueName]: !m.values[valueName],
            },
          }
          : m
      )
    );
  };


  //Delete Permissions

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this permission?'))
      return;
    try {
      await deleteUserPermission(id);
      await fetchUserPermissions();
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

  const effectiveUserPermissions = allUserPermissions.filter((data) => data.role !== 'Admin')



  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === '') {
      setFilteredPermissions(permissionDialogData);
    } else {
      const filtered = permissionDialogData.filter((p) =>
        p.module.toLowerCase().includes(term)
      );
      setFilteredPermissions(filtered);
    }
  };



  // ===================== RENDER =====================
  return (
    <Container maxWidth="lg" sx={{ pt: 1, pb: 4 }}>
      {/* ======= PAGE HEADER ======= */}
      <Box
        display="flex"
        justifyContent="space-between"
        flexDirection={isMobile ? "column" : "row"}
        alignItems={isMobile ? "stretch" : "center"}
        gap={2}
        mb={3}
      >
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
          Manage User Permissions
        </Typography>
      </Box>

      {/* ======= USER PERMISSION TABLE ======= */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Role</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {effectiveUserPermissions.map((singlePerm, index) => (
              <TableRow key={index}>
                <TableCell>{singlePerm.role}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(singlePerm._id, singlePerm.role)}
                  >
                    <ReadMoreIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDelete(singlePerm._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ======= PERMISSION DIALOG BOX ======= */}
      <PermissionDialogBox
        open={openDialog}
        handleClose={handleCloseDialog}
        handleSearchChange={handleSearchChange}
        handleSavePermissions={handleSavePermissions}
        selectedRole={selectedRole}
        permissionDialogData={permissionDialogData}
        handleModuleToggle={handleModuleToggle}
        handleValueChange={handleValueChange}
        searchTerm={searchTerm}
        filteredPermissions={filteredPermissions}
      />
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

export default AllUserPermissions;

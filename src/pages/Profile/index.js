import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useDispatch, useSelector } from "react-redux";
import { addLoginToken } from "../../reduxcomponents/slices/tokenSlice";
import { getAllUserPermission } from "../../api/userPermissionAPI";
import { updateUser } from "../../api/userAPI";

const Profile = () => {
  const { user, token, refreshToken } = useSelector((state) => state.tokens) || {};
  const dispatch = useDispatch();
  const [allUserPermissions, setAllUserPermissions] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Initialize editable user safely
  const [editableUser, setEditableUser] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    role: user?.permission || "",
    permission:
      allUserPermissions?.find((mod) => mod.role === user?.permission)
        ?.permission || [],
  });

  const [editField, setEditField] = useState(null);

  // Update editableUser if Redux user changes
  useEffect(() => {
    setEditableUser({
      name: user?.fullName || "",
      email: user?.email || "",
      role: user?.permission || "",
      permission:
        allUserPermissions.find((mod) => mod.role === user?.permission)
          ?.permission || [],
    });
  }, [user, allUserPermissions]);

  const fetchUserPermissions = async () => {
    try {
      const res = await getAllUserPermission();
      const items = res?.items || [];
      setAllUserPermissions(items);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  // Double click to edit
  const handleDoubleClick = (field) => setEditField(field);

  // Update editableUser on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Blur handler: save changes to Redux
  const handleBlur = async () => {
    setEditField(null);

    const updatedUser = {
      ...user,
      fullName: editableUser.name,
      email: editableUser.email,
      permission: editableUser.role,
    };

    try {
      await updateUser(updatedUser, user._id); // ✅ wait for update
      dispatch(
        addLoginToken({
          token,
          refreshToken,
          user: updatedUser,
        })
      );
      setOpenSnackbar(true); // ✅ Show success message
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  // Column definitions for permissions table
  const permissionColumns = useMemo(() => [
    {
      accessorKey: "module",
      header: "Module",
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ getValue }) => {
        const values = getValue();
        return (
          <>
            {values.map((v) => (
              <span key={v}>{v} </span>
            ))}
          </>
        );
      },
    },
  ], []);

  // Table instance for permissions
  const permissionsTable = useReactTable({
    data: editableUser.permission,
    columns: permissionColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.module,
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        p: 2
      }}>
      <Card sx={{ width: "80%", p: 3, m: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom mb={4} fontWeight={700}>
            Profile Summary
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={4}>
            {["name", "email", "role"].map((field) => (
              <Grid item xs={12} sm={6} key={field}>
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#555", fontWeight: 600 }}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Typography>
                </Box>

                {editField === field ? (
                  <TextField
                    name={field}
                    value={editableUser[field]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoFocus
                    size="small"
                    fullWidth
                  />
                ) : (
                  <Typography
                    onDoubleClick={() => handleDoubleClick(field)}
                    sx={{
                      cursor: "pointer",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {editableUser[field]}
                  </Typography>
                )}
              </Grid>
            ))}
          </Grid>
          {editableUser.role !== "Admin" &&
            <Box mt={4}>
              <Typography gutterBottom sx={{ color: "#555" }} fontWeight={600}>
                Permissions
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    {permissionsTable.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableCell key={header.id} sx={{ fontWeight: 600 }}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {permissionsTable.getRowModel().rows.length > 0 ? (
                      permissionsTable.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={permissionColumns.length} align="center">
                          No permissions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          }
        </CardContent>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            Profile edited successfully!
          </Alert>
        </Snackbar>
      </Card>
    </Box>

  );
};

export default Profile;

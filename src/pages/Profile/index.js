import React, { useState, useEffect } from "react";
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
      console.log(items);


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

  // Map permissions to table rows
  const permissionRows = editableUser.permission.map((val) => (
    <TableRow key={val.module}>
      <TableCell>{val.module}</TableCell>
      <TableCell>
        {val.value.map((v) => (
          <span key={v}>{v} </span>
        ))}
      </TableCell>
    </TableRow>
  ));

  return (
    <Box 
      sx={{
        display: "flex",
        justifyContent:"center",
        p:2
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
              <Typography gutterBottom sx={{color: "#555"}} fontWeight={600}>
                Permissions
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Module</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{permissionRows}</TableBody>
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

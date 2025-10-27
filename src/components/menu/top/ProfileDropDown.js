import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
// import DarkModeIcon from "@mui/icons-material/DarkMode";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LogoutIcon from "@mui/icons-material/Logout";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { updatePassword } from "../../../api/userAPI";
import useSnackbar from "../../../hooks/useSnackbar";

const ProfileDropdown = ({ anchorEl, handleClose }) => {
  const open = Boolean(anchorEl);
  const { user } = useSelector(state => state.tokens);
  const navigate = useNavigate();
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  //States
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);


  //Validation Schema
  const validationSchema = Yup.object({
    oldPassword: Yup.string().required("Old password is required"),
    newPassword: Yup.string().required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });


  const handleUpdatePassword = async () => {
    try {
      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      };

      const res = await updatePassword(payload);
      console.log("Password updated successfully", res);
      setConfirmOpen(false);
      setOpenDialog(false);
      showSnackbar(`${res.data.message}`, 'success');
      // navigate("/");
    } catch (error) {
      console.error("Password update failed:", error);
      showSnackbar(`${error?.response?.data?.message}`, 'error');
    }

  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: 280,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          mt: 1.5,
        },
      }}
    >
      {/* User Info Section */}
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <Avatar src={user?.avatar} sx={{ width: 48, height: 48, mr: 2 }} />
        <Box>
          <Typography fontWeight={600}>{user?.fullName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.permission}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ py: 0 }}>
        <ListItemButton onClick={() => navigate("/profile")}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="View Profile" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/dashboard')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {/* <ListItemButton>
          <ListItemIcon>
            <DarkModeIcon />
          </ListItemIcon>
          <ListItemText primary="Dark Mode" />
          <Switch size="small" />
        </ListItemButton> */}

        <ListItemButton onClick={() => navigate('/permission')}>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText primary="All Permission" />
        </ListItemButton>

        <ListItemButton onClick={() => setOpenDialog(true)}>
          <ListItemIcon>
            <VpnKeyIcon />
          </ListItemIcon>
          <ListItemText primary="Update Password" />
        </ListItemButton>

        <Divider sx={{ my: 1 }} />

        <ListItemButton sx={{ color: "error.main" }} onClick={() => navigate('/')}>
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItemButton>
      </List>

      {/* Update Password Dialog */}
      <Dialog open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            backdropFilter: "blur(12px)",
            background: "rgba(255, 255, 255, 0.8)",
          },
        }}>
        <DialogTitle fontWeight={600}>Update Password</DialogTitle>
        <Formik
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            setFormData(values);
            setConfirmOpen(true);
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Field
                  as={TextField}
                  name="oldPassword"
                  label="Old Password"
                  type={showOldPassword ? "text" : "password"}
                  fullWidth
                  error={(touched.oldPassword && Boolean(errors.oldPassword))}
                  helperText={(touched.oldPassword && errors.oldPassword)}
                  InputProps={{
                    endAdornment: (
                        <Box
                          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                          onClick={() => setShowOldPassword(prev => !prev)}
                        >
                          {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </Box>
                    )
                  }}
                />
                <Field
                  as={TextField}
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  fullWidth
                  error={touched.newPassword && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
                  InputProps={{
                    endAdornment: (
                        <Box
                          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                          onClick={() => setShowNewPassword(prev => !prev)}
                        >
                          {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </Box>
                    )
                  }}
                />
                <Field
                  as={TextField}
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Save
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      {/* Confirm Update Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle fontWeight={600}>Confirm Update</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update your password?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleUpdatePassword()}
          >
            Yes, Update
          </Button>
        </DialogActions>
      </Dialog>

      <SnackbarComponent />
    </Popover>
  );
};

export default ProfileDropdown;

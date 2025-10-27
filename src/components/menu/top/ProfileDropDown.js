import React, { useState } from "react";
import {
  Alert,
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
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
// import DarkModeIcon from "@mui/icons-material/DarkMode";
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
  const snackbar = useSnackbar();

  //States
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [formData, setFormData] = useState(null);


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
      snackbar("Password updated successfully");
      // navigate("/");
    } catch (error) {
      console.error("Password update failed:", error);

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
                  type="password"
                  fullWidth
                  error={(touched.oldPassword && Boolean(errors.oldPassword))}
                  helperText={(touched.oldPassword && errors.oldPassword)}
                />
                <Field
                  as={TextField}
                  name="newPassword"
                  label="New Password"
                  type="password"
                  fullWidth
                  error={touched.newPassword && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
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

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Password updated successfully!
        </Alert>
      </Snackbar>
    </Popover>
  );
};

export default ProfileDropdown;

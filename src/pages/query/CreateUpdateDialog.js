import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

const CreateUpdateDialog = ({ open, onClose, onSubmit, initialValues }) => {
  const isUpdate = Boolean(initialValues?.id);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const formik = useFormik({
    initialValues: initialValues || { name: "", email: "" },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
    enableReinitialize: true, // Allows form to update when initialValues change
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isUpdate ? "Update Entry" : "Create Entry"}</DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={formik.handleSubmit} color="primary" variant="contained">
          {isUpdate ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUpdateDialog;

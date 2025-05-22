import { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Drawer,
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Chip
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { deleteVehicleObj, getAllVehicle, insertVehicle, updateVehicle } from "../../api/vehicleAPI";
import useSnackbar from "../../hooks/useSnackbar";

const Vehicles = () => {
  const [vehiclesData, setVehiclesData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const fetchVehicles = async () => {
    const res = await getAllVehicle();
    setVehiclesData(res);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddClick = () => {
    setSelectedVehicle(null);
    setEditMode(false);
    setDrawerOpen(true);
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditMode(true);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (vehicleToDelete) {
      await deleteVehicleObj(vehicleToDelete._id);
      fetchVehicles();
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
      showSnackbar("Vehicle deleted successfully", "success");
    }
  };

  const initialValues = {
    owner_name: '',
    owner_phn: '',
    owner_address: '',
    owner_aadhar: '',
    drivers: [],
    vehicles: [],
    region: []
  };

  const validationSchema = Yup.object({
    owner_name: Yup.string().required('Required'),
    owner_phn: Yup.string().required('Required'),
    owner_address: Yup.string().required('Required'),
    owner_aadhar: Yup.string().required('Required')
  });

  const handleSubmit = async (values, actions) => {
    if (editMode && selectedVehicle) {
      const res = await updateVehicle(selectedVehicle._id, values);
      if (res) {
        showSnackbar("Owner info updated successfully!", "success");
      }
    } else {
      const res = await insertVehicle(values);
      if (res) {
        showSnackbar("Owner info created successfully!", "success");
      }
    }
    fetchVehicles();
    setDrawerOpen(false);
    actions.resetForm();
  };

  return (
    <Box p={3} sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Vehicle Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>Add Vehicle</Button>
      </Box>

      <Grid container spacing={2}>
        {vehiclesData.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh" width="100%">
            <Typography variant="h6" color="textSecondary">No vehicle data found</Typography>
          </Box>
        ) : (
          vehiclesData.map((vehicle) => (
            <Grid item xs={12} md={6} lg={3} key={vehicle._id}>
              <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight={600}>Owner: {vehicle.owner_name}</Typography>
                  <Typography>Phone: {vehicle.owner_phn}</Typography>

                  <Typography mt={1} fontWeight={600}>Drivers:</Typography>
                  <Stack spacing={0.5}>{vehicle.drivers?.map((d, i) => <Typography key={i}>{d.driver_name} ({d.driver_phn})</Typography>)}</Stack>

                  <Typography mt={1} fontWeight={600}>Vehicles:</Typography>
                  <Stack spacing={0.5}>{vehicle.vehicles?.map((v, i) => <Typography key={i}>{v.vehicle_name} ({v.vehicle_no})</Typography>)}</Stack>

                  <Typography mt={1} fontWeight={600}>Region:</Typography>
                  <Stack spacing={0.5}>{vehicle.region?.map((r, i) => <Typography key={i}>{r.destination} {r.sub_desti && `- ${r.sub_desti}`}</Typography>)}</Stack>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleEditClick(vehicle)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDeleteClick(vehicle)}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box width={600} p={3} role="presentation">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">{editMode ? 'Edit Vehicle' : 'Add Vehicle'}</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Formik
            initialValues={selectedVehicle || initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <TextField fullWidth name="owner_name" label="Owner Name" value={values.owner_name} onChange={handleChange} margin="normal" />
                <TextField fullWidth name="owner_phn" label="Phone" value={values.owner_phn} onChange={handleChange} margin="normal" />
                <TextField fullWidth name="owner_address" label="Address" value={values.owner_address} onChange={handleChange} margin="normal" />
                <TextField fullWidth name="owner_aadhar" label="Aadhar" value={values.owner_aadhar} onChange={handleChange} margin="normal" />

                {/* Drivers */}
                <FieldArray name="drivers">
                  {({ push, remove }) => (
                    <Box>
                      <Typography variant="subtitle1" mt={2}>Drivers</Typography>
                      {values.drivers.map((driver, index) => (
                        <Box key={index} display="flex" gap={1} alignItems="center" mb={1}>
                          <TextField label="Name" name={`drivers[${index}].driver_name`} value={driver.driver_name} onChange={handleChange} fullWidth />
                          <TextField label="Phone" name={`drivers[${index}].driver_phn`} value={driver.driver_phn} onChange={handleChange} fullWidth />
                          <IconButton onClick={() => remove(index)}><CloseIcon /></IconButton>
                        </Box>
                      ))}
                      <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => push({ driver_name: '', driver_phn: '' })}>Add Driver</Button>
                    </Box>
                  )}
                </FieldArray>

                {/* Vehicles */}
                <FieldArray name="vehicles">
                  {({ push, remove }) => (
                    <Box>
                      <Typography variant="subtitle1" mt={3}>Vehicles</Typography>
                      {values.vehicles.map((vehicle, index) => (
                        <Box key={index} display="flex" gap={1} alignItems="center" mb={1}>
                          <TextField label="No" name={`vehicles[${index}].vehicle_no`} value={vehicle.vehicle_no} onChange={handleChange} fullWidth />
                          <TextField label="Name" name={`vehicles[${index}].vehicle_name`} value={vehicle.vehicle_name} onChange={handleChange} fullWidth />
                          <IconButton onClick={() => remove(index)}><CloseIcon /></IconButton>
                        </Box>
                      ))}
                      <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => push({ vehicle_no: '', vehicle_name: '' })}>Add Vehicle</Button>
                    </Box>
                  )}
                </FieldArray>

                {/* Region */}
                <FieldArray name="region">
                  {({ push, remove }) => (
                    <Box>
                      <Typography variant="subtitle1" mt={3}>Region</Typography>
                      {values.region.map((reg, index) => (
                        <Box key={index} display="flex" gap={1} alignItems="center" mb={1}>
                          <TextField label="Destination" name={`region[${index}].destination`} value={reg.destination} onChange={handleChange} fullWidth />
                          <TextField label="Sub Desti" name={`region[${index}].sub_desti`} value={reg.sub_desti} onChange={handleChange} fullWidth />
                          <IconButton onClick={() => remove(index)}><CloseIcon /></IconButton>
                        </Box>
                      ))}
                      <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => push({ destination: '', sub_desti: '' })}>Add Region</Button>
                    </Box>
                  )}
                </FieldArray>

                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>Submit</Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Drawer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete the vehicle belonging to <strong>{vehicleToDelete?.owner_name}</strong>?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <SnackbarComponent />
    </Box>
  );
};

export default Vehicles;

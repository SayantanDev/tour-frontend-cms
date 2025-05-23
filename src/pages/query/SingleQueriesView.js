import React, { useEffect, useState } from 'react';

import {
  Box, Button, Divider, Drawer, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Autocomplete
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useSelector } from 'react-redux';
import { getAllHotels } from '../../api/hotelsAPI';
import { getAllVehicle } from '../../api/vehicleAPI';
import { getSingleOperation, updateFollowupDetails } from '../../api/operationAPI';
import { fetchOperationByQueries } from '../../api/queriesAPI';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date) ? dateString : date.toLocaleDateString();
};

function SingleQueriesView() {
  const { fetchSelectedquerie } = useSelector((state) => state.queries);
  console.log("fetchSelectedquerie :", fetchSelectedquerie.id);

  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);
  const [operation, setOperation] = useState({});
  const [itineraryData, setItineraryData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [guestDrawer, setGuestDrawer] = useState(false);
  const [bookingDrawer, setBookingDrawer] = useState(false);

  const [guestInfo, setGuestInfo] = useState({
    name: fetchSelectedquerie?.guest_details?.guest_info?.guest_name || '',
    contact: fetchSelectedquerie?.guest_details?.guest_info?.guest_phone || '',
    email: fetchSelectedquerie?.guest_details?.guest_info?.guest_email || '',
    pax: fetchSelectedquerie?.guest_details?.pax || '',
    hotel: fetchSelectedquerie?.guest_details?.stay_info?.hotel || '',
    rooms: fetchSelectedquerie?.guest_details?.stay_info?.rooms || '',
    carname: fetchSelectedquerie?.guest_details?.car_details?.car_name || '',
    carcount: fetchSelectedquerie?.guest_details?.car_details?.car_count || '',
    source: fetchSelectedquerie?.guest_details?.lead_source || '',
    bookingDate: fetchSelectedquerie?.createdAt?.slice(0, 10) || '',
    tourDate: fetchSelectedquerie?.guest_details?.travel_date?.slice(0, 10) || '',
    bookingStatus: fetchSelectedquerie?.guest_details?.lead_stage || '',
    cost: fetchSelectedquerie?.guest_details?.cost || '',
    advancePayment: fetchSelectedquerie?.guest_details?.advance || '',
    duePayment:
      typeof fetchSelectedquerie?.guest_details?.cost === 'number' &&
        typeof fetchSelectedquerie?.guest_details?.advance === 'number'
        ? fetchSelectedquerie.guest_details?.cost - fetchSelectedquerie.guest_details?.advance
        : '',
  });
  const detchOperationData = async () => {
    const operationData = await getSingleOperation(fetchSelectedquerie.id);
    setOperation(operationData);
    
    const followUpData = operationData?.followup_details?.map((item, index) => ({
      day: (index + 1).toString(),
      date: item.journey_date || '',
      place: item.destination || '',
      hotelName: item.hotel_name || '',
      hotelAmount: item.hotel_amount || '',
      hotelConfirmation: item.hotel_confirmation || '',
      checkinDate: item.checkin_date || '',
      checkoutDate: item.checkout_date || '',
      mealPlan: item.meal_plan || '',
      vehicleName: item.vehicle_name || '',
      vehiclePayment: item.vehicle_payment || '',
      vehicleStatus: item.vehicle_status || '',
      driverName: item.driver || '',
    })) || []

    setItineraryData(followUpData);
  
 }
    useEffect(() => {
   
    detchOperationData();
    // fetchOperationByQueries().then(setOperation);
    getAllHotels().then(setHotels);
    getAllVehicle().then(setVehicles);
  }, []);

  const handleGuestChange = (e) => {
    setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
  };

  const openEditDrawer = (row, index) => {
    setEditRow(row);
    setEditIndex(index);
    setDrawerOpen(true);

    const selectedHotel = hotels.find(h => h.hotel_name === row.hotelName);
    setRoomOptions(selectedHotel?.category || []);

    const owner = vehicles.find(v => v.vehicles.some(veh => veh.vehicle_name === row.vehicleName));
    setDriverOptions(owner?.drivers || []);
  };

  const handleEditChange = (e) => {
    setEditRow({ ...editRow, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    const newData = [...itineraryData];
    newData[editIndex] = editRow;
    const itnObj = { followup_details: newData }
    setItineraryData(newData);
    await updateFollowupDetails(fetchSelectedquerie.id,itnObj);
    setDrawerOpen(false);
  };

  const saveGuestInfo = () => {
    console.log("guestInfo:", guestInfo);
    
    setGuestDrawer(false);
  };

  const guestFields = [
    { label: 'Name', field: 'name' },
    { label: 'Contact', field: 'contact' },
    { label: 'Email', field: 'email' },
    { label: 'Pax', field: 'pax' },
    { label: 'Hotel', field: 'hotel' },
    { label: 'Rooms', field: 'rooms' },
    { label: 'Car Name', field: 'carname' },
    { label: 'Car Count', field: 'carcount' },
  ];

  const bookingFields = [
    { label: 'Source', field: 'source' },
    { label: 'Booking Date', field: 'bookingDate' },
    { label: 'Tour Date', field: 'tourDate' },
    { label: 'Booking Status', field: 'bookingStatus' },
    { label: 'Cost', field: 'cost' },
    { label: 'Advance Payment', field: 'advancePayment' },
    { label: 'Due Payment', field: 'duePayment' },
  ];

  const columns = [
    { label: 'Day', field: 'day' },
    { label: 'Date', field: 'date' },
    { label: 'Place', field: 'place' },
    { label: 'Hotel Name', field: 'hotelName' },
    { label: 'Hotel Amount', field: 'hotelAmount' },
    { label: 'Hotel Confirmation', field: 'hotelConfirmation' },
    { label: 'Checkin Date', field: 'checkinDate' },
    { label: 'Checkout Date', field: 'checkoutDate' },
    { label: 'Meal Plan', field: 'mealPlan' },
    { label: 'Vehicle Name', field: 'vehicleName' },
    { label: 'Vehicle Payment', field: 'vehiclePayment' },
    { label: 'Vehicle Status', field: 'vehicleStatus' },
    { label: 'Driver Name', field: 'driverName' }
  ];

  return (
    <Box p={2}>
      {/* Guest & Booking Details */}
      <Paper elevation={4} sx={{ p: 3, m: 2, border: '2px solid #1976d2', borderRadius: 3 }}>
        <Typography variant="h5" align="center" fontWeight="bold" color="primary" gutterBottom>
          Guest & Booking Details
        </Typography>
        <Grid container spacing={4} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="secondary">Guest & Stay Information</Typography>
                <IconButton onClick={() => setGuestDrawer(true)}>
                  <EditOutlinedIcon />
                </IconButton>
              </Box>
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {guestFields.map((item) => (
                      <TableRow key={item.field}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{item.label}</TableCell>
                        <TableCell>{guestInfo[item.field] || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="secondary">Booking & Payment</Typography>
                <IconButton onClick={() => setBookingDrawer(true)}>
                  <EditOutlinedIcon />
                </IconButton>
              </Box>
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {bookingFields.map((item) => (
                      <TableRow key={item.field}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{item.label}</TableCell>
                        <TableCell>
                          {['bookingDate', 'tourDate'].includes(item.field)
                            ? formatDate(guestInfo[item.field])
                            : guestInfo[item.field] || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Itinerary Table */}
      <Typography variant="h5" align="center" fontWeight="bold" color="primary" gutterBottom mt={5}>
        Short Itinerary
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#e8f5e9' }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.field}><strong>{col.label}</strong></TableCell>
              ))}
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itineraryData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell key={col.field}>
                    {['date', 'checkinDate', 'checkoutDate'].includes(col.field)
                      ? formatDate(row[col.field])
                      : row[col.field]}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton onClick={() => openEditDrawer(row, index)}>
                    <EditOutlinedIcon color="primary" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Itinerary Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 500, p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Edit Itinerary</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {columns.map((col) => {
              if (col.field === 'hotelName') {
                return (
                  <Grid item xs={12} key={col.field}>
                    <Autocomplete
                      fullWidth
                      options={hotels}
                      getOptionLabel={(option) => option.hotel_name}
                      renderInput={(params) => <TextField {...params} label="Hotel Name" />}
                      value={hotels.find(h => h.hotel_name === editRow.hotelName) || null}
                      onChange={(e, value) => {
                        setEditRow({ ...editRow, hotelName: value?.hotel_name || '', hotelAmount: '' });
                        setRoomOptions(value?.category || []);
                      }}
                    />
                  </Grid>
                );
              }
              if (col.field === 'hotelAmount') {
                return (
                  <Grid item xs={12} key={col.field}>
                    <Autocomplete
                      fullWidth
                      options={roomOptions}
                      getOptionLabel={(option) => `${option.room_cat} - ₹${option.room_price}`}
                      renderInput={(params) => <TextField {...params} label="Room Category" />}
                      onChange={(e, value) => {
                        setEditRow({ ...editRow, hotelAmount: value?.room_price || '' });
                      }}
                    />
                  </Grid>
                );
              }
              if (col.field === 'vehicleName') {
                return (
                  <Grid item xs={12} key={col.field}>
                    <Autocomplete
                      fullWidth
                      options={vehicles.flatMap(v => v.vehicles)}
                      getOptionLabel={(option) => option.vehicle_name}
                      renderInput={(params) => <TextField {...params} label="Vehicle Name" />}
                      value={vehicles.flatMap(v => v.vehicles).find(v => v.vehicle_name === editRow.vehicleName) || null}
                      onChange={(e, value) => {
                        setEditRow({ ...editRow, vehicleName: value?.vehicle_name || '' });
                        const owner = vehicles.find(v => v.vehicles.some(veh => veh.vehicle_name === value?.vehicle_name));
                        setDriverOptions(owner?.drivers || []);
                      }}
                    />
                  </Grid>
                );
              }
              if (col.field === 'driverName') {
                return (
                  <Grid item xs={12} key={col.field}>
                    <Autocomplete
                      fullWidth
                      options={driverOptions}
                      getOptionLabel={(option) => option.driver_name}
                      renderInput={(params) => <TextField {...params} label="Driver Name" />}
                      onChange={(e, value) => {
                        setEditRow({ ...editRow, driverName: value?.driver_name || '' });
                      }}
                    />
                  </Grid>
                );
              }
              return (
                <Grid item xs={12} key={col.field}>
                  <TextField
                    fullWidth
                    type={['date', 'checkinDate', 'checkoutDate'].includes(col.field) ? 'date' : 'text'}
                    label={col.label}
                    name={col.field}
                    value={['date', 'checkinDate', 'checkoutDate'].includes(col.field)
                      ? editRow[col.field]?.slice(0, 10) || ''
                      : editRow[col.field] || ''}
                    onChange={handleEditChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              );
            })}
          </Grid>
          <Box textAlign="right" mt={3}>
            <Button variant="contained" color="primary" onClick={saveEdit}>Save</Button>
          </Box>
        </Box>
      </Drawer>

      {/* Edit Guest Drawer */}
      <Drawer anchor="right" open={guestDrawer} onClose={() => setGuestDrawer(false)}>
        <Box sx={{ width: 500, p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Edit Guest & Stay Information</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {guestFields.map((item) => (
              <Grid item xs={12} key={item.field}>
                <TextField
                  fullWidth
                  label={item.label}
                  name={item.field}
                  value={guestInfo[item.field] || ''}
                  onChange={handleGuestChange}
                />
              </Grid>
            ))}
          </Grid>
          <Box textAlign="right" mt={3}>
            <Button variant="contained" onClick={saveGuestInfo}>Save</Button>
          </Box>
        </Box>
      </Drawer>

      {/* Edit Booking Drawer */}
      <Drawer anchor="right" open={bookingDrawer} onClose={() => setBookingDrawer(false)}>
        <Box sx={{ width: 500, p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Edit Booking & Payment</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {bookingFields.map((item) => (
              <Grid item xs={12} key={item.field}>
                <TextField
                  fullWidth
                  type={['bookingDate', 'tourDate'].includes(item.field) ? 'date' : 'text'}
                  label={item.label}
                  name={item.field}
                  value={['bookingDate', 'tourDate'].includes(item.field)
                    ? guestInfo[item.field]?.slice(0, 10) || ''
                    : guestInfo[item.field] || ''}
                  onChange={handleGuestChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            ))}
          </Grid>
          <Box textAlign="right" mt={3}>
            <Button variant="contained" onClick={() => setBookingDrawer(false)}>Save</Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SingleQueriesView;

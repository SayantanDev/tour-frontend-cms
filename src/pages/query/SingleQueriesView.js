import React, { useEffect, useState, useMemo } from 'react';

import {
  Box, Button, Divider, Drawer, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Autocomplete,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useSelector } from 'react-redux';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { getAllHotels } from '../../api/hotelsAPI';
import { getAllVehicle } from '../../api/vehicleAPI';
import { addChangeRequest, addChangeRequestForItineray, getQueriesByoperation, getSingleOperation, updateFollowupDetails } from '../../api/operationAPI';
// import { fetchOperationByQueries } from '../../api/queriesAPI';
import useSnackbar from '../../hooks/useSnackbar';
import usePermissions from '../../hooks/UsePermissions';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date) ? dateString : date.toLocaleDateString();
};

const columnsData = [
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
  { label: 'Driver Name', field: 'driverName' },
  { label: 'CRV', field: 'status' }
];

function SingleQueriesView() {
  const { fetchSelectedquerie } = useSelector((state) => state.queries);
  const hasPermission = usePermissions();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);
  // const [operation, setOperation] = useState({});
  const [itineraryData, setItineraryData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [guestDrawer, setGuestDrawer] = useState(false);
  const [bookingDrawer, setBookingDrawer] = useState(false);
  const [guestInfo, setGuestInfo] = useState({});
  const [changeRequestOpen, setChangeRequestOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [editHistory, setEditHistory] = useState([]);

  const [verifyPopupOpen, setVerifyPopupOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('');
  const [rejectedReason, setRejectedReason] = useState('');
  const [verifyIndex, setVerifyIndex] = useState(null); // index of the itinerary row
  const [rejectedViewOpen, setRejectedViewOpen] = useState(false);

  const detchOperationData = async () => {
    const operationData = await getSingleOperation(fetchSelectedquerie.id);
    // setOperation(operationData);

    const followUpData = operationData?.followup_details?.map((item, index) => ({
      id: item._id,
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
      status: item.approved_status || '',
    })) || []

    setItineraryData(followUpData);
    const queriesData = await getQueriesByoperation(operationData._id);
    const guestAndStayData = {
      name: operationData?.guest_info?.name || '',
      contact: operationData?.guest_info?.phone || '',
      email: operationData?.guest_info?.email || '',
      pax: operationData?.trip_details?.number_of_adults || '',
      hotel: queriesData?.stay_info?.hotel || '',
      rooms: queriesData?.stay_info?.rooms || '',
      carname: queriesData?.car_details?.car_name || '',
      carcount: queriesData?.car_details?.car_count || '',
      source: queriesData?.lead_source || '',
      bookingDate: operationData?.createdAt?.slice(0, 10) || '',
      tourDate: queriesData?.travel_date?.slice(0, 10) || '',
      bookingStatus: queriesData?.lead_stage || '',
      cost: queriesData?.cost || '',
      advancePayment: queriesData?.advance || '',
      duePayment:
        typeof queriesData?.cost === 'number' &&
          typeof queriesData?.advance === 'number'
          ? queriesData.cost - operationData.guest_details?.advance
          : '',
    }
    setGuestInfo(guestAndStayData);
  }

  useEffect(() => {
    detchOperationData();
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

  // const saveEdit = async () => {
  //   const newData = [...itineraryData];
  //   newData[editIndex] = editRow;
  //   const itnObj = { followup_details: newData }
  //   setItineraryData(newData);
  //   const res = await updateFollowupDetails(fetchSelectedquerie.id, itnObj);
  //   if (res) {
  //     showSnackbar(res.message, "success");
  //   }
  //   setDrawerOpen(false);
  // };

  const saveEdit = async () => {
    const newData = [...itineraryData];
    const originalRow = itineraryData[editIndex];
    const updatedRow = { ...editRow };

    const changedFields = { day: updatedRow.day };
    let hasChanged = false;

    // Compare and collect changed fields
    for (const key in updatedRow) {
      if (key !== 'day' && updatedRow[key] !== originalRow[key]) {
        changedFields[key] = updatedRow[key];
        hasChanged = true;
      }
    }

    if (!hasChanged) {
      showSnackbar("No changes detected.", "info");
      setDrawerOpen(false);
      return;
    }

    // ⬇️ Store in edit history
    setEditHistory((prev) => [...prev, changedFields]);

    // ⬇️ Set status to "pending" only for this changed row
    updatedRow.status = "Pending";
    newData[editIndex] = updatedRow;

    const itnObj = { followup_details: newData };
    const res = await updateFollowupDetails(fetchSelectedquerie.id, itnObj);
    if (res) {
      // await addChangeRequestForItineray(fetchSelectedquerie.id, { description: changedFields });
      showSnackbar(res.message, "success");
    }

    setDrawerOpen(false);
  };

  const saveGuestInfo = () => {
    setGuestDrawer(false);
  };

  const handleVerifyItineray = async () => {
    // const res = await verifyItinerary(fetchSelectedquerie.id);
    // if (res) {
    //   showSnackbar(res.message, "success");
    // }
    // const newData = [...itineraryData];
    setVerifyStatus('');
    setRejectedReason('');
    setVerifyPopupOpen(true);
    const originalRow = itineraryData[editIndex];
  }

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

  // Column definitions for @tanstack/react-table
  const columns = useMemo(() => [
    ...columnsData.map((col) => ({
      accessorKey: col.field,
      header: col.label,
      cell: ({ row }) => {
        const rowData = row.original;
        const dateFields = ['date', 'checkinDate', 'checkoutDate'];
        return dateFields.includes(col.field)
          ? formatDate(rowData[col.field])
          : rowData[col.field];
      },
    })),
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const rowData = row.original;
        const rowIndex = row.index;
        return (
          <IconButton onClick={() => openEditDrawer(rowData, rowIndex)}>
            <EditOutlinedIcon color="primary" />
          </IconButton>
        );
      },
    },
  ], [openEditDrawer]);

  // Table instance
  const table = useReactTable({
    data: itineraryData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const handleChangeRequest = async () => {
    // Example: You can send this to an API or log it
    if (!description.trim()) {
      alert("Please enter a description before submitting.");
      return;
    }

    // Reset and close the dialog
    setDescription('');
    setChangeRequestOpen(false);

    await addChangeRequest(fetchSelectedquerie.id, { description });
    showSnackbar("Change Request Submitted Successfully", "success");
  };

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
                {hasPermission("operation", "alter") && (
                  <IconButton onClick={() => setGuestDrawer(true)}>
                    <EditOutlinedIcon />
                  </IconButton>
                )}
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
                {hasPermission("operation", "alter") && (
                  <IconButton onClick={() => setBookingDrawer(true)}>
                    <EditOutlinedIcon />
                  </IconButton>
                )}
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
          {hasPermission("operation", "changeRequest") && (
            <Grid xs={12} >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" color="secondary" onClick={() => setChangeRequestOpen(true)} >
                  Change Request
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Itinerary Table */}
      <Typography variant="h5" align="center" fontWeight="bold" color="primary" gutterBottom mt={5}>
        Short Itinerary
      </Typography>
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button variant="outlined" color="error" onClick={() => setRejectedViewOpen(true)}>
          rejected
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#e8f5e9' }}>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    <strong>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </strong>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
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
            {columnsData.map((col) => {
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
                    disabled={['day', 'date', 'checkinDate', 'checkoutDate', 'status'].includes(col.field)}
                  />
                </Grid>
              );
            })}
          </Grid>
          <Box textAlign="right" mt={3}>
            <Button variant="contained" color="primary" onClick={saveEdit}>Save</Button>
            {hasPermission("operation", "verify") && (
              <Button variant="contained" color="success" sx={{ ml: 1 }} onClick={handleVerifyItineray}>Verify</Button>
            )}
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
      <SnackbarComponent />
      {/* change request popup */}
      <Dialog open={changeRequestOpen} onClose={() => setChangeRequestOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Request</DialogTitle>
        <DialogContent>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangeRequestOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangeRequest}>
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={verifyPopupOpen} onClose={() => setVerifyPopupOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Verify Itinerary (Day {itineraryData[editIndex]?.day})</DialogTitle>
        <DialogContent>
          <Typography>Select Status</Typography>
          <Box mt={1}>
            <Button
              variant={verifyStatus === 'Approved' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setVerifyStatus('Approved')}
              sx={{ mr: 1 }}
            >
              Approve
            </Button>
            <Button
              variant={verifyStatus === 'Rejected' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setVerifyStatus('Rejected')}
            >
              Reject
            </Button>
          </Box>

          {verifyStatus === 'Rejected' && (
            <TextField
              label="Rejection Reason"
              fullWidth
              multiline
              rows={3}
              value={rejectedReason}
              onChange={(e) => setRejectedReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyPopupOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!verifyStatus || (verifyStatus === 'Rejected' && !rejectedReason.trim())}
            onClick={async () => {
              const updatedItinerary = [...itineraryData];
              const item = updatedItinerary[editIndex];

              item.status = verifyStatus;

              if (verifyStatus === 'Rejected') {
                item.rejected_reason = item.rejected_reason || [];
                item.rejected_reason.push({ description: rejectedReason });
              }

              const res = await updateFollowupDetails(fetchSelectedquerie.id, {
                followup_details: updatedItinerary
              });

              if (res) {
                setItineraryData(updatedItinerary);
                showSnackbar(`Day ${item.day} marked as ${verifyStatus}`, "success");
                setVerifyPopupOpen(false);
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectedViewOpen} onClose={() => setRejectedViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>All Rejected Reasons</DialogTitle>
        <DialogContent dividers>
          {itineraryData.filter(day => Array.isArray(day.rejected_reason) && day.rejected_reason.length > 0).length === 0 ? (
            <Typography>No rejected reasons found.</Typography>
          ) : (
            itineraryData.map((day, idx) =>
              Array.isArray(day.rejected_reason) && day.rejected_reason.length > 0 ? (
                <Box key={idx} sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                  <Typography fontWeight="bold" gutterBottom>
                    Day {day.day} - {formatDate(day.date)} - {day.place}
                  </Typography>
                  {day.rejected_reason.map((entry, i) => (
                    <Typography variant="body2" key={i} sx={{ pl: 2 }}>
                      • {new Date(entry.date_time).toLocaleString()} — {entry.description}
                    </Typography>
                  ))}
                </Box>
              ) : null
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectedViewOpen(false)} color="primary" variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default SingleQueriesView;

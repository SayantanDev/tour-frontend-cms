import React, { useEffect, useState, useMemo } from 'react';

import {
  Box, Button, Divider, Drawer, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Autocomplete,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useSelector } from 'react-redux';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { getAllHotels } from '../../api/hotelsAPI';
import { getAllVehicle } from '../../api/vehicleAPI';
import { addChangeRequest, addChangeRequestForItineray, getQueriesByoperation, getSingleOperation, updateFollowupDetails } from '../../api/operationAPI';
import { calculateSingleHotelCost } from '../createItinerary/createInquiryCalculation';
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
  { label: 'Room Type', field: 'roomType' },
  { label: 'Meal Plan', field: 'mealPlan' },
  { label: 'Vehicle Name', field: 'vehicleName' },
  { label: 'Vehicle Payment', field: 'vehiclePayment' },
  { label: 'Vehicle Status', field: 'vehicleStatus' },
  { label: 'Driver Name', field: 'driverName' },
  { label: 'CRV', field: 'status' }
];

const SingleQueriesView = () => {
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
  const [operationId, setOperationId] = useState(null);
  const [guestDrawer, setGuestDrawer] = useState(false);
  const [bookingDrawer, setBookingDrawer] = useState(false);
  const [guestInfo, setGuestInfo] = useState({});
  const [changeRequestOpen, setChangeRequestOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [editHistory, setEditHistory] = useState([]);
  const [hotelSeason, setHotelSeason] = useState('off_season_price');
  const [stayInfo, setStayInfo] = useState({ rooms: 0, hotel: '' });
  const [tripDetails, setTripDetails] = useState({ pax: 0, kids_above_5: 0, duration: 0 });

  const [verifyPopupOpen, setVerifyPopupOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('');
  const [rejectedReason, setRejectedReason] = useState('');
  const [verifyIndex, setVerifyIndex] = useState(null); // index of the itinerary row
  const [rejectedViewOpen, setRejectedViewOpen] = useState(false);

  const fetchOperationData = async () => {
    if (!fetchSelectedquerie?._id) {
      console.error("No selected query ID found");
      return;
    }

    try {
      const operationData = await getSingleOperation(fetchSelectedquerie?._id);
      if (!operationData) return;
      setOperationId(operationData._id);

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
        hotelId: item.hotel_id || '',
        roomType: item.room_type || '',
        mealPlan: item.meal_plan || '',
        status: item.approved_status || '',
        rejected_reason: item.rejected_reason || [],
      })) || []

      setItineraryData(followUpData);
      const queriesData = await getQueriesByoperation(operationData._id);

      setTripDetails({
        pax: operationData?.trip_details?.number_of_adults || 0,
        kids_above_5: operationData?.trip_details?.number_of_kids || 0,
        duration: operationData?.trip_details?.duration || 0,
      });

      setStayInfo({
        hotel: queriesData?.stay_info?.hotel || '',
        rooms: queriesData?.stay_info?.rooms || 0,
      });

      const guestAndStayData = {
        name: operationData?.guest_info?.name || '',
        country_code: operationData?.guest_info?.country_code || '+91',
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
          !isNaN(parseFloat(queriesData?.cost)) && !isNaN(parseFloat(queriesData?.advance))
            ? parseFloat(queriesData.cost) - parseFloat(queriesData.advance)
            : '',
      }
      setGuestInfo(guestAndStayData);
    } catch (error) {
      console.error("Error fetching operation data:", error);
      showSnackbar("Failed to fetch operation data", "error");
    }
  }

  useEffect(() => {
    fetchOperationData();
    getAllHotels().then(setHotels);
    getAllVehicle().then(setVehicles);
  }, [fetchSelectedquerie?._id]);

  const handleGuestChange = (e) => {
    setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
  };

  const openEditDrawer = (row, index) => {
    setEditRow(row);
    setEditIndex(index);
    setDrawerOpen(true);

    const selectedHotel = hotels.find(h => h.hotel_name === row.hotelName || h._id === row.hotelId);
    setRoomOptions(selectedHotel?.category || []);

    const owner = vehicles.find(v => v.vehicles.some(veh => veh.vehicle_name === row.vehicleName));
    setDriverOptions(owner?.drivers || []);
  };

  // Helpers for Pricing Status (Matched with HotelSelectionCard.js)
  const hasHotelPrice = (hotelId) => {
    if (!hotelSeason) return false;
    const hotel = hotels.find(h => h._id === hotelId);
    if (!hotel) return false;
    return hotel.category?.some(cat => {
      const pricing = cat[hotelSeason];
      if (!pricing) return false;
      return ['cp_plan', 'map_plan', 'ap_plan'].some(plan => pricing[plan] > 0);
    });
  };

  const hasRoomPrice = (hotelId, roomCat) => {
    if (!hotelSeason) return false;
    const hotel = hotels.find(h => h._id === hotelId);
    const cat = hotel?.category?.find(c => c.room_cat === roomCat);
    if (!cat) return false;
    const pricing = cat[hotelSeason];
    if (!pricing) return false;
    return ['cp_plan', 'map_plan', 'ap_plan'].some(plan => pricing[plan] > 0);
  };

  const hasMealPlanPrice = (hotelId, roomCat, mealPlan) => {
    if (!hotelSeason || !mealPlan) return false;
    const hotel = hotels.find(h => h._id === hotelId);
    const cat = hotel?.category?.find(c => c.room_cat === roomCat);
    const pricing = cat?.[hotelSeason];
    return pricing?.[mealPlan] > 0;
  };

  const handleEditChange = (e) => {
    setEditRow({ ...editRow, [e.target.name]: e.target.value });
  };

  const mapItineraryToPayload = (data) => {
    return data.map(item => ({
      _id: item.id,
      journey_date: item.date,
      destination: item.place,
      hotel_name: item.hotelName,
      hotel_amount: item.hotelAmount,
      hotel_confirmation: item.hotelConfirmation,
      checkin_date: item.checkinDate,
      checkout_date: item.checkoutDate,
      meal_plan: item.mealPlan,
      room_type: item.roomType,
      hotel_id: item.hotelId,
      vehicle_name: item.vehicleName,
      vehicle_payment: item.vehiclePayment,
      vehicle_status: item.vehicleStatus,
      driver: item.driverName,
      approved_status: item.status,
      rejected_reason: item.rejected_reason || []
    }));
  };

  // const saveEdit = async () => {
  //   const newData = [...itineraryData];
  //   newData[editIndex] = editRow;
  //   const itnObj = { followup_details: newData }
  //   setItineraryData(newData);
  //   const res = await updateFollowupDetails(fetchSelectedquerie?._id, itnObj);
  //   if (res) {
  //     showSnackbar(res.message, "success");
  //   }
  //   setDrawerOpen(false);
  // };

  const saveEdit = async () => {
    try {
      console.log("Saving edit...", { editIndex, editRow, itineraryData });

      if (editIndex === null || !itineraryData[editIndex]) {
        showSnackbar("Error: Invalid edit state", "error");
        return;
      }

      const newData = [...itineraryData];
      const originalRow = itineraryData[editIndex];
      const updatedRow = { ...editRow };

      const changedFields = [];
      let hasChanged = false;

      // Compare and collect changed fields
      for (const key in updatedRow) {
        if (key !== 'day' && key !== 'rejected_reason' && updatedRow[key] !== originalRow[key]) {
          changedFields.push(`${key}: ${originalRow[key]} -> ${updatedRow[key]}`);
          hasChanged = true;
        }
      }

      if (!hasChanged) {
        showSnackbar("No changes detected.", "info");
        setDrawerOpen(false);
        return;
      }

      if (hasPermission("operation", "alter")) {
        // DIRECT SAVE logic for authorized roles
        updatedRow.status = "Pending";
        newData[editIndex] = updatedRow;

        const payload = mapItineraryToPayload(newData);
        const res = await updateFollowupDetails(operationId, { followup_details: payload });

        if (res) {
          showSnackbar(res.message || "Changes saved successfully", "success");
          setItineraryData(newData);
          setDrawerOpen(false);
        }
      } else if (hasPermission("operation", "changeRequest")) {
        // CHANGE REQUEST logic for roles like 'User'
        const changeDescription = `Day ${updatedRow.day} changes: ${changedFields.join(", ")}`;
        const res = await addChangeRequestForItineray(operationId, { description: changeDescription });

        if (res) {
          showSnackbar("Change request submitted successfully", "success");
          setDrawerOpen(false);
        }
      } else {
        showSnackbar("Resource not allowed", "error");
      }
    } catch (error) {
      console.error("Error in saveEdit:", error);
      showSnackbar(error.response?.data?.message || "Failed to process request", "error");
    }
  };

  // Auto-update cost when season changes in drawer
  useEffect(() => {
    if (drawerOpen && editRow.hotelId && editRow.roomType && editRow.mealPlan) {
      const cost = calculateSingleHotelCost(
        { hotelId: editRow.hotelId, roomType: editRow.roomType, mealPlan: editRow.mealPlan },
        hotels,
        hotelSeason,
        tripDetails,
        stayInfo
      );
      if (cost !== editRow.hotelAmount) {
        setEditRow(prev => ({ ...prev, hotelAmount: cost || 0 }));
      }
    }
  }, [hotelSeason]);

  const saveGuestInfo = () => {
    setGuestDrawer(false);
  };

  const handleVerifyItineray = async () => {
    // const res = await verifyItinerary(fetchSelectedquerie?._id);
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
    { label: 'Country Code', field: 'country_code' },
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
        const canEdit = hasPermission("operation", "alter") || hasPermission("operation", "changeRequest");
        return canEdit ? (
          <IconButton onClick={() => openEditDrawer(rowData, rowIndex)}>
            <EditOutlinedIcon color="primary" />
          </IconButton>
        ) : null;
      },
    },
  ], [openEditDrawer, hasPermission]);

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

    await addChangeRequest(fetchSelectedquerie?._id, { description });
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
                        <TableCell>
                          {item.field === 'contact'
                            ? `${guestInfo.country_code || ''} ${guestInfo.contact || ''}`
                            : guestInfo[item.field] || 'N/A'}
                        </TableCell>
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
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {hasPermission("operation", "alter") ? "Edit Itinerary" : "Submit Change Request"}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Hotel Season</InputLabel>
                <Select
                  value={hotelSeason}
                  label="Hotel Season"
                  onChange={(e) => setHotelSeason(e.target.value)}
                >
                  <MenuItem value="off_season_price">Off Season</MenuItem>
                  <MenuItem value="season_price">Season</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {columnsData.map((col) => {
              if (col.field === 'hotelName') {
                return (
                  <Grid item xs={12} key={col.field}>
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={hotels}
                      getOptionLabel={(option) => `${option.hotel_name} (${option.sub_destination || option.location})`}
                      value={hotels.find(h => h._id === editRow.hotelId || h.hotel_name === editRow.hotelName) || null}
                      onChange={(e, value) => {
                        const updatedRow = {
                          ...editRow,
                          hotelId: value?._id || '',
                          hotelName: value?.hotel_name || '',
                          roomType: '',
                          mealPlan: ''
                        };
                        const cost = calculateSingleHotelCost(
                          { hotelId: updatedRow.hotelId, roomType: updatedRow.roomType, mealPlan: updatedRow.mealPlan },
                          hotels,
                          hotelSeason,
                          tripDetails,
                          stayInfo
                        );
                        setEditRow({ ...updatedRow, hotelAmount: cost || 0 });
                        setRoomOptions(value?.category || []);
                      }}
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        const priced = hasHotelPrice(option._id);
                        return (
                          <Box
                            key={key}
                            component="li"
                            {...optionProps}
                            sx={{
                              backgroundColor: priced ? '#e8f5e9 !important' : '#ffebee !important',
                              '&:hover': {
                                backgroundColor: priced ? '#c8e6c9 !important' : '#ffcdd2 !important',
                              }
                            }}
                          >
                            {option.hotel_name} ({option.sub_destination || option.location})
                          </Box>
                        );
                      }}
                      renderInput={(params) => <TextField {...params} label="Hotel Name" size="small" />}
                    />
                  </Grid>
                );
              }
              if (col.field === 'hotelAmount') {
                return (
                  <React.Fragment key={col.field}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small" disabled={!editRow.hotelId}>
                        <InputLabel>Room Type</InputLabel>
                        <Select
                          value={editRow.roomType || ''}
                          label="Room Type"
                          onChange={(e) => {
                            const updatedRow = { ...editRow, roomType: e.target.value };
                            const cost = calculateSingleHotelCost(
                              { hotelId: updatedRow.hotelId, roomType: updatedRow.roomType, mealPlan: updatedRow.mealPlan },
                              hotels,
                              hotelSeason,
                              tripDetails,
                              stayInfo
                            );
                            setEditRow({ ...updatedRow, hotelAmount: cost || 0 });
                          }}
                        >
                          {roomOptions.map((cat, index) => {
                            const priced = hasRoomPrice(editRow.hotelId, cat.room_cat);
                            return (
                              <MenuItem
                                key={index}
                                value={cat.room_cat}
                                sx={{
                                  backgroundColor: priced ? '#e8f5e9' : '#ffebee',
                                  '&:hover': { backgroundColor: priced ? '#c8e6c9' : '#ffcdd2' }
                                }}
                              >
                                {cat.room_cat}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small" disabled={!editRow.roomType}>
                        <InputLabel>Meal Plan</InputLabel>
                        <Select
                          value={editRow.mealPlan || ''}
                          label="Meal Plan"
                          onChange={(e) => {
                            const updatedRow = { ...editRow, mealPlan: e.target.value };
                            const cost = calculateSingleHotelCost(
                              { hotelId: updatedRow.hotelId, roomType: updatedRow.roomType, mealPlan: updatedRow.mealPlan },
                              hotels,
                              hotelSeason,
                              tripDetails,
                              stayInfo
                            );
                            setEditRow({ ...updatedRow, hotelAmount: cost || 0 });
                          }}
                        >
                          {[
                            { value: 'cp_plan', label: 'CP (Breakfast)' },
                            { value: 'map_plan', label: 'MAP (Breakfast + 1 major meal)' },
                            { value: 'ap_plan', label: 'AP (All Meals)' }
                          ].map((plan) => {
                            const priced = hasMealPlanPrice(editRow.hotelId, editRow.roomType, plan.value);
                            return (
                              <MenuItem
                                key={plan.value}
                                value={plan.value}
                                sx={{
                                  backgroundColor: priced ? '#e8f5e9' : '#ffebee',
                                  '&:hover': { backgroundColor: priced ? '#c8e6c9' : '#ffcdd2' }
                                }}
                              >
                                {plan.label}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Hotel Amount"
                        size="small"
                        type="number"
                        value={editRow.hotelAmount || ''}
                        onChange={(e) => setEditRow({ ...editRow, hotelAmount: e.target.value })}
                        helperText="Calculated automatically, but can be overridden"
                      />
                    </Grid>
                  </React.Fragment>
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
              if (['roomType', 'mealPlan'].includes(col.field)) return null;
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
            <Button variant="contained" color="primary" onClick={saveEdit}>
              {hasPermission("operation", "alter") ? "Save" : "Submit Request"}
            </Button>
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

              const res = await updateFollowupDetails(fetchSelectedquerie?._id, {
                followup_details: mapItineraryToPayload(updatedItinerary)
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

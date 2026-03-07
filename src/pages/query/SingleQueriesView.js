import React, { useEffect, useState, useMemo, useCallback } from 'react';

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
  MenuItem,
  Chip,
  Stack,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  CircularProgress
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import BedroomParentIcon from '@mui/icons-material/BedroomParent';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import GroupsIcon from '@mui/icons-material/Groups';
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

const getStatusChip = (status) => {
  const s = typeof status === 'string' ? status : (status?.status || status?.label || '');
  switch (s.toLowerCase()) {
    case 'approved':
      return <Chip label="Approved" color="success" size="small" icon={<VerifiedIcon />} variant="filled" sx={{ fontWeight: 'bold' }} />;
    case 'rejected':
      return <Chip label="Rejected" color="error" size="small" icon={<ErrorOutlineIcon />} variant="filled" sx={{ fontWeight: 'bold' }} />;
    case 'pending':
      return <Chip label="Pending" color="warning" size="small" icon={<PendingActionsIcon />} variant="filled" sx={{ fontWeight: 'bold' }} />;
    case 'change request':
    case 'change-request':
      return <Chip label="Change Request" color="info" size="small" icon={<EditOutlinedIcon />} variant="filled" sx={{ fontWeight: 'bold' }} />;
    default:
      return <Chip label={s || 'N/A'} size="small" variant="outlined" sx={{ fontWeight: '500' }} />;
  }
};

const getMealPlanLabel = (plan) => {
  const plans = {
    'cp_plan': 'CP (Breakfast)',
    'map_plan': 'MAP (Bf + 1 Meal)',
    'ap_plan': 'AP (All Meals)',
    'ep_plan': 'EP (No Meals)'
  };
  return plans[plan] || plan || '-';
};

const SingleQueriesView = () => {
  const { fetchSelectedquerie } = useSelector((state) => state.queries || {});
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectedViewOpen, setRejectedViewOpen] = useState(false);

  const fetchOperationData = useCallback(async () => {
    if (!fetchSelectedquerie?._id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

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
        roomType: item.room_type || item.roomType || '',
        mealPlan: item.meal_plan || item.mealPlan || '',
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
        roomType: queriesData?.stay_info?.room_type || queriesData?.stay_info?.roomType || '',
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching operation data:", error);
      setError("Failed to load data. Please try again.");
      showSnackbar("Failed to fetch operation data", "error");
      setLoading(false);
    }
  }, [fetchSelectedquerie?._id]);

  useEffect(() => {
    fetchOperationData();
    getAllHotels().then(setHotels);
    getAllVehicle().then(setVehicles);
  }, [fetchSelectedquerie?._id]);

  const handleGuestChange = (e) => {
    setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
  };

  const openEditDrawer = useCallback((row, index) => {
    setEditRow(row);
    setEditIndex(index);
    setDrawerOpen(true);

    if (hotels && hotels.length > 0) {
      const selectedHotel = hotels.find(h => h.hotel_name === row.hotelName || h._id === row.hotelId);
      setRoomOptions(selectedHotel?.category || []);
    }

    if (vehicles && vehicles.length > 0) {
      const owner = vehicles.find(v => v.vehicles.some(veh => veh.vehicle_name === row.vehicleName));
      setDriverOptions(owner?.drivers || []);
    }
  }, [hotels, vehicles]);

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
      } else if (hasPermission("operation", "changeRequest") || hasPermission("operation", "change-request")) {
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
    { label: 'Name', field: 'name', icon: <PersonIcon /> },
    { label: 'Contact', field: 'contact', icon: <PhoneIcon /> },
    { label: 'Email', field: 'email', icon: <EmailIcon /> },
    { label: 'Pax', field: 'pax', icon: <GroupsIcon /> },
    { label: 'Hotel', field: 'hotel', icon: <HotelIcon /> },
    { label: 'Room Type', field: 'roomType', icon: <BedroomParentIcon /> },
    { label: 'Rooms', field: 'rooms', icon: <BedroomParentIcon /> },
    { label: 'Car Name', field: 'carname', icon: <DirectionsCarIcon /> },
    { label: 'Car Count', field: 'carcount', icon: <InfoIcon /> },
  ];

  const bookingFields = [
    { label: 'Source', field: 'source', icon: <InfoIcon /> },
    { label: 'Booking Date', field: 'bookingDate', icon: <CalendarMonthIcon /> },
    { label: 'Tour Date', field: 'tourDate', icon: <CalendarMonthIcon /> },
    { label: 'Booking Status', field: 'bookingStatus', icon: <VerifiedIcon /> },
    { label: 'Cost', field: 'cost', icon: <InfoIcon /> },
    { label: 'Advance Payment', field: 'advancePayment', icon: <InfoIcon /> },
    { label: 'Due Payment', field: 'duePayment', icon: <InfoIcon /> },
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
        const canEdit = hasPermission("operation", "alter") || hasPermission("operation", "changeRequest") || hasPermission("operation", "change-request");
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

  if (!fetchSelectedquerie?._id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 4, maxWidth: 500 }}>
          <WarningAmberIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>No Query Selected</Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a query from the list to view its details.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">Loading query details...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 4, maxWidth: 400 }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>{error}</Typography>
          <Button variant="contained" onClick={fetchOperationData} sx={{ mt: 2 }}>Retry</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Premium Guest & Booking Details Header */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '0.02em' }}>Query Details</Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Overview of guest information and booking status</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            {(hasPermission("operation", "changeRequest") || hasPermission("operation", "change-request")) && (
              <Button
                variant="contained"
                sx={{ bgcolor: 'white', color: '#1976d2', '&:hover': { bgcolor: '#f0f0f0' }, fontWeight: 'bold', borderRadius: 2 }}
                onClick={() => setChangeRequestOpen(true)}
              >
                Change Request
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Guest Information Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 4, height: '100%', border: '1px solid #e0e0e0' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fbfc', borderBottom: '1px solid #eef2f6' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="text.primary">Guest & Stay Information</Typography>
              </Stack>
              {hasPermission("operation", "alter") && (
                <Tooltip title="Edit Guest Details">
                  <IconButton size="small" onClick={() => setGuestDrawer(true)} sx={{ color: '#1976d2' }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <CardContent>
              <Grid container spacing={2}>
                {guestFields.map((item) => (
                  <Grid item xs={12} sm={6} key={item.field}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ color: '#64748b', mt: 0.5 }}>{item.icon}</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {item.field === 'contact'
                            ? `${guestInfo.country_code || ''} ${guestInfo.contact || ''}`
                            : guestInfo[item.field] || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Details Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 4, height: '100%', border: '1px solid #e0e0e0' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fbfc', borderBottom: '1px solid #eef2f6' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: '#d32f2f', width: 32, height: 32 }}>
                  <CalendarMonthIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="text.primary">Booking & Payment</Typography>
              </Stack>
              {hasPermission("operation", "alter") && (
                <Tooltip title="Edit Booking Details">
                  <IconButton size="small" onClick={() => setBookingDrawer(true)} sx={{ color: '#d32f2f' }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <CardContent>
              <Grid container spacing={2}>
                {bookingFields.map((item) => (
                  <Grid item xs={12} sm={6} key={item.field}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ color: '#64748b', mt: 0.5 }}>{item.icon}</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {['bookingDate', 'tourDate'].includes(item.field)
                            ? formatDate(guestInfo[item.field])
                            : item.field === 'bookingStatus'
                              ? <Chip label={guestInfo[item.field] || 'N/A'} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 'bold' }} />
                              : guestInfo[item.field] || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Premium Short Itinerary Section */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="800" color="text.primary">Short Itinerary</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <VerifiedIcon sx={{ color: '#1976d2', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                {itineraryData.filter(d => d.status === 'Approved').length} of {itineraryData.length} days verified
              </Typography>
            </Stack>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ErrorOutlineIcon />}
            onClick={() => setRejectedViewOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
          >
            View Rejections
          </Button>
        </Stack>

        <Stack spacing={2.5}>
          {itineraryData.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: '#f8fbfc', border: '2px dashed #e0e0e0' }}>
              <InfoIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" color="text.secondary">No itinerary details available for this query.</Typography>
            </Paper>
          ) : itineraryData.map((day, index) => (
            <Card key={index} elevation={2} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', transition: '0.3s', '&:hover': { boxShadow: 6, borderColor: '#1976d2' } }}>
              <Grid container>
                {/* Day/Date Sidebar */}
                <Grid item xs={12} sm={2} sx={{ bgcolor: '#f8fbfc', p: 2, borderRight: { sm: '1px solid #eef2f6' }, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="950" color="primary" sx={{ mb: 0 }}>D{day.day}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ display: 'block', mb: 1 }}>{formatDate(day.date)}</Typography>
                  <Box sx={{ mb: 1 }}>
                    {getStatusChip(day.status)}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Tooltip title="Edit this day">
                      <IconButton size="small" onClick={() => openEditDrawer(day, index)} sx={{ color: '#1976d2', border: '1px solid #e0e0e0' }}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                {/* Main Content */}
                <Grid item xs={12} sm={10} sx={{ p: 2.5 }}>
                  <Grid container spacing={3}>
                    {/* Destination & Basic Info */}
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnIcon color="error" fontSize="small" />
                        <Typography variant="h6" fontWeight="bold">{day.place}</Typography>
                      </Stack>
                      <Divider sx={{ my: 1.5 }} />
                    </Grid>

                    {/* Hotel Content */}
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2}>
                        <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}>
                          <HotelIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">HOTEL ACCOMMODATION</Typography>
                          <Typography variant="body2" fontWeight="700">{day.hotelName || 'No Hotel Selected'}</Typography>
                          <Stack direction="row" spacing={3} sx={{ mt: 1.5 }} flexWrap="wrap">
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">Stay Period</Typography>
                              <Typography variant="body2" fontWeight="500">
                                {day.checkinDate && day.checkoutDate
                                  ? `${formatDate(day.checkinDate)} - ${formatDate(day.checkoutDate)}`
                                  : '-'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">Room Type</Typography>
                              <Typography variant="body2" fontWeight="500">{day.roomType || '-'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">Meal Plan</Typography>
                              <Typography variant="body2" fontWeight="500">{getMealPlanLabel(day.mealPlan)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">Amount</Typography>
                              <Typography variant="body2" fontWeight="700" color="success.main">₹{day.hotelAmount || '0'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">Confirm No.</Typography>
                              <Typography variant="body2" fontWeight="600" color="primary">{day.hotelConfirmation || '-'}</Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Vehicle Content */}
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2}>
                        <Avatar sx={{ bgcolor: '#f1f8e9', color: '#388e3c' }}>
                          <DirectionsCarIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">VEHICLE & DRIVER</Typography>
                          <Typography variant="body2" fontWeight="700">{day.vehicleName || 'No Vehicle Assigned'}</Typography>
                          <Stack direction="row" spacing={3} sx={{ mt: 1.5 }} flexWrap="wrap">
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">Driver Name</Typography>
                              <Typography variant="body2" fontWeight="500">{day.driverName || '-'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">Payment Status</Typography>
                              <Typography variant="body2" fontWeight="500">{day.vehiclePayment || '-'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">Logistics Status</Typography>
                              <Typography variant="body2" fontWeight="500">{day.vehicleStatus || '-'}</Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Stack>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 550, p: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: '#1976d2' }}><EditOutlinedIcon /></Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {hasPermission("operation", "alter") ? "Edit Itinerary" : "Change Request"}
              </Typography>
              <Typography variant="body2" color="text.secondary">Modify day details and accommodations</Typography>
            </Box>
          </Stack>
          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            {/* Season Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon fontSize="small" /> PRICING SEASON
              </Typography>
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

            {/* Hotel Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <HotelIcon fontSize="small" /> ACCOMMODATION DETAILS
              </Typography>
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
                <Grid item xs={12} sm={6} key={col.field}>
                  {col.field === 'vehicleName' && (
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
                      <DirectionsCarIcon fontSize="small" /> VEHICLE & LOGISTICS
                    </Typography>
                  )}
                  <TextField
                    fullWidth
                    size="small"
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

          <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #eef2f6', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, px: 3 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={saveEdit} sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}>
              {hasPermission("operation", "alter") ? "Save Changes" : "Submit Request"}
            </Button>
            {hasPermission("operation", "verify") && (
              <Button variant="contained" color="success" onClick={handleVerifyItineray} sx={{ borderRadius: 2, px: 3 }}>
                Verify
              </Button>
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
        <DialogTitle>Verify Itinerary (Day {editIndex !== null && itineraryData[editIndex] ? itineraryData[editIndex].day : ''})</DialogTitle>
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
              const item = editIndex !== null ? updatedItinerary[editIndex] : null;

              if (!item) {
                showSnackbar("Error: No item selected for verification", "error");
                return;
              }

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

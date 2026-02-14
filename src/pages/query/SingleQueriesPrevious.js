import React, { useState, useMemo } from 'react';
import {
  Box,
  Divider,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid2,
} from '@mui/material';
// import Grid2 from '@mui/material/Unstable_Grid2';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useSelector } from 'react-redux';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

const itineraryDataInitial = [
  { day: '1', date: '05-Apr-25', hotel: 'demo hotel', payment: 4000, confirmation: 'dome', place: 'Reach Dhotrey' },
  { day: '2', date: '06-Apr-25', hotel: 'demo hotel', payment: 4000, confirmation: 'dome', place: 'Dhotrey to Tumling' },
  { day: '3', date: '07-Apr-25', hotel: 'demo hotel', payment: 4000, confirmation: 'dome', place: 'Tumling to Kalipokhari' },
  { day: '4', date: '08-Apr-25', hotel: 'demo hotel', payment: 4000, confirmation: 'dome', place: 'Kalipokhari to Sandakphu' },
  { day: '5', date: '09-Apr-25', hotel: 'demo hotel', payment: 4000, confirmation: 'dome', place: 'Sandakphu to Srikhola' },
  { day: '6', date: '10-Apr-25', hotel: 'demo hotel', payment: 4000, confirmation: 'dome', place: 'Onward journey from Srikhola' },
];

function SingleQueriesView() {
  const { fetchSelectedquerie } = useSelector((state) => state.queries);
  const [editGuest, setEditGuest] = useState(false);
  const [editBooking, setEditBooking] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: fetchSelectedquerie?.guest_info?.guest_name || '',
    contact: fetchSelectedquerie?.guest_info?.guest_phone || '',
    email: fetchSelectedquerie?.guest_info?.guest_email || '',
    pax: fetchSelectedquerie?.pax || '',
    hotel: fetchSelectedquerie?.stay_info?.hotel || '',
    rooms: fetchSelectedquerie?.stay_info?.rooms || '',
    carname: fetchSelectedquerie?.car_details?.car_name || '',
    carcount: fetchSelectedquerie?.car_details?.car_count || '',
    source: fetchSelectedquerie?.lead_source || '',
    bookingDate: fetchSelectedquerie?.created_at?.slice(0, 10) || '',
    tourDate: fetchSelectedquerie?.travel_date?.slice(0, 10) || '',
    bookingStatus: fetchSelectedquerie?.lead_stage || '',
    cost: fetchSelectedquerie?.cost || '',
    advancePayment: fetchSelectedquerie?.advance || '',
  });

  const [itineraryData, setItineraryData] = useState(itineraryDataInitial);

  const handleGuestChange = (e) => {
    setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
  };

  const handleItineraryChange = (index, field, value) => {
    const newData = [...itineraryData];
    newData[index][field] = value;
    setItineraryData(newData);
  };

  const columnLabels = [
    'Day',
    'Date',
    'Place',
    'Hotel',
    'Payment',
    'Confirmation',
    'Check-In / Check-Out',
    'Meal Plan',
    'Vehicle',
    'Notes',
  ];

  const fieldKeys = [
    'day',
    'date',
    'place',
    'hotel',
    'payment',
    'confirmation',
    'checkInOut',
    'mealPlan',
    'vehicle',
    'notes',
  ];

  // Column definitions for @tanstack/react-table
  const columns = useMemo(() => 
    fieldKeys.map((field, index) => ({
      accessorKey: field,
      header: columnLabels[index],
      cell: ({ row }) => {
        const rowData = row.original;
        const rowIndex = row.index;
        return (
          <TextField
            variant="standard"
            fullWidth
            value={rowData[field] || ''}
            onChange={(e) => handleItineraryChange(rowIndex, field, e.target.value)}
          />
        );
      },
    }))
  , [fieldKeys, columnLabels, handleItineraryChange]);

  // Table instance
  const table = useReactTable({
    data: itineraryData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Grid2 container>
      <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold" color="primary">
        Query Details
      </Typography>

      <Grid2 container spacing={4} sx={{ mt: 3 }}>
        {/* Guest & Stay Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold" color="secondary" gutterBottom>
                Guest & Stay Information
              </Typography>
              <Typography sx={{ cursor: 'pointer' }} onClick={() => setEditGuest(!editGuest)}>
                <EditOutlinedIcon />
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {['name', 'contact', 'email', 'pax', 'hotel', 'rooms', 'carname', 'carcount'].map((key) => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    name={key}
                    value={guestInfo[key]}
                    onChange={handleGuestChange}
                    disabled={!editGuest}
                  />
                </Grid>
              ))}
            </Grid>
            {editGuest && (
              <Box textAlign="right" mt={2}>
                <Button variant="contained" color="primary" onClick={() => setEditGuest(false)}>
                  Save
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Booking & Payment */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold" color="secondary" gutterBottom>
                Booking & Payment
              </Typography>
              <Typography sx={{ cursor: 'pointer' }} onClick={() => setEditBooking(!editBooking)}>
                <EditOutlinedIcon />
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {['source', 'bookingDate', 'tourDate', 'bookingStatus', 'cost', 'advancePayment'].map((key) => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    name={key}
                    value={guestInfo[key]}
                    onChange={handleGuestChange}
                    disabled={!editBooking}
                  />
                </Grid>
              ))}
            </Grid>
            {editBooking && (
              <Box textAlign="right" mt={2}>
                <Button variant="contained" color="primary" onClick={() => setEditBooking(false)}>
                  Save
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid2>

      {/* Short Itinerary */}
      <Box sx={{ mt: 6, mb: 10 }}>
        <Typography variant="h5" color="error" fontWeight="bold" align="center" gutterBottom>
          Short Itinerary
        </Typography>

        <TableContainer component={Paper} elevation={3} sx={{ marginTop: '20px' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#e8f5e9' }}>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const fieldKey = header.column.columnDef.accessorKey;
                    return (
                      <TableCell
                        key={header.id}
                        sx={fieldKey === 'place' ? { width: '250px' } : { width: 'auto' }}
                      >
                        <strong>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </strong>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{ backgroundColor: index % 2 === 0 ? '#f1f8e9' : '#ffffff' }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const fieldKey = cell.column.columnDef.accessorKey;
                    return (
                      <TableCell
                        key={cell.id}
                        sx={fieldKey === 'place' ? { width: '250px' } : {}}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Grid2>
  );
};

export default SingleQueriesView;

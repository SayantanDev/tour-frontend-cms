import React, { useEffect, useState } from "react";
import { Container, Typography, Button, IconButton, Tooltip, Box } from '@mui/material';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import HikingIcon from '@mui/icons-material/Hiking';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../components/dataTable';
import { getAllQueries } from "../../api/queriesAPI";

const Query = () => {
    const [query, setQuery] = useState([]);
    const [filteredQuery, setFilteredQuery] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuery = async () => {
            try {
                const response = await getAllQueries();
                const sortedData = response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setQuery(sortedData);
                setFilteredQuery(sortedData);
            } catch (error) {
                console.error("Error fetching query:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuery();
    }, []);

    const handleView = (id) => {
        console.log("Viewing query:", id);
        // Implement navigation or modal logic
    };

    const handleEdit = (id) => {
        console.log("Editing query:", id);
        // Implement edit functionality
    };

    const handleDelete = (id) => {
        console.log("Deleting query:", id);
        // Implement delete functionality (show confirmation dialog)
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'contact', headerName: 'Contact', width: 110 },
        { field: 'bookingDate', headerName: 'Booking Date', width: 130 },
        { field: 'tourDate', headerName: 'Tour Date', width: 130 },
        { field: 'bookingStatus', headerName: 'Status', width: 120 },
        { field: 'cost', headerName: 'Cost', width: 120 },
        { field: 'advancePayment', headerName: 'Advance Payment', width: 150 },
        { 
            field: 'action', 
            headerName: 'Action', 
            width: 180, 
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View">
                        <IconButton color="primary" size="small" onClick={() => handleView(params.row.id)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton color="warning" size="small" onClick={() => handleEdit(params.row.id)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton color="error" size="small" onClick={() => handleDelete(params.row.id)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    const rows = filteredQuery.map((item) => ({
        id: item._id,
        name: item.guest_info?.guest_name || "N/A",
        contact: item.guest_info?.guest_phone || "N/A",
        bookingDate: new Date(item.created_at).toLocaleDateString(),
        tourDate: new Date(item.travel_date).toLocaleDateString(),
        bookingStatus: item.lead_stage || "Pending",
        cost: item.cost || "N/A",
        advancePayment: item.advancePayment ? `₹${item.advancePayment}` : "₹0",
    }));

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Typography variant="h5" gutterBottom>
                Queries
            </Typography>

            {/* Filter Buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Button variant="contained" size="small" color="warning" startIcon={<UpcomingIcon />}>
                    Upcoming
                </Button>
                <Button variant="contained" size="small" color="primary" startIcon={<HikingIcon />}>
                    Current
                </Button>
                <Button variant="contained" size="small" color="success" startIcon={<ShoppingCartIcon />}>
                    Advance Paid
                </Button>
                <Button variant="contained" size="small" color="success" startIcon={<CurrencyRupeeIcon />}>
                    Paid
                </Button>
                <Button variant="contained" size="small" color="secondary" startIcon={<DateRangeIcon />}>
                    Old
                </Button>
            </Box>

            {/* Data Table */}
            <Box sx={{ height: 500, width: '100%', backgroundColor: 'white', boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                <DataTable rows={rows} columns={columns} loading={loading} />
            </Box>
        </Container>
    );
};

export default Query;

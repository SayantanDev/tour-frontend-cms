import React, { useEffect, useState } from "react";
import { Container, Typography, Button, IconButton, Tooltip, Box, Chip, MenuItem, Menu, Modal, Grid, Paper, Divider } from "@mui/material";
import UpcomingIcon from "@mui/icons-material/Upcoming";
import HikingIcon from "@mui/icons-material/Hiking";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DataTable from "../../components/dataTable";
import { getAllQueries, updateQueries } from "../../api/queriesAPI";
import usePermissions from "../../hooks/UsePermissions";
import NotAuthorized from "../NotAuthorized";
import moment from "moment";
import CreateUpdateDialog from "./CreateUpdateDialog";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
const Query = () => {
    const checkPermission = usePermissions();

    const canView = checkPermission("queries", "view");
    const canCreate = checkPermission("queries", "create");
    const canEdit = checkPermission("queries", "alter");
    const canDelete = checkPermission("queries", "delete");

    const [query, setQuery] = useState([]);
    const [filteredQuery, setFilteredQuery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [view, SetView] = useState(false)

    useEffect(() => {
        if (!canView) return; // Stop fetching if the user cannot view

        fetchQuery();
    }, [canView]);
    const getStatusColor = (status) => {
        switch (status) {
            case "Confirm":
                return "success"; // Green
            case "Cancel":
                return "error"; // Red
            case "FollowUp":
                return "warning"; // Orange
            case "Postponed":
                return "info"; // Blue
            default:
                return "default"; // Gray
        }
    };
    const fetchQuery = async () => {
        try {
            const response = await getAllQueries();
            const sortedData = response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            console.log("sorted data is ", sortedData);

            setQuery(sortedData);
            setFilteredQuery(sortedData);
        } catch (error) {
            console.error("Error fetching query:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (event, rowId) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(rowId);
    };

    const handleClosee = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleStatusUpdate = async (newStatus) => {
        console.log(`Updating status for row ${selectedRow} to ${newStatus}`);
        const value = {
            lead_stage: newStatus

        }
        try {
            const res = await updateQueries(selectedRow, value);
            fetchQuery();
            handleClosee();

        } catch (error) {
            console.log(error);


        }
        // Implement API call or state update logic here

    };

    const handleView = (id, value) => {
        // console.log("Viewing query:", id);
        console.log("selected row:", value);
        setSelectedData(value);

        SetView(true)

    };
    const handleOpen = (data = null) => {
        setSelectedData(data);
        setDialogOpen(true);
    };
    const handleClose = () => {
        setDialogOpen(false);
    };
    const handleEdit = (id) => {
        if (!canEdit) return;
        console.log("Editing query:", id);
        // Implement edit functionality
    };

    const handleDelete = (id) => {
        if (!canDelete) return;
        console.log("Deleting query:", id);
        // Implement delete functionality (show confirmation dialog)
    };

    if (!canView) {
        return <NotAuthorized />;
    }

    const columns = [
        { field: "name", headerName: "Name", width: 200 },
        { field: "contact", headerName: "Contact", width: 110 },
        { field: "bookingDate", headerName: "Booking Date", width: 130 },
        { field: "tourDate", headerName: "Tour Date", width: 130 },
        {
            field: "bookingStatus",
            headerName: "Status",
            width: 120,
            renderCell: (params) => {
                return (
                    <>
                        <Chip
                            label={params.row.bookingStatus}
                            onClick={(event) => handleClick(event, params.row.id)}
                            color={getStatusColor(params.row.bookingStatus)} // Dynamic color
                            sx={{ cursor: "pointer", fontWeight: "bold" }}
                        />
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClosee}>
                            <MenuItem onClick={() => handleStatusUpdate("Confirm")}>Confirm</MenuItem>
                            <MenuItem onClick={() => handleStatusUpdate("Cancel")}>Cancel</MenuItem>
                            <MenuItem onClick={() => handleStatusUpdate("FollowUp")}>Follow Up</MenuItem>
                            <MenuItem onClick={() => handleStatusUpdate("Postponed")}>Postponed</MenuItem>
                        </Menu>
                    </>
                );
            }

        },
        { field: "cost", headerName: "Cost", width: 120 },
        { field: "advancePayment", headerName: "Advance Payment", width: 150 },
        {
            field: "action",
            headerName: "Action",
            width: canEdit || canDelete ? 180 : 100,
            renderCell: (params) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View">
                        <IconButton color="primary" size="small" onClick={() => handleView(params.row.id, params.row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {canEdit && (
                        <Tooltip title="Edit">
                            <IconButton color="warning" size="small" onClick={() => handleEdit(params.row.id)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title="Delete">
                            <IconButton color="error" size="small" onClick={() => handleDelete(params.row.id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            ),
        },
    ];

    const rows = filteredQuery.map((item) => ({
        id: item._id,
        name: item.guest_info?.guest_name || "N/A",
        contact: item.guest_info?.guest_phone || "N/A",
        email: item.guest_info?.guest_email || "N/A",
        pax: item.pax || "N/A",
        rooms: item.stay_info?.stay_info,
        hotel: item.stay_info?.hotel || "N/A",
        carname: item.car_details?.car_name || "N/A",
        carcount: item.car_details?.car_count || "N/A",
        source: item.lead_source,
        bookingDate: new Date(item.created_at).toLocaleDateString(),
        tourDate: new Date(item.travel_date).toLocaleDateString(),
        bookingStatus: item.lead_stage || "Pending",
        cost: item.cost || "N/A",
        advancePayment: item.advancePayment ? `₹${item.advancePayment}` : "₹0",

    }));

    return (
        <>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Queries
                </Typography>

                {/* Filter Buttons */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
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
                <Box sx={{ height: 500, width: "100%", backgroundColor: "white", boxShadow: 3, borderRadius: 2, overflow: "hidden" }}>
                    <DataTable rows={rows} columns={columns} loading={loading} />
                </Box>
                <CreateUpdateDialog
                    open={dialogOpen}
                    onClose={handleClose}
                    // onSubmit={handleSubmit} 
                    initialValues={selectedData}
                />
            </Container>
            {view && <Modal open={view} onClose={() => SetView(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: { xs: "90%", md: 700 },
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        borderRadius: 2,
                        p: 3,
                    }}
                >
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold" color="primary">
                            Queries Details
                        </Typography>

                        {/* Guest Details */}
                        <Typography variant="subtitle1" fontWeight="bold" color="secondary" sx={{ mt: 2 }}>
                            Guest Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}><Detail label="Name" value={selectedData.name} /></Grid>
                            <Grid item xs={6}><Detail label="Contact" value={selectedData.contact} /></Grid>
                            <Grid item xs={6}><Detail label="Email" value={selectedData.email} /></Grid>
                            <Grid item xs={6}><Detail label="PAX" value={selectedData.pax} /></Grid>
                        </Grid>

                        {/* Stay Details */}
                        <Typography variant="subtitle1" fontWeight="bold" color="secondary" sx={{ mt: 2 }}>
                            Stay Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}><Detail label="Hotel" value={selectedData.hotel} /></Grid>
                            <Grid item xs={6}><Detail label="Rooms" value={selectedData.rooms} /></Grid>
                        </Grid>

                        {/* Car Details */}
                        <Typography variant="subtitle1" fontWeight="bold" color="secondary" sx={{ mt: 2 }}>
                            Car Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}><Detail label="Car Name" value={selectedData.carname} /></Grid>
                            <Grid item xs={6}><Detail label="Car Count" value={selectedData.carcount} /></Grid>
                        </Grid>

                        {/* Payment & Other Details */}
                        <Typography variant="subtitle1" fontWeight="bold" color="secondary" sx={{ mt: 2 }}>
                            Booking & Payment
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}><Detail label="Source" value={selectedData.source} /></Grid>
                            <Grid item xs={6}><Detail label="Booking Date" value={selectedData.bookingDate} /></Grid>
                            <Grid item xs={6}><Detail label="Tour Date" value={selectedData.tourDate} /></Grid>
                            <Grid item xs={6}><Detail label="Status" value={selectedData.bookingStatus} /></Grid>
                            <Grid item xs={6}><Detail label="Total Cost" value={selectedData.cost} /></Grid>
                            <Grid item xs={6}><Detail label="Advance Paid" value={selectedData.advancePayment} /></Grid>
                        </Grid>

                        {/* Close Button */}
                        {/* <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            sx={{ mt: 3 }}
                            onClick={handleClose}
                        >
                            Close
                        </Button> */}
                    </Paper>
                </Box>
            </Modal>}
        </>
    );
};
const Detail = ({ label, value }) => (
    <>
        <Typography variant="body2" fontWeight="bold" color="textSecondary">
            {label}
        </Typography>
        <Typography variant="body2" color="text.primary">
            {value}
        </Typography>
    </>
);

export default Query;

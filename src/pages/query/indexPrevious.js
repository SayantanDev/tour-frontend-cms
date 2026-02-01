import React, { useEffect, useState, useMemo } from "react";
import { Container, Typography, Button, IconButton, Tooltip, Box, Chip, MenuItem, Menu, Modal, Grid, Paper, Divider, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllQueries, updateQueries } from "../../api/queriesAPI";
import usePermissions from "../../hooks/UsePermissions";
import NotAuthorized from "../NotAuthorized";
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import CreateUpdateDialog from "./CreateUpdateDialog";
import { useDispatch } from "react-redux";
import { setSelectedquerie } from "../../reduxcomponents/slices/queriesSlice";
import { useNavigate } from "react-router-dom";

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
    const dispatch = useDispatch();
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
    const [searchQuery, setSearchQuery] = useState("")
    const [dateQuery, setDateQuery] = useState("");
    const [statusQuery, setStatusQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("")
    const [editableRowId, setEditableRowId] = useState(null)
    const [editedRowData, setEditedRowData] = useState({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const navigate = useNavigate();
    useEffect(() => {
        if (!canView) return; // Stop fetching if the user cannot view

        fetchQuery();
    }, [canView]);
    const getStatusColor = (status) => {
        switch (status) {
            case "Confirm":
                return "success"; // Green
            case "Cancel":
                return "default"; // Red
            case "FollowUp":
                return "warning"; // Orange  Higher Priority
            case "Postponed":
                return "info"; // Blue
            case "Higher Priority":
                return "error";
            default:
                return "default"; // Gray
        }
    };
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

    const handleClick = (event, rowId) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(rowId);
    };


    const handleClosee = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleStatusUpdate = async (newStatus) => {
        const value = {
            lead_stage: newStatus
        }
        try {
            const res = await updateQueries(selectedRow, value);
            fetchQuery();
            handleClosee();

        } catch (error) {
        }
    };

    const handleView = (id, value) => {
        setSelectedData(value);
        SetView(true)
    };
    const handleEditOpen = (id, value) => {
        dispatch(setSelectedquerie(value))
        navigate("/query/view")

    }
    const handleOpen = (data = null) => {
        setSelectedData(data);
        setDialogOpen(true);
    };
    const handleClose = () => {
        setDialogOpen(false);
    };
    const handleEdit = (id) => {
        if (!canEdit) return;
        setEditableRowId(id)

    };

    const handleDelete = async (id) => {
        if (!canDelete) return;
    };

    if (!canView) {
        return <NotAuthorized />;
    }
    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`; // Matches input[type="date"]
    };

    const NewFilteredQuery = filteredQuery.filter((item) => {
        const searchLower = searchQuery.toLowerCase();
        const name = item.guest_info?.guest_name?.toLowerCase() || "";
        const phone = item.guest_info?.guest_phone?.toLowerCase() || "";

        const bookingDate = formatDate(item.created_at); // formatted as yyyy-mm-dd
        const tourDate = formatDate(item.travel_date);

        const matchesSearch =
            name.includes(searchLower) || phone.includes(searchLower);

        const matchesDate =
            !dateQuery || bookingDate === dateQuery || tourDate === dateQuery;
        const matchesStatus = !statusQuery || item.lead_stage === statusQuery;

        const matchLocation = !locationQuery || item.destination === locationQuery;

        return matchesSearch && matchesDate && matchesStatus && matchLocation;
    });

    // Handle save edit
    const handleSaveEdit = async (row) => {
        try {
            const editObj = {};
            if (editedRowData.name !== undefined) {
                editObj["guest_info.guest_name"] = editedRowData.name;
            }
            if (editedRowData.contact !== undefined) {
                editObj["guest_info.guest_phone"] = editedRowData.contact;
            }
            if (editedRowData.bookingDate !== undefined) {
                editObj["booking_date"] = editedRowData.bookingDate;
            }
            if (editedRowData.tourDate !== undefined) {
                editObj["travel_date"] = editedRowData.tourDate;
            }
            if (editedRowData.cost !== undefined) {
                editObj["cost"] = editedRowData.cost;
            }
            if (editedRowData.advancePayment !== undefined) {
                editObj["advancePayment"] = editedRowData.advancePayment;
            }

            if (Object.keys(editObj).length > 0) {
                await updateQueries(row.id, editObj);
                setEditableRowId(null);
                setEditedRowData({});
                fetchQuery();
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    // Column definitions for @tanstack/react-table
    const columns = useMemo(() => [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const rowData = row.original;
                if (editableRowId === rowData.id) {
                    return (
                        <TextField
                            size="small"
                            value={editedRowData.name !== undefined ? editedRowData.name : rowData.name}
                            onChange={(e) => setEditedRowData({ ...editedRowData, name: e.target.value })}
                            sx={{ width: 200 }}
                        />
                    );
                }
                return rowData.name;
            },
        },
        {
            accessorKey: "contact",
            header: "Contact",
            cell: ({ row }) => {
                const rowData = row.original;
                if (editableRowId === rowData.id) {
                    return (
                        <TextField
                            size="small"
                            value={editedRowData.contact !== undefined ? editedRowData.contact : rowData.contact}
                            onChange={(e) => setEditedRowData({ ...editedRowData, contact: e.target.value })}
                            sx={{ width: 110 }}
                        />
                    );
                }
                return rowData.contact;
            },
        },
        {
            accessorKey: "bookingDate",
            header: "Booking Date",
            cell: ({ row }) => {
                const rowData = row.original;
                if (editableRowId === rowData.id) {
                    return (
                        <TextField
                            type="date"
                            size="small"
                            value={editedRowData.bookingDate !== undefined ? editedRowData.bookingDate : rowData.bookingDate}
                            onChange={(e) => setEditedRowData({ ...editedRowData, bookingDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 130 }}
                        />
                    );
                }
                return rowData.bookingDate;
            },
        },
        {
            accessorKey: "tourDate",
            header: "Tour Date",
            cell: ({ row }) => {
                const rowData = row.original;
                if (editableRowId === rowData.id) {
                    return (
                        <TextField
                            type="date"
                            size="small"
                            value={editedRowData.tourDate !== undefined ? editedRowData.tourDate : rowData.tourDate}
                            onChange={(e) => setEditedRowData({ ...editedRowData, tourDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 130 }}
                        />
                    );
                }
                return rowData.tourDate;
            },
        },
        {
            accessorKey: "bookingStatus",
            header: "Lead Stage",
            cell: ({ row }) => {
                const rowData = row.original;
                return (
                    <>
                        <Tooltip title={`${rowData.bookingStatus}`}>
                            <Chip
                                label={rowData.bookingStatus}
                                onClick={(event) => handleClick(event, rowData.id)}
                                color={getStatusColor(rowData.bookingStatus)}
                                sx={{ cursor: "pointer", fontWeight: "bold" }}
                            />
                        </Tooltip>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selectedRow === rowData.id} onClose={handleClosee}>
                            <MenuItem onClick={() => handleStatusUpdate("Confirm")}>Confirm</MenuItem>
                            <MenuItem onClick={() => handleStatusUpdate("Cancel")}>Cancel</MenuItem>
                            <MenuItem onClick={() => handleStatusUpdate("FollowUp")}>Follow Up</MenuItem>
                            <MenuItem onClick={() => handleStatusUpdate("Postponed")}>Postponed</MenuItem>
                            <MenuItem onClick={() => handleStatusUpdate("Higher Priority")}>Higher Priority</MenuItem>
                        </Menu>
                    </>
                );
            },
        },
        {
            accessorKey: "cost",
            header: "Cost",
            cell: ({ row }) => {
                const rowData = row.original;
                if (editableRowId === rowData.id) {
                    return (
                        <TextField
                            size="small"
                            value={editedRowData.cost !== undefined ? editedRowData.cost : rowData.cost}
                            onChange={(e) => setEditedRowData({ ...editedRowData, cost: e.target.value })}
                            sx={{ width: 120 }}
                        />
                    );
                }
                return rowData.cost;
            },
        },
        {
            accessorKey: "advancePayment",
            header: "Advance Payment",
            cell: ({ row }) => {
                const rowData = row.original;
                if (editableRowId === rowData.id) {
                    return (
                        <TextField
                            size="small"
                            value={editedRowData.advancePayment !== undefined ? editedRowData.advancePayment : rowData.advancePayment}
                            onChange={(e) => setEditedRowData({ ...editedRowData, advancePayment: e.target.value })}
                            sx={{ width: 150 }}
                        />
                    );
                }
                return rowData.advancePayment;
            },
        },
        {
            id: "action",
            header: "Action",
            cell: ({ row }) => {
                const rowData = row.original;
                if (editableRowId === rowData.id) {
                    return (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button size="small" onClick={() => handleSaveEdit(rowData)}>Save</Button>
                            <Button size="small" onClick={() => { setEditableRowId(null); setEditedRowData({}); }}>Cancel</Button>
                        </Box>
                    );
                }
                return (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="View">
                            <IconButton color="primary" size="small" onClick={() => handleView(rowData.id, rowData)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {canEdit && (
                            <Tooltip title="open">
                                <IconButton color="warning" size="small" onClick={() => handleEditOpen(rowData.id, rowData)}>
                                    <KeyboardArrowRightOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canEdit && (
                            <Tooltip title="Edit">
                                <IconButton color="info" size="small" onClick={() => {
                                    setEditableRowId(rowData.id);
                                    setEditedRowData({
                                        name: rowData.name,
                                        contact: rowData.contact,
                                        bookingDate: rowData.bookingDate,
                                        tourDate: rowData.tourDate,
                                        cost: rowData.cost,
                                        advancePayment: rowData.advancePayment,
                                    });
                                }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canDelete && (
                            <Tooltip title="Delete">
                                <IconButton color="error" size="small" onClick={() => handleDelete(rowData.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            },
        },
    ], [editableRowId, editedRowData, anchorEl, selectedRow, canEdit, canDelete, handleClick, handleClosee, handleStatusUpdate, handleView, handleEditOpen, handleDelete, getStatusColor]);

    // Table instance
    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: rowsPerPage,
                pageIndex: page,
            },
        },
        state: {
            pagination: {
                pageIndex: page,
                pageSize: rowsPerPage,
            },
        },
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === "function" 
                ? updater({ pageIndex: page, pageSize: rowsPerPage })
                : updater;
            setPage(newPagination.pageIndex);
            setRowsPerPage(newPagination.pageSize);
        },
        manualPagination: false,
    });

    // Sync table pagination with state
    useEffect(() => {
        if (table.getState().pagination.pageIndex !== page) {
            table.setPageIndex(page);
        }
        if (table.getState().pagination.pageSize !== rowsPerPage) {
            table.setPageSize(rowsPerPage);
        }
    }, [page, rowsPerPage, table]);

    const handleChangePage = (e, newPage) => {
        setPage(newPage);
        table.setPageIndex(newPage);
    };

    const handleChangeRowsPerPage = (e) => {
        const newRowsPerPage = parseInt(e.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        table.setPageSize(newRowsPerPage);
        table.setPageIndex(0);
    };


    const rows = NewFilteredQuery.map((item) => ({
        id: item._id,
        name: item.guest_info?.guest_name || "N/A",
        contact: item.guest_info?.guest_phone || "N/A",
        email: item.guest_info?.guest_email || "N/A",
        pax: item.pax || "N/A",
        rooms: item.stay_info?.rooms,
        hotel: item.stay_info?.hotel || "N/A",
        carname: item.car_details?.car_name || "N/A",
        carcount: item.car_details?.car_count || "N/A",
        source: item.lead_source,
        bookingDate: formatDate(item.created_at),
        tourDate: formatDate(item.travel_date),
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
                    <TextField
                        label="Search by name or phoneNo..."
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: "300px" }}
                    />
                    <TextField
                        type="date"
                        label="Search by Date"
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        value={dateQuery}
                        onChange={(e) => setDateQuery(e.target.value)}
                    />
                    <TextField
                        select
                        label="Search by Status"
                        size="small"
                        value={statusQuery}
                        onChange={(e) => setStatusQuery(e.target.value)}
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Confirm">Confirm</MenuItem>
                        <MenuItem value="Cancel">Cancel</MenuItem>
                        <MenuItem value="FollowUp">Follow Up</MenuItem>
                        <MenuItem value="Postponed">Postponed</MenuItem>
                        <MenuItem value="new">New</MenuItem>
                        <MenuItem value="Higher Priority">Higher Priority</MenuItem>


                    </TextField>

                    <TextField
                        select
                        label="Search by location"
                        size="small"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        sx={{ width: 200 }}
                    >


                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Darjeeling">Darjeeling</MenuItem>
                        <MenuItem value="Sikkim">Sikkim</MenuItem>
                        <MenuItem value="North Sikkim">North Sikkim</MenuItem>
                        <MenuItem value="Sandakphu">Sandakphu</MenuItem>
                    </TextField>
                </Box>

                {/* Data Table */}
                <Paper sx={{ boxShadow: 3, borderRadius: 2, overflow: "hidden" }}>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableCell key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map(row => (
                                        <TableRow key={row.original.id} hover>
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center">
                                            No queries found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={rows.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10]}
                    />
                </Paper>
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

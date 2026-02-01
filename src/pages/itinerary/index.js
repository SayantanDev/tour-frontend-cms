import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Button, IconButton, Collapse, Box, Card, CardContent, Tooltip, CircularProgress, TextField, Checkbox,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem, Select,
    OutlinedInput, InputLabel, FormControl, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getExpandedRowModel,
    flexRender,
} from "@tanstack/react-table";
import { getAllInquiries, InquiryUserAssign, InquiryUserRemove } from "../../api/inquiryAPI";
import { getAllUsers } from "../../api/userAPI";
import { useDispatch } from "react-redux";
import { setSelectedInquiry } from "../../reduxcomponents/slices/inquirySlice";
import useSnackbar from "../../hooks/useSnackbar";
import usePermissions from "../../hooks/UsePermissions";

const Inquiry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const hasPermission = usePermissions();

    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [openRow, setOpenRow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const rowsPerPage = 30;

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);

    const [selectedInquiries, setSelectedInquiries] = useState([]);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [userRemoveDialogOpen, setUserRemoveDialogOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [userList, setUserList] = useState([]);

    const fetchInquiries = async () => {
        try {
            const response = await getAllInquiries();
            const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setInquiries(sortedData);
            setFilteredInquiries(sortedData);
        } catch (error) {
            console.error("Error fetching inquiries:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                const usersOnly = response.data.filter(u => u.permission === "User");
                setUserList(usersOnly);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };
        fetchUsers();
    }, []);

    const getAssignedUserNames = (inquiry) => {
        if (!inquiry.manage_teams || inquiry.manage_teams.length === 0) return "-";
        return inquiry.manage_teams
            .map(team => {
                const user = userList.find(u => u.id === team.user_id);
                return user ? user.fullName : "Unknown";
            })
            .join(", ");
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredInquiries(
            inquiries.filter((inquiry) =>
                inquiry.guest_name.toLowerCase().includes(query) ||
                inquiry.guest_email.toLowerCase().includes(query) ||
                inquiry.guest_phone.includes(query)
            )
        );
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleInquiryClick = (inquiry) => {
        dispatch(setSelectedInquiry(inquiry));
        navigate(`/createItinerary`);
    };

    const handleOpenDeleteDialog = (inquiryId) => {
        setSelectedInquiryId(inquiryId);
        setDeleteDialogOpen(true);
    };

    // const handleCloseDeleteDialog = () => {
    //     // setDeleteDialogOpen(false);
    //     setSelectedInquiryId(null);
    // };

    // const handleConfirmDelete = async () => {
    //     try {
    //         await deleteInquiry(selectedInquiryId);
    //         await fetchInquiries();
    //     } catch (error) {
    //         console.error("Error deleting inquiry:", error);
    //     } finally {
    //         handleCloseDeleteDialog();
    //     }
    // };

    const handleAssignUser = async () => {
        try {
            const res = await InquiryUserAssign({ inquiryIds: selectedInquiries, userIds: selectedUserIds });
            setSelectedInquiries([]);
            setSelectedUserIds([]);
            setAssignDialogOpen(false);
            await fetchInquiries();
            showSnackbar(res.message, "success");
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveUser = async () => {
        try {
            await InquiryUserRemove({ inquiryIds: selectedInquiries, userIds: selectedUserIds });
            setSelectedInquiries([]);
            setSelectedUserIds([]);
            setUserRemoveDialogOpen(false);
            await fetchInquiries();
        } catch (err) {
            console.error(err);
        }
    };

    const assignedUserIds = selectedInquiries
        .flatMap(id => inquiries.find(i => i._id === id)?.manage_teams || [])
        .map(team => team.user_id);
    const uniqueAssignedUserIds = [...new Set(assignedUserIds)];
    const assignableUsers = userList.filter(user => !uniqueAssignedUserIds.includes(user.id));

    const assignedUsersPerInquiry = selectedInquiries.map(id =>
        (inquiries.find(i => i._id === id)?.manage_teams || []).map(team => team.user_id)
    );
    const removableUserIds = assignedUsersPerInquiry.reduce((a, b) => a.filter(id => b.includes(id)), assignedUsersPerInquiry[0] || []);
    const removableUsers = userList.filter(user => removableUserIds.includes(user.id));

    // Column definitions for @tanstack/react-table
    const columns = useMemo(() => {
        const cols = [];
        
        if (hasPermission("inquiry", "alter")) {
            cols.push({
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        size="small"
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        size="small"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            });
        }
        
        cols.push(
            {
                accessorKey: "guest_name",
                header: "Name",
            },
            {
                accessorKey: "guest_email",
                header: "Email",
            },
            {
                accessorKey: "guest_phone",
                header: "Phone",
            },
            {
                accessorKey: "arrival_date",
                header: "Arrival Date",
                cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
            }
        );
        
        if (hasPermission("inquiry", "alter")) {
            cols.push({
                accessorKey: "assigned_users",
                header: "Assigned Users",
                cell: ({ row }) => getAssignedUserNames(row.original),
            });
        }
        
        cols.push(
            {
                id: "quote",
                header: "Quote",
                cell: ({ row }) => (
                    <Button size="small" onClick={() => handleInquiryClick(row.original)}>
                        Generate
                    </Button>
                ),
                enableSorting: false,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const inquiry = row.original;
                    return (
                        <>
                            <Tooltip title="View">
                                <IconButton onClick={() => row.toggleExpanded()} size="small">
                                    <Visibility fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            {hasPermission("inquiry", "alter") && (
                                <>
                                    <Tooltip title="Edit">
                                        <IconButton size="small">
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => handleOpenDeleteDialog(inquiry._id)} size="small">
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </>
                    );
                },
                enableSorting: false,
            }
        );
        
        return cols;
    }, [hasPermission, filteredInquiries, userList, handleInquiryClick, handleOpenDeleteDialog, getAssignedUserNames]);

    // Row selection state for table
    const [rowSelection, setRowSelection] = useState({});

    // Table instance
    const table = useReactTable({
        data: filteredInquiries,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: {
            pagination: {
                pageSize: rowsPerPage,
                pageIndex: page,
            },
        },
        state: {
            expanded: openRow ? { [openRow]: true } : {},
            rowSelection,
            pagination: {
                pageIndex: page,
                pageSize: rowsPerPage,
            },
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onExpandedChange: (updater) => {
            const currentExpanded = openRow ? { [openRow]: true } : {};
            const newExpanded = typeof updater === "function" 
                ? updater(currentExpanded)
                : updater;
            const expandedKeys = Object.keys(newExpanded).filter(key => newExpanded[key]);
            // Only allow one row to be expanded at a time
            setOpenRow(expandedKeys.length > 0 ? expandedKeys[expandedKeys.length - 1] : null);
        },
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === "function" 
                ? updater({ pageIndex: page, pageSize: rowsPerPage })
                : updater;
            setPage(newPagination.pageIndex);
        },
        getRowId: (row) => row._id,
        manualPagination: false,
    });

    // Sync selected inquiries with table selection state
    useEffect(() => {
        const selectedIds = Object.keys(rowSelection)
            .filter(key => rowSelection[key])
            .map(key => {
                // Find the inquiry by matching the row ID (which is the _id)
                const inquiry = filteredInquiries.find(i => i._id === key);
                return inquiry?._id;
            })
            .filter(Boolean);
        setSelectedInquiries(selectedIds);
    }, [rowSelection, filteredInquiries]);

    return (
        <Container maxWidth={false}>
            
            <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                justifyContent="space-between"
                sx={{ mb: 2, flexWrap: 'wrap' }}
            >
                <Typography variant="h4" color="warning" sx={{ whiteSpace: 'nowrap' }}>
                    Inquiry List
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button variant="contained" size="small" onClick={() => navigate("/createItinerary")}>
                    Create New Inquiry
                    </Button>
                    {hasPermission("inquiry", "alter") && (
                    <>
                        <Button
                        variant="outlined"
                        size="small"
                        disabled={!selectedInquiries.length}
                        onClick={() => setAssignDialogOpen(true)}
                        >
                        Assign User
                        </Button>
                        <Button
                        variant="outlined"
                        size="small"
                        disabled={!selectedInquiries.length}
                        onClick={() => setUserRemoveDialogOpen(true)}
                        >
                        Remove User
                        </Button>
                    </>
                    )}
                </Stack>

                <Box sx={{ minWidth: 250, flexGrow: 1, maxWidth: 300 }}>
                    <TextField
                    size="small"
                    label="Search by Name, Email, or Phone"
                    fullWidth
                    value={searchQuery}
                    onChange={handleSearch}
                    />
                </Box>
            </Stack>



            {loading ? (
                <Box display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ width: '100%' }}>
                        <Table size="small" sx={{ width: '100%' }}>
                            <TableHead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableCell
                                                key={header.id}
                                                sx={header.id === "select" ? { padding: "checkbox" } : {}}
                                            >
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
                                {table.getRowModel().rows.map(row => {
                                    const inquiry = row.original;
                                    const isExpanded = row.getIsExpanded();
                                    return (
                                        <React.Fragment key={row.id}>
                                            <TableRow>
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell
                                                        key={cell.id}
                                                        sx={cell.column.id === "select" ? { padding: "checkbox" } : {}}
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={row.getVisibleCells().length}
                                                        sx={{ paddingBottom: 0, paddingTop: 0 }}
                                                    >
                                                        <Collapse in={isExpanded}>
                                                            <Box margin={2}>
                                                                <Card variant="outlined">
                                                                    <CardContent sx={{ padding: 1 }}>
                                                                        <Typography variant="body2">Lead Source: {inquiry.lead_source}</Typography>
                                                                        <Typography variant="body2">Message: {inquiry.guest_message}</Typography>
                                                                        <Typography variant="body2">Verified: {inquiry.verifyed ? "Yes" : "No"}</Typography>
                                                                        <Typography variant="body2">
                                                                            Arrival: 
                                                                            {new Date(inquiry.arrival_date).toLocaleString()}
                                                                        </Typography>
                                                                    </CardContent>
                                                                </Card>
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={filteredInquiries.length}
                        page={table.getState().pagination.pageIndex}
                        onPageChange={handleChangePage}
                        rowsPerPage={table.getState().pagination.pageSize}
                        rowsPerPageOptions={[30]}
                    />
                </>
            )}

            {/* Assign Users Dialog */}
            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
                <DialogTitle>Assign Users</DialogTitle>
                <DialogContent>
                    <DialogContentText>Select one or more users to assign to selected inquiries.</DialogContentText>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Select Users</InputLabel>
                        <Select multiple value={selectedUserIds} onChange={(e) => setSelectedUserIds(e.target.value)} input={<OutlinedInput label="Select Users" />} renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => {
                                    const user = userList.find(u => u.id === value);
                                    return <Chip key={value} label={user?.fullName || value} />;
                                })}
                            </Box>
                        )}>
                            {assignableUsers.map(user => (
                                <MenuItem key={user.id} value={user.id}>{user.fullName} ({user.email})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssignUser} color="primary">Assign</Button>
                </DialogActions>
            </Dialog>

            {/* Remove Users Dialog */}
            <Dialog open={userRemoveDialogOpen} onClose={() => setUserRemoveDialogOpen(false)}>
                <DialogTitle>Remove Users</DialogTitle>
                <DialogContent>
                    <DialogContentText>Select one or more users to remove from selected inquiries.</DialogContentText>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Select Users</InputLabel>
                        <Select multiple value={selectedUserIds} onChange={(e) => setSelectedUserIds(e.target.value)} input={<OutlinedInput label="Select Users" />} renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => {
                                    const user = userList.find(u => u.id === value);
                                    return <Chip key={value} label={user?.fullName || value} />;
                                })}
                            </Box>
                        )}>
                            {removableUsers.map(user => (
                                <MenuItem key={user.id} value={user.id}>{user.fullName} ({user.email})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserRemoveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRemoveUser} sx={{ color: 'red' }}>Remove</Button>
                </DialogActions>
            </Dialog>
            <SnackbarComponent />
        </Container>
    );
};

export default Inquiry;

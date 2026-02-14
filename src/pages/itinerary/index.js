import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Button, IconButton, Collapse, Box, Card, CardContent, Tooltip, CircularProgress, Checkbox,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem, Select,
    OutlinedInput, InputLabel, FormControl, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getExpandedRowModel,
    flexRender,
} from "@tanstack/react-table";
import { getAllInquiries, InquiryUserAssign, InquiryUserRemove, deleteInquiry } from "../../api/inquiryAPI";
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
    // const [searchQuery, setSearchQuery] = useState("");
    const [openRow, setOpenRow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const ROWS_PER_PAGE = 20;

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);

    const [selectedInquiries, setSelectedInquiries] = useState([]);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [userRemoveDialogOpen, setUserRemoveDialogOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [userList, setUserList] = useState([]);

    const fetchInquiries = async (pageNum = 1) => {
        setLoading(true);
        try {
            const response = await getAllInquiries(pageNum, ROWS_PER_PAGE);
            const newData = response.data || [];

            setInquiries(prev => {
                if (pageNum === 1) return newData;
                // Filter out duplicates just in case
                const existingIds = new Set(prev.map(i => i._id));
                const uniqueNew = newData.filter(i => !existingIds.has(i._id));
                return [...prev, ...uniqueNew];
            });

            setHasMore(response.pagination?.hasNextPage || false);
        } catch (error) {
            console.error("Error fetching inquiries:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries(1);
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

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchInquiries(nextPage);
        }
    };

    const getAssignedUserNames = React.useCallback((inquiry) => {
        if (!inquiry.manage_teams || inquiry.manage_teams.length === 0) return "-";
        return inquiry.manage_teams
            .map(team => {
                const user = userList.find(u => u.id === team.user_id);
                return user ? user.fullName : "Unknown";
            })
            .join(", ");
    }, [userList]);



    const handleInquiryClick = React.useCallback((inquiry) => {
        dispatch(setSelectedInquiry(inquiry));
        navigate(`/createItinerary`);
    }, [dispatch, navigate]);

    const handleOpenDeleteDialog = React.useCallback((inquiryId) => {
        setSelectedInquiryId(inquiryId);
        setDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedInquiryId(null);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteInquiry(selectedInquiryId);
            showSnackbar("Inquiry deleted successfully", "success");
            await fetchInquiries();
        } catch (error) {
            console.error("Error deleting inquiry:", error);
            showSnackbar("Failed to delete inquiry", "error");
        } finally {
            handleCloseDeleteDialog();
        }
    };

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
    }, [hasPermission, handleInquiryClick, handleOpenDeleteDialog, getAssignedUserNames]);

    // Row selection state for table
    const [rowSelection, setRowSelection] = useState({});

    // Table instance
    const table = useReactTable({
        data: inquiries,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: {
            pagination: {
                pageSize: inquiries.length > 0 ? inquiries.length : 10, // Show all fetched
                pageIndex: 0,
            },
        },
        state: {
            expanded: openRow ? { [openRow]: true } : {},
            rowSelection,
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
        getRowId: (row) => row._id,
        manualPagination: true, // We handle pagination via scroll
    });

    // Sync selected inquiries with table selection state
    useEffect(() => {
        const selectedIds = Object.keys(rowSelection)
            .filter(key => rowSelection[key])
            .map(key => {
                // Find the inquiry by matching the row ID (which is the _id)
                const inquiry = inquiries.find(i => i._id === key);
                return inquiry?._id;
            })
            .filter(Boolean);
        setSelectedInquiries(selectedIds);
    }, [rowSelection, inquiries]);

    return (
        <Container maxWidth={false} sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

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


            </Stack>



            {loading ? (
                <Box display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
                <>
                    <TableContainer
                        component={Paper}
                        sx={{ width: '100%', flexGrow: 1, overflowY: 'auto' }}
                        onScroll={handleScroll}
                    >
                        <Table size="small" stickyHeader sx={{ width: '100%' }}>
                            <TableHead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableCell
                                                key={header.id}
                                                sx={{
                                                    backgroundColor: 'background.paper',
                                                    ...(header.id === "select" ? { padding: "checkbox" } : {})
                                                }}
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
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                                            <CircularProgress size={24} />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
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
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this inquiry? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <SnackbarComponent />
        </Container>
    );
};

export default Inquiry;

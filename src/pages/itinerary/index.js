import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Collapse, Box, Card, CardContent, Tooltip, CircularProgress, Grid, TextField, Checkbox,
    TablePagination, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem, Select,
    OutlinedInput, InputLabel, FormControl, Chip
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { deleteInquiry, getAllInquiries, InquiryUserAssign, InquiryUserRemove } from "../../api/inquiryAPI";
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

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleToggleView = (index) => setOpenRow(openRow === index ? null : index);

    const handleInquiryClick = (inquiry) => {
        dispatch(setSelectedInquiry(inquiry));
        navigate(`/createItinerary`);
    };

    const handleOpenDeleteDialog = (inquiryId) => {
        setSelectedInquiryId(inquiryId);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedInquiryId(null);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteInquiry(selectedInquiryId);
            await fetchInquiries();
        } catch (error) {
            console.error("Error deleting inquiry:", error);
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

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Inquiry List</Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <Button variant="contained" onClick={() => navigate("/createItinerary")}>Create New Inquiry</Button>
                    {hasPermission("inquiry", "alter") && (
                        <>
                            <Button variant="outlined" sx={{ ml: 2 }} disabled={!selectedInquiries.length} onClick={() => setAssignDialogOpen(true)}>Assign User</Button>
                            <Button variant="outlined" sx={{ ml: 2 }} disabled={!selectedInquiries.length} onClick={() => setUserRemoveDialogOpen(true)}>Remove User</Button>
                        </>
                    )}
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Search by Name, Email, or Phone" fullWidth value={searchQuery} onChange={handleSearch} />
                </Grid>
            </Grid>

            {loading ? (
                <Box display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {hasPermission("inquiry", "alter") && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedInquiries.length === filteredInquiries.length}
                                                onChange={(e) => setSelectedInquiries(e.target.checked ? filteredInquiries.map(i => i._id) : [])}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Arrival Date</TableCell>
                                    {hasPermission("inquiry", "alter") && (
                                        <TableCell>Assigned Users</TableCell>
                                    )}
                                    <TableCell>Quote</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredInquiries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((inquiry, index) => (
                                    <React.Fragment key={inquiry._id}>
                                        <TableRow>
                                            {hasPermission("inquiry", "alter") && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedInquiries.includes(inquiry._id)}
                                                        onChange={(e) => {
                                                            const updated = e.target.checked
                                                                ? [...selectedInquiries, inquiry._id]
                                                                : selectedInquiries.filter(id => id !== inquiry._id);
                                                            setSelectedInquiries(updated);
                                                        }}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>{inquiry.guest_name}</TableCell>
                                            <TableCell>{inquiry.guest_email}</TableCell>
                                            <TableCell>{inquiry.guest_phone}</TableCell>
                                            <TableCell>{new Date(inquiry.arrival_date).toLocaleDateString()}</TableCell>
                                            {hasPermission("inquiry", "alter") && (
                                                <TableCell>{getAssignedUserNames(inquiry)}</TableCell>
                                            )}
                                            <TableCell>
                                                <Button onClick={() => handleInquiryClick(inquiry)}>Generate</Button>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="View"><IconButton onClick={() => handleToggleView(index)}><Visibility /></IconButton></Tooltip>
                                                {hasPermission("inquiry", "alter") && (
                                                    <>
                                                        <Tooltip title="Edit"><IconButton><Edit /></IconButton></Tooltip>
                                                        <Tooltip title="Delete"><IconButton onClick={() => handleOpenDeleteDialog(inquiry._id)}><Delete /></IconButton></Tooltip>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={8}>
                                                <Collapse in={openRow === index}>
                                                    <Box margin={2}>
                                                        <Card><CardContent>
                                                            <Typography>Lead Source: {inquiry.lead_source}</Typography>
                                                            <Typography>Message: {inquiry.guest_message}</Typography>
                                                            <Typography>Verified: {inquiry.verifyed ? "Yes" : "No"}</Typography>
                                                            <Typography>Arrival: {new Date(inquiry.arrival_date).toLocaleString()}</Typography>
                                                        </CardContent></Card>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination component="div" count={filteredInquiries.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} rowsPerPageOptions={[30]} />
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

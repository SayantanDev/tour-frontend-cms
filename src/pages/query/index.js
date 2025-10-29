import React, { useEffect, useState } from "react";
import {
  Container, Typography, IconButton, Tooltip, Box, Chip, MenuItem,
  Modal, Paper, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Select, Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { deleteQueries, getAllQueries, updateQueries } from "../../api/queriesAPI";
import usePermissions from "../../hooks/UsePermissions";
import { useDispatch } from "react-redux";
import { setSelectedquerie } from "../../reduxcomponents/slices/queriesSlice";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../hooks/useSnackbar";
import { getAllUsers } from "../../api/userAPI";
import { getChangeRequest, getRejectedChanges, handleChangeRequestApproval } from "../../api/operationAPI";
import { Delete } from '@mui/icons-material';

const Query = () => {
  const checkPermission = usePermissions();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const canView = checkPermission("queries", "view");
  // const canEdit = checkPermission("queries", "alter");
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  // const [query, setQuery] = useState([]);
  const [filteredQuery, setFilteredQuery] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});

  // Modal and team management
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);

  // modal change request
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedChangeRequests, setSelectedChangeRequests] = useState([]);
  const [currentQueryId, setCurrentQueryId] = useState(null);

  // rejected modal
  const [rejectedModalOpen, setRejectedModalOpen] = useState(false);
  const [rejectedChanges, setRejectedChanges] = useState([]);

  // delete 
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
    if (canView) fetchQuery();
  }, [canView]);

  const fetchQuery = async () => {
    try {
      const response = await getAllQueries();
      const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      // setQuery(sortedData);
      setFilteredQuery(sortedData);
    } catch (error) {
      console.error("Error fetching query:", error);
    } finally {
      // setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      const filtered = users.data.filter(u => u.permission === "User");
      setAllUsers(filtered);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleSaveEdit = async (id) => {
    try {
      const updatedFields = {};
      if (editedRowData.guest_name !== undefined) updatedFields.guest_name = editedRowData.guest_name;
      if (editedRowData.guest_phone !== undefined) updatedFields.guest_phone = editedRowData.guest_phone;
      if (editedRowData.cost !== undefined) updatedFields.cost = editedRowData.cost;
      if (editedRowData.advance !== undefined) updatedFields.advance = editedRowData.advance;
      if (editedRowData.lead_stage !== undefined) updatedFields.lead_stage = editedRowData.lead_stage;

      const response = await updateQueries(id, updatedFields);
      if (response.success) showSnackbar(response.message, "success");

      fetchQuery();
      setEditingRowId(null);
      setEditedRowData({});
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirm": return "success";
      case "Cancel": return "default";
      case "FollowUp": return "warning";
      case "Postponed": return "info";
      case "Higher Priority": return "error";
      default: return "default";
    }
  };

  const handleEditOpen = async (id) => {
    // const res = await fetchOperationByQueries(id);
    dispatch(setSelectedquerie({ id }));
    navigate("/query/view");
  };

  const filteredRows = filteredQuery.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const name = item.guest_info?.guest_name?.toLowerCase() || "";
    const phone = item.guest_info?.guest_phone?.toLowerCase() || "";
    const bookingDate = formatDate(item.created_at);
    const tourDate = formatDate(item.travel_date);
    return (
      (name.includes(searchLower) || phone.includes(searchLower)) &&
      (!dateQuery || bookingDate === dateQuery || tourDate === dateQuery) &&
      (!statusQuery || item.lead_stage === statusQuery) &&
      (!locationQuery || item.destination === locationQuery)
    );
  });
  const handleOpenDeleteDialog = (row) => {
    setQueryToDelete(row);
    setDeleteDialogOpen(true);
  };


  const openUserModal = (row) => {
    setSelectedQueryId(row._id);
    const assigned = row.manage_teams?.map(mt => mt.user_id) || [];
    setAssignedUsers(assigned);
    setUserModalOpen(true);
  };

  const saveUserAssignments = async () => {
    try {
      const manage_teams = assignedUsers.map(userId => ({
        user_id: userId,
        date: new Date(),
        status: "Assigned",
      }));
      const response = await updateQueries(selectedQueryId, { manage_teams });
      if (response.success) {
        showSnackbar("Users assigned successfully", "success");
        fetchQuery();
      } else {
        showSnackbar("Assignment failed", "error");
      }
      setUserModalOpen(false);
    } catch (err) {
      console.error("Assignment failed", err);
      showSnackbar("Something went wrong", "error");
    }
  };

  const openChangeRequestModal = async (queryId) => {
    try {
      const res = await getChangeRequest(queryId);
      console.log("getChangeRequest response : ", res);
      // const data = await res.json();
      setSelectedChangeRequests(res);
      setCurrentQueryId(queryId);
      setChangeModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch change requests", err);
      showSnackbar("Failed to load change requests", "error");
    }
  };
  const handleChangeRequestAction = async (changeId, action, reason = "") => {
    try {
      const body = { status: action };
      if (action === "Rejected") body.reason = reason;
      const res = await handleChangeRequestApproval(currentQueryId, changeId, body)

      if (!res) throw new Error("Action failed");

      showSnackbar(`Change ${action.toLowerCase()} successfully`, "success");
      openChangeRequestModal(currentQueryId); // Refresh list
    } catch (err) {
      console.error(err);
      showSnackbar("Action failed", "error");
    }
  };
  const openRejectedChangeModal = async (operationId) => {
    try {
      const res = await getRejectedChanges(operationId);
      console.log("");

      // const data = await res.json();
      setRejectedChanges(res);
      setRejectedModalOpen(true);
    } catch (err) {
      console.error("Failed to load rejected changes", err);
      showSnackbar("Failed to load rejected changes", "error");
    }
  };
  const handleDeleteQuery = async () => {
    try {
      const res = await deleteQueries(queryToDelete._id);
      if (res.success) {
        showSnackbar("Query deleted successfully", "success");
        fetchQuery();
      } else {
        showSnackbar("Failed to delete query", "error");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      showSnackbar("Something went wrong while deleting", "error");
    } finally {
      setDeleteDialogOpen(false);
      setQueryToDelete(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Leads</Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <TextField label="Search" size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <TextField type="date" label="Date" size="small" value={dateQuery} onChange={(e) => setDateQuery(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField select label="Status" size="small" value={statusQuery} onChange={(e) => setStatusQuery(e.target.value)} sx={{ minWidth: 180 }}>
          {["", "Confirm", "Cancel", "FollowUp", "Postponed", "Higher Priority"].map((status) => (
            <MenuItem key={status} value={status}>{status || "All"}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Location" size="small" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} sx={{ minWidth: 180 }}>
          {["", "Darjeeling", "Sikkim", "North Sikkim", "Sandakphu"].map((loc) => (
            <MenuItem key={loc} value={loc}>{loc || "All"}</MenuItem>
          ))}
        </TextField>
      </Box>
      {/* <Container> */}
      {/* <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        flexWrap="wrap"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" color="warning" sx={{ whiteSpace: 'nowrap' }}>
          Leads
        </Typography>

        <TextField
          label="Search"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <TextField
          type="date"
          label="Date"
          size="small"
          value={dateQuery}
          onChange={(e) => setDateQuery(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          select
          label="Status"
          size="small"
          value={statusQuery}
          onChange={(e) => setStatusQuery(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {["", "Confirm", "Cancel", "FollowUp", "Postponed", "Higher Priority"].map((status) => (
            <MenuItem key={status} value={status}>
              {status || "All"}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Location"
          size="small"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {["", "Darjeeling", "Sikkim", "North Sikkim", "Sandakphu"].map((loc) => (
            <MenuItem key={loc} value={loc}>
              {loc || "All"}
            </MenuItem>
          ))}
        </TextField>
      </Stack> */}

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 1, overflowX: "auto", mb: 2 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Advance</TableCell>
              <TableCell>Actions</TableCell>
              {checkPermission("operation", "change-request") && (<TableCell>Change Request</TableCell>)}
              {checkPermission("queries", "delete") && (<TableCell>Delete</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row._id} hover>
                <TableCell>
                  {editingRowId === row._id ? (
                    <TextField size="small" value={editedRowData.guest_name} onChange={(e) => setEditedRowData({ ...editedRowData, guest_name: e.target.value })} />
                  ) : row.guest_info?.guest_name}
                </TableCell>
                <TableCell>
                  {editingRowId === row._id ? (
                    <TextField size="small" value={editedRowData.guest_phone} onChange={(e) => setEditedRowData({ ...editedRowData, guest_phone: e.target.value })} />
                  ) : row.guest_info?.guest_phone}
                </TableCell>
                <TableCell>
                  {editingRowId === row._id ? (
                    <Select size="small" value={editedRowData.lead_stage} onChange={(e) => setEditedRowData({ ...editedRowData, lead_stage: e.target.value })}>
                      {["Confirm", "Cancel", "FollowUp", "Postponed", "Higher Priority"].map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Chip label={row.lead_stage} color={getStatusColor(row.lead_stage)} />
                  )}
                </TableCell>
                <TableCell>
                  {editingRowId === row._id ? (
                    <TextField size="small" value={editedRowData.cost} onChange={(e) => setEditedRowData({ ...editedRowData, cost: e.target.value })} />
                  ) : row.cost || "N/A"}
                </TableCell>
                <TableCell>
                  {editingRowId === row._id ? (
                    <TextField size="small" value={editedRowData.advance} onChange={(e) => setEditedRowData({ ...editedRowData, advance: e.target.value })} />
                  ) : row.advance ? `${row.advance}` : "0"}
                </TableCell>

                <TableCell>
                  {editingRowId === row._id ? (
                    <>
                      <Button onClick={() => handleSaveEdit(row._id)} size="small">Save</Button>
                      <Button onClick={() => { setEditingRowId(null); setEditedRowData({}); }} size="small">Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => {
                          setEditingRowId(row._id);
                          setEditedRowData({
                            guest_name: row.guest_info?.guest_name || "",
                            guest_phone: row.guest_info?.guest_phone || "",
                            cost: row.cost || "",
                            advance: row.advance || "",
                            lead_stage: row.lead_stage || "",
                          });
                        }}>
                          <Typography color="success">Edit</Typography>
                        </IconButton>
                      </Tooltip>
                      {row.advance > 0 &&
                        <Tooltip title="Manage Operation">
                          <IconButton onClick={() => handleEditOpen(row.operation_id)}>
                            <Typography color="primary">Manage</Typography>
                          </IconButton>
                        </Tooltip>
                      }

                      {checkPermission("queries", "assuser") && (
                        <Tooltip title="Assign Users">
                          <IconButton onClick={() => openUserModal(row)}>
                            <Typography color="secondary">Assign Users</Typography>
                          </IconButton>
                        </Tooltip>
                      )}

                    </>
                  )}
                </TableCell>
                {checkPermission("operation", "change-request") && (
                  <TableCell>
                    <Tooltip title="View Rejected Changes">
                      <IconButton onClick={() => openRejectedChangeModal(row.operation_id)}>
                        <Typography color="error">Rejected</Typography>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Changes Request">
                      <IconButton onClick={() => openChangeRequestModal(row.operation_id)}>
                        <Button size="small">CRV</Button>
                        {/* <Typography color="error">Rejected</Typography> */}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
                {checkPermission("queries", "delete") && (
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleOpenDeleteDialog(row)}>
                        <Typography color="error">Delete</Typography>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 25]}
          size="small"
        />
      </TableContainer>


      {/* User Assign Modal */}
      <Modal open={userModalOpen} onClose={() => setUserModalOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper', boxShadow: 24,
          p: 4, width: 400, borderRadius: 2
        }}>
          <Typography variant="h6" mb={2}>Assign Users</Typography>

          <Select
            multiple
            fullWidth
            value={assignedUsers}
            onChange={(e) => setAssignedUsers(e.target.value)}
            renderValue={(selected) =>
              allUsers
                .filter(user => selected.includes(user.id))
                .map(user => user.fullName)
                .join(", ")
            }
          >
            {allUsers.map(user => (
              <MenuItem key={user.id} value={user.id}>
                <Checkbox checked={assignedUsers.includes(user.id)} />
                {user.fullName}
              </MenuItem>
            ))}
          </Select>

          <Button
            fullWidth
            sx={{ mt: 2 }}
            variant="contained"
            onClick={saveUserAssignments}
          >
            Save Changes
          </Button>
        </Box>
      </Modal>

      {/* change request view */}
      <Modal open={changeModalOpen} onClose={() => setChangeModalOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#f5f5f5', boxShadow: 24, p: 4,
          width: 600, maxHeight: "90vh", overflowY: "auto", borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>Change Requests</Typography>
          {selectedChangeRequests.map(change => (
            <Paper key={change._id} sx={{ p: 2, mb: 2 }}>
              <Typography><b>Description:</b> {change.description}</Typography>
              <Typography><b>Status:</b> {change.approved_status}</Typography>
              <Typography><b>User:</b> {change.user_id?.fullName} ({change.user_id?.email})</Typography>
              <Typography>
                <b>Submitted On:</b>{" "}
                {new Date(change.date_time).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Typography>

              {change.approved_status === "Pending" && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleChangeRequestAction(change._id, "Approved")}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      const reason = prompt("Enter rejection reason:");
                      if (reason) handleChangeRequestAction(change._id, "Rejected", reason);
                    }}
                  >
                    Reject
                  </Button>
                </Box>
              )}

              {change.approved_status === "Rejected" && change.rejected_reason && (
                <Typography sx={{ mt: 1, color: "error.main" }}>
                  <b>Rejection Reason:</b> {change.rejected_reason}
                </Typography>
              )}
            </Paper>
          ))}

          <Button onClick={() => setChangeModalOpen(false)} fullWidth sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>

      {/* rejected reason view */}
      <Modal open={rejectedModalOpen} onClose={() => setRejectedModalOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#fff3f3', p: 4, width: 600,
          borderRadius: 2, boxShadow: 24, maxHeight: '80vh', overflowY: 'auto'
        }}>
          <Typography variant="h6" gutterBottom>Rejected Change Requests</Typography>
          {rejectedChanges.length === 0 ? (
            <Typography>No rejected requests found.</Typography>
          ) : (
            rejectedChanges.map(change => (
              <Paper key={change._id} sx={{ p: 2, mb: 2 }}>
                <Typography><b>Description:</b> {change.description}</Typography>
                <Typography><b>User:</b> {change.user_id?.fullName} ({change.user_id?.email})</Typography>
                <Typography><b>Date:</b> {new Date(change.date_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</Typography>
                <Typography sx={{ mt: 1, color: "error.main" }}>
                  <b>Rejection Reason:</b> {change.rejected_reason}
                </Typography>
              </Paper>
            ))
          )}
          <Button onClick={() => setRejectedModalOpen(false)} fullWidth sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>


      <SnackbarComponent />
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {queryToDelete && (
            <>
              <Typography sx={{ mb: 1 }}>
                Are you sure you want to delete this query?
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                <Typography><b>Name:</b> {queryToDelete.guest_info?.guest_name || "N/A"}</Typography>
                <Typography><b>Phone:</b> {queryToDelete.guest_info?.guest_phone || "N/A"}</Typography>
                <Typography><b>Status:</b> {queryToDelete.lead_stage || "N/A"}</Typography>
                {queryToDelete.destination && (
                  <Typography><b>Destination:</b> {queryToDelete.destination}</Typography>
                )}
              </Paper>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteQuery}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>


    </Container>
  );
};

export default Query;

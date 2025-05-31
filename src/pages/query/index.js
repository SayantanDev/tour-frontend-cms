import React, { useEffect, useState } from "react";
import {
  Container, Typography, IconButton, Tooltip, Box, Chip, MenuItem, Menu,
  Modal, Grid, Paper, Divider, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Select, Checkbox
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import { fetchOperationByQueries, getAllQueries, updateQueries } from "../../api/queriesAPI";
// import { getAllUsers } from "../../api/userAPI"; // Adjust as needed
import usePermissions from "../../hooks/UsePermissions";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedquerie } from "../../reduxcomponents/slices/queriesSlice";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../hooks/useSnackbar";
import { getAllUsers } from "../../api/userAPI";

const Query = () => {
  const checkPermission = usePermissions();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const canView = checkPermission("queries", "view");
  const canEdit = checkPermission("queries", "alter");
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const [query, setQuery] = useState([]);
  const [filteredQuery, setFilteredQuery] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchUsers();
    if (canView) fetchQuery();
  }, [canView]);

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

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      const filtered = users.data.filter(u => u.permission === "User");
      console.log("Filtered users:", filtered);

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
    const res = await fetchOperationByQueries(id);
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

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Advance</TableCell>
              <TableCell>Actions</TableCell>
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

      <SnackbarComponent />
    </Container>
  );
};

export default Query;

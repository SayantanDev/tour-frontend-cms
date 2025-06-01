import React, { useEffect, useState } from "react";
import {
  Container, Typography, IconButton, Tooltip, Box, Chip, MenuItem,
  Modal, Paper, TextField, Button, Table, TableBody, Stack,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Select, Checkbox
} from "@mui/material";
import { getAllQueries, updateQueries } from "../../api/queriesAPI";
import usePermissions from "../../hooks/UsePermissions";
import { useDispatch } from "react-redux";
import { setSelectedquerie } from "../../reduxcomponents/slices/queriesSlice";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../hooks/useSnackbar";
import { getAllUsers } from "../../api/userAPI";

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

  useEffect(() => {
    fetchUsers();
    if (canView) fetchQuery();
  }, [canView]);

  const fetchQuery = async () => {
    try {
      const response = await getAllQueries();
      const sortedData = response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    <Container>
      <Stack
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
      </Stack>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 1, overflowX: "auto", mb: 2 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ px: 1.5 }}>Name</TableCell>
              <TableCell sx={{ px: 1.5 }}>Contact</TableCell>
              <TableCell sx={{ px: 1.5 }}>Status</TableCell>
              <TableCell sx={{ px: 1.5 }}>Cost</TableCell>
              <TableCell sx={{ px: 1.5 }}>Advance</TableCell>
              <TableCell sx={{ px: 1.5 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row._id} hover>
                  <TableCell sx={{ px: 1.5 }}>
                    {editingRowId === row._id ? (
                      <TextField
                        size="small"
                        value={editedRowData.guest_name}
                        onChange={(e) =>
                          setEditedRowData({ ...editedRowData, guest_name: e.target.value })
                        }
                      />
                    ) : (
                      row.guest_info?.guest_name
                    )}
                  </TableCell>

                  <TableCell sx={{ px: 1.5 }}>
                    {editingRowId === row._id ? (
                      <TextField
                        size="small"
                        value={editedRowData.guest_phone}
                        onChange={(e) =>
                          setEditedRowData({ ...editedRowData, guest_phone: e.target.value })
                        }
                      />
                    ) : (
                      row.guest_info?.guest_phone
                    )}
                  </TableCell>

                  <TableCell sx={{ px: 1.5 }}>
                    {editingRowId === row._id ? (
                      <Select
                        size="small"
                        value={editedRowData.lead_stage}
                        onChange={(e) =>
                          setEditedRowData({ ...editedRowData, lead_stage: e.target.value })
                        }
                      >
                        {["Confirm", "Cancel", "FollowUp", "Postponed", "Higher Priority"].map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Chip
                        label={row.lead_stage}
                        color={getStatusColor(row.lead_stage)}
                        size="small"
                      />
                    )}
                  </TableCell>

                  <TableCell sx={{ px: 1.5 }}>
                    {editingRowId === row._id ? (
                      <TextField
                        size="small"
                        value={editedRowData.cost}
                        onChange={(e) =>
                          setEditedRowData({ ...editedRowData, cost: e.target.value })
                        }
                      />
                    ) : (
                      row.cost || "N/A"
                    )}
                  </TableCell>

                  <TableCell sx={{ px: 1.5 }}>
                    {editingRowId === row._id ? (
                      <TextField
                        size="small"
                        value={editedRowData.advance}
                        onChange={(e) =>
                          setEditedRowData({ ...editedRowData, advance: e.target.value })
                        }
                      />
                    ) : row.advance ? `${row.advance}` : "0"}
                  </TableCell>

                  <TableCell sx={{ px: 1.5 }}>
                    {editingRowId === row._id ? (
                      <>
                        <Button size="small" onClick={() => handleSaveEdit(row._id)}>
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingRowId(null);
                            setEditedRowData({});
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingRowId(row._id);
                              setEditedRowData({
                                guest_name: row.guest_info?.guest_name || "",
                                guest_phone: row.guest_info?.guest_phone || "",
                                cost: row.cost || "",
                                advance: row.advance || "",
                                lead_stage: row.lead_stage || "",
                              });
                            }}
                          >
                            <Typography color="success" fontSize="small">Edit</Typography>
                          </IconButton>
                        </Tooltip>

                        {row.advance > 0 && (
                          <Tooltip title="Manage Operation">
                            <IconButton size="small" onClick={() => handleEditOpen(row.operation_id)}>
                              <Typography color="primary" fontSize="small">Manage</Typography>
                            </IconButton>
                          </Tooltip>
                        )}

                        {checkPermission("queries", "assuser") && (
                          <Tooltip title="Assign Users">
                            <IconButton size="small" onClick={() => openUserModal(row)}>
                              <Typography color="secondary" fontSize="small">Assign</Typography>
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
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

      <SnackbarComponent />
    </Container>
  );
};

export default Query;

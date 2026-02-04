import React, { useEffect, useState, useMemo } from "react";
import {
  Container, Typography, IconButton, Tooltip, Box, Chip, MenuItem, Modal, Paper,
  TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { deleteQueries, getAllQueries, updateQueries } from "../../api/queriesAPI";
import usePermissions from "../../hooks/UsePermissions";
import { useDispatch } from "react-redux";
import { setSelectedquerie } from "../../reduxcomponents/slices/queriesSlice";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../hooks/useSnackbar";
import { getAllUsers } from "../../api/userAPI";
import { getChangeRequest, getRejectedChanges, handleChangeRequestApproval } from "../../api/operationAPI";

const Query = () => {
  const checkPermission = usePermissions();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const canView = checkPermission("queries", "view");
  // const canEdit = checkPermission("queries", "alter");
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  // const [query, setQuery] = useState([]);
  const [queries, setQueries] = useState([]);
  // const [filteredQuery, setFilteredQuery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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

  const fetchQuery = React.useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await getAllQueries(pageNum, 30);
      // const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); 
      // Server should ideally handle sorting with pagination
      const newData = response.data || [];

      setQueries(prev => {
        if (pageNum === 1) return newData;
        // Filter out duplicates if any
        const existingIds = new Set(prev.map(i => i._id));
        const uniqueNew = newData.filter(i => !existingIds.has(i._id));
        return [...prev, ...uniqueNew];
      });

      setHasMore(response.pagination?.hasNextPage || false);
      setHasMore(response.pagination?.hasNextPage || false);
    } catch (error) {
      console.error("Error fetching query:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      const filtered = users.data.filter(u => u.permission === "User");
      setAllUsers(filtered);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (canView) fetchQuery(1);
  }, [canView]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchQuery(nextPage);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleSaveEdit = React.useCallback(async (id) => {
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
  }, [editedRowData, fetchQuery, showSnackbar]);

  const getStatusColor = React.useCallback((status) => {
    switch (status) {
      case "Confirm": return "success";
      case "Cancel": return "default";
      case "FollowUp": return "warning";
      case "Postponed": return "info";
      case "Higher Priority": return "error";
      default: return "default";
    }
  }, []);

  const handleEditOpen = React.useCallback(async (id) => {
    dispatch(setSelectedquerie({ id }));
    navigate("/query/view");
  }, [dispatch, navigate]);
  const handleOpenDeleteDialog = React.useCallback((row) => {
    setQueryToDelete(row);
    setDeleteDialogOpen(true);
  }, []);


  const openUserModal = React.useCallback((row) => {
    setSelectedQueryId(row._id);
    const assigned = row.manage_teams?.map(mt => mt.user_id) || [];
    setAssignedUsers(assigned);
    setUserModalOpen(true);
  }, []);

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

  const openChangeRequestModal = React.useCallback(async (queryId) => {
    try {
      const res = await getChangeRequest(queryId);
      setSelectedChangeRequests(res);
      setCurrentQueryId(queryId);
      setChangeModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch change requests", err);
      showSnackbar("Failed to load change requests", "error");
    }
  }, [showSnackbar]);
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
  const openRejectedChangeModal = React.useCallback(async (operationId) => {
    try {
      const res = await getRejectedChanges(operationId);
      setRejectedChanges(res);
      setRejectedModalOpen(true);
    } catch (err) {
      console.error("Failed to load rejected changes", err);
      showSnackbar("Failed to load rejected changes", "error");
    }
  }, [showSnackbar]);
  const handleDeleteQuery = async () => {
    try {
      const res = await deleteQueries(queryToDelete._id);
      if (res.success) {
        showSnackbar("Query deleted successfully", "success");
        setQueries(prev => prev.filter(q => q._id !== queryToDelete._id));
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

  // Column definitions for @tanstack/react-table
  const columns = useMemo(() => {
    const cols = [
      {
        accessorKey: "guest_info.guest_name",
        header: "Name",
        cell: ({ row }) => {
          const rowData = row.original;
          if (editingRowId === rowData._id) {
            return (
              <TextField
                size="small"
                value={editedRowData.guest_name}
                onChange={(e) => setEditedRowData({ ...editedRowData, guest_name: e.target.value })}
              />
            );
          }
          return rowData.guest_info?.guest_name || "";
        },
      },
      {
        accessorKey: "guest_info.guest_phone",
        header: "Contact",
        cell: ({ row }) => {
          const rowData = row.original;
          if (editingRowId === rowData._id) {
            return (
              <TextField
                size="small"
                value={editedRowData.guest_phone}
                onChange={(e) => setEditedRowData({ ...editedRowData, guest_phone: e.target.value })}
              />
            );
          }
          return rowData.guest_info?.guest_phone || "";
        },
      },
      {
        accessorKey: "lead_stage",
        header: "Status",
        cell: ({ row }) => {
          const rowData = row.original;
          if (editingRowId === rowData._id) {
            return (
              <Select
                size="small"
                value={editedRowData.lead_stage}
                onChange={(e) => setEditedRowData({ ...editedRowData, lead_stage: e.target.value })}
              >
                {["Confirm", "Cancel", "FollowUp", "Postponed", "Higher Priority"].map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            );
          }
          return <Chip label={rowData.lead_stage} color={getStatusColor(rowData.lead_stage)} />;
        },
      },
      {
        accessorKey: "cost",
        header: "Cost",
        cell: ({ row }) => {
          const rowData = row.original;
          if (editingRowId === rowData._id) {
            return (
              <TextField
                size="small"
                value={editedRowData.cost}
                onChange={(e) => setEditedRowData({ ...editedRowData, cost: e.target.value })}
              />
            );
          }
          return rowData.cost || "N/A";
        },
      },
      {
        accessorKey: "advance",
        header: "Advance",
        cell: ({ row }) => {
          const rowData = row.original;
          if (editingRowId === rowData._id) {
            return (
              <TextField
                size="small"
                value={editedRowData.advance}
                onChange={(e) => setEditedRowData({ ...editedRowData, advance: e.target.value })}
              />
            );
          }
          return rowData.advance ? `${rowData.advance}` : "0";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          if (editingRowId === rowData._id) {
            return (
              <>
                <Button onClick={() => handleSaveEdit(rowData._id)} size="small">Save</Button>
                <Button onClick={() => { setEditingRowId(null); setEditedRowData({}); }} size="small">Cancel</Button>
              </>
            );
          }
          return (
            <>
              <Tooltip title="Edit">
                <IconButton onClick={() => {
                  setEditingRowId(rowData._id);
                  setEditedRowData({
                    guest_name: rowData.guest_info?.guest_name || "",
                    guest_phone: rowData.guest_info?.guest_phone || "",
                    cost: rowData.cost || "",
                    advance: rowData.advance || "",
                    lead_stage: rowData.lead_stage || "",
                  });
                }}>
                  <Typography color="success">Edit</Typography>
                </IconButton>
              </Tooltip>
              {rowData.advance > 0 && (
                <Tooltip title="Manage Operation">
                  <IconButton onClick={() => handleEditOpen(rowData.operation_id)}>
                    <Typography color="primary">Manage</Typography>
                  </IconButton>
                </Tooltip>
              )}
              {checkPermission("queries", "assuser") && (
                <Tooltip title="Assign Users">
                  <IconButton onClick={() => openUserModal(rowData)}>
                    <Typography color="secondary">Assign Users</Typography>
                  </IconButton>
                </Tooltip>
              )}
            </>
          );
        },
      },
    ];

    if (checkPermission("operation", "change-request")) {
      cols.push({
        id: "changeRequest",
        header: "Change Request",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <>
              <Tooltip title="View Rejected Changes">
                <IconButton onClick={() => openRejectedChangeModal(rowData.operation_id)}>
                  <Typography color="error">Rejected</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="View Changes Request">
                <IconButton onClick={() => openChangeRequestModal(rowData.operation_id)}>
                  <Button size="small">CRV</Button>
                </IconButton>
              </Tooltip>
            </>
          );
        },
      });
    }

    if (checkPermission("queries", "delete")) {
      cols.push({
        id: "delete",
        header: "Delete",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <Tooltip title="Delete">
              <IconButton onClick={() => handleOpenDeleteDialog(rowData)}>
                <Typography color="error">Delete</Typography>
              </IconButton>
            </Tooltip>
          );
        },
      });
    }

    return cols;
  }, [editingRowId, editedRowData, checkPermission, handleSaveEdit, handleEditOpen, openUserModal, openRejectedChangeModal, openChangeRequestModal, handleOpenDeleteDialog, getStatusColor]);

  // Table instance
  const table = useReactTable({
    data: queries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: queries.length > 0 ? queries.length : 10,
        pageIndex: 0,
      },
    },
    manualPagination: true,
  });

  return (
    <Container maxWidth={false} sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
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

      <TableContainer
        component={Paper}
        sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}
        onScroll={handleScroll}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} sx={{ backgroundColor: 'background.paper' }}>
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.original._id} hover>
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

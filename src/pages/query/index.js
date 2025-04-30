// Full working version of the Query component with editable table rows
import React, { useEffect, useState } from "react";
import {
  Container, Typography, IconButton, Tooltip, Box, Chip, MenuItem, Menu,
  Modal, Grid, Paper, Divider, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination, Select
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
// import EditSquareIcon from '@mui/icons-material/EditSquare';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { getAllQueries, updateQueries } from "../../api/queriesAPI";
import usePermissions from "../../hooks/UsePermissions";
import { useDispatch } from "react-redux";
import { setSelectedquerie } from "../../reduxcomponents/slices/queriesSlice";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../hooks/useSnackbar";

const Detail = ({ label, value }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="caption" color="textSecondary" fontWeight="bold">
      {label}
    </Typography>
    <Typography variant="body2" color="textPrimary">
      {value || "-"}
    </Typography>
  </Box>
);

const Query = () => {
  const checkPermission = usePermissions();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const canView = checkPermission("queries", "view");
  const canCreate = checkPermission("queries", "create");
  const canEdit = checkPermission("queries", "alter");
  const canDelete = checkPermission("queries", "delete");

  //   const canView = checkPermission("queries", "view");
  const [query, setQuery] = useState([]);
  const [filteredQuery, setFilteredQuery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [view, setView] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  useEffect(() => {
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

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleSaveEdit = async (id) => {
    try {
      const updatedFields = {};
  
      if (editedRowData.guest_name !== undefined) {
        updatedFields["guest_info.guest_name"] = editedRowData.guest_name;
      }
      if (editedRowData.guest_phone !== undefined) {
        updatedFields["guest_info.guest_phone"] = editedRowData.guest_phone;
      }
      if (editedRowData.cost !== undefined) {
        updatedFields.cost = editedRowData.cost;
      }
      if (editedRowData.advance !== undefined) {
        updatedFields.advance = editedRowData.advance;
      }
      if (editedRowData.lead_stage !== undefined) {
        updatedFields.lead_stage = editedRowData.lead_stage;
      }
  
      const response = await updateQueries(id, updatedFields);
  
      if (response.success) {
        showSnackbar(response.message, "success");
      }
  
      fetchQuery();
      setEditingRowId(null);
      setEditedRowData({});
    } catch (error) {
      console.error("Update failed:", error);
    }
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
  const handleEditOpen = (id, value) => {
    dispatch(setSelectedquerie(value))
    navigate("/query/view")

  }
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Queries</Typography>
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
                  ) : (
                    row.guest_info?.guest_name
                  )}
                </TableCell>
                <TableCell>
                  {editingRowId === row._id ? (
                    <TextField size="small" value={editedRowData.guest_phone} onChange={(e) => setEditedRowData({ ...editedRowData, guest_phone: e.target.value })} />
                  ) : (
                    row.guest_info?.guest_phone
                  )}
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
                  ) : (
                    row.cost || "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {editingRowId === row._id ? (
                    <TextField size="small" value={editedRowData.advance} onChange={(e) => setEditedRowData({ ...editedRowData, advance: e.target.value })} />
                  ) : (
                    row.advance ? `${row.advance}` : "0"
                  )}
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
                          {/* <EditSquareIcon /> */}
                          <Typography color="success"> Edit</Typography>
                        </IconButton>
                      </Tooltip>
                      {row.advance > 0 &&
                      <Tooltip title="open">
                        <IconButton color="warning" size="small" onClick={() => handleEditOpen(row.id, row)}>
                          {/* <KeyboardArrowRightOutlinedIcon fontSize="small" /> */}
                          <Typography color="primary">Manage</Typography>
                        </IconButton>
                      </Tooltip>
                      }
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
      <SnackbarComponent />
    </Container>

  );
};

export default Query;

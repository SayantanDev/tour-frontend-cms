import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Container, Typography, IconButton, Tooltip, Box, Chip, MenuItem, Modal, Paper,
  TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Avatar, InputAdornment, CircularProgress, Divider, Grid as MuiGrid
} from "@mui/material";
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { deleteQueries, getAllQueries, updateQueries } from "../../api/queriesAPI";
import usePermissions from "../../hooks/UsePermissions";
import { useDispatch } from "react-redux";
import { setSelectedquerie } from "../../reduxcomponents/slices/queriesSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSnackbar from "../../hooks/useSnackbar";
import { getAllUsers } from "../../api/userAPI";
import { getChangeRequest, getRejectedChanges, handleChangeRequestApproval } from "../../api/operationAPI";

const getStatusStyles = (status) => {
  switch (status) {
    case "Confirm": return { color: "#2e7d32", bg: "#e8f5e9", icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> };
    case "Cancel": return { color: "#d32f2f", bg: "#ffebee", icon: <ErrorOutlineIcon sx={{ fontSize: 14 }} /> };
    case "FollowUp": return { color: "#ed6c02", bg: "#fff3e0", icon: <PendingActionsIcon sx={{ fontSize: 14 }} /> };
    case "Postponed": return { color: "#0288d1", bg: "#e1f5fe", icon: <EventIcon sx={{ fontSize: 14 }} /> };
    case "Higher Priority": return { color: "#9c27b0", bg: "#f3e5f5", icon: <TrendingUpIcon sx={{ fontSize: 14 }} /> };
    default: return { color: "#475569", bg: "#f1f5f9", icon: null };
  }
};

const ModernStatusChip = ({ status }) => {
  const styles = getStatusStyles(status);
  return (
    <Chip
      label={status}
      size="small"
      icon={styles.icon}
      sx={{
        height: 24,
        fontSize: '0.7rem',
        fontWeight: 'bold',
        color: styles.color,
        backgroundColor: styles.bg,
        border: `1px solid ${styles.color}40`,
        '& .MuiChip-icon': { color: 'inherit' },
        borderRadius: '6px'
      }}
    />
  );
};

// --- Stable Editable Cell Components ---

const EditableTextCell = ({ value, onChange, placeholder, autoFocus }) => (
  <TextField
    size="small"
    fullWidth
    autoFocus={autoFocus}
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    sx={{ '& .MuiInputBase-input': { py: '4px', fontSize: '0.8rem' } }}
  />
);

const EditablePhoneCell = ({ countryCode, phone, onCountryCodeChange, onPhoneChange }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    <TextField
      size="small"
      sx={{ width: 60, '& .MuiInputBase-input': { py: '4px', fontSize: '0.8rem' } }}
      value={countryCode === undefined ? "+91" : countryCode}
      onChange={(e) => onCountryCodeChange(e.target.value)}
      placeholder="+91"
    />
    <TextField
      size="small"
      sx={{ '& .MuiInputBase-input': { py: '4px', fontSize: '0.8rem' } }}
      value={phone || ""}
      onChange={(e) => onPhoneChange(e.target.value)}
    />
  </Box>
);

const EditableSelectCell = ({ value, onChange, options }) => (
  <Select
    size="small"
    fullWidth
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    sx={{ height: 32, fontSize: '0.8rem' }}
  >
    {options.map((opt) => (
      <MenuItem key={opt} value={opt} sx={{ fontSize: '0.8rem' }}>{opt}</MenuItem>
    ))}
  </Select>
);

const EditableNumberCell = ({ value, onChange }) => (
  <TextField
    size="small"
    type="number"
    value={(value === 0 || value === '0') ? 0 : (value || "")}
    onChange={(e) => onChange(e.target.value)}
    sx={{ width: 100, '& .MuiInputBase-input': { py: '4px', fontSize: '0.8rem' } }}
  />
);

const Query = () => {
  const checkPermission = usePermissions();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const canView = checkPermission("queries", "view");
  // const canEdit = checkPermission("queries", "alter");
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  // const [query, setQuery] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [dateQuery, setDateQuery] = useState(searchParams.get("date") || "");
  const [statusQuery, setStatusQuery] = useState(searchParams.get("stage") || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.get("location") || "");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [selectedQuickEditId, setSelectedQuickEditId] = useState(null);
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

  const fetchQuery = useCallback(async (pageNum = 1, filters = {}) => {
    setLoading(true);
    try {
      const response = await getAllQueries(pageNum, 30, filters);
      const newData = response.data || [];

      setQueries(prev => {
        if (pageNum === 1) return newData;
        const existingIds = new Set(prev.map(i => i._id));
        const uniqueNew = newData.filter(i => !existingIds.has(i._id));
        return [...prev, ...uniqueNew];
      });

      setHasMore(response.pagination?.hasNextPage || false);
    } catch (error) {
      console.error("Error fetching query:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state to URL and fetch on filter change
  useEffect(() => {
    const filters = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusQuery) filters.stage = statusQuery;
    if (locationQuery) filters.location = locationQuery;
    if (dateQuery) filters.date = dateQuery;

    // Update URL
    const params = new URLSearchParams(filters);
    setSearchParams(params, { replace: true });

    // Fetch leads (Reset to page 1)
    setPage(1);
    if (canView) fetchQuery(1, filters);
  }, [searchQuery, statusQuery, locationQuery, dateQuery, canView, fetchQuery, setSearchParams]);

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
    // Initial fetch is handled by the filter useEffect above
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchQuery(nextPage);
    }
  };

  // const formatDate = (date) => {
  //   const d = new Date(date);
  //   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  // };

  const handleSaveEdit = useCallback(async (id, dataToSave) => {
    try {
      const updatedFields = {};
      if (dataToSave.guest_name !== undefined) updatedFields.guest_name = dataToSave.guest_name;
      if (dataToSave.guest_phone !== undefined) updatedFields.guest_phone = dataToSave.guest_phone;
      if (dataToSave.guest_country_code !== undefined) updatedFields.guest_country_code = dataToSave.guest_country_code;
      if (dataToSave.cost !== undefined) updatedFields.cost = dataToSave.cost;
      if (dataToSave.advance !== undefined) updatedFields.advance = dataToSave.advance;
      if (dataToSave.lead_stage !== undefined) updatedFields.lead_stage = dataToSave.lead_stage;

      const response = await updateQueries(id, updatedFields);
      if (response.success) showSnackbar(response.message, "success");

      fetchQuery();
      setQuickEditOpen(false);
      setSelectedQuickEditId(null);
      setEditedRowData({});
    } catch (error) {
      console.error("Update failed:", error);
    }
  }, [fetchQuery, showSnackbar]);

  const getStatusColor = useCallback((status) => {
    return getStatusStyles(status).color;
  }, []);

  const stats = useMemo(() => {
    const s = { total: queries.length, confirm: 0, followUp: 0, pending: 0 };
    queries.forEach(q => {
      if (q.lead_stage === "Confirm") s.confirm++;
      else if (q.lead_stage === "FollowUp") s.followUp++;
      else s.pending++;
    });
    return s;
  }, [queries]);

  const handleEditOpen = useCallback((rowData) => {
    dispatch(setSelectedquerie({ ...rowData, id: rowData.operation_id }));
    navigate("/query/view");
  }, [dispatch, navigate]);
  const handleOpenDeleteDialog = useCallback((row) => {
    setQueryToDelete(row);
    setDeleteDialogOpen(true);
  }, []);


  const openUserModal = useCallback((row) => {
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

  const openChangeRequestModal = useCallback(async (queryId) => {
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
      openChangeRequestModal(currentQueryId); // Refresh modal list
      fetchQuery(1); // Refresh main list to update counts
    } catch (err) {
      console.error(err);
      showSnackbar("Action failed", "error");
    }
  };
  const openRejectedChangeModal = useCallback(async (operationId) => {
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
        header: "Lead Name",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              onClick={() => handleEditOpen(rowData)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  '& .MuiTypography-root': { color: 'primary.main' },
                  '& .MuiAvatar-root': { transform: 'scale(1.1)' }
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28, fontSize: '0.8rem', fontWeight: 'bold', transition: 'transform 0.2s' }}>
                {rowData.guest_info?.guest_name?.charAt(0) || 'G'}
              </Avatar>
              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ transition: 'color 0.2s' }}>
                {rowData.guest_info?.guest_name || "N/A"}
              </Typography>
            </Stack>
          );
        },
      },
      {
        accessorKey: "guest_info.guest_phone",
        header: "Contact Details",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <Box>
              <Typography variant="body2" fontWeight={500}>{`${rowData.guest_info?.guest_country_code || "+91"} ${rowData.guest_info?.guest_phone || ""}`}</Typography>
              <Typography variant="caption" color="text.secondary">{rowData.guest_info?.guest_email || ""}</Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: "lead_stage",
        header: "Stage",
        cell: ({ row }) => {
          const rowData = row.original;
          return <ModernStatusChip status={rowData.lead_stage} />;
        },
      },
      {
        accessorKey: "cost",
        header: "Total Cost",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <Typography variant="body2" fontWeight={700} color="primary.main">
              ₹{Number(rowData.cost || 0).toLocaleString('en-IN')}
            </Typography>
          );
        },
      },
      {
        accessorKey: "advance",
        header: "Advance",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <Typography variant="body2" fontWeight={600} color={rowData.advance > 0 ? "success.main" : "text.secondary"}>
              ₹{Number(rowData.advance || 0).toLocaleString('en-IN')}
            </Typography>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Quick Edit">
                <IconButton size="small" color="primary" onClick={() => {
                  setSelectedQuickEditId(rowData._id);
                  setEditedRowData({
                    guest_name: rowData.guest_info?.guest_name || "",
                    guest_phone: rowData.guest_info?.guest_phone || "",
                    guest_country_code: rowData.guest_info?.guest_country_code || rowData.guest_country_code || "+91",
                    cost: rowData.cost || "",
                    advance: rowData.advance || "",
                    lead_stage: rowData.lead_stage || "",
                  });
                  setQuickEditOpen(true);
                }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {rowData.advance > 0 && (
                <Tooltip title="Manage Itinerary">
                  <IconButton size="small" color="info" onClick={() => handleEditOpen(rowData)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {checkPermission("queries", "assuser") && (
                <Tooltip title="Assign Users">
                  <IconButton size="small" color="secondary" onClick={() => openUserModal(rowData)}>
                    <AssignmentIndIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
    ];

    if (checkPermission("operation", "change-request")) {
      cols.push({
        id: "changeRequest",
        header: "Requests",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <Stack direction="row" spacing={1.5}>
              <Tooltip title={`${rowData.rejected_changes || 0} Rejected Changes`}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <IconButton size="small" color="error" onClick={() => openRejectedChangeModal(rowData.operation_id || rowData._id)}>
                    <ErrorOutlineIcon fontSize="small" />
                  </IconButton>
                  {rowData.rejected_changes > 0 && (
                    <Box sx={{
                      position: 'absolute', top: -4, right: -4,
                      bgcolor: 'error.main', color: 'white',
                      borderRadius: '50%', width: 16, height: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 'bold', border: '2px solid white'
                    }}>
                      {rowData.rejected_changes}
                    </Box>
                  )}
                </Box>
              </Tooltip>
              <Tooltip title={`${rowData.pending_changes || 0} Pending Requests`}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <IconButton size="small" color="warning" onClick={() => openChangeRequestModal(rowData.operation_id || rowData._id)}>
                    <ChangeCircleIcon fontSize="small" />
                  </IconButton>
                  {rowData.pending_changes > 0 && (
                    <Box sx={{
                      position: 'absolute', top: -4, right: -4,
                      bgcolor: 'warning.main', color: 'white',
                      borderRadius: '50%', width: 16, height: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 'bold', border: '2px solid white'
                    }}>
                      {rowData.pending_changes}
                    </Box>
                  )}
                </Box>
              </Tooltip>
            </Stack>
          );
        },
      });
    }

    if (checkPermission("queries", "delete")) {
      cols.push({
        id: "delete",
        header: "",
        cell: ({ row }) => (
          <Tooltip title="Delete Lead">
            <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(row.original)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      });
    }

    return cols;
  }, [checkPermission, handleEditOpen, openUserModal, openRejectedChangeModal, openChangeRequestModal, handleOpenDeleteDialog]);

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
    <Container maxWidth={false} sx={{ height: '100vh', py: 2, bgcolor: '#f8fafc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Header & Stats */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.5px' }}>
              Lead Management
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Monitor and manage your travel inquiries in real-time
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchQuery(1)}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/createItinerary")}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)' }}
            >
              New Lead
            </Button>
          </Stack>
        </Stack>

        <MuiGrid container spacing={2}>
          {[
            { label: 'Total Leads', value: stats.total, color: '#1e293b', icon: <MoreVertIcon fontSize="small" /> },
            { label: 'Confirmed', value: stats.confirm, color: '#2e7d32', icon: <CheckCircleIcon fontSize="small" /> },
            { label: 'Follow Ups', value: stats.followUp, color: '#ed6c02', icon: <PendingActionsIcon fontSize="small" /> },
            { label: 'Pending/New', value: stats.pending, color: '#0288d1', icon: <TrendingUpIcon fontSize="small" /> },
          ].map((stat, i) => (
            <MuiGrid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 2, borderRadius: '12px', borderLeft: `4px solid ${stat.color}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 40, height: 40 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="text.primary">
                    {stat.value}
                  </Typography>
                </Box>
              </Paper>
            </MuiGrid>
          ))}
        </MuiGrid>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <MuiGrid container spacing={2} alignItems="center">
          <MuiGrid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, phone or email..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: '8px', bgcolor: '#fcfcfc' }
              }}
            />
          </MuiGrid>
          <MuiGrid item xs={6} md={2}>
            <TextField
              fullWidth
              select
              label="Stage"
              size="small"
              value={statusQuery}
              onChange={(e) => setStatusQuery(e.target.value)}
              InputProps={{ sx: { borderRadius: '8px' } }}
            >
              <MenuItem value="">All Stages</MenuItem>
              {["Confirm", "Cancel", "FollowUp", "Postponed", "Higher Priority"].map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </MuiGrid>
          <MuiGrid item xs={6} md={2}>
            <TextField
              fullWidth
              select
              label="Location"
              size="small"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              InputProps={{ sx: { borderRadius: '8px' } }}
            >
              <MenuItem value="">All Locations</MenuItem>
              {["Darjeeling", "Sikkim", "Sandakphu"].map((loc) => (
                <MenuItem key={loc} value={loc}>{loc}</MenuItem>
              ))}
            </TextField>
          </MuiGrid>
          <MuiGrid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Travel Date"
              size="small"
              value={dateQuery}
              onChange={(e) => setDateQuery(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: { borderRadius: '8px' },
                startAdornment: (
                  <InputAdornment position="start">
                    <EventIcon color="action" fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </MuiGrid>
          <MuiGrid item xs={12} md={1}>
            <Tooltip title="Clear Filters">
              <IconButton onClick={() => { setSearchQuery(""); setStatusQuery(""); setLocationQuery(""); setDateQuery(""); }}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </MuiGrid>
        </MuiGrid>
      </Paper>

      {/* Table Section */}
      <TableContainer
        component={Paper}
        sx={{
          flexGrow: 1,
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: 'none',
          bgcolor: 'background.paper',
          overflowY: "auto",
          position: 'relative'
        }}
        onScroll={handleScroll}
      >
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      py: 2,
                      borderBottom: '2px solid #e2e8f0'
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.original._id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc' },
                    '& td': { py: 1.5, borderBottom: '1px solid #f1f5f9' }
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={queries.length > 0 ? columns.length : 10} align="center" sx={{ py: 10 }}>
                  <Box sx={{ textAlign: 'center', opacity: 0.5 }}>
                    <SearchIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">No leads found</Typography>
                    <Typography variant="body2">Try adjusting your filters or search query</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {loading && (
          <Box sx={{ position: 'sticky', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <CircularProgress size={32} />
          </Box>
        )}
      </TableContainer>

      {/* User Assign Modal */}
      <Modal open={userModalOpen} onClose={() => setUserModalOpen(false)}>
        <Paper sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          p: 3, width: 400, borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Assign Team Members</Typography>
          <Divider sx={{ mb: 2 }} />
          <Select
            multiple
            fullWidth
            size="small"
            value={assignedUsers}
            onChange={(e) => setAssignedUsers(e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {allUsers
                  .filter(user => selected.includes(user.id))
                  .map(user => (
                    <Chip key={user.id} label={user.fullName} size="small" />
                  ))}
              </Box>
            )}
            sx={{ borderRadius: '8px' }}
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
            sx={{ mt: 3, borderRadius: '8px', height: 44, fontWeight: 600 }}
            variant="contained"
            onClick={saveUserAssignments}
          >
            Update Permissions
          </Button>
        </Paper>
      </Modal>

      {/* Change Request View */}
      <Modal open={changeModalOpen} onClose={() => setChangeModalOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#f8fafc', boxShadow: 24, p: 3,
          width: 600, maxHeight: "85vh", overflowY: "auto", borderRadius: '16px'
        }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Review Change Requests</Typography>
          <Divider sx={{ mb: 2 }} />
          {selectedChangeRequests.length === 0 ? (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No pending requests</Typography>
          ) : (
            selectedChangeRequests.map(change => (
              <Paper key={change._id} sx={{ p: 2, mb: 2, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                    <ChangeCircleIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{change.user_id?.fullName || 'User'}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(change.date_time).toLocaleString()}</Typography>
                  </Box>
                  <Chip label={change.approved_status} size="small" color="primary" variant="outlined" sx={{ ml: 'auto' }} />
                </Stack>

                <Typography variant="body2" sx={{ bgcolor: '#ffffff', p: 1.5, borderRadius: '8px', border: '1px dashed #cbd5e1', mb: 2 }}>
                  {change.description}
                </Typography>

                {change.approved_status === "Pending" && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleChangeRequestAction(change._id, "Approved")}
                      sx={{ borderRadius: '6px', px: 3 }}
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
                      sx={{ borderRadius: '6px' }}
                    >
                      Reject
                    </Button>
                  </Stack>
                )}
              </Paper>
            ))
          )}
          <Button onClick={() => setChangeModalOpen(false)} fullWidth sx={{ mt: 1, color: 'text.secondary' }}>Close</Button>
        </Box>
      </Modal>

      {/* Rejected Reason View */}
      <Modal open={rejectedModalOpen} onClose={() => setRejectedModalOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#fff', p: 3, width: 500,
          borderRadius: '16px', boxShadow: 24, maxHeight: '80vh', overflowY: 'auto'
        }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>History of Rejections</Typography>
          <Divider sx={{ mb: 2 }} />
          {rejectedChanges.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" py={4}>No history found.</Typography>
          ) : (
            rejectedChanges.map(change => (
              <Paper key={change._id} sx={{ p: 2, mb: 2, bgcolor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px' }}>
                <Typography variant="subtitle2" fontWeight={700}>{new Date(change.date_time).toLocaleDateString()}</Typography>
                <Typography variant="body2" sx={{ my: 1 }}>{change.description}</Typography>
                <Box sx={{ p: 1, bgcolor: '#ffffff', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                  <Typography variant="caption" color="error.main" fontWeight={700}>REJECTION REASON:</Typography>
                  <Typography variant="body2" color="error.main">{change.rejected_reason}</Typography>
                </Box>
              </Paper>
            ))
          )}
          <Button onClick={() => setRejectedModalOpen(false)} fullWidth color="inherit">Close</Button>
        </Box>
      </Modal>

      <SnackbarComponent />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure you want to permanently delete this lead? This action cannot be undone.
          </Typography>
          {queryToDelete && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: '8px' }}>
              <Typography variant="subtitle2" fontWeight={700}>{queryToDelete.guest_info?.guest_name}</Typography>
              <Typography variant="caption" color="text.secondary">ID: {queryToDelete._id}</Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'text.secondary' }}>Keep Lead</Button>
          <Button color="error" variant="contained" onClick={handleDeleteQuery} sx={{ borderRadius: '8px', px: 3 }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Edit Dialog */}
      <Dialog
        open={quickEditOpen}
        onClose={() => setQuickEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, bgcolor: '#f1f5f9', py: 2 }}>Quick Edit Lead</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Lead Name"
              value={editedRowData.guest_name || ""}
              onChange={(e) => setEditedRowData(prev => ({ ...prev, guest_name: e.target.value }))}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                sx={{ width: 100 }}
                label="Code"
                value={editedRowData.guest_country_code || "+91"}
                onChange={(e) => setEditedRowData(prev => ({ ...prev, guest_country_code: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={editedRowData.guest_phone || ""}
                onChange={(e) => setEditedRowData(prev => ({ ...prev, guest_phone: e.target.value }))}
              />
            </Stack>
            <TextField
              fullWidth
              select
              label="Lead Stage"
              value={editedRowData.lead_stage || ""}
              onChange={(e) => setEditedRowData(prev => ({ ...prev, lead_stage: e.target.value }))}
            >
              {["Confirm", "Cancel", "FollowUp", "Postponed", "Higher Priority"].map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Total Cost"
                type="number"
                value={(editedRowData.cost === 0 || editedRowData.cost === '0') ? 0 : (editedRowData.cost || "")}
                onChange={(e) => setEditedRowData(prev => ({ ...prev, cost: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Advance"
                type="number"
                value={(editedRowData.advance === 0 || editedRowData.advance === '0') ? 0 : (editedRowData.advance || "")}
                onChange={(e) => setEditedRowData(prev => ({ ...prev, advance: e.target.value }))}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Button onClick={() => setQuickEditOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSaveEdit(selectedQuickEditId, editedRowData)}
            sx={{ borderRadius: '8px', px: 4, fontWeight: 700 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Query;

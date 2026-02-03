import React, { useEffect, useState, useMemo } from "react";
import {
  Container, Typography, Button, IconButton, TextField, Box, Autocomplete,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, Chip, Switch, CircularProgress, Tooltip, Select, MenuItem,
  Checkbox
} from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import PackageDialog from '../../components/packages/PackageDialog';
import { getSinglePackages, verifyPackage, updatePackageRanking } from '../../api/packageAPI';
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeSelectedPackage, setSelectedPackage, updatePackageInStore } from "../../reduxcomponents/slices/packagesSlice";
import usePermissions from "../../hooks/UsePermissions";
import PaymentsIcon from '@mui/icons-material/Payments';
import CostDialogbox from "../../components/packages/costDialogbox";
import useAppData from "../../hooks/useAppData";

// --------- helpers ----------
const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
};

const safeCost = (pkg) => {
  if (pkg?.type === 'Trek') {
    return pkg?.details?.cost?.singleCost ?? "N/A";
  }
  const mc = pkg?.details?.cost?.multipleCost;
  if (Array.isArray(mc) && mc.length) {
    const first = mc[0];
    if (first?.Budget != null) return first.Budget;
    if (first?.budget != null) return first.budget;
    const anyPrice = Object.values(first || {}).find(v => typeof v === 'number' || typeof v === 'string');
    return anyPrice ?? "N/A";
  }
  return "N/A";
};

const safeDuration = (pkg) => pkg?.details?.header?.h2 ?? "—";

// ========== Component ==========
const AllPackages = () => {
  // Use centralized data hook
  const { allPackages: reduxPackages } = useAppData({ autoFetch: false });

  const [allPackages, setAllPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newD, setNewD] = useState(false);
  const [singleRowData, setSingleRowData] = useState({});
  const [filterLocation, setFilterLocation] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [searchLabel, setSearchLabel] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  //navigatyion from dashboard
  const location = useLocation();

  // Sync local state with Redux data
  useEffect(() => {
    if (reduxPackages && reduxPackages.length > 0) {
      setAllPackages(reduxPackages);
    }
  }, [reduxPackages]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const zoneFromURL = params.get("zone");

    setFilterLocation(zoneFromURL ?? null);

  }, [location.search]);

  // NEW: filters
  const [filterVerified, setFilterVerified] = useState('All'); // 'All' | 'Verified' | 'Not Verified'
  const [filterDateField, setFilterDateField] = useState('created'); // 'created' | 'updated'
  const [filterDateFrom, setFilterDateFrom] = useState(''); // YYYY-MM-DD
  const [filterDateTo, setFilterDateTo] = useState('');     // YYYY-MM-DD

  const [rankingFilter, setRankingFilter] = useState(false);

  // track which rows are updating "verified"
  const [toggleLoading, setToggleLoading] = useState({});

  // NEW: track which rows are updating "ranking"
  const [rankingLoading, setRankingLoading] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [costDialogdata, setCostDialogData] = useState({
    singleCost: null,
    multipleCost: [],
    daysCost: [],
    valueCost: [],
  });
  const [openConfirm, setOpenConfirm] = useState({ isVisible: false, section: "", target: "" });


  const handleOpenConfirm = (section, target) => {
    setOpenConfirm({ isVisible: true, section, target });
    console.log(section, target);
  }

  const handleCloseConfirm = () => setOpenConfirm({ isVisible: false, section: "", target: "" });


  const handleConfirmDelete = () => {

    const { section, target } = openConfirm;

    const updated = { ...costDialogdata };
    if (section === "multiple") {
      updated.multipleCost = updated.multipleCost.filter((d) => d.Persons !== target);
    } else if (section === "days") {
      updated.daysCost = updated.daysCost.filter((d) => d.Days !== target);
    } else if (section === "value") {
      updated.valueCost = updated.valueCost.filter((d) => d.Type !== target);
    }
    setCostDialogData(updated);
    handleCloseConfirm();
  }

  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getPermission = usePermissions();

  // initial fetch - REMOVED (handled by useAppData and useEffect sync)


  const uniqueLocations = useMemo(
    () => [...new Set(allPackages.map(pkg => pkg.location).filter(Boolean))],
    [allPackages]
  );
  const uniqueTypes = useMemo(
    () => [...new Set(allPackages.map(pkg => pkg.type).filter(Boolean))],
    [allPackages]
  );

  // filtering + mapping to rows
  useEffect(() => {
    let filtered = [...allPackages];

    if (filterLocation) {
      filtered = filtered.filter(pkg => (pkg.location || "").toLowerCase() === filterLocation.toLowerCase());
    }
    if (filterType) {
      filtered = filtered.filter(pkg => (pkg.type || "").toLowerCase() === filterType.toLowerCase());
    }
    if (searchLabel) {
      const q = searchLabel.toLowerCase();
      filtered = filtered.filter(pkg => (pkg.label || "").toLowerCase().includes(q));
    }

    // Verified filter
    if (filterVerified !== 'All') {
      const want = filterVerified === 'Verified';
      filtered = filtered.filter(pkg => Boolean(pkg?.verified) === want);
    }

    // Date-wise filter
    if (filterDateFrom || filterDateTo) {
      const key = filterDateField === 'created' ? 'created_at' : 'updated_at';
      const fromTime = filterDateFrom ? new Date(`${filterDateFrom}T00:00:00`).getTime() : null;
      const toTime = filterDateTo ? new Date(`${filterDateTo}T23:59:59`).getTime() : null;

      filtered = filtered.filter(pkg => {
        const t = pkg?.[key] ? new Date(pkg[key]).getTime() : null;
        if (!t) return false; // if no date and a range is set, exclude
        if (fromTime && t < fromTime) return false;
        if (toTime && t > toTime) return false;
        return true;
      });
    }

    if (rankingFilter) {
      filtered.sort((a, b) => {
        if (a.ranking === 0 && b.ranking === 0) return 0;
        if (a.ranking === 0) return 1;
        if (b.ranking === 0) return -1;
        return a.ranking - b.ranking;
      });
    }


    const rows = filtered.map(pkg => ({
      raw: pkg,
      id: pkg._id,
      title: pkg.label || "Untitled",
      type: pkg.type || "—",
      verified: Boolean(pkg.verified),
      created_at: pkg.created_at,
      updated_at: pkg.updated_at,
      duration: safeDuration(pkg),
      cost: safeCost(pkg),
      ranking: Number.isFinite(pkg?.ranking) ? pkg.ranking : 0, // NEW
    }));

    setFilteredPackages(rows);
  }, [
    allPackages,
    filterLocation,
    filterType,
    searchLabel,
    filterVerified,
    filterDateField,
    filterDateFrom,
    filterDateTo,
    rankingFilter
  ]);

  console.log(filteredPackages);

  // actions
  const handleView = React.useCallback((id) => {
    navigate(`/packages/view/${id}`);
  }, [navigate]);

  const handleEdit = React.useCallback(async (id) => {
    try {
      const singleData = await getSinglePackages(id);
      dispatch(setSelectedPackage(singleData.data));
      navigate(`/packages/createandedit`);
    } catch (error) {
      console.error('Failed to fetch single package', error);
    }
  }, [dispatch, navigate]);

  const createNewPackage = () => {
    dispatch(removeSelectedPackage());
    navigate(`/packages/createandedit`);
  };

  const handleToggleVerified = React.useCallback(async (row, nextVal) => {
    const id = row.id;
    setToggleLoading(prev => ({ ...prev, [id]: true }));

    // Optimistic update via Redux
    const pkg = allPackages.find(p => p._id === id);
    if (pkg) {
      dispatch(updatePackageInStore({ ...pkg, verified: nextVal }));
    }

    try {
      const objD = { verified: nextVal };
      await verifyPackage(id, objD); // <-- backend update
      // Update with new timestamp
      if (pkg) {
        dispatch(updatePackageInStore({
          ...pkg,
          verified: nextVal,
          updated_at: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error("Failed to update verified", err);
      // Revert on error
      if (pkg) {
        dispatch(updatePackageInStore({ ...pkg, verified: !nextVal }));
      }
    } finally {
      setToggleLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [allPackages, dispatch]);

  // NEW: change ranking
  const handleChangeRanking = React.useCallback(async (row, nextVal) => {
    const id = row.id;
    const newRanking = Number(nextVal);

    setRankingLoading(prev => ({ ...prev, [id]: true }));

    // Optimistic update via Redux
    const pkg = allPackages.find(p => p._id === id);
    if (pkg) {
      dispatch(updatePackageInStore({ ...pkg, ranking: newRanking }));
    }

    try {
      // Assume API signature: updatePackageRanking(id, { ranking: number })
      await updatePackageRanking(id, { ranking: newRanking });
      // bump updated_at
      if (pkg) {
        dispatch(updatePackageInStore({
          ...pkg,
          ranking: newRanking,
          updated_at: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error("Failed to update ranking", err);
      // Revert on error
      if (pkg) {
        dispatch(updatePackageInStore({ ...pkg, ranking: pkg?.ranking || 0 }));
      }
    } finally {
      setRankingLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [allPackages, dispatch]);



  const handleImageUpload = React.useCallback((id) => {
    navigate(`/upload/package/${id}`);
  }, [navigate]);


  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };


  const handleOpenDialog = React.useCallback((id) => {
    console.log(id);

    // have to check this portion
    const currentUser = filteredPackages.find((user) => user.id === id);

    const costData = {
      singleCost: currentUser.raw.details.cost.singleCost,
      multipleCost: currentUser.raw.details.cost.multipleCost.map((cost) => ({
        Persons: cost.pax,
        Pricing: cost.pricing.map((price) => ({
          Category: price.catagory,
          Price: price.price,
        }))
      })),
      daysCost: currentUser.raw.details.cost.daysCost.map((days) => ({
        Days: days.days,
        Pricing: days.pricing.map((dat) => ({
          Category: dat.catagory,
          Price: dat.price,
        }))
      })),
      valueCost: currentUser.raw.details.cost.valueCost.map((val) => ({
        Type: val.type,
        Price: val.price,
      })),

    }

    setCostDialogData(costData);
    console.log(costData);

    setOpenDialog(true);
  }, [filteredPackages]);

  const handleCloseDialog = React.useCallback((id) => {
    setOpenDialog(false);
  }, []);

  // Column definitions for @tanstack/react-table (must be after all handler functions)
  const columns = useMemo(() => [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "duration",
      header: "Duration",
    },
    {
      accessorKey: "verified",
      header: "Verified",
      cell: ({ row }) => {
        const rowData = row.original;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getPermission('packages', 'alter-verify') &&
              <Switch
                size="small"
                checked={rowData.verified}
                onChange={(e) => handleToggleVerified(rowData, e.target.checked)}
                disabled={toggleLoading[rowData.id]}
                inputProps={{ 'aria-label': 'Toggle verified' }}
              />}
            {toggleLoading[rowData.id] ? (
              <CircularProgress size={16} />
            ) : (
              <Chip
                size="small"
                label={rowData.verified ? "Verified" : "Not Verified"}
                color={rowData.verified ? "success" : "default"}
                variant={rowData.verified ? "filled" : "outlined"}
              />
            )}
          </Box>
        );
      },
    },
    {
      accessorKey: "ranking",
      header: "Ranking",
      cell: ({ row }) => {
        const rowData = row.original;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getPermission('packages', 'alter-ranking') ? (
              <Select
                size="small"
                value={rowData.ranking ?? 0}
                onChange={(e) => handleChangeRanking(rowData, e.target.value)}
                disabled={rankingLoading[rowData.id]}
                sx={{ minWidth: 80 }}
              >
                {Array.from({ length: 11 }).map((_, i) => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Typography>{rowData.ranking ?? 0}</Typography>
            )}
            {rankingLoading[rowData.id] && <CircularProgress size={16} />}
          </Box>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <Tooltip title={value || ""}>
            <span>{formatDate(value)}</span>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <Tooltip title={value || ""}>
            <span>{formatDate(value)}</span>
          </Tooltip>
        );
      },
    },
    {
      id: "cost",
      header: "Cost",
      cell: ({ row }) => {
        const rowData = row.original;
        return (
          <PaymentsIcon
            color="primary"
            onClick={() => handleOpenDialog(rowData.id)}
            sx={{ cursor: 'pointer' }}
          />
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const rowData = row.original;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            {getPermission('packages', 'alter-image') &&
              <Tooltip title="Image Upload">
                <IconButton color="success" onClick={() => handleImageUpload(rowData.id)}>
                  <DriveFolderUploadIcon />
                </IconButton>
              </Tooltip>}
            {getPermission('packages', 'view') &&
              <Tooltip title="FullView">
                <IconButton color="warning" onClick={() => handleView(rowData.id)}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>}
            {getPermission('packages', 'alter') &&
              <Tooltip title="Edit">
                <IconButton color="primary" onClick={() => handleEdit(rowData.id)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>}
            <Tooltip title="Location">
              <IconButton color="error">
                <LocationOffIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [getPermission, toggleLoading, rankingLoading, handleToggleVerified, handleChangeRanking, handleImageUpload, handleView, handleEdit, handleOpenDialog]);

  // Table instance
  const table = useReactTable({
    data: filteredPackages,
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

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    table.setPageIndex(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    table.setPageSize(newRowsPerPage);
    table.setPageIndex(0);
  };

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>All Packages</Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search Title"
          size="small"
          value={searchLabel}
          onChange={(e) => setSearchLabel(e.target.value)}
          sx={{ width: 250 }}
        />
        <Autocomplete
          value={filterLocation}
          onChange={(e, newVal) => setFilterLocation(newVal)}
          options={uniqueLocations}
          renderInput={(params) => <TextField {...params} label="Location" size="small" />}
          sx={{ width: 200 }}
        />
        <Autocomplete
          value={filterType}
          onChange={(e, newVal) => setFilterType(newVal)}
          options={uniqueTypes}
          renderInput={(params) => <TextField {...params} label="Type" size="small" />}
          sx={{ width: 200 }}
        />

        {/* NEW: Verified filter */}
        <TextField
          label="Verified"
          size="small"
          select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          sx={{ width: 160 }}
          SelectProps={{ native: true }}
        >
          <option value="All">All</option>
          <option value="Verified">Verified</option>
          <option value="Not Verified">Not Verified</option>
        </TextField>

        {/* NEW: Date field selector */}
        <TextField
          label="Date Field"
          size="small"
          select
          value={filterDateField}
          onChange={(e) => setFilterDateField(e.target.value)}
          sx={{ width: 160 }}
          SelectProps={{ native: true }}
        >
          <option value="created">Created At</option>
          <option value="updated">Updated At</option>
        </TextField>

        {/* NEW: From / To dates */}
        <TextField
          label="From"
          size="small"
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          sx={{ width: 170 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To"
          size="small"
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          sx={{ width: 170 }}
          InputLabelProps={{ shrink: true }}
        />
        {getPermission('packages', 'create') &&
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={createNewPackage}
          >
            Add New Package
          </Button>
        }

        <Typography
          color={filterLocation ? "textPrimary" : "text.disabled"}
          display="flex"
          alignItems="center"
          gap={1}
        >
          Ranking
          <Checkbox
            {...label}
            disabled={!filterLocation}
            checked={rankingFilter}
            onChange={(e) => setRankingFilter(e.target.checked)}
          />
        </Typography>

      </Box>

      {/* Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell
                      key={header.id}
                      align={header.id === "actions" ? "center" : "left"}
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
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      align={cell.column.id === "actions" ? "center" : "left"}
                      sx={cell.column.id === "actions" ? { width: "200px" } : {}}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No packages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredPackages.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>

      {/* Dialog (Optional) */}
      <PackageDialog
        open={dialogOpen}
        singleRowData={singleRowData}
        newD={newD}
        handleClose={() => {
          setSingleRowData({});
          setNewD(false);
          setDialogOpen(false);
        }}
      />
      <CostDialogbox
        open={openDialog}
        openConfirm={openConfirm}
        handleClose={handleCloseDialog}
        costDialogdata={costDialogdata}
        setCostDialogData={setCostDialogData}
        handleOpenConfirm={handleOpenConfirm}
        handleCloseConfirm={handleCloseConfirm}
        handleConfirmDelete={handleConfirmDelete}
      />
    </Container>
  );
};

export default AllPackages;

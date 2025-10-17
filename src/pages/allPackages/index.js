import React, { useEffect, useState, useMemo } from "react";
import {
  Container, Typography, Button, IconButton, TextField, Box, Autocomplete,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, Chip, Switch, CircularProgress, Tooltip, Select, MenuItem,
  Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import PackageDialog from '../../components/packages/PackageDialog';
import { getAllPackages, getSinglePackages, verifyPackage, updatePackageRanking } from '../../api/packageAPI';
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeSelectedPackage, setSelectedPackage } from "../../reduxcomponents/slices/packagesSlice";
import usePermissions from "../../hooks/UsePermissions";
import PaymentsIcon from '@mui/icons-material/Payments';
import CostDialogbox from "../../components/packages/costDialogbox";
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
  const [selectedId, setSelectedId] = useState(null);
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

  // initial fetch
  useEffect(() => {
    getAllPackages()
      .then((res) => {
        setAllPackages(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch packages', err);
      });
  }, []);

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
  const handleView = (id) => {
    navigate(`/packages/view/${id}`);
  };

  const handleEdit = async (id) => {
    try {
      const singleData = await getSinglePackages(id);
      dispatch(setSelectedPackage(singleData.data));
      navigate(`/packages/createandedit`);
    } catch (error) {
      console.error('Failed to fetch single package', error);
    }
  };

  const createNewPackage = () => {
    dispatch(removeSelectedPackage());
    navigate(`/packages/createandedit`);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(+event.target.value); setPage(0); };

  const paginatedRows = filteredPackages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  console.log(paginatedRows);


  const handleToggleVerified = async (row, nextVal) => {
    const id = row.id;
    setToggleLoading(prev => ({ ...prev, [id]: true }));

    // optimistic UI
    setAllPackages(prev =>
      prev.map(p => (p._id === id ? { ...p, verified: nextVal } : p))
    );

    try {
      const objD = { verified: nextVal };
      await verifyPackage(id, objD); // <-- backend update
      // reflect updated_at immediately
      setAllPackages(prev =>
        prev.map(p => (p._id === id ? { ...p, updated_at: new Date().toISOString() } : p))
      );
    } catch (err) {
      console.error("Failed to update verified", err);
      // revert on error
      setAllPackages(prev =>
        prev.map(p => (p._id === id ? { ...p, verified: !nextVal } : p))
      );
    } finally {
      setToggleLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // NEW: change ranking
  const handleChangeRanking = async (row, nextVal) => {
    const id = row.id;
    const newRanking = Number(nextVal);

    setRankingLoading(prev => ({ ...prev, [id]: true }));

    // optimistic UI
    const prevSnapshot = allPackages;
    setAllPackages(prev =>
      prev.map(p => (p._id === id ? { ...p, ranking: newRanking } : p))
    );

    try {
      // Assume API signature: updatePackageRanking(id, { ranking: number })
      await updatePackageRanking(id, { ranking: newRanking });
      // bump updated_at
      setAllPackages(prev =>
        prev.map(p => (p._id === id ? { ...p, updated_at: new Date().toISOString() } : p))
      );
    } catch (err) {
      console.error("Failed to update ranking", err);
      // revert on error
      setAllPackages(prevSnapshot);
    } finally {
      setRankingLoading(prev => ({ ...prev, [id]: false }));
    }
  };



  const handleImageUpload = (id) => {
    navigate(`/upload/package/${id}`);
  };


  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };


  const handleOpenDialog = (id) => {

    setSelectedId(id);
    console.log(id);




    // have to check this portion
    const currentUser = paginatedRows.find((user) => user.id === id);



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
  };

  const handleCloseDialog = (id) => {
    setOpenDialog(false);
    setSelectedId(null);
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
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
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>Ranking</TableCell> {/* NEW */}
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.duration}</TableCell>

                  {/* Verified toggle */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPermission('packages', 'alter-verify') &&
                        <Switch
                          size="small"
                          checked={row.verified}
                          onChange={(e) => handleToggleVerified(row, e.target.checked)}
                          disabled={toggleLoading[row.id]}
                          inputProps={{ 'aria-label': 'Toggle verified' }}
                        />}
                      {toggleLoading[row.id] ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Chip
                          size="small"
                          label={row.verified ? "Verified" : "Not Verified"}
                          color={row.verified ? "success" : "default"}
                          variant={row.verified ? "filled" : "outlined"}
                        />
                      )}
                    </Box>
                  </TableCell>

                  {/* NEW: Ranking selector */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPermission('packages', 'alter-ranking') ? (
                        // ✅ When permission exists → show editable Select
                        <Select
                          size="small"
                          value={row.ranking ?? 0}
                          onChange={(e) => handleChangeRanking(row, e.target.value)}
                          disabled={rankingLoading[row.id]}
                          sx={{ minWidth: 80 }}
                        >
                          {Array.from({ length: 11 }).map((_, i) => (
                            <MenuItem key={i} value={i}>
                              {i}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        // 🚫 When no permission → show static value in a box
                        <Typography>{row.ranking ?? 0}</Typography>
                      )}

                      {rankingLoading[row.id] && <CircularProgress size={16} />}
                    </Box>
                  </TableCell>


                  {/* Dates */}
                  <TableCell>
                    <Tooltip title={row.created_at || ""}>
                      <span>{formatDate(row.created_at)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={row.updated_at || ""}>
                      <span>{formatDate(row.updated_at)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell><PaymentsIcon color="primary"
                    onClick={() => handleOpenDialog(row.id)} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center" width={"200px"}>
                    {getPermission('packages', 'alter-image') &&
                      <Tooltip title="Image Upload">
                        <IconButton color="success" onClick={() => handleImageUpload(row.id)}>
                          <DriveFolderUploadIcon />
                        </IconButton>
                      </Tooltip>}
                    {getPermission('packages', 'view') &&
                      <Tooltip title="FullView">
                        <IconButton color="warning" onClick={() => handleView(row.id)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>}
                    {getPermission('packages', 'alter') &&
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(row.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>}
                    <Tooltip title="Location">
                      <IconButton color="error">
                        <LocationOffIcon />
                      </IconButton>
                    </Tooltip>

                  </TableCell>
                </TableRow>
              ))}
              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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

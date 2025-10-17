import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  IconButton,
  Menu,
  Select,
  Checkbox,
  Pagination,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getAllplaces, getSinglePlace, deletePlace } from "../../api/placeApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeSelectedPlace, setSelectedPlace } from "../../reduxcomponents/slices/placesSlice";
import useSnackbar from "../../hooks/useSnackbar";
import CheckIcon from "@mui/icons-material/Check";
import { handleChangeRanking } from "../allPackages/rankingUtil"; // adjust path
import usePermissions from "../../hooks/UsePermissions";

const AllPlaces = () => {
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getPermission = usePermissions();
  const [allPlaces, setAllPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [rankingLoading, setRankingLoading] = useState({});

  //navigated from dashboard
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const zoneFromURL = params.get("zone");

    if (zoneFromURL) {
      setSelectedZone(zoneFromURL);
    }
  }, [location.search]);



  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [rankingFilter, setRankingFilter] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

  // menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuPlaceId, setMenuPlaceId] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);

  useEffect(() => {
    getAllplaces()
      .then((res) => {
        setAllPlaces(res);
        setFilteredPlaces(res);
      }).catch((err) => {
        console.error("Failed to fetch places", err);
      });
  }, []);

  const zones = [...new Set(allPlaces.map((place) => place.zone))];

  useEffect(() => {
    let filtered = allPlaces;

    if (searchTerm) {
      filtered = filtered.filter((place) =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedZone) {
      filtered = filtered.filter((place) => place.zone === selectedZone);
    }

    if (rankingFilter) {
      filtered.sort((a, b) => {
        if (a.ranking === 0 && b.ranking === 0) return 0;
        if (a.ranking === 0) return 1;
        if (b.ranking === 0) return -1;
        return a.ranking - b.ranking;
      });
    }

    setFilteredPlaces(filtered);
  }, [searchTerm, selectedZone, rankingFilter, allPlaces]);

  const handleEdit = async (id) => {
    const response = await getSinglePlace(id);
    dispatch(setSelectedPlace(response));
    navigate(`/places/createandedit`);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleImageUpload = (id) => {
    navigate(`/upload/destination/${id}`);
  };

  const confirmDelete = async () => {
    try {
      await deletePlace(deleteId);
      setAllPlaces((prev) => prev.filter((place) => place._id !== deleteId));
      setConfirmOpen(false);
      showSnackbar("Place Deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete place", err);
      showSnackbar("Failed to delete place", "error");
    }
  };

  // menu handlers
  const handleMenuOpen = (e, placeId) => {
    setMenuAnchorEl(e.currentTarget);
    setMenuPlaceId(placeId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuPlaceId(null);
  };

  const handleAddPackages = () => {
    if (menuPlaceId) {
      navigate(`/upload/packages/${menuPlaceId}`);
    }
    handleMenuClose();
  };

  const paginatedRows = filteredPlaces.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const packageToDelete = paginatedRows.find(pkg => pkg._id === deleteId);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Main content */}
      <Box flex="1" p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h5">All Places</Typography>
          {getPermission('places', 'create') &&
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                dispatch(removeSelectedPlace());
                navigate("/places/createandedit");
              }}
            >
              Create New Place
            </Button>
          }
        </Box>

        {/* Filters */}
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Box mb={3} display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Search by Name"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <TextField
              label="Filter by Zone"
              variant="outlined"
              select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Zones</MenuItem>
              {zones.map((zone, index) => (
                <MenuItem key={index} value={zone}>
                  {zone}
                </MenuItem>
              ))}
            </TextField>
            <Typography
              color={selectedZone ? "textPrimary" : "text.disabled"}
              display="flex"
              alignItems="center"
              gap={1}
            >
              Ranking
              <Checkbox
                {...label}
                disabled={!selectedZone}
                checked={rankingFilter}
                onChange={(e) => setRankingFilter(e.target.checked)}
              />
            </Typography>
          </Box>
        </Box>

        {/* Cards */}
        {paginatedRows.length === 0 ? <Typography>No Data Found</Typography> :
          <Grid container spacing={3}>
            {paginatedRows.map((place) => (
              <Grid item xs={12} sm={6} md={4} key={place._id}>
                <Card
                  variant="outlined"
                  sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}
                >
                  {/* Top-right menu button */}
                  <Box sx={{ position: "absolute", top: 4, right: 4 }}>
                    <IconButton
                      aria-label="more options"
                      size="small"
                      onClick={(e) => handleMenuOpen(e, place._id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {place.name}{" "}
                      {place.ranking >= 1 && (
                        <Chip size="small" label={place.ranking} color="success" variant="outlined" />
                      )}
                    </Typography>

                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Zone: {place.zone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Temp: {place.min_temperature}°C - {place.max_temperature}°C
                    </Typography>
                    <Typography variant="body2" mt={1} noWrap>
                      Description: {place.description}
                    </Typography>
                    <Box mt={1}>
                      <Chip size="small" label={`Price: ₹${place.price}`} sx={{ mr: 1 }} />
                      {place.is_active && <Chip size="small" label="Active" color="success" />}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ mt: "auto", justifyContent: "space-between", px: 2, pb: 2 }}>
                    {getPermission('places', 'alter') &&
                      <Button size="small" variant="outlined" onClick={() => handleEdit(place._id)}>
                        Edit
                      </Button>
                    }

                    {getPermission('places', 'alter-image') &&
                      <Badge badgeContent={place.images.length} color="error" invisible={place.images.length === 0}>
                        <Button
                          size="small"
                          variant={place.images.length > 0 ? "contained" : "outlined"}
                          color={place.images.length > 0 ? "success" : "primary"}
                          startIcon={place.images.length > 0 ? <CheckIcon /> : null}
                          onClick={() => handleImageUpload(place._id)}
                        >
                          Upload
                        </Button>
                      </Badge>
                    }

                    {getPermission('places', 'alter-ranking') &&

                      <Select
                        size="small"
                        value={place.ranking ?? 0}
                        onChange={(e) =>
                          handleChangeRanking(
                            place,
                            e.target.value,
                            allPlaces,
                            setAllPlaces,
                            rankingLoading,
                            setRankingLoading
                          )
                        }
                        disabled={rankingLoading[place.id]}
                        sx={{
                          minWidth: 80,
                          height: 32,
                          "& .MuiSelect-select": { paddingY: 0.5 },
                        }}
                      >
                        {Array.from({ length: 11 }).map((_, i) => (
                          <MenuItem key={i} value={i}>
                            {i}
                          </MenuItem>
                        ))}
                      </Select>
                    }

                    {getPermission('places', 'delete') &&

                      <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(place._id)}>
                        Delete
                      </Button>
                    }
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        }
      </Box>

      {/* Pagination bar at bottom */}

      {paginatedRows.length >= 9 &&
        <Box p={2} mt="auto" display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" mr={1}>
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              size="small"
            >
              {[9, 18, 27].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Pagination
            component="div"
            count={Math.ceil(filteredPlaces.length / rowsPerPage)}
            page={page + 1}
            onChange={(_, value) => setPage(value - 1)}
            color="primary"
            shape="rounded"
          />
        </Box>
      }

      {/* Per-card menu */}
      {getPermission('places', 'add-packages') &&
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleAddPackages}>Add Packages</MenuItem>
        </Menu>
      }

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{packageToDelete?.name || "this package"}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <SnackbarComponent />
    </Box>
  );
};

export default AllPlaces;

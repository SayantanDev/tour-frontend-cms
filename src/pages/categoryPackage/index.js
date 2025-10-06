import React, { useEffect, useState } from "react";
import {
    Typography,
    Grid,
    Card,
    CardContent,
    Divider,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Select,
    Chip,
    CardActions,
    TextField,
    Checkbox
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../hooks/useSnackbar";
import {
    DeleteCatPackages,
    getAllcatPackage,
    getSinglecatPackages,
    updateCatPackageRanking
} from "../../api/catPackageAPI";
import { useDispatch } from "react-redux";
import {
    removeSelectedCtgPackage,
    setSelectedCtgPakage
} from "../../reduxcomponents/slices/ctgpackageSlice";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import usePermissions from "../../hooks/UsePermissions";

const CategoryPackage = () => {
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const fetchPermission = usePermissions();

    // keep raw API data separate
    const [allCatPackageRaw, setAllCatPackageRaw] = useState([]);
    const [allCatPackage, setAllCatPackage] = useState([]);

    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuPlaceId, setMenuPlaceId] = useState(null);
    const menuOpen = Boolean(menuAnchorEl);

    const [deleteId, setDeleteId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [rankingLoading, setRankingLoading] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedZone, setSelectedZone] = useState("");
    const [rankingFilter, setRankingFilter] = useState(false);

    const handleChangeRanking = async (catPackage, nextVal) => {
        const id = catPackage._id;
        const newRanking = Number(nextVal);

        // update in both raw and filtered
        setAllCatPackageRaw((prev) =>
            prev.map((p) => (p._id === id ? { ...p, ranking: newRanking } : p))
        );
        setAllCatPackage((prev) =>
            prev.map((p) => (p._id === id ? { ...p, ranking: newRanking } : p))
        );

        const prevSnapshot = [...allCatPackageRaw];

        try {
            await updateCatPackageRanking(id, { ranking: newRanking });
            setAllCatPackageRaw((prev) =>
                prev.map((item) =>
                    item._id === id
                        ? { ...item, updated_at: new Date().toISOString() }
                        : item
                )
            );
        } catch (err) {
            console.error("Failed to update ranking", err);
            setAllCatPackageRaw(prevSnapshot);
        } finally {
            setRankingLoading((prev) => ({ ...prev, [id]: false }));
        }
    };

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
            navigate(`/upload/categorypackages/${menuPlaceId}`);
        }
        handleMenuClose();
    };

    // fetch raw data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllcatPackage();
                setAllCatPackageRaw(res?.data || []);
            } catch (error) {
                console.error("Failed to fetch packages:", error);
                showSnackbar("Failed to load category packages", "error");
            }
        };
        fetchData();
    }, []);

    // apply filtering/sorting whenever dependencies change
    useEffect(() => {
        let filtered = [...allCatPackageRaw];

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

        setAllCatPackage(filtered);
    }, [searchTerm, selectedZone, rankingFilter, allCatPackageRaw]);

    const handleDelete = async (id) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await DeleteCatPackages(deleteId);
            setAllCatPackageRaw((prev) => prev.filter((pkg) => pkg._id !== deleteId));
            setConfirmOpen(false);
            showSnackbar("Category Package Deleted successfully", "success");
        } catch (err) {
            console.error("Failed to delete package", err);
            showSnackbar("Failed to delete package", "error");
        }
    };

    const handleEdit = async (id) => {
        const response = await getSinglecatPackages(id);
        dispatch(setSelectedCtgPakage(response.data));
        navigate(`/category-packages/createandedit`);
    };

    const handleImageUpload = (id) => {
        navigate(`/upload/category/${id}`);
    };

    const packageToDelete = allCatPackage.find((pkg) => pkg._id === deleteId);

    const formatLabel = (str) => {
        return str
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const zones = [...new Set(allCatPackageRaw.map((place) => place.zone))];
    const label = { inputProps: { "aria-label": "Checkbox demo" } };

    return (
        <Box p={3}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                flexWrap="wrap"
                gap={2}
            >
                <Typography variant="h5">All Category Packages</Typography>
                {fetchPermission('ctg-packages', 'create') &&
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            dispatch(removeSelectedCtgPackage());
                            navigate("/category-packages/createandedit");
                        }}
                    >
                        Create New CTG-PKG
                    </Button>
                }
            </Box>

            {/* Filters */}
            <Box
                mb={3}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
            >
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

            <Grid container spacing={3}>
                {allCatPackage.length === 0 ? (
                    <Box width="100%" textAlign="center" mt={4}>
                        <Typography variant="h6" color="text.secondary">
                            No data found.
                        </Typography>
                    </Box>
                ) : (
                    allCatPackage.map((catPackage) => (
                        <Grid item xs={12} sm={6} md={4} key={catPackage._id}>
                            <Card
                                variant="outlined"
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative"
                                }}
                            >
                                <Box sx={{ position: "absolute", top: 4, right: 4 }}>
                                    <IconButton
                                        aria-label="more options"
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, catPackage._id)}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {catPackage.name}{" "}
                                        {catPackage.ranking >= 1 && (
                                            <Chip
                                                size="small"
                                                label={catPackage.ranking}
                                                color="success"
                                                variant="outlined"
                                            />
                                        )}
                                    </Typography>
                                    <Divider sx={{ mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Zone: {catPackage.zone}
                                    </Typography>

                                    <Typography variant="body2" mt={1} color="text.secondary">
                                        Package User Type:{" "}
                                        {formatLabel(catPackage.package_usage_type)}
                                    </Typography>
                                    <Box mt={1}>
                                        <Chip
                                            size="small"
                                            label={`Price: ₹${catPackage.price}`}
                                            sx={{ mr: 1 }}
                                        />
                                        {catPackage.is_active && (
                                            <Chip size="small" label="Active" color="success" />
                                        )}
                                    </Box>

                                    <CardActions>
                                        {fetchPermission('ctg-packages', 'alter') &&
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleEdit(catPackage._id)}
                                            >
                                                Edit
                                            </Button>}
                                        {fetchPermission('ctg-packages', 'alter-image') &&
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                sx={{ m: 1 }}
                                                onClick={() => handleImageUpload(catPackage._id)}
                                            >
                                                Upload
                                            </Button>}
                                        {fetchPermission('ctg-packages', 'delete') &&
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                                sx={{ m: 1 }}
                                                onClick={() => handleDelete(catPackage._id)}
                                            >
                                                Delete
                                            </Button>}
                                        {fetchPermission('ctg-packages', 'alter-ranking') &&
                                            <Select
                                                size="small"
                                                sx={{
                                                    m: 1,
                                                    minWidth: 80,
                                                    "& .MuiSelect-select": {
                                                        py: 0.6,
                                                        px: 1.5
                                                    }
                                                }}
                                                onChange={(e) =>
                                                    handleChangeRanking(catPackage, e.target.value)
                                                }
                                                value={catPackage.ranking ?? 0}
                                            >
                                                {Array.from({ length: 11 }).map((_, i) => (
                                                    <MenuItem key={i} value={i}>
                                                        {i}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        }
                                    </CardActions>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            <Menu
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem onClick={handleAddPackages}>Add Packages</MenuItem>
            </Menu>

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

export default CategoryPackage;
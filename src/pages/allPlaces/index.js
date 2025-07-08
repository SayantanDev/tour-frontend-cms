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
    DialogActions
} from "@mui/material";
import { getAllplaces, getSinglePlace, deletePlace } from "../../api/placeApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeSelectedPlace, setSelectedPlace } from "../../reduxcomponents/slices/placesSlice";
import useSnackbar from "../../hooks/useSnackbar";

const AllPlaces = () => {
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [allPlaces, setAllPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedZone, setSelectedZone] = useState("");

    const [deleteId, setDeleteId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        getAllplaces()
            .then((res) => {
                setAllPlaces(res);
                setFilteredPlaces(res);
            })
            .catch((err) => {
                console.error("Failed to fetch places", err);
            });
    }, []);

    const zones = [...new Set(allPlaces.map(place => place.zone))];

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

        setFilteredPlaces(filtered);
    }, [searchTerm, selectedZone, allPlaces]);

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
    }

    const confirmDelete = async () => {
        try {
            await deletePlace(deleteId);
            setAllPlaces(prev => prev.filter(place => place._id !== deleteId));
            setConfirmOpen(false);
        } catch (err) {
            console.error("Failed to delete place", err);
        } finally {
            showSnackbar('Place Deleted successfully', 'success');
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h5">All Places</Typography>
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
            </Box>

            {/* Filters */}
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
            </Box>

            {/* Cards */}
            <Grid container spacing={3}>
                {filteredPlaces.map((place) => (
                    <Grid item xs={12} sm={6} md={4} key={place._id}>
                        <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>{place.name}</Typography>
                                <Divider sx={{ mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">Zone: {place.zone}</Typography>
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
                                <Button size="small" variant="outlined" onClick={() => handleEdit(place._id)}>Edit</Button>
                                <Button size="small" variant="outlined" onClick={() => handleImageUpload(place._id)}>Upload</Button>
                                <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(place._id)}>Delete</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this place?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
            <SnackbarComponent />
        </Box>

    );
};

export default AllPlaces;

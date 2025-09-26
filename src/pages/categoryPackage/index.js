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
    DialogContent
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../hooks/useSnackbar";
import { DeleteCatPackages, getAllcatPackage, getSinglecatPackages } from "../../api/catPackageAPI";
import { useDispatch } from "react-redux";
import { removeSelectedCtgPackage, setSelectedCtgPakage } from "../../reduxcomponents/slices/ctgpackageSlice";
import MoreVertIcon from "@mui/icons-material/MoreVert";


const CategoryPackage = () => {
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [allCatPackage, setAllCatPackage] = useState([]);

    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuPlaceId, setMenuPlaceId] = useState(null);
    const menuOpen = Boolean(menuAnchorEl);

    const [deleteId, setDeleteId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);



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
            // adjust route as per your project structure
            navigate(`/upload/categorypackages/${menuPlaceId}`);
        }
        handleMenuClose();
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllcatPackage();
                setAllCatPackage(res?.data || []); // Assuming res.data contains the packages
                console.log("my data", res.data);

            } catch (error) {
                console.error("Failed to fetch packages:", error);
                showSnackbar("Failed to load category packages", "error");
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id) => {

        setDeleteId(id);
        setConfirmOpen(true);
    }


    const confirmDelete = async () => {
        try {
            await DeleteCatPackages(deleteId);
            setAllCatPackage(allCatPackage.filter((pkg) => pkg._id !== deleteId));
            setConfirmOpen(false);
            showSnackbar("Category Package Deleted successfully", "success");
        } catch (err) {
            console.error("Failed to delete package", err);
            showSnackbar("Failed to delete package", "error");
        }
    };

    const handleEdit = async (id) => {
        const response = await getSinglecatPackages(id);
        console.log("getSinglecatPackages : ", response.data);

        dispatch(setSelectedCtgPakage(response.data));
        navigate(`/category-packages/createandedit`);
    };
    const handleImageUpload = (id) => {
        navigate(`/upload/category/${id}`);
    };

    const packageToDelete = allCatPackage.find(pkg => pkg._id === deleteId);

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h5">All Category Packages</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        dispatch(removeSelectedCtgPackage());
                        navigate("/category-packages/createandedit")
                    }}
                >
                    Create New CTG-PKG
                </Button>
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
                            <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
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
                                    <Typography variant="h6" gutterBottom>{catPackage.name}</Typography>
                                    <Divider sx={{ mb: 1 }} />
                                    <Button size="small" variant="outlined" onClick={() => handleEdit(catPackage._id)}>Edit</Button>
                                    <Button size="small" variant="outlined" sx={{ m: 1 }} onClick={() => handleImageUpload(catPackage._id)}>Upload</Button>
                                    <Button size="small" color="error" variant="outlined" sx={{ m: 1 }} onClick={() => handleDelete(catPackage._id)}>Delete</Button>
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
                    <DialogContent>Are you sure you want to delete{" "}
                      <strong>{packageToDelete?.name || "this package"}</strong>?</DialogContent>
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

import React, { useEffect, useState } from "react";
import {
    Typography,
    Grid,
    Card,
    CardContent,
    Divider,
    Button,
    Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../hooks/useSnackbar";
import { getAllcatPackage } from "../../api/catPackageAPI";

const CategoryPackage = () => {
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const navigate = useNavigate();
    const [allCatPackage, setAllCatPackage] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllcatPackage();
                setAllCatPackage(res?.data || []); // Assuming res.data contains the packages
            } catch (error) {
                console.error("Failed to fetch packages:", error);
                showSnackbar("Failed to load category packages", "error");
            }
        };

        fetchData();
    }, []);

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h5">All Category Packages</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/category-packages/createandedit")}
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
                            <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>{catPackage.name}</Typography>
                                    <Divider sx={{ mb: 1 }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            <SnackbarComponent />
        </Box>
    );
};

export default CategoryPackage;

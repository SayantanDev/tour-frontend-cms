import { useEffect, useState } from "react";
import {
    Typography, Card, CardContent, CardActions, Button, Grid, Drawer, TextField,
    Box, Divider, IconButton, Chip, Stack, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';

import { getAllHotels, insertHotel, deleteHotel, updateHotel } from '../../api/hotelsAPI';
import useSnackbar from "../../hooks/useSnackbar";
import usePermissions from "../../hooks/UsePermissions";

const Hotels = () => {
    const [hotels, setHotels] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [addMode, setAddMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDestination, setSelectedDestination] = useState("");
    const [selectedSubDestination, setSelectedSubDestination] = useState("");
    const [selectedType, setSelectedType] = useState("");

    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const getPermission = usePermissions();

    const emptyHotel = {
        destination: "",
        sub_destination: "",
        hotel_name: "",
        type: "Hotel",
        category: [{ room_cat: "", room_price: 0 }],
        rating: 0,
        contacts: [""],
        address: "",
        amenities: [""]
    };

    const [newHotel, setNewHotel] = useState(emptyHotel);

    useEffect(() => {
        async function fetchHotels() {
            try {
                const data = await getAllHotels();
                setHotels(data);
            } catch (err) {
                console.error('Error fetching hotels:', err);
            }
        }
        fetchHotels();
    }, []);

    const handleView = (hotel) => {
        setEditMode(false);
        setAddMode(false);
        setSelectedHotel(hotel);
        setDrawerOpen(true);
    };

    const handleEdit = (hotel) => {
        setEditMode(true);
        setAddMode(false);
        setSelectedHotel(hotel);
        setNewHotel(hotel);
        setDrawerOpen(true);
    };

    const handleDelete = async (hotelId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this hotel?");
        if (!confirmDelete) return;

        try {
            await deleteHotel(hotelId);
            setHotels(hotels.filter((h) => h._id !== hotelId));
            showSnackbar("Hotel deleted successfully!", "success");
        } catch (err) {
            console.error('Error deleting hotel:', err);
            showSnackbar("Failed to delete hotel", "error");
        }
    };

    const handleAddDrawer = () => {
        setEditMode(false);
        setNewHotel(emptyHotel);
        setAddMode(true);
        setDrawerOpen(true);
    };

    return (
        <Box p={3} sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography variant="h6" fontWeight={600} color="primary">
                    Hotel Management
                </Typography>
                {getPermission('hotel', 'add-hotel') &&
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAddDrawer}>
                        Add Hotel
                    </Button>
                }
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" mb={2}>
                <TextField
                    size="small"
                    label="Search by Hotel Name"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <FormControl sx={{ minWidth: 140 }} size="small">
                    <InputLabel>Destination</InputLabel>
                    <Select
                        value={selectedDestination}
                        onChange={(e) => setSelectedDestination(e.target.value)}
                        label="Destination"
                    >
                        <MenuItem value="">All</MenuItem>
                        {[...new Set(hotels.map(h => h.destination))].map(dest => (
                            <MenuItem key={dest} value={dest}>{dest}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 160 }} size="small">
                    <InputLabel>Sub Destination</InputLabel>
                    <Select
                        value={selectedSubDestination}
                        onChange={(e) => setSelectedSubDestination(e.target.value)}
                        label="Sub Destination"
                    >
                        <MenuItem value="">All</MenuItem>
                        {[...new Set(hotels.map(h => h.sub_destination))].map(sub => (
                            <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 140 }} size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        label="Type"
                    >
                        <MenuItem value="">All</MenuItem>
                        {[...new Set(hotels.map(h => h.type))].map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {hotels.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <Typography variant="h6" color="text.secondary">Hotel not found</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {hotels
                        .filter((hotel) =>
                            (hotel.hotel_name ?? "")
                                .toLowerCase()
                                .includes((searchQuery ?? "").toLowerCase()) &&
                            (selectedDestination ? hotel.destination === selectedDestination : true) &&
                            (selectedSubDestination ? hotel.sub_destination === selectedSubDestination : true) && (selectedType ? hotel.type === selectedType : true)
                        )
                        .map((hotel) => (

                            <Grid item xs={12} sm={6} md={3} key={hotel.id}>
                                <Card variant="outlined"
                                    sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                                    <CardContent>
                                        <Typography variant="h6" color="primary" fontWeight={600}>{hotel.hotel_name}</Typography>
                                        <Divider sx={{ mb: 1 }} />
                                        <Typography variant="body2" ><b>Location:</b> {hotel.destination} - {hotel.sub_destination}</Typography>
                                        <Typography variant="body2"><b>Type:</b> {hotel.type}</Typography>
                                        <Typography variant="body2"><b>Rating:</b> ⭐ {hotel.rating}</Typography>
                                    </CardContent>
                                    <CardActions sx={{ mt: "auto", justifyContent: "space-between", px: 2, pb: 2 }}>
                                        {getPermission('hotel', 'view') &&
                                            <Button size="small" variant="outlined" onClick={() => handleView(hotel)}>
                                                View
                                            </Button>
                                        }

                                        {getPermission('hotel', 'alter') &&
                                            <Button size="small" variant="outlined" color="success" onClick={() => handleEdit(hotel)}>
                                                Edit
                                            </Button>
                                        }

                                        {getPermission('hotel', 'delete') &&

                                            <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(hotel._id)}>
                                                Delete
                                            </Button>
                                        }

                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                </Grid>
            )}

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 600, p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={600}>{addMode ? "Add Hotel" : editMode ? "Edit Hotel" : "Hotel Details"}</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {(addMode || editMode) ? (
                        <Formik
                            initialValues={newHotel}
                            enableReinitialize
                            validationSchema={Yup.object({
                                hotel_name: Yup.string().required("Required"),
                                destination: Yup.string().required("Required"),
                                sub_destination: Yup.string().required("Required"),
                                type: Yup.string().required("Required"),
                                rating: Yup.number().min(0).max(5),
                                category: Yup.array().of(Yup.object({
                                    room_cat: Yup.string().required("Required"),
                                    room_price: Yup.number().required("Required").min(0)
                                })),
                                contacts: Yup.array().of(Yup.string().required("Required")),
                                amenities: Yup.array().of(Yup.string().required("Required"))
                            })}
                            onSubmit={async (values, { setSubmitting }) => {
                                try {
                                    if (editMode) {
                                        const res = await updateHotel(selectedHotel._id, values);
                                        const updated = hotels.map(h =>
                                            h._id === selectedHotel._id ? { ...values, _id: selectedHotel._id } : h
                                        );
                                        setHotels(updated);
                                        showSnackbar(res?.message || "Hotel updated successfully!", "success");
                                    } else {
                                        const added = await insertHotel(values);
                                        setHotels([...hotels, added.data]);
                                        showSnackbar(added?.message || "Hotel added successfully!", "success");
                                    }
                                    setDrawerOpen(false);
                                } catch (err) {
                                    console.error('Error saving hotel:', err);
                                    showSnackbar(err?.response?.data?.message || "Something went wrong!", "error");
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ values, handleChange, handleBlur, errors, touched }) => (
                                <Form>
                                    <Box display="flex" gap={2}>
                                        <TextField fullWidth label="Hotel Name" name="hotel_name" margin="normal" value={values.hotel_name} onChange={handleChange} onBlur={handleBlur} error={touched.hotel_name && !!errors.hotel_name} helperText={touched.hotel_name && errors.hotel_name} />
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Type</InputLabel>
                                            <Select name="type" value={values.type} onChange={handleChange} label="Type">
                                                {['Hotel', 'Homestay', 'Resort', 'Guest House', 'Villa', 'Pension'].map(option => (
                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Box display="flex" gap={2}>
                                        <TextField fullWidth label="Destination" name="destination" margin="normal" value={values.destination} onChange={handleChange} onBlur={handleBlur} error={touched.destination && !!errors.destination} helperText={touched.destination && errors.destination} />
                                        <TextField fullWidth label="Sub Destination" name="sub_destination" margin="normal" value={values.sub_destination} onChange={handleChange} onBlur={handleBlur} error={touched.sub_destination && !!errors.sub_destination} helperText={touched.sub_destination && errors.sub_destination} />
                                    </Box>

                                    <FieldArray name="category">
                                        {({ push, remove }) => (
                                            <>
                                                {values.category.map((cat, i) => (
                                                    <Box key={i} sx={{ border: '1px solid #1976d2', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                                                        <Box display="flex" gap={2}>
                                                            <TextField fullWidth label={`Room Category ${i + 1}`} name={`category[${i}].room_cat`} margin="dense" value={cat.room_cat} onChange={handleChange} onBlur={handleBlur} error={touched.category?.[i]?.room_cat && !!errors.category?.[i]?.room_cat} helperText={touched.category?.[i]?.room_cat && errors.category?.[i]?.room_cat} />
                                                            <TextField fullWidth type="number" label={`Room Price ${i + 1}`} name={`category[${i}].room_price`} margin="dense" value={cat.room_price} onChange={handleChange} onBlur={handleBlur} error={touched.category?.[i]?.room_price && !!errors.category?.[i]?.room_price} helperText={touched.category?.[i]?.room_price && errors.category?.[i]?.room_price} />
                                                        </Box>
                                                        {values.category.length > 1 && (<IconButton color="error" onClick={() => remove(i)}><DeleteIcon /></IconButton>)}
                                                    </Box>
                                                ))}
                                                <Button onClick={() => push({ room_cat: "", room_price: 0 })}>+ Add Category</Button>
                                            </>
                                        )}
                                    </FieldArray>

                                    <TextField fullWidth type="number" label="Rating" name="rating" margin="normal" value={values.rating} onChange={handleChange} onBlur={handleBlur} />

                                    <TextField fullWidth label="Address" name="address" margin="normal" value={values.address} onChange={handleChange} onBlur={handleBlur} />

                                    <Typography variant="subtitle2" mt={2}>Contacts</Typography>
                                    <FieldArray name="contacts">
                                        {({ push, remove }) => (
                                            <>
                                                {values.contacts.map((c, i) => (
                                                    <Box key={i} display="flex" alignItems="center" gap={1}>
                                                        <TextField fullWidth name={`contacts[${i}]`} margin="dense" label={`Contact ${i + 1}`} value={c} onChange={handleChange} onBlur={handleBlur} error={touched.contacts?.[i] && !!errors.contacts?.[i]} helperText={touched.contacts?.[i] && errors.contacts?.[i]} />
                                                        {values.contacts.length > 1 && (<IconButton color="error" onClick={() => remove(i)}><DeleteIcon /></IconButton>)}
                                                    </Box>
                                                ))}
                                                <Button onClick={() => push("")}>+ Add Contact</Button>
                                            </>
                                        )}
                                    </FieldArray>

                                    <Typography variant="subtitle2" mt={2}>Amenities</Typography>
                                    <FieldArray name="amenities">
                                        {({ push, remove }) => (
                                            <>
                                                {values.amenities.map((a, i) => (
                                                    <Box key={i} display="flex" alignItems="center" gap={1}>
                                                        <TextField fullWidth name={`amenities[${i}]`} margin="dense" label={`Amenity ${i + 1}`} value={a} onChange={handleChange} onBlur={handleBlur} error={touched.amenities?.[i] && !!errors.amenities?.[i]} helperText={touched.amenities?.[i] && errors.amenities?.[i]} />
                                                        {values.amenities.length > 1 && (<IconButton color="error" onClick={() => remove(i)}><DeleteIcon /></IconButton>)}
                                                    </Box>
                                                ))}
                                                <Button onClick={() => push("")}>+ Add Amenity</Button>
                                            </>
                                        )}
                                    </FieldArray>

                                    <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} type="submit">Save Hotel</Button>
                                </Form>
                            )}
                        </Formik>
                    ) : selectedHotel && (
                        <>
                            <Box display="flex" gap={2}>
                                <TextField label="Hotel Name" fullWidth margin="normal" value={selectedHotel.hotel_name} disabled />
                                <TextField label="Type" fullWidth margin="normal" value={selectedHotel.type} disabled />
                            </Box>
                            <Box display="flex" gap={2}>
                                <TextField label="Destination" fullWidth margin="normal" value={selectedHotel.destination} disabled />
                                <TextField label="Sub Destination" fullWidth margin="normal" value={selectedHotel.sub_destination} disabled />
                            </Box>
                            {selectedHotel.category.map((cat, i) => (
                                <Box key={i} display="flex" gap={2} mb={1}>
                                    <TextField label={`Room Category ${i + 1}`} fullWidth margin="dense" value={cat.room_cat} disabled />
                                    <TextField label={`Room Price ${i + 1}`} fullWidth margin="dense" value={cat.room_price} disabled />
                                </Box>
                            ))}
                            <TextField label="Rating" fullWidth margin="normal" value={selectedHotel.rating} disabled />
                            <TextField label="Address" fullWidth margin="normal" value={selectedHotel.address} disabled />
                            <Typography variant="subtitle2" mt={2}>Contacts</Typography>
                            {selectedHotel.contacts.map((c, i) => (<TextField key={i} fullWidth margin="dense" value={c} disabled />))}
                            <Typography variant="subtitle2" mt={2}>Amenities</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                                {selectedHotel.amenities.map((a, i) => (<Chip key={i} label={a} sx={{ mb: 1 }} />))}
                            </Stack>
                        </>
                    )}
                </Box>
            </Drawer>

            <SnackbarComponent />
        </Box>
    );
};

export default Hotels;

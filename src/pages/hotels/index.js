import { useEffect, useState } from "react";
import {
  Typography, Card, CardContent, CardActions, Button, Grid, Drawer, TextField,
  Box, Divider, IconButton, Chip, Stack, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";

import { getAllHotels, insertHotel, deleteHotel, updateHotel } from "../../api/hotelsAPI";
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
    category: [
      {
        room_cat: "",
        season_price: 0,
        off_season_price: 0,
        cp_plan: 0,
        ap_plan: 0,
        map_plan: 0
      }
    ],
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
      } catch (error) {
        console.error("Error fetching hotels:", error);
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
    setNewHotel(hotel);
    setSelectedHotel(hotel);
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure?");
    if (!ok) return;

    try {
      await deleteHotel(id);
      setHotels(hotels.filter((h) => h._id !== id));
      showSnackbar("Hotel deleted successfully", "success");
    } catch (err) {
      showSnackbar("Failed to delete hotel", "error");
    }
  };

  const handleAddDrawer = () => {
    setAddMode(true);
    setEditMode(false);
    setNewHotel(emptyHotel);
    setDrawerOpen(true);
  };

  return (
    <Box p={3} sx={{ backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>Hotel Management</Typography>

        {getPermission("hotel", "add-hotel") && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddDrawer}>
            Add Hotel
          </Button>
        )}
      </Box>

      {/* FILTERS */}
      <Stack direction="row" spacing={2} flexWrap="wrap" mb={2}>
        <TextField
          size="small"
          label="Search by Hotel Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <FormControl size="small">
          <InputLabel>Destination</InputLabel>
          <Select
            value={selectedDestination}
            label="Destination"
            onChange={(e) => setSelectedDestination(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set(hotels.map((h) => h.destination))].map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Sub Destination</InputLabel>
          <Select
            value={selectedSubDestination}
            label="Sub Destination"
            onChange={(e) => setSelectedSubDestination(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set(hotels.map((h) => h.sub_destination))].map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            label="Type"
            onChange={(e) => setSelectedType(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set(hotels.map((h) => h.type))].map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* HOTEL CARDS */}
      <Grid container spacing={3}>
        {hotels
          .filter((h) =>
            h.hotel_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedDestination ? h.destination === selectedDestination : true) &&
            (selectedSubDestination ? h.sub_destination === selectedSubDestination : true) &&
            (selectedType ? h.type === selectedType : true)
          )
          .map((hotel) => (
            <Grid item xs={12} sm={6} md={3} key={hotel._id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {hotel.hotel_name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography><b>Location:</b> {hotel.destination} - {hotel.sub_destination}</Typography>
                  <Typography><b>Type:</b> {hotel.type}</Typography>
                  <Typography><b>Rating:</b> ⭐ {hotel.rating}</Typography>
                </CardContent>

                <CardActions sx={{ mt: "auto", justifyContent: "space-between", p: 2 }}>
                  <Button size="small" variant="outlined" onClick={() => handleView(hotel)}>View</Button>

                  {getPermission("hotel", "alter") && (
                    <Button size="small" variant="outlined" color="success" onClick={() => handleEdit(hotel)}>
                      Edit
                    </Button>
                  )}

                  {getPermission("hotel", "delete") && (
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(hotel._id)}>
                      Delete
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 600, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {addMode ? "Add Hotel" : editMode ? "Edit Hotel" : "Hotel Details"}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* ADD / EDIT FORM */}
          {(addMode || editMode) ? (
            <Formik
              initialValues={newHotel}
              enableReinitialize
              validationSchema={Yup.object({
                hotel_name: Yup.string().required("Required"),
                destination: Yup.string().required("Required"),
                sub_destination: Yup.string().required("Required"),
                type: Yup.string().required("Required"),
                category: Yup.array().of(
                  Yup.object({
                    room_cat: Yup.string().required("Required"),
                    season_price: Yup.number().required(),
                    off_season_price: Yup.number().required(),
                    cp_plan: Yup.number().required(),
                    ap_plan: Yup.number().required(),
                    map_plan: Yup.number().required(),
                  })
                )
              })}
              onSubmit={async (values) => {
                try {
                  if (editMode) {
                    await updateHotel(selectedHotel._id, values);
                    setHotels(
                      hotels.map((h) =>
                        h._id === selectedHotel._id ? { ...values, _id: selectedHotel._id } : h
                      )
                    );
                    showSnackbar("Hotel updated!", "success");
                  } else {
                    const res = await insertHotel(values);
                    setHotels([...hotels, res.data]);
                    showSnackbar("Hotel added!", "success");
                  }
                  setDrawerOpen(false);
                } catch (err) {
                  showSnackbar("Error saving hotel", "error");
                }
              }}
            >
              {({ values, handleChange }) => (
                <Form>

                  {/* Hotel Name + Type */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Hotel Name"
                        name="hotel_name"
                        value={values.hotel_name}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          name="type"
                          label="Type"
                          value={values.type}
                          onChange={handleChange}
                        >
                          {["Hotel", "Homestay", "Resort", "Guest House", "Villa", "Pension"].map((x) => (
                            <MenuItem key={x} value={x}>{x}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Destination + Sub Destination */}
                  <Grid container spacing={2} mt={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Destination"
                        name="destination"
                        value={values.destination}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Sub Destination"
                        name="sub_destination"
                        value={values.sub_destination}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>

                  {/* CATEGORY SECTION */}
                  <Typography fontWeight={600} mt={3} mb={1}>
                    Room Categories
                  </Typography>

                  <FieldArray name="category">
                    {({ push, remove }) => (
                      <>
                        {values.category.map((cat, i) => (
                          <Box
                            key={i}
                            sx={{
                              border: "1px solid #1976d2",
                              p: 2,
                              mb: 2,
                              borderRadius: 2
                            }}
                          >
                            {/* Room Category */}
                            <TextField
                              fullWidth
                              label="Room Category"
                              name={`category[${i}].room_cat`}
                              value={cat.room_cat}
                              onChange={handleChange}
                            />

                            {/* Row 1 - Season + Off Season */}
                            <Grid container spacing={2} mt={1}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="Season Price"
                                  name={`category[${i}].season_price`}
                                  value={cat.season_price}
                                  onChange={handleChange}
                                />
                              </Grid>

                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="Off Season Price"
                                  name={`category[${i}].off_season_price`}
                                  value={cat.off_season_price}
                                  onChange={handleChange}
                                />
                              </Grid>
                            </Grid>

                            {/* Row 2 - CP + AP */}
                            <Grid container spacing={2} mt={1}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="CP Plan"
                                  name={`category[${i}].cp_plan`}
                                  value={cat.cp_plan}
                                  onChange={handleChange}
                                />
                              </Grid>

                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="AP Plan"
                                  name={`category[${i}].ap_plan`}
                                  value={cat.ap_plan}
                                  onChange={handleChange}
                                />
                              </Grid>
                            </Grid>

                            {/* Row 3 - MAP */}
                            <Grid container spacing={2} mt={1}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="MAP Plan"
                                  name={`category[${i}].map_plan`}
                                  value={cat.map_plan}
                                  onChange={handleChange}
                                />
                              </Grid>

                              <Grid item xs={6}></Grid>
                            </Grid>

                            {values.category.length > 1 && (
                              <IconButton color="error" onClick={() => remove(i)} sx={{ mt: 1 }}>
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        ))}

                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() =>
                            push({
                              room_cat: "",
                              season_price: 0,
                              off_season_price: 0,
                              cp_plan: 0,
                              ap_plan: 0,
                              map_plan: 0
                            })
                          }
                        >
                          + Add Category
                        </Button>
                      </>
                    )}
                  </FieldArray>

                  {/* Rating */}
                  <TextField
                    fullWidth
                    type="number"
                    label="Rating"
                    name="rating"
                    margin="normal"
                    value={values.rating}
                    onChange={handleChange}
                  />

                  {/* Address */}
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    margin="normal"
                    value={values.address}
                    onChange={handleChange}
                  />

                  {/* Contacts */}
                  <Typography fontWeight={600} mt={2} mb={2}>Contacts</Typography>
                  <FieldArray name="contacts">
                    {({ push, remove }) => (
                      <>
                        {values.contacts.map((c, i) => (
                          <Box key={i} display="flex" alignItems="center" gap={1}>
                            <TextField
                              fullWidth
                              label={`Contact ${i + 1}`}
                              name={`contacts[${i}]`}
                              value={c}
                              onChange={handleChange}
                              mb={2}
                            />

                            {values.contacts.length > 1 && (
                              <IconButton onClick={() => remove(i)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        ))}

                        <Button onClick={() => push("")}>+ Add Contact</Button>
                      </>
                    )}
                  </FieldArray>

                  {/* Amenities */}
                  <Typography fontWeight={600} mt={2} mb={2}>Amenities</Typography>
                  <FieldArray name="amenities">
                    {({ push, remove }) => (
                      <>
                        {values.amenities.map((a, i) => (
                          <Box key={i} display="flex" alignItems="center" gap={1}>
                            <TextField
                              fullWidth
                              label={`Amenity ${i + 1}`}
                              name={`amenities[${i}]`}
                              value={a}
                              onChange={handleChange}
                            />

                            {values.amenities.length > 1 && (
                              <IconButton onClick={() => remove(i)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        ))}

                        <Button onClick={() => push("")}>+ Add Amenity</Button>
                      </>
                    )}
                  </FieldArray>

                  <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
                    Save Hotel
                  </Button>
                </Form>
              )}
            </Formik>
          ) : (
            selectedHotel && (
              <>
                {/* VIEW MODE */}

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Hotel Name" fullWidth value={selectedHotel.hotel_name} disabled />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField label="Type" fullWidth value={selectedHotel.type} disabled />
                  </Grid>
                </Grid>

                <Grid container spacing={2} mt={2}>
                  <Grid item xs={6}>
                    <TextField label="Destination" fullWidth value={selectedHotel.destination} disabled />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Sub Destination" fullWidth value={selectedHotel.sub_destination} disabled />
                  </Grid>
                </Grid>

                {/* View Categories */}
                {selectedHotel.category.map((cat, i) => (
                  <Box key={i} sx={{ border: "1px solid #e0e0e0", p: 2, borderRadius: 2, mb: 2 }}>
                    <Typography fontWeight={600}>Room Category: {cat.room_cat}</Typography>

                    <Grid container spacing={2} mt={1}>
                      <Grid item xs={6}><Typography><b>Season Price:</b> ₹{cat.season_price}</Typography></Grid>
                      <Grid item xs={6}><Typography><b>Off Season Price:</b> ₹{cat.off_season_price}</Typography></Grid>

                      <Grid item xs={6}><Typography><b>CP Plan:</b> ₹{cat.cp_plan}</Typography></Grid>
                      <Grid item xs={6}><Typography><b>AP Plan:</b> ₹{cat.ap_plan}</Typography></Grid>

                      <Grid item xs={6}><Typography><b>MAP Plan:</b> ₹{cat.map_plan}</Typography></Grid>
                    </Grid>
                  </Box>
                ))}

                <TextField fullWidth label="Rating" margin="normal" value={selectedHotel.rating} disabled />
                <TextField fullWidth label="Address" margin="normal" value={selectedHotel.address} disabled />

                <Typography fontWeight={600} mt={2} mb={2}>Contacts</Typography>
                {selectedHotel.contacts.map((c, i) => (
                  <TextField key={i} margin="dense" fullWidth value={c} disabled />
                ))}

                <Typography fontWeight={600} mt={2} mb={2}>Amenities</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedHotel.amenities.map((a, i) => (
                    <Chip key={i} label={a} sx={{ mb: 1 }} />
                  ))}
                </Stack>
              </>
            )
          )}

        </Box>
      </Drawer>

      <SnackbarComponent />
    </Box>
  );
};

export default Hotels;

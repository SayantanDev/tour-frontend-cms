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

  // ⭐ MATCHING BACKEND MODEL EXACT
  const emptyPrice = {
    cp_plan: 0,
    ep_plan: 0,
    ap_plan: 0,
    map_plan: 0,
    extra_mat_cp: 0,
    extra_mat_ap: 0,
    extra_mat_ep: 0,
    extra_mat_map: 0,
    cnb_cp: 0,
    cnb_ap: 0,
    cnb_ep: 0,
    cnb_map: 0,
  };

  const emptyHotel = {
    destination: "",
    sub_destination: "",
    hotel_name: "",
    type: "Hotel",
    category: [
      {
        room_cat: "",
        season_price: { ...emptyPrice },
        off_season_price: { ...emptyPrice },
      },
    ],
    rating: 0,
    contacts: [""],
    address: "",
    amenities: [""],
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
    setNewHotel(JSON.parse(JSON.stringify(hotel)));
    setSelectedHotel(hotel);
    setDrawerOpen(true);
  };

  const handleAddDrawer = () => {
    setAddMode(true);
    setEditMode(false);
    setNewHotel(JSON.parse(JSON.stringify(emptyHotel)));
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteHotel(id);
      setHotels(hotels.filter((h) => h._id !== id));
      showSnackbar("Hotel deleted", "success");
    } catch {
      showSnackbar("Failed to delete hotel", "error");
    }
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
            sx={{ minWidth: 150 }}
            value={selectedDestination}
            label="Destination"
            onChange={(e) => setSelectedDestination(e.target.value)}
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
            sx={{ minWidth: 170 }}
            value={selectedSubDestination}
            label="Sub Destination"
            onChange={(e) => setSelectedSubDestination(e.target.value)}
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
            sx={{ minWidth: 150 }}
            value={selectedType}
            label="Type"
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set(hotels.map((h) => h.type))].map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* HOTEL CARDS */}
      <Grid container spacing={3}>
        {hotels
          .filter((h) =>
            h.hotel_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (!selectedDestination || h.destination === selectedDestination) &&
            (!selectedSubDestination || h.sub_destination === selectedSubDestination) &&
            (!selectedType || h.type === selectedType)
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
        <Box sx={{ width: 1000, p: 3, maxHeight: "100vh", overflowY: "auto" }}>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {addMode ? "Add Hotel" : editMode ? "Edit Hotel" : "Hotel Details"}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* ADD OR EDIT MODE */}
          {(addMode || editMode) ? (
            <Formik
              initialValues={newHotel}
              enableReinitialize
              validationSchema={Yup.object({
                hotel_name: Yup.string().required("Hotel name is required"),
                destination: Yup.string().required("Destination is required"),
                sub_destination: Yup.string().required("Sub destination is required"),
                type: Yup.string().required("Type is required"),
              })}

              onSubmit={async (values) => {
                try {
                  if (editMode) {
                    await updateHotel(selectedHotel._id, values);
                    showSnackbar("Hotel updated", "success");

                    setHotels(hotels.map((h) => (
                      h._id === selectedHotel._id ? { ...values, _id: h._id } : h
                    )));

                  } else {
                    const res = await insertHotel(values);
                    showSnackbar("Hotel added", "success");
                    setHotels([...hotels, res.data]);
                  }

                  setDrawerOpen(false);

                } catch {
                  showSnackbar("Error saving", "error");
                }
              }}
            >
              {({ values, handleChange }) => (
                <Form>

                  {/* HOTEL BASIC INFO */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth label="Hotel Name"
                        name="hotel_name"
                        value={values.hotel_name}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          label="Type"
                          name="type"
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

                  {/* DESTINATION */}
                  <Grid container spacing={2} mt={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth label="Destination"
                        name="destination"
                        value={values.destination}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth label="Sub Destination"
                        name="sub_destination"
                        value={values.sub_destination}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>

                  {/* CATEGORY LIST */}
                  <Typography fontWeight={600} mt={3} mb={1}>Room Categories</Typography>

                  <FieldArray name="category">
                    {({ push, remove }) => (
                      <>
                        {values.category.map((cat, i) => (
                          <Box key={i} sx={{ border: "1px solid #1976d2", borderRadius: 2, p: 2, mb: 3 }}>

                            {/* ROOM CATEGORY */}
                            <TextField
                              fullWidth
                              label="Room Category"
                              name={`category[${i}].room_cat`}
                              value={cat.room_cat}
                              onChange={handleChange}
                              sx={{ mb: 2 }}
                            />

                            <Grid container spacing={2}>

                              {/* SEASON PRICE */}
                              <Grid item xs={6}>
                                <Box sx={{
                                  border: "1px solid #0d47a1",
                                  borderRadius: 2,
                                  p: 2,
                                  background: "#f1f7ff"
                                }}>
                                  <Typography fontWeight={700} color="primary" mb={2}>Season Price</Typography>

                                  <Grid container spacing={2}>

                                    {/* BASE PLANS */}
                                    {["cp_plan", "ep_plan", "ap_plan", "map_plan"].map((field, idx) => (
                                      <Grid item xs={4} key={idx}>
                                        <TextField
                                          fullWidth type="number"
                                          label={field.toUpperCase().replace("_", " ")}
                                          name={`category[${i}].season_price.${field}`}
                                          value={cat.season_price[field]}
                                          onChange={handleChange}
                                        />
                                      </Grid>
                                    ))}

                                    {/* EXTRA MAT */}
                                    {[
                                      { key: "extra_mat_cp", label: "Extra Mat CP" },
                                      { key: "extra_mat_ap", label: "Extra Mat AP" },
                                      { key: "extra_mat_ep", label: "Extra Mat EP" },
                                      { key: "extra_mat_map", label: "Extra Mat MAP" },
                                    ].map(({ key, label }) => (
                                      <Grid item xs={4} key={key}>
                                        <TextField
                                          fullWidth type="number"
                                          label={label}
                                          name={`category[${i}].season_price.${key}`}
                                          value={cat.season_price[key]}
                                          onChange={handleChange}
                                        />
                                      </Grid>
                                    ))}

                                    {/* CNB */}
                                    {[
                                      { key: "cnb_cp", label: "CNB CP" },
                                      { key: "cnb_ap", label: "CNB AP" },
                                      { key: "cnb_ep", label: "CNB EP" },
                                      { key: "cnb_map", label: "CNB MAP" },
                                    ].map(({ key, label }) => (
                                      <Grid item xs={4} key={key}>
                                        <TextField
                                          fullWidth type="number"
                                          label={label}
                                          name={`category[${i}].season_price.${key}`}
                                          value={cat.season_price[key]}
                                          onChange={handleChange}
                                        />
                                      </Grid>
                                    ))}

                                  </Grid>
                                </Box>
                              </Grid>

                              {/* OFF SEASON PRICE */}
                              <Grid item xs={6}>
                                <Box sx={{
                                  border: "1px solid #ad1457",
                                  borderRadius: 2,
                                  p: 2,
                                  background: "#fff0f6"
                                }}>
                                  <Typography fontWeight={700} color="secondary" mb={2}>Off Season Price</Typography>

                                  <Grid container spacing={2}>

                                    {/* BASE PLANS */}
                                    {["cp_plan", "ep_plan", "ap_plan", "map_plan"].map((field, idx) => (
                                      <Grid item xs={4} key={idx}>
                                        <TextField
                                          fullWidth type="number"
                                          label={field.toUpperCase().replace("_", " ")}
                                          name={`category[${i}].off_season_price.${field}`}
                                          value={cat.off_season_price[field]}
                                          onChange={handleChange}
                                        />
                                      </Grid>
                                    ))}

                                    {/* EXTRA MAT */}
                                    {[
                                      { key: "extra_mat_cp", label: "Extra Mat CP" },
                                      { key: "extra_mat_ap", label: "Extra Mat AP" },
                                      { key: "extra_mat_ep", label: "Extra Mat EP" },
                                      { key: "extra_mat_map", label: "Extra Mat MAP" },
                                    ].map(({ key, label }) => (
                                      <Grid item xs={4} key={key}>
                                        <TextField
                                          fullWidth type="number"
                                          label={label}
                                          name={`category[${i}].off_season_price.${key}`}
                                          value={cat.off_season_price[key]}
                                          onChange={handleChange}
                                        />
                                      </Grid>
                                    ))}

                                    {/* CNB */}
                                    {[
                                      { key: "cnb_cp", label: "CNB CP" },
                                      { key: "cnb_ap", label: "CNB AP" },
                                      { key: "cnb_ep", label: "CNB EP" },
                                      { key: "cnb_map", label: "CNB MAP" },
                                    ].map(({ key, label }) => (
                                      <Grid item xs={4} key={key}>
                                        <TextField
                                          fullWidth type="number"
                                          label={label}
                                          name={`category[${i}].off_season_price.${key}`}
                                          value={cat.off_season_price[key]}
                                          onChange={handleChange}
                                        />
                                      </Grid>
                                    ))}

                                  </Grid>
                                </Box>
                              </Grid>

                            </Grid>

                            {/* REMOVE CATEGORY */}
                            {values.category.length > 1 && (
                              <IconButton color="error" onClick={() => remove(i)} sx={{ mt: 2 }}>
                                <DeleteIcon />
                              </IconButton>
                            )}

                          </Box>
                        ))}

                        {/* ADD NEW CATEGORY */}
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => push({
                            room_cat: "",
                            season_price: { ...emptyPrice },
                            off_season_price: { ...emptyPrice }
                          })}
                        >
                          + Add Category
                        </Button>
                      </>
                    )}
                  </FieldArray>

                  {/* RATING */}
                  <TextField
                    fullWidth type="number" label="Rating"
                    name="rating"
                    value={values.rating}
                    onChange={handleChange}
                    sx={{ mt: 3 }}
                  />

                  {/* ADDRESS */}
                  <TextField
                    fullWidth label="Address"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    sx={{ mt: 2 }}
                  />

                  {/* CONTACTS */}
                  <Typography fontWeight={600} mt={3}>Contacts</Typography>
                  <FieldArray name="contacts">
                    {({ push, remove }) => (
                      <>
                        {values.contacts.map((c, i) => (
                          <Box key={i} display="flex" gap={1} alignItems="center">
                            <TextField
                              fullWidth margin="dense"
                              label={`Contact ${i + 1}`}
                              name={`contacts[${i}]`}
                              value={c}
                              onChange={handleChange}
                            />
                            {values.contacts.length > 1 && (
                              <IconButton color="error" onClick={() => remove(i)}>
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                        <Button onClick={() => push("")}>+ Add Contact</Button>
                      </>
                    )}
                  </FieldArray>

                  {/* AMENITIES */}
                  <Typography fontWeight={600} mt={3}>Amenities</Typography>
                  <FieldArray name="amenities">
                    {({ push, remove }) => (
                      <>
                        {values.amenities.map((a, i) => (
                          <Box key={i} display="flex" gap={1} alignItems="center">
                            <TextField
                              fullWidth margin="dense"
                              label={`Amenity ${i + 1}`}
                              name={`amenities[${i}]`}
                              value={a}
                              onChange={handleChange}
                            />
                            {values.amenities.length > 1 && (
                              <IconButton color="error" onClick={() => remove(i)}>
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

            /* VIEW MODE */
            selectedHotel && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth disabled label="Hotel Name" value={selectedHotel.hotel_name} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth disabled label="Type" value={selectedHotel.type} />
                  </Grid>
                </Grid>

                <Grid container spacing={2} mt={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth disabled label="Destination" value={selectedHotel.destination} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth disabled label="Sub Destination" value={selectedHotel.sub_destination} />
                  </Grid>
                </Grid>

                {/* CATEGORY LIST */}
                {selectedHotel.category?.map((cat, i) => (
                  <Box key={i} sx={{ border: "1px solid #ddd", p: 2, borderRadius: 2, mt: 3 }}>
                    <Typography fontWeight={600} mb={2}>Room Category: {cat.room_cat}</Typography>

                    <Grid container spacing={3}>
                      {/* SEASON PRICE */}
                      <Grid item xs={6}>
                        <Box sx={{ border: "1px solid #1976d2", borderRadius: 2, p: 2 }}>
                          <Typography fontWeight={600} color="primary">Season Price</Typography>

                          {/* BASE PLANS */}
                          <Typography mt={1}>CP: ₹{cat.season_price.cp_plan}</Typography>
                          <Typography>EP: ₹{cat.season_price.ep_plan}</Typography>
                          <Typography>AP: ₹{cat.season_price.ap_plan}</Typography>
                          <Typography>MAP: ₹{cat.season_price.map_plan}</Typography>

                          {/* EXTRA MAT */}
                          <Typography mt={1}>Extra Mat CP: ₹{cat.season_price.extra_mat_cp}</Typography>
                          <Typography>Extra Mat AP: ₹{cat.season_price.extra_mat_ap}</Typography>
                          <Typography>Extra Mat EP: ₹{cat.season_price.extra_mat_ep}</Typography>
                          <Typography>Extra Mat MAP: ₹{cat.season_price.extra_mat_map}</Typography>

                          {/* CNB */}
                          <Typography mt={1}>CNB CP: ₹{cat.season_price.cnb_cp}</Typography>
                          <Typography>CNB AP: ₹{cat.season_price.cnb_ap}</Typography>
                          <Typography>CNB EP: ₹{cat.season_price.cnb_ep}</Typography>
                          <Typography>CNB MAP: ₹{cat.season_price.cnb_map}</Typography>
                        </Box>
                      </Grid>

                      {/* OFF SEASON PRICE */}
                      <Grid item xs={6}>
                        <Box sx={{ border: "1px solid #ad1457", borderRadius: 2, p: 2 }}>
                          <Typography fontWeight={600} color="secondary">Off Season Price</Typography>

                          <Typography mt={1}>CP: ₹{cat.off_season_price.cp_plan}</Typography>
                          <Typography>EP: ₹{cat.off_season_price.ep_plan}</Typography>
                          <Typography>AP: ₹{cat.off_season_price.ap_plan}</Typography>
                          <Typography>MAP: ₹{cat.off_season_price.map_plan}</Typography>

                          {/* EXTRA MAT */}
                          <Typography mt={1}>Extra Mat CP: ₹{cat.off_season_price.extra_mat_cp}</Typography>
                          <Typography>Extra Mat AP: ₹{cat.off_season_price.extra_mat_ap}</Typography>
                          <Typography>Extra Mat EP: ₹{cat.off_season_price.extra_mat_ep}</Typography>
                          <Typography>Extra Mat MAP: ₹{cat.off_season_price.extra_mat_map}</Typography>

                          {/* CNB */}
                          <Typography mt={1}>CNB CP: ₹{cat.off_season_price.cnb_cp}</Typography>
                          <Typography>CNB AP: ₹{cat.off_season_price.cnb_ap}</Typography>
                          <Typography>CNB EP: ₹{cat.off_season_price.cnb_ep}</Typography>
                          <Typography>CNB MAP: ₹{cat.off_season_price.cnb_map}</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                  </Box>
                ))}

                <TextField fullWidth disabled label="Rating" value={selectedHotel.rating} sx={{ mt: 3 }} />
                <TextField fullWidth disabled label="Address" value={selectedHotel.address} sx={{ mt: 2 }} />

                {/* CONTACTS */}
                <Typography fontWeight={600} mt={3}>Contacts</Typography>
                {selectedHotel.contacts.map((c, i) => (
                  <TextField key={i} fullWidth disabled value={c} sx={{ mt: 1 }} />
                ))}

                {/* AMENITIES */}
                <Typography fontWeight={600} mt={3}>Amenities</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
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

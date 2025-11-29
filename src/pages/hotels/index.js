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

  // ⭐ Correct Default Object
  const emptyHotel = {
    destination: "",
    sub_destination: "",
    hotel_name: "",
    type: "Hotel",
    category: [
      {
        room_cat: "",
        season_price: {
          cp_plan: 0,
          ap_plan: 0,
          map_plan: 0,
          extra_mat: 0,
          cnb: 0,
        },
        off_season_price: {
          cp_plan: 0,
          ap_plan: 0,
          map_plan: 0,
          extra_mat: 0,
          cnb: 0,
        },
      },
    ],
    rating: 0,
    contacts: [""],
    address: "",
    amenities: [""],
  };

  const [newHotel, setNewHotel] = useState(emptyHotel);

  // FETCH HOTELS
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

      {/* === DRAWER === */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{
          width: 920,
          p: 3,
          maxHeight: "100vh",
          overflowY: "auto"
        }}>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {addMode ? "Add Hotel" : editMode ? "Edit Hotel" : "Hotel Details"}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />


          {/* ADD / EDIT MODE */}
          {(addMode || editMode) ? (
            <Formik
              initialValues={newHotel}
              enableReinitialize
              validationSchema={Yup.object({
                hotel_name: Yup.string().required("Hotel name is required"),
                destination: Yup.string().required("Destination is required"),
                sub_destination: Yup.string().required("Sub destination is required"),
                type: Yup.string().required("Type is required"),

                category: Yup.array().of(
                  Yup.object({
                    room_cat: Yup.string().required("Room category required"),

                    season_price: Yup.object({
                      cp_plan: Yup.number().required("Required").min(0),
                      ap_plan: Yup.number().required("Required").min(0),
                      map_plan: Yup.number().required("Required").min(0),
                      extra_mat: Yup.number().required("Required").min(0),
                      cnb: Yup.number().required("Required").min(0),
                    }),

                    off_season_price: Yup.object({
                      cp_plan: Yup.number().required("Required").min(0),
                      ap_plan: Yup.number().required("Required").min(0),
                      map_plan: Yup.number().required("Required").min(0),
                      extra_mat: Yup.number().required("Required").min(0),
                      cnb: Yup.number().required("Required").min(0),
                    }),
                  })
                ),
              })}

              onSubmit={async (values) => {
                try {
                  if (editMode) {
                    await updateHotel(selectedHotel._id, values);
                    showSnackbar("Hotel updated", "success");
                    setHotels(hotels.map((h) =>
                      h._id === selectedHotel._id ? { ...values, _id: h._id } : h
                    ));
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

                  {/* HOTEL NAME + TYPE */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField fullWidth label="Hotel Name"
                        placeholder="Example: Hotel Mount View"
                        name="hotel_name"
                        value={values.hotel_name}
                        onChange={handleChange} />
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
                      <TextField fullWidth label="Destination"
                        placeholder="Example: Darjeeling, Gangtok"
                        name="destination"
                        value={values.destination}
                        onChange={handleChange} />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField fullWidth label="Sub Destination"
                        placeholder="Example: MG Marg, Mall Road"
                        name="sub_destination"
                        value={values.sub_destination}
                        onChange={handleChange} />
                    </Grid>
                  </Grid>

                  {/* ⭐ CATEGORY BLOCK ⭐ */}
                  <Typography fontWeight={600} mt={3} mb={1}>Room Categories</Typography>

                  <FieldArray name="category">
                    {({ push, remove }) => (
                      <>
                        {values.category.map((cat, i) => (
                          <Box key={i} sx={{ border: "1px solid #1976d2", borderRadius: 2, p: 2, mb: 3 }}>

                            <TextField
                              fullWidth
                              label="Room Category"
                              placeholder="Example: Deluxe, Super Deluxe"
                              name={`category[${i}].room_cat`}
                              value={cat.room_cat}
                              onChange={handleChange}
                              sx={{ mb: 2 }}
                            />

                            {/* LEFT & RIGHT BOX */}
                            <Grid container spacing={2}>

                              {/* ========== LEFT BOX ========== */}
                              <Grid item xs={6}>
                                <Box sx={{
                                  border: "1px solid #0d47a1",
                                  borderRadius: 2,
                                  p: 2,
                                  background: "#f1f7ff"
                                }}>
                                  <Typography fontWeight={700} color="primary" mb={2}>
                                    Season Price
                                  </Typography>

                                  <Grid container spacing={2}>

                                    {/* Row 1 */}
                                    <Grid item xs={4}>
                                      <TextField
                                        fullWidth type="number" label="CP"
                                        placeholder="CP Plan"
                                        name={`category[${i}].season_price.cp_plan`}
                                        value={cat.season_price.cp_plan}
                                        onChange={handleChange}
                                      />
                                    </Grid>

                                    <Grid item xs={4}>
                                      <TextField
                                        fullWidth type="number" label="AP"
                                        placeholder="AP Plan"
                                        name={`category[${i}].season_price.ap_plan`}
                                        value={cat.season_price.ap_plan}
                                        onChange={handleChange}
                                      />
                                    </Grid>

                                    <Grid item xs={4}>
                                      <TextField
                                        fullWidth type="number" label="MAP"
                                        placeholder="MAP Plan"
                                        name={`category[${i}].season_price.map_plan`}
                                        value={cat.season_price.map_plan}
                                        onChange={handleChange}
                                      />
                                    </Grid>

                                    {/* Row 2 */}
                                    <Grid item xs={6} mt={2}>
                                      <TextField
                                        fullWidth type="number" label="Extra Mat"
                                        placeholder="Extra Mattress"
                                        name={`category[${i}].season_price.extra_mat`}
                                        value={cat.season_price.extra_mat}
                                        onChange={handleChange}
                                      />
                                    </Grid>

                                    <Grid item xs={6} mt={2}>
                                      <TextField
                                        fullWidth type="number" label="CNB"
                                        placeholder="Child No Bed"
                                        name={`category[${i}].season_price.cnb`}
                                        value={cat.season_price.cnb}
                                        onChange={handleChange}
                                      />
                                    </Grid>

                                  </Grid>
                                </Box>
                              </Grid>

                              {/* ========== RIGHT BOX ========== */}
                              <Grid item xs={6}>
                                <Box sx={{
                                  border: "1px solid #ad1457",
                                  borderRadius: 2,
                                  p: 2,
                                  background: "#fff0f6"
                                }}>
                                  <Typography fontWeight={700} color="secondary" mb={2}>
                                    Off Season Price
                                  </Typography>

                                  <Grid container spacing={2}>

                                    {/* Row 1 */}
                                    <Grid item xs={4}>
                                      <TextField
                                        fullWidth type="number" label="CP"
                                        placeholder="CP Plan"
                                        name={`category[${i}].off_season_price.cp_plan`}
                                        value={cat.off_season_price.cp_plan}
                                        onChange={handleChange}
                                      />
                                    </Grid>

                                    <Grid item xs={4}>
                                      <TextField
                                        fullWidth type="number" label="AP"
                                        placeholder="AP Plan"
                                        name={`category[${i}].off_season_price.ap_plan`}
                                        value={cat.off_season_price.ap_plan}
                                        onChange={handleChange}
                                      />
                                    </Grid>

                                    <Grid item xs={4}>
                                      <TextField
                                        fullWidth type="number" label="MAP"
                                        placeholder="MAP Plan"
                                        name={`category[${i}].off_season_price.map_plan`}
                                        value={cat.off_season_price.map_plan}
                                        onChange={handleChange}
                                      />
                                    </Grid>

                                    {/* Row 2 */}
                                    <Grid item xs={6} mt={2}>
                                      <TextField
                                        fullWidth type="number" label="Extra Mat"
                                        placeholder="Extra Mattress"
                                        name={`category[${i}].off_season_price.extra_mat`}
                                        value={cat.off_season_price.extra_mat}
                                        onChange={handleChange}
                                      />
                                    </Grid>

                                    <Grid item xs={6} mt={2}>
                                      <TextField
                                        fullWidth type="number" label="CNB"
                                        placeholder="Child No Bed"
                                        name={`category[${i}].off_season_price.cnb`}
                                        value={cat.off_season_price.cnb}
                                        onChange={handleChange}
                                      />
                                    </Grid>

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

                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() =>
                            push({
                              room_cat: "",
                              season_price: { cp_plan: 0, ap_plan: 0, map_plan: 0, extra_mat: 0, cnb: 0 },
                              off_season_price: { cp_plan: 0, ap_plan: 0, map_plan: 0, extra_mat: 0, cnb: 0 },
                            })
                          }
                        >
                          + Add Category
                        </Button>
                      </>
                    )}
                  </FieldArray>


                  {/* RATING */}
                  <TextField
                    fullWidth type="number" label="Rating"
                    placeholder="Example: 4.5"
                    name="rating" value={values.rating} onChange={handleChange}
                    sx={{ mt: 3 }}
                  />

                  {/* ADDRESS */}
                  <TextField
                    fullWidth label="Address" name="address"
                    placeholder="Hotel full address"
                    value={values.address} onChange={handleChange}
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
                              fullWidth margin="dense" label={`Contact ${i + 1}`}
                              placeholder="Phone number"
                              name={`contacts[${i}]`} value={c} onChange={handleChange}
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
                              fullWidth margin="dense" label={`Amenity ${i + 1}`}
                              placeholder="WiFi, Heater, TV, etc"
                              name={`amenities[${i}]`} value={a} onChange={handleChange}
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

            /* ================= VIEW MODE ================= */
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

                {/* CATEGORY VIEW */}
                {selectedHotel.category?.map((cat, i) => (
                  <Box key={i} sx={{ border: "1px solid #ddd", p: 2, borderRadius: 2, mt: 3 }}>

                    <Typography fontWeight={600} mb={2}>Room Category: {cat.room_cat}</Typography>

                    <Grid container spacing={3}>
                      {/* LEFT – Season */}
                      <Grid item xs={6}>
                        <Box sx={{border: "1px solid #1976d2", borderRadius: 2, p: 2}}>
                          <Typography fontWeight={600} color="primary">Season Price</Typography>
                          <Box mt={1}>
                            <Typography>CP: ₹{cat.season_price.cp_plan}</Typography>
                            <Typography>AP: ₹{cat.season_price.ap_plan}</Typography>
                            <Typography>MAP: ₹{cat.season_price.map_plan}</Typography>
                            <Typography>Extra Mat: ₹{cat.season_price.extra_mat}</Typography>
                            <Typography>CNB: ₹{cat.season_price.cnb}</Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* RIGHT – Off season */}
                      <Grid item xs={6}>
                        <Box sx={{border: "1px solid #ad1457", borderRadius: 2, p: 2}}>
                          <Typography fontWeight={600} color="secondary">Off Season Price</Typography>
                          <Box mt={1}>
                            <Typography>CP: ₹{cat.off_season_price.cp_plan}</Typography>
                            <Typography>AP: ₹{cat.off_season_price.ap_plan}</Typography>
                            <Typography>MAP: ₹{cat.off_season_price.map_plan}</Typography>
                            <Typography>Extra Mat: ₹{cat.off_season_price.extra_mat}</Typography>
                            <Typography>CNB: ₹{cat.off_season_price.cnb}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                  </Box>
                ))}

                <TextField fullWidth disabled label="Rating" value={selectedHotel.rating} sx={{ mt: 3 }} />
                <TextField fullWidth disabled label="Address" value={selectedHotel.address} sx={{ mt: 2 }} />

                <Typography fontWeight={600} mt={3}>Contacts</Typography>
                {selectedHotel.contacts.map((c, i) => (
                  <TextField key={i} fullWidth disabled value={c} sx={{ mt: 1 }} />
                ))}

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

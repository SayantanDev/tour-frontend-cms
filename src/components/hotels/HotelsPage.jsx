import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, TextField, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import AddIcon from "@mui/icons-material/Add";

import { getAllHotels, insertHotel, updateHotel, deleteHotel } from "../../api/hotelsAPI";
import { setAllHotels } from "../../reduxcomponents/slices/hotelsSlice";
import useSnackbar from "../../hooks/useSnackbar";
import usePermissions from "../../hooks/UsePermissions";

import HotelsList from "./HotelsList";
import HotelDrawer from "./HotelDrawer";

const emptyPrice = Object.fromEntries(
  [
    "cp_plan", "ep_plan", "ap_plan", "map_plan",
    "extra_mat_cp", "extra_mat_ap", "extra_mat_ep", "extra_mat_map",
    "cnb_cp", "cnb_ap", "cnb_ep", "cnb_map"
  ].map((k) => [k, 0])
);

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

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("view");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [formInitialValues, setFormInitialValues] = useState(emptyHotel);

  const [searchQuery, setSearchQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [subDestination, setSubDestination] = useState("");
  const [type, setType] = useState("");

  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const getPermission = usePermissions();
  const configData = useSelector((state) => state.config.configData || {});
  const dispatch = useDispatch();

  const permissions = {
    edit: getPermission("hotel", "alter"),
    delete: getPermission("hotel", "delete"),
    add: getPermission("hotel", "add-hotel"),
  };

  // Fetch hotels
  useEffect(() => {
    (async () => {
      try {
        const list = await getAllHotels();
        setHotels(list);
        dispatch(setAllHotels(list)); // Update Redux
      } catch (err) {
        console.error(err);
      }
    })();
  }, [dispatch]);

  /** HANDLERS **/
  const handleView = (hotel) => {
    setDrawerMode("view");
    setSelectedHotel(hotel);
    setDrawerOpen(true);
  };

  const handleEdit = (hotel) => {
    setDrawerMode("edit");
    setFormInitialValues(JSON.parse(JSON.stringify(hotel)));
    setSelectedHotel(hotel);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setDrawerMode("add");
    setFormInitialValues(JSON.parse(JSON.stringify(emptyHotel)));
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteHotel(id);
      const updatedHotels = hotels.filter((h) => h._id !== id);
      setHotels(updatedHotels);
      dispatch(setAllHotels(updatedHotels)); // Update Redux
      showSnackbar("Hotel deleted", "success");
    } catch {
      showSnackbar("Error deleting hotel", "error");
    }
  };

  const handleSubmit = async (values) => {
    try {
      let updatedHotels;
      if (drawerMode === "edit") {
        await updateHotel(selectedHotel._id, values);
        updatedHotels = hotels.map((h) => (h._id === selectedHotel._id ? { ...values, _id: h._id } : h));
        setHotels(updatedHotels);
        dispatch(setAllHotels(updatedHotels)); // Update Redux
        showSnackbar("Hotel updated", "success");
      } else {
        const res = await insertHotel(values);
        updatedHotels = [...hotels, res.data];
        setHotels(updatedHotels);
        dispatch(setAllHotels(updatedHotels)); // Update Redux
        showSnackbar("Hotel added", "success");
      }

      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
      showSnackbar("Error saving hotel", "error");
    }
  };

  return (
    <Box p={3} sx={{ background: "#f5f6fa", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={600}>Hotel Management</Typography>

        {permissions.add && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Hotel
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
        <TextField
          size="small"
          label="Search by Hotel Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Destination</InputLabel>
          <Select value={destination} onChange={(e) => setDestination(e.target.value)} label="Destination">
            <MenuItem value="">All</MenuItem>
            {[...new Set(hotels.map((h) => h.destination))].map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sub Destination</InputLabel>
          <Select value={subDestination} onChange={(e) => setSubDestination(e.target.value)} label="Sub Destination">
            <MenuItem value="">All</MenuItem>
            {[...new Set(hotels.map((h) => h.sub_destination))].map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select value={type} onChange={(e) => setType(e.target.value)} label="Type">
            <MenuItem value="">All</MenuItem>
            {configData?.additionalCosts?.hotel?.map((hotelType) => (
              <MenuItem key={hotelType.type} value={hotelType.type}>
                {hotelType.type}
              </MenuItem>
            )) || [...new Set(hotels.map((h) => h.type))].map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Hotel Cards */}
      <HotelsList
        hotels={hotels}
        searchQuery={searchQuery}
        destination={destination}
        subDestination={subDestination}
        type={type}
        permissions={permissions}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Drawer */}
      <HotelDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={drawerMode}
        selectedHotel={selectedHotel}
        formInitialValues={formInitialValues}
        onSubmit={handleSubmit}
      />

      <SnackbarComponent />
    </Box>
  );
};

export default HotelsPage;

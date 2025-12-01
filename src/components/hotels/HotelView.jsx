import { Box, Grid, TextField, Typography, Chip } from "@mui/material";

const HotelView = ({ hotel }) => {
  if (!hotel) return null;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField fullWidth disabled label="Hotel Name" value={hotel.hotel_name} />
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth disabled label="Type" value={hotel.type} />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={2}>
        <Grid item xs={6}>
          <TextField fullWidth disabled label="Destination" value={hotel.destination} />
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth disabled label="Sub Destination" value={hotel.sub_destination} />
        </Grid>
      </Grid>

      {/* Categories */}
      {hotel.category?.map((cat, i) => (
        <Box key={i} sx={{ border: "1px solid #ddd", mt: 3, borderRadius: 2, p: 2 }}>
          <Typography fontWeight={600}>Room Category: {cat.room_cat}</Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <Typography fontWeight={600}>Season Price</Typography>

              {Object.entries(cat.season_price).map(([key, value]) => (
                <Typography key={key}>
                  {key.replace(/_/g, " ").toUpperCase()}: ₹{value}
                </Typography>
              ))}
            </Grid>

            <Grid item xs={6}>
              <Typography fontWeight={600}>Off Season Price</Typography>

              {Object.entries(cat.off_season_price).map(([key, value]) => (
                <Typography key={key}>
                  {key.replace(/_/g, " ").toUpperCase()}: ₹{value}
                </Typography>
              ))}
            </Grid>
          </Grid>
        </Box>
      ))}

      <TextField fullWidth disabled label="Rating" value={hotel.rating} sx={{ mt: 3 }} />
      <TextField fullWidth disabled label="Address" value={hotel.address} sx={{ mt: 2 }} />

      {/* Contacts */}
      <Typography fontWeight={600} mt={3}>Contacts</Typography>
      {hotel.contacts.map((c, i) => (
        <TextField key={i} fullWidth disabled value={c} sx={{ mt: 1 }} />
      ))}

      {/* Amenities */}
      <Typography fontWeight={600} mt={3}>Amenities</Typography>
      <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
        {hotel.amenities.map((a, i) => (
          <Chip key={i} label={a} />
        ))}
      </Box>
    </Box>
  );
};

export default HotelView;

import { Grid } from "@mui/material";
import HotelCard from "./HotelCard";

const HotelsList = ({ hotels, searchQuery, destination, subDestination, type, permissions, onView, onEdit, onDelete }) => {

  const filteredHotels = hotels.filter((h) =>
    h.hotel_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!destination || h.destination === destination) &&
    (!subDestination || h.sub_destination === subDestination) &&
    (!type || h.type === type)
  );

  return (
    <Grid container spacing={3}>
      {filteredHotels.map((hotel) => (
        <Grid item xs={12} sm={6} md={3} key={hotel._id}>
          <HotelCard
            hotel={hotel}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            permissions={permissions}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default HotelsList;

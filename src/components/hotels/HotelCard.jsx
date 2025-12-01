import { Card, CardContent, CardActions, Button, Divider, Typography } from "@mui/material";

const HotelCard = ({ hotel, onView, onEdit, onDelete, permissions }) => (
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
      <Button size="small" variant="outlined" onClick={() => onView(hotel)}>
        View
      </Button>

      {permissions.edit && (
        <Button size="small" variant="outlined" color="success" onClick={() => onEdit(hotel)}>
          Edit
        </Button>
      )}

      {permissions.delete && (
        <Button size="small" variant="outlined" color="error" onClick={() => onDelete(hotel._id)}>
          Delete
        </Button>
      )}
    </CardActions>
  </Card>
);

export default HotelCard;

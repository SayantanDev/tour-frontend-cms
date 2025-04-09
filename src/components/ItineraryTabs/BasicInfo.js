import React from "react";
import {
 Card,
 CardHeader,
 CardContent,
 Typography,
 Grid,
 Container,
 Box,
} from "@mui/material";

const BasicInfo = ({ customerInput, totalQuotetionCost }) => {
 console.log("totalQuotetionCost input is :", customerInput);

 const {
  name,
  email,
  phone,
  hotel,
  days,
  car,
  carCount,
  pax

 } = customerInput || {};

 return (
  <Container maxWidth="sm" sx={{ mt: 4 }}>
   <Card elevation={3}>
    <CardHeader
     title="Basic Information"
     sx={{ backgroundColor: "primary.main", color: "white" }}
    />
    <CardContent>
     <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
       <Typography variant="subtitle2" color="text.secondary">
        Guest Name
       </Typography>
       <Typography variant="body1">{name || "-"}</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
       <Typography variant="subtitle2" color="text.secondary">
        Email
       </Typography>
       <Typography variant="body1">{email || "-"}</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
       <Typography variant="subtitle2" color="text.secondary">
        Contact Number
       </Typography>
       <Typography variant="body1">{phone || "-"}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
       <Typography variant="subtitle2" color="text.secondary">
        Number of Person
       </Typography>
       <Typography variant="body1">{pax || "-"}</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
       <Typography variant="subtitle2" color="text.secondary">
        Car Count
       </Typography>
       <Typography variant="body1">{carCount || "-"}</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
       <Typography variant="subtitle2" color="text.secondary">
        Hotel
       </Typography>
       <Typography variant="body1">{hotel || "-"}</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
       <Typography variant="subtitle2" color="text.secondary">
        Number of Days
       </Typography>
       <Typography variant="body1">{days || "-"}</Typography>
      </Grid>

      <Grid item xs={12}  sm={6}>
       <Typography variant="subtitle2" color="text.secondary">
        Car Details
       </Typography>
       <Typography variant="body1">{car || "-"}</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
       <Typography variant="subtitle2" color="text.secondary">
        Total Quotation Cost
       </Typography>
       <Typography variant="body1">{totalQuotetionCost || "-"}</Typography>
      </Grid>
     </Grid>
    </CardContent>
   </Card>
  </Container>
 );
};

export default BasicInfo;

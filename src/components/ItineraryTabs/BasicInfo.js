import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Container
} from "@mui/material";

const InfoBlock = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography variant="caption" color="text.secondary" fontWeight="bold" gutterBottom>
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{
        padding: "8px 12px",
        boxShadow: "inset 0 0 2px rgba(0,0,0,0.1)",
      }}
    >
      {value || "-"}
    </Typography>
  </Grid>
);

const BasicInfo = ({ customerInput, totalQuotetionCost }) => {
  const {
    name,
    email,
    phone,
    hotel,
    days,
    car,
    carCount,
    pax,
  } = customerInput || {};

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Card elevation={4} >
        <CardHeader
          title="Basic Information"
          sx={{
            // backgroundColor: "primary.main",
            color: "Black",
            textAlign: "center",
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            py: 2,
            // borderTopLeftRadius: 12,
            // borderTopRightRadius: 12,
          }}
        />
        <CardContent sx={{ px: 4, py: 3 }}>
          <Grid container spacing={3}>
            <InfoBlock label="Guest Name" value={name} />
            <InfoBlock label="Email" value={email} />
            <InfoBlock label="Contact Number" value={phone} />
            <InfoBlock label="Number of Person" value={pax} />
            <InfoBlock label="Car Count" value={carCount} />
            <InfoBlock label="Hotel" value={hotel} />
            <InfoBlock label="Number of Days" value={days} />
            <InfoBlock label="Car Details" value={car} />
            <InfoBlock label="Total Quotation Cost" value={totalQuotetionCost} />
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BasicInfo;

import { Grid, Box } from "@mui/material";
import TotalPlace from "./totalPlace";
import TotalPackage from "./totalPackage";

const PlacePackageSummary = () => {
  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Left: Places Table */}
        <Grid item xs={12} md={6}>
          <TotalPlace />
        </Grid>

        {/* Right: Packages Table */}
        <Grid item xs={12} md={6}>
          <TotalPackage /> 
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlacePackageSummary;

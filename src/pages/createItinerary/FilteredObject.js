import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";

const FilteredObject = ({filteredData, handleCardClick, filteredLocation,loading}) => {
  const durationFilter = 6;
  // Apply duration filter if durationFilter is provided
  // const filteredByDuration = durationFilter
  //   ? filteredData.filter((card) => card.duration === durationFilter)
  //   : filteredData;

    if (loading) {
      return (
        <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Container>
      );
    }
  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Custom Package Card */}
        {filteredLocation && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                display: "flex",
                background: "linear-gradient(136deg, #1f57e0 , #3896ee,white)",
                flexDirection: "column",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardContent
                onClick={() => handleCardClick()}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 3,
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(78, 177, 220, 0.15)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "white" }}
                >
                  Custom Package
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Create your own custom travel experience
                </Typography>
                <Box
                  sx={{
                    mt: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "white" }}
                    >
                      Flexible Pricing
                    </Typography>
                    <AddCircleOutlinedIcon
                      sx={{
                        fontSize: "2.5rem",
                        color: "#65df30",
                        cursor: "pointer",
                      }}
                    />
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Filtered Cards */}
        {filteredData.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardContent
                onClick={() =>
                  handleCardClick(card.title, card.location, card.locSecond)
                }
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 3,
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(78, 177, 220, 0.15)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {card.locSecond}
                </Typography>
                <Box
                  sx={{
                    mt: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "success.main" }}
                  >
                    {card.price}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FilteredObject;

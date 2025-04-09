import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  Grid2,
} from "@mui/material";

const FilteredObject = ({ filteredData, handleCardClick }) => {
  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
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
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {card.locSecond}
                </Typography>
                <Box
                  sx={{
                    mt: "auto", // Pushes content to the bottom
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
      <Grid2>
        {/* coutom component */}
      </Grid2>
    </Container>
  );
};

export default FilteredObject;

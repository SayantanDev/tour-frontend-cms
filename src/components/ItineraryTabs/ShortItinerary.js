import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

const ShortItinerary = ({ customerInput }) => {
  // 1. Grab the initial number of days
  const totalDays = customerInput.days ?? 1;

  // 2. Build an initial array: [{tagValue:""}, ...] length = totalDays
  const makeEmptyItinerary = (days) =>
    Array.from({ length: days }, (_,i) => ({tagName: `Day ${i + 1}`, tagValue: "" })); //like for each 

  // 3. State holds the array of day‑plans
  const [itinerary, setItinerary] = useState(makeEmptyItinerary(totalDays));
  console.log("itinerary is is :",itinerary);
  

  // 4. If the prop changes, reset the state
  useEffect(() => {
    setItinerary(makeEmptyItinerary(totalDays));
  }, [totalDays]);

  // 5. Handlers
  const handlePlanChange = (index, value) => {
    setItinerary((prev) => {
      const next = [...prev];
      next[index].tagValue = value;
      return next;
    });
  };

  const handleAddDay = () => {
    setItinerary((prev) => [...prev, { tagValue: "" }]);
  };

  const handleDeleteDay = (index) => {
    setItinerary((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Short Itinerary
      </Typography>

      {itinerary.map((item, idx) => (
        <Paper key={idx} elevation={1} sx={{ p: 2, mb: 2 }}>
          <Grid container alignItems="center" spacing={2}>
            {/* Day label */}
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle1">Day {idx + 1}</Typography>
            </Grid>

            {/* Plan input */}
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Your Plan"
                value={item.tagValue}
                onChange={(e) => handlePlanChange(idx, e.target.value)}
              />
            </Grid>

            {/* Delete button */}
            <Grid item xs={12} sm={2}>
              <IconButton
                aria-label="delete day"
                onClick={() => handleDeleteDay(idx)}
                disabled={itinerary.length === 1}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddDay}
        sx={{ mt: 1 }}
      >
        Add Day
      </Button>
    </Box>
  );
};

export default ShortItinerary;

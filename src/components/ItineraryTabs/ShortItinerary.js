import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setNewPackageInfo } from "../../reduxcomponents/slices/packagesSlice";


const ShortItinerary = ({ customerInput,setCustomerInput, selectedCard }) => {
  const dispatch = useDispatch();

  // 1. Get total number of days from props
  // const totalDays = customerInput.days ?? 1;

  // 1. Determine total days based on selectedCard itinerary first
  const totalDays = selectedCard?.itinerary?.length || customerInput.days || 1;
  const [dayCount, setDayCount] = useState(totalDays);

  console.log("total itinerary count : ", dayCount);

  // 2. Create itinerary, prioritizing selectedCard values
  const makeEmptyItinerary = (days, existingValues = []) =>
    Array.from({ length: days }, (_, i) => ({
      tagName: `Day ${i + 1}`,
      tagValue: existingValues[i] ?? "",
    }));

  // 3. Initialize itinerary state
  const [itinerary, setItinerary] = useState([]);

  useEffect(() => {
    const existingValues = selectedCard?.itinerary?.map((day) => day.tagValue) || [];
    const newItinerary = makeEmptyItinerary(totalDays, existingValues);

    setItinerary((prev) => {
      const isSame =
        prev.length === newItinerary.length &&
        prev.every((item, idx) => item.tagValue === newItinerary[idx].tagValue);
      return isSame ? prev : newItinerary;
    });

  }, [totalDays, selectedCard]);


  // 5. Handle input change
  const handlePlanChange = (index, value) => {
    setItinerary((prev) => {
      const next = [...prev];
      next[index].tagValue = value;
      return next;
    });
  };

  // 6. Add a new day
  const handleAddDay = () => {
    setItinerary((prev) => {
      const updated = [...prev, { tagName: `Day ${prev.length + 1}`, tagValue: "" }];
      setCustomerInput?.({ ...customerInput, days: updated.length }); //Update days
      return updated;
    });
  };
  
  // 7. Delete a day and update day labels
  const handleDeleteDay = (index) => {
    setItinerary((prev) => {
      const updated = prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, tagName: `Day ${i + 1}` }));
      setCustomerInput?.({ ...customerInput, days: updated.length }); // Update days
      return updated;
    });
  };
  
  // 8. Dispatch to Redux only when all fields are filled
  const handleSaveItinerary = () => {
    const allFilled = itinerary.every((item) => item.tagValue.trim() !== "");
    if (allFilled) {
      dispatch(setNewPackageInfo({ details: { shortItinerary: itinerary } }));
    } else {
      alert("Please fill in all day plans before saving.");
    }
  };

  return (
    <Box sx={{ width: "50vw" }}>
      <Typography variant="h6" gutterBottom>
        Short Itinerary
      </Typography>

      {itinerary.map((item, idx) => (
        <Box key={idx} sx={{ mb: 2 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle1">{item.tagName}</Typography>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Your Plan"
                value={item.tagValue}
                onChange={(e) => handlePlanChange(idx, e.target.value)}
              />
            </Grid>

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
        </Box>
      ))}

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDay}
        >
          Add Day
        </Button>

        <Button
          variant="outlined"
          onClick={handleSaveItinerary}
          color="success"
        >
          Save Itinerary
        </Button>
      </Box>
    </Box>
  );
};

export default ShortItinerary;

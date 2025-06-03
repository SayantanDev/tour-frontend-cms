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
import { useDispatch, useSelector } from "react-redux";
import {
  setCheckItinery,
  setNewPackageInfo,
  setNewPackageItinerary,
} from "../../reduxcomponents/slices/packagesSlice";

const ShortItinerary = ({ customerInput, setCustomerInput, selectedCard }) => {
  const dispatch = useDispatch();
  const { fetchNewPackageItinerary: customItinerary } = useSelector(
    (state) => state.package
  );

  const totalDays =
    selectedCard?.itinerary?.length || customerInput.days || 1;

  const makeEmptyItinerary = (days, existingValues = []) =>
    Array.from({ length: days }, (_, i) => ({
      tagName: `Day ${i + 1}`,
      tagValue: existingValues[i] ?? "",
    }));

  const [itinerary, setItinerary] = useState([]);

  useEffect(() => {
    const existingValues =
      selectedCard?.itinerary?.map((day) => day.tagValue) ||
      customItinerary.shortItinerary?.map((day) => day.tagValue) || [];
    const newItinerary = makeEmptyItinerary(totalDays, existingValues);

    setItinerary((prev) => {
      const isSame =
        prev.length === newItinerary.length &&
        prev.every((item, idx) => item.tagValue === newItinerary[idx].tagValue);
      return isSame ? prev : newItinerary;
    });
  }, [totalDays, selectedCard]);

  const handlePlanChange = (index, value) => {
    setItinerary((prev) => {
      const next = [...prev];
      next[index].tagValue = value;
      return next;
    });
  };

  const handleAddDay = () => {
    setItinerary((prev) => {
      const updated = [...prev, { tagName: `Day ${prev.length + 1}`, tagValue: "" }];
      setCustomerInput?.({ ...customerInput, days: updated.length });
      return updated;
    });
  };

  const handleDeleteDay = (index) => {
    setItinerary((prev) => {
      const updated = prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, tagName: `Day ${i + 1}` }));
      setCustomerInput?.({ ...customerInput, days: updated.length });
      return updated;
    });
  };

  useEffect(() => {
    const allFilled = itinerary.every((item) => item.tagValue.trim() !== "");
    if (allFilled && itinerary.length > 0) {
      dispatch(setNewPackageItinerary({ shortItinerary: itinerary }));
      dispatch(setCheckItinery(true));

    }
  }, [itinerary, dispatch]);

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
      </Box>
    </Box>
  );
};

export default ShortItinerary;

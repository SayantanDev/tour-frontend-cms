import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setNewPackageInfo } from "../../reduxcomponents/slices/packagesSlice";
import { CONFIG_STR } from "../../configuration";

function Reach({ selectedCard }) {
  const dispatch = useDispatch();
  const exclusionOptions = CONFIG_STR.commonReach.exclusions;
  const inclusionOptions = CONFIG_STR.commonReach.inclusions;

  // console.log("selectedCard >< ", exclusionOptions);


  const [exclusions, setExclusions] = useState([]);
  const [inclusions, setInclusions] = useState([]);



  // Sync initial data from selectedCard
  useEffect(() => {
    const formattedExclusions = selectedCard?.exclusions?.length
      ? selectedCard.exclusions.map((item) => ({ tagValue: item }))
      : exclusionOptions.map((item) => ({ tagValue: item }));

    const formattedInclusions = selectedCard?.inclusions?.length
      ? selectedCard.inclusions.map((item) => ({ tagValue: item }))
      : inclusionOptions.map((item) => ({ tagValue: item }));

    setExclusions(formattedExclusions);
    setInclusions(formattedInclusions);

    // Initial dispatch
    dispatch(setNewPackageInfo({
      details: {
        cost: {
          exclusions: formattedExclusions.map((item) => item.tagValue),
          inclusions: formattedInclusions.map((item) => item.tagValue),
        },
      },
    }));
  }, [exclusionOptions,inclusionOptions,selectedCard, dispatch]);

  // Update dispatch whenever exclusions or inclusions change
  const updateRedux = (updatedExclusions, updatedInclusions) => {
    dispatch(setNewPackageInfo({
      details: {
        cost: {
          exclusions: updatedExclusions.map((item) => item.tagValue),
          inclusions: updatedInclusions.map((item) => item.tagValue),
        },
      },
    }));
  };

  const handleExclusionChange = (index, value) => {
    const updated = [...exclusions];
    updated[index].tagValue = value;
    setExclusions(updated);
    updateRedux(updated, inclusions);
  };

  const handleInclusionChange = (index, value) => {
    const updated = [...inclusions];
    updated[index].tagValue = value;
    setInclusions(updated);
    updateRedux(exclusions, updated);
  };

  const handleAddExclusion = () => {
    const updated = [...exclusions, { tagValue: "" }];
    setExclusions(updated);
    updateRedux(updated, inclusions);
  };

  const handleAddInclusion = () => {
    const updated = [...inclusions, { tagValue: "" }];
    setInclusions(updated);
    updateRedux(exclusions, updated);
  };

  const handleDeleteExclusion = (index) => {
    const updated = exclusions.filter((_, i) => i !== index);
    setExclusions(updated);
    updateRedux(updated, inclusions);
  };

  const handleDeleteInclusion = (index) => {
    const updated = inclusions.filter((_, i) => i !== index);
    setInclusions(updated);
    updateRedux(exclusions, updated);
  };

  return (
    <Box>
      {/* Exclusions Accordion */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} id="exclusions-header">
          <Typography component="span">1. Exclusions List</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: "50vw" }}>
            {/* <Typography variant="body2" sx={{ mb: 3 }}>
              If you need suggestions or want to view previous exclusions, click the link.
            </Typography> */}
            {exclusions.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={8} sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Typography>{idx + 1}.</Typography>
                    <TextField
                      fullWidth
                      label={`Exclusion ${idx + 1}`}
                      value={item.tagValue}
                      onChange={(e) => handleExclusionChange(idx, e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      onClick={() => handleDeleteExclusion(idx)}
                      disabled={exclusions.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddExclusion}
              sx={{ mt: 1 }}
            >
              Add Exclusion
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Inclusions Accordion */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} id="inclusions-header">
          <Typography component="span">2. Inclusions List</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: "50vw" }}>
            {inclusions.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={8} sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Typography>{idx + 1}.</Typography>
                    <TextField
                      fullWidth
                      label={`Inclusion ${idx + 1}`}
                      value={item.tagValue}
                      onChange={(e) => handleInclusionChange(idx, e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      onClick={() => handleDeleteInclusion(idx)}
                      disabled={inclusions.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddInclusion}
              sx={{ mt: 1 }}
            >
              Add Inclusion
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default Reach;

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

function Reach({ selectedCard }) {
  const [exclusions, setExclusions] = useState([]);
  const [inclusions, setInclusions] = useState([]);

  useEffect(() => {
    if (selectedCard?.exclusions?.length > 0) {
      const formatted = selectedCard.exclusions.map((item) => ({
        tagValue: item,
      }));
      setExclusions(formatted);
    } else {
      setExclusions([{ tagValue: "" }]);
    }

    if (selectedCard?.inclusions?.length > 0) {
      const formatted = selectedCard.inclusions.map((item) => ({
        tagValue: item,
      }));
      setInclusions(formatted);
    } else {
      setInclusions([{ tagValue: "" }]);
    }
  }, [selectedCard]);

  const handleExclusionChange = (index, value) => {
    setExclusions((prev) => {
      const next = [...prev];
      next[index].tagValue = value;
      return next;
    });
  };

  const handleInclusionChange = (index, value) => {
    setInclusions((prev) => {
      const next = [...prev];
      next[index].tagValue = value;
      return next;
    });
  };

  const handleAddExclusion = () => {
    setExclusions((prev) => [...prev, { tagValue: "" }]);
  };

  const handleAddInclusion = () => {
    setInclusions((prev) => [...prev, { tagValue: "" }]);
  };

  const handleDeleteExclusion = (index) => {
    setExclusions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteInclusion = (index) => {
    setInclusions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      {/* Exclusions Accordion */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="exclusions-content"
          id="exclusions-header"
        >
          <Typography component="span">Exclusions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: "50vw" }}>
            <Typography variant="h6" gutterBottom>
              Exclusions List
            </Typography>

            {exclusions.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={8} sx={{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}>
                    <Typography>{idx + 1}.</Typography>
                    <TextField
                      fullWidth
                      label={`Exclusion ${idx + 1}`}
                      value={item.tagValue}
                      onChange={(e) =>
                        handleExclusionChange(idx, e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      aria-label="delete"
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
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="inclusions-content"
          id="inclusions-header"
        >
          <Typography component="span">Inclusions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: "50vw" }}>
            <Typography variant="h6" gutterBottom>
              Inclusions List
            </Typography>

            {inclusions.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={8} sx={{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}>
                  <Typography>{idx + 1}.</Typography>
                    <TextField
                      fullWidth
                      label={`Inclusion ${idx + 1}`}
                      value={item.tagValue}
                      onChange={(e) =>
                        handleInclusionChange(idx, e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      aria-label="delete"
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

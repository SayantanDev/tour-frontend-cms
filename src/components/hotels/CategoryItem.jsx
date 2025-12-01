import { Box, Grid, IconButton, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PriceBox from "./PriceBox";

const CategoryItem = ({
  i,
  cat,
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  remove
}) => {
  return (
    <Box sx={{ border: "1px solid #1976d2", borderRadius: 2, p: 2, mb: 3 }}>
      <TextField
        fullWidth
        label="Room Category"
        name={`category[${i}].room_cat`}
        value={cat.room_cat}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched?.category?.[i]?.room_cat && errors?.category?.[i]?.room_cat}
        helperText={touched?.category?.[i]?.room_cat && errors?.category?.[i]?.room_cat}
        sx={{ mb: 2 }}
      />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <PriceBox
            title="Season Price"
            color="primary"
            prefix="season_price"
            categoryIndex={i}
            {...{ values, errors, touched, handleChange, handleBlur }}
          />
        </Grid>

        <Grid item xs={6}>
          <PriceBox
            title="Off Season Price"
            color="secondary"
            prefix="off_season_price"
            categoryIndex={i}
            {...{ values, errors, touched, handleChange, handleBlur }}
          />
        </Grid>
      </Grid>

      <IconButton color="error" onClick={() => remove(i)} sx={{ mt: 2 }}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default CategoryItem;

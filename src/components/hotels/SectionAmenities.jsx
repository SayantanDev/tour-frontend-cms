import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { FieldArray } from "formik";

const SectionAmenities = ({ values, errors, touched, handleChange, handleBlur }) => {
  return (
    <>
      <Typography fontWeight={600} mt={3}>Amenities</Typography>

      <FieldArray name="amenities">
        {({ push, remove }) => (
          <>
            {values.amenities.map((a, i) => (
              <Box key={i} display="flex" gap={1} alignItems="center">
                <TextField
                  fullWidth
                  margin="dense"
                  label={`Amenity ${i + 1}`}
                  name={`amenities[${i}]`}
                  value={a}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched?.amenities?.[i] && errors?.amenities?.[i]}
                  helperText={touched?.amenities?.[i] && errors?.amenities?.[i]}
                />

                {values.amenities.length > 1 && (
                  <IconButton color="error" onClick={() => remove(i)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            <Button onClick={() => push("")}>+ Add Amenity</Button>
          </>
        )}
      </FieldArray>
    </>
  );
};

export default SectionAmenities;

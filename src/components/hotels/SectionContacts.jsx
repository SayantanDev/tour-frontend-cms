import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { FieldArray } from "formik";

const SectionContacts = ({ values, errors, touched, handleChange, handleBlur }) => {
  return (
    <>
      <Typography fontWeight={600} mt={3}>Contacts</Typography>

      <FieldArray name="contacts">
        {({ push, remove }) => (
          <>
            {values.contacts.map((c, i) => (
              <Box key={i} display="flex" gap={1} alignItems="center">
                <TextField
                  fullWidth
                  label={`Contact ${i + 1}`}
                  name={`contacts[${i}]`}
                  margin="dense"
                  value={c}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched?.contacts?.[i] && errors?.contacts?.[i]}
                  helperText={touched?.contacts?.[i] && errors?.contacts?.[i]}
                />
                {values.contacts.length > 1 && (
                  <IconButton onClick={() => remove(i)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            <Button onClick={() => push("")}>+ Add Contact</Button>
          </>
        )}
      </FieldArray>
    </>
  );
};

export default SectionContacts;

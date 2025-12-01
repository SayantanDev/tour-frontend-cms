import { Grid, Button, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Formik, Form } from "formik";
import TextFieldValidated from "./TextFieldValidated";
import SectionCategories from "./SectionCategories";
import SectionContacts from "./SectionContacts";
import SectionAmenities from "./SectionAmenities";
import { validationSchema } from "./validationSchema";

const HotelForm = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Form>

          {/* BASIC INFO */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextFieldValidated
                name="hotel_name"
                label="Hotel Name"
                {...{ values, errors, touched, handleChange, handleBlur }}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={values.type}
                  name="type"
                  label="Type"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.type && Boolean(errors.type)}
                >
                  {["Hotel", "Homestay", "Resort", "Guest House", "Villa", "Pension"].map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* DESTINATIONS */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextFieldValidated
                name="destination"
                label="Destination"
                {...{ values, errors, touched, handleChange, handleBlur }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextFieldValidated
                name="sub_destination"
                label="Sub Destination"
                {...{ values, errors, touched, handleChange, handleBlur }}
              />
            </Grid>
          </Grid>

          {/* CATEGORIES */}
          <SectionCategories
            {...{ values, errors, touched, handleChange, handleBlur }}
          />

          {/* RATING */}
          <TextFieldValidated
            name="rating"
            label="Rating"
            type="number"
            {...{ values, errors, touched, handleChange, handleBlur }}
            sx={{ mt: 2 }}
          />

          {/* ADDRESS */}
          <TextFieldValidated
            name="address"
            label="Address"
            {...{ values, errors, touched, handleChange, handleBlur }}
            sx={{ mt: 2 }}
          />

          {/* CONTACTS */}
          <SectionContacts
            {...{ values, errors, touched, handleChange, handleBlur }}
          />

          {/* AMENITIES */}
          <SectionAmenities
            {...{ values, errors, touched, handleChange, handleBlur }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Save Hotel
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 1 }}
            onClick={onCancel}
          >
            Cancel
          </Button>

        </Form>
      )}
    </Formik>
  );
};

export default HotelForm;

import { TextField } from "@mui/material";
import { getIn } from "formik";

const NumberField = ({
  name,
  label,
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  ...props
}) => {
  const fieldValue = getIn(values, name);
  const fieldError = getIn(errors, name);
  const fieldTouched = getIn(touched, name);

  return (
    <TextField
      fullWidth
      type="number"
      label={label}
      name={name}
      value={fieldValue ?? ""}
      onChange={(e) => {
        // Prevent negative numbers
        if (e.target.value < 0) return;
        handleChange(e);
      }}
      onBlur={handleBlur}
      error={Boolean(fieldTouched && fieldError)}
      helperText={fieldTouched && fieldError}
      inputProps={{ min: 0 }}
      {...props}
    />
  );
};

export default NumberField;

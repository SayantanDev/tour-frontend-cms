import { TextField } from "@mui/material";
import { getIn } from "formik";

const TextFieldValidated = ({
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
      label={label}
      name={name}
      value={fieldValue ?? ""}
      onChange={handleChange}
      onBlur={handleBlur}
      error={Boolean(fieldTouched && fieldError)}
      helperText={fieldTouched && fieldError}
      {...props}
    />
  );
};

export default TextFieldValidated;

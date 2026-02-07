import { Box, Grid, Typography } from "@mui/material";
import NumberField from "./NumberField";

const PriceBox = ({
  title,
  color,
  prefix,
  categoryIndex,
  values,
  errors,
  touched,
  handleChange,
  handleBlur
}) => {
  // const fields = [
  //   "cp_plan", "ep_plan", "ap_plan", "map_plan",
  //   "extra_mat_cp", "extra_mat_ap", "extra_mat_ep", "extra_mat_map",
  //   "cnb_cp", "cnb_ap", "cnb_ep", "cnb_map",
  // ];
  const fields = [
    "cp_plan", "ap_plan", "map_plan",
    "extra_mat_cp", "extra_mat_ap", "extra_mat_map",
    "cnb_cp", "cnb_ap", "cnb_map",
  ];

  return (
    <Box sx={{ border: "1px solid", borderColor: color, borderRadius: 2, p: 2 }}>
      <Typography fontWeight={700} color={color} mb={2}>{title}</Typography>

      <Grid container spacing={2}>
        {fields.map((key) => (
          <Grid item xs={4} key={key}>
            <NumberField
              label={key.replace(/_/g, " ").toUpperCase()}
              name={`category[${categoryIndex}].${prefix}.${key}`}
              values={values}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PriceBox;

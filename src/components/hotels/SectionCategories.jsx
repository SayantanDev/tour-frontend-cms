import { Button, Typography } from "@mui/material";
import { FieldArray } from "formik";
import CategoryItem from "./CategoryItem";

const SectionCategories = ({
  values, errors, touched, handleChange, handleBlur
}) => {
  return (
    <>
      <Typography fontWeight={600} mt={3} mb={1}>Room Categories</Typography>

      <FieldArray name="category">
        {({ push, remove }) => (
          <>
            {values.category?.map((cat, i) => (
              <CategoryItem
                key={i}
                i={i}
                cat={cat}
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                remove={remove}
              />
            ))}

            <Button
              variant="outlined"
              onClick={() =>
                push({
                  room_cat: "",
                  season_price: Object.fromEntries(
                    [
                      "cp_plan", "ep_plan", "ap_plan", "map_plan",
                      "extra_mat_cp", "extra_mat_ap", "extra_mat_ep", "extra_mat_map",
                      "cnb_cp", "cnb_ap", "cnb_ep", "cnb_map"
                    ].map((k) => [k, 0])
                  ),
                  off_season_price: Object.fromEntries(
                    [
                      "cp_plan", "ep_plan", "ap_plan", "map_plan",
                      "extra_mat_cp", "extra_mat_ap", "extra_mat_ep", "extra_mat_map",
                      "cnb_cp", "cnb_ap", "cnb_ep", "cnb_map"
                    ].map((k) => [k, 0])
                  )
                })
              }
            >
              + Add Category
            </Button>
          </>
        )}
      </FieldArray>
    </>
  );
};

export default SectionCategories;

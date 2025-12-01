import * as Yup from "yup";

const priceKeys = [
  "cp_plan", "ep_plan", "ap_plan", "map_plan",
  "extra_mat_cp", "extra_mat_ap", "extra_mat_ep", "extra_mat_map",
  "cnb_cp", "cnb_ap", "cnb_ep", "cnb_map"
];

export const validationSchema = Yup.object({
  hotel_name: Yup.string().required("Hotel name is required"),
  destination: Yup.string().required("Destination is required"),
  sub_destination: Yup.string().required("Sub destination is required"),
  type: Yup.string().required("Hotel type is required"),

  rating: Yup.number()
    .min(0)
    .max(5)
    .typeError("Rating must be a number")
    .required(),

  category: Yup.array().of(
    Yup.object({
      room_cat: Yup.string().required("Room category is required"),

      season_price: Yup.object(
        Object.fromEntries(
          priceKeys.map((key) => [
            key,
            Yup.number().min(0).typeError("Invalid number")
          ])
        )
      ),

      off_season_price: Yup.object(
        Object.fromEntries(
          priceKeys.map((key) => [
            key,
            Yup.number().min(0).typeError("Invalid number")
          ])
        )
      ),
    })
  ),

  contacts: Yup.array().of(Yup.string()),
  amenities: Yup.array().of(Yup.string()),
  address: Yup.string(),
});

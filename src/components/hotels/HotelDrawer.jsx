import { Drawer, Box, IconButton, Divider, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HotelForm from "./HotelForm";
import HotelView from "./HotelView";

const HotelDrawer = ({
  open,
  onClose,
  mode,
  selectedHotel,
  formInitialValues,
  onSubmit,
}) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 950, p: 3, maxHeight: "100vh", overflowY: "auto" }}>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {mode === "add"
              ? "Add Hotel"
              : mode === "edit"
              ? "Edit Hotel"
              : "Hotel Details"}
          </Typography>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {mode === "view" && <HotelView hotel={selectedHotel} />}

        {(mode === "add" || mode === "edit") && (
          <HotelForm
            initialValues={formInitialValues}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        )}
      </Box>
    </Drawer>
  );
};

export default HotelDrawer;

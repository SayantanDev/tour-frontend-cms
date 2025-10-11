import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  TextField,
} from "@mui/material";

const PermissionDialogBox = ({
  open,
  handleClose,
  handleSavePermissions,
  selectedRole,
  permissionDialogData,
  handleModuleToggle,
  handleValueChange,
  handleSearchChange,
  searchTerm,
  filteredPermissions
}) => {



  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      {/* ======= DIALOG TITLE ======= */}
      <DialogTitle>
        {selectedRole ? `Manage Permissions for "${selectedRole}"` : "Manage Permissions"}
      </DialogTitle>

      {/* ======= DIALOG CONTENT ======= */}
      <DialogContent>
        <form>
          <Box sx={{ mb: 3, mt: 2 }}>
            <TextField
              label="Search by Module Name"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              sx={{ maxWidth: 400 }}
            />
          </Box>
          <Grid container spacing={2}>
            {filteredPermissions.map((module, index) => (
              <Grid item xs={12} key={index}>
                <Box
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    p: 2,
                    mb: 2,
                    backgroundColor: module.enabled ? "#f9f9f9" : "#fff",
                  }}
                >

                  {/* ======= MODULE NAME ======= */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={module.enabled}
                        onChange={() => handleModuleToggle(module.module)}
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 600 }}>{module.module}</Typography>
                    }
                  />

                  {/* ======= PERMISSION VALUES ======= */}
                  <Grid container spacing={1} sx={{ pl: 3 }}>
                    {Object.keys(module.values).map((valueKey, i) => (
                      <Grid item xs={6} sm={4} md={3} key={i}>
                        < FormControlLabel
                          control={
                            <Checkbox
                              checked={module.values[valueKey]}
                              disabled={!module.enabled}
                              onChange={() =>
                                handleValueChange(module.module, valueKey)
                              }
                            />
                          }
                          label={valueKey.charAt(0).toUpperCase() + valueKey.slice(1)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>
        </form>
      </DialogContent>

      {/* ======= DIALOG ACTIONS ======= */}
      <DialogActions>
        <Button
          onClick={handleSavePermissions}
          variant="contained"
          color="success"
        >
          Save
        </Button>
        <Button onClick={handleClose} variant="contained" color="error">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionDialogBox;

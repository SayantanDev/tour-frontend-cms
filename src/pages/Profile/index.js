import { Box, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLoginToken } from "../../reduxcomponents/slices/tokenSlice";

const Profile = () => {

  const { user } = useSelector(state => state.tokens);
  const dispatch = useDispatch();

  const [editableUser, setEditableUser] = useState({
    name: user?.fullName,
    email: user?.email,
  });

  const [editField, setEditField] = useState(null);

  const handleDoubleClick = (field) => setEditField(field);

  const handleChange = (e) =>
    setEditableUser({ ...editableUser, [e.target.name]: e.target.value });

  const handleBlur = () => {
    setEditField(null);
    dispatch(addLoginToken({ user: editableUser }));
  }

  return (
    <Card sx={{ maxWidth: 600, p: 2, m: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom mb={4} fontWeight={500}>
          Profile Summary
        </Typography>

        <Grid container spacing={4}>
          {["name", "email"].map((field) => (
            <Grid item xs={12} sm={6} key={field}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: "#555", fontWeight: 600 }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Typography>
              </Box>

              {editField === field ? (
                <TextField
                  name={field}
                  value={editableUser[field]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoFocus
                  size="small"
                  fullWidth
                />
              ) : (
                <Typography
                  onDoubleClick={() => handleDoubleClick(field)}
                  sx={{
                    cursor: "pointer",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}>{editableUser[field]}</Typography>
              )}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Profile;
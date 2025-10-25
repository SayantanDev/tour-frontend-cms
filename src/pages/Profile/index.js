import { Box, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLoginToken } from "../../reduxcomponents/slices/tokenSlice";

const Profile = () => {
  const dispatch = useDispatch();

  // tokens slice structure: { token, refreshToken, user }
  const { user, token, refreshToken } = useSelector((state) => state.tokens);

  // local editable form state
  const [editableUser, setEditableUser] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
  });

  // keep local editable copy in sync with redux when redux changes
  useEffect(() => {
    setEditableUser({
      name: user?.fullName || "",
      email: user?.email || "",
    });
  }, [user]);

  // which field is currently being edited
  const [editField, setEditField] = useState(null);

  const handleDoubleClick = (field) => {
    setEditField(field);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // when user leaves the input, we:
  // 1. exit edit mode
  // 2. update redux store with new values
  const handleBlur = useCallback(() => {
    setEditField(null);

    // build an updated user object keeping all other fields (_id, permission, etc.)
    const updatedUser = {
      ...user,
      fullName: editableUser.name,
      email: editableUser.email,
    };

    // dispatch back into redux in the exact shape your reducer expects
    dispatch(
      addLoginToken({
        token,
        refreshToken,
        user: updatedUser,
      })
    );
  }, [dispatch, user, token, refreshToken, editableUser]);

  return (
    <Card sx={{ maxWidth: 600, p: 2, m: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom mb={4} fontWeight={500}>
          Profile Summary
        </Typography>

        <Grid container spacing={4}>
          {[
            { field: "name", label: "Name" },
            { field: "email", label: "Email" },
          ].map(({ field, label }) => (
            <Grid item xs={12} sm={6} key={field}>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#555", fontWeight: 600 }}
                >
                  {label}
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
                    border: "1px solid transparent",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  {editableUser[field] || "—"}
                </Typography>
              )}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Profile;

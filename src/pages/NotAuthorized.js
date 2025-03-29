import React from "react";
import { Typography, Container, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LockPerson } from "@mui/icons-material";

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 10 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <LockPerson sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
        <Typography variant="h2" color="error" fontWeight="bold">
          403
        </Typography>
        <Typography variant="h5" sx={{ mt: 1, fontWeight: "bold" }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
          You do not have permission to access this page. Please contact the administrator if you believe this is a mistake.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotAuthorized;

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { getAllPackages } from "../../api/packageAPI";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/UsePermissions";

const TotalPackage = () => {
  const [filteredPackages, setFilteredPackages] = useState([]);
  const navigate = useNavigate();
  const getPermission = usePermissions();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await getAllPackages();
        const sortedData = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setFilteredPackages(sortedData);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };
    fetchPackages();
  }, []);

  // Get unique locations dynamically
  const locations = [...new Set(filteredPackages.map((pkg) => pkg.location))];

  // Prepare summary data dynamically
  const summaryData = [
    { label: "Total", count: filteredPackages.length, location: "" },
    ...locations.map((loc) => ({
      label: loc,
      count: filteredPackages.filter((pkg) => pkg.location === loc).length,
      location: loc,
    })),
  ];

  // Navigate dynamically based on row clicked
  const handleNavigate = (zone) => {
    if (!zone) {
      navigate("/packages"); // Total row, no filter
    } else {
      navigate(`/packages?zone=${encodeURIComponent(zone)}`);
    }
  };

  return (
    getPermission('packages', 'view') && (
      <Box mb={5}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Packages Summary
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Zone</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Count</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {summaryData.map((item, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "#f9f9f9" },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <TableCell align="center">{item.label}</TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold">{item.count}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => handleNavigate(item.location)}
                    >
                      View Packages
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    )

  );
};

export default TotalPackage;

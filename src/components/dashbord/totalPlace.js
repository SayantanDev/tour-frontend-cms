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
  TablePagination,
} from "@mui/material";
import { getAllplaces } from "../../api/placeApi";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/UsePermissions";

const TotalPlace = () => {
  const [places, setPlaces] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const navigate = useNavigate();
  const getPermission = usePermissions();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await getAllplaces();
        setPlaces(response);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };
    fetchPlaces();
  }, []);

  // Get unique zones dynamically
  const zones = [...new Set(places.map((p) => p.zone))];

  // Prepare summary data dynamically
  const summaryData = [
    { label: "All Zones", count: places.length, zone: "" }, // total row
    ...zones.map((zone) => ({
      label: zone,
      count: places.filter((p) => p.zone === zone).length,
      zone: zone,
    })),
  ];

  // Navigate dynamically based on row clicked
  const handleNavigate = (zone) => {
    if (!zone) {
      navigate("/places/view"); // Total row
    } else {
      navigate(`/places/view?zone=${encodeURIComponent(zone)}`); // Specific zone
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    getPermission('places', 'view') && (
      <Box mb={5}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Places Summary
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Zone
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Count
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {summaryData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
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
                        onClick={() => handleNavigate(item.zone)}
                      >
                        View Places
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={summaryData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5]} // 👈 fixed to always show 5
          />
        </TableContainer>
      </Box>
    )
  );
};

export default TotalPlace;

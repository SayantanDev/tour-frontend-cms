import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Collapse,
    Box,
    Card,
    CardContent,
    Divider,
    Tooltip,
    CircularProgress,
    Grid,
    TextField,
    TablePagination
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { getAllInquiries } from "../../api/inquiryAPI";
import { useDispatch } from "react-redux";
import { setSelectedInquiry } from "../../reduxcomponents/slices/inquirySlice";

const Inquiry = () => {
  const dispatch = useDispatch();
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [openRow, setOpenRow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const rowsPerPage = 30;

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const response = await getAllInquiries(); // Replace with actual API endpoint
                const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setInquiries(sortedData);
                setFilteredInquiries(sortedData);
            } catch (error) {
                console.error("Error fetching inquiries:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInquiries();
    }, []);
    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredInquiries(
            inquiries.filter((inquiry) =>
                inquiry.guest_name.toLowerCase().includes(query) ||
                inquiry.guest_email.toLowerCase().includes(query) ||
                inquiry.guest_phone.includes(query)
            )
        );
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleToggleView = (index) => {
        setOpenRow(openRow === index ? null : index);
    };
    const handleInquiryClick = (inquiry) => {
        dispatch(setSelectedInquiry(inquiry));
       navigate(`/createItinerary`);  
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom align="left" sx={{ fontWeight: "bold", color: "#333" }}>
                Inquiry List
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/createItinerary")}
                    >
                        Create New Inquiry
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Search by Name, Email, or Phone"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </Grid>
            </Grid>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <CircularProgress />
                </Box>
            ) : (<>
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Phone</strong></TableCell>
                                <TableCell><strong>Arrival Date</strong></TableCell>
                                <TableCell><strong>Quote/Itineary</strong></TableCell>

                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInquiries.map((inquiry, index) => (
                                <React.Fragment key={inquiry._id}>
                                    <TableRow>
                                        <TableCell>{inquiry.guest_name}</TableCell>
                                        <TableCell>{inquiry.guest_email}</TableCell>
                                        <TableCell>{inquiry.guest_phone}</TableCell>
                                        <TableCell>{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                // sx={{ mb: 2, display: "block", mx: "auto" }}
                                                // onClick={() => navigate("/createItinerary")}
                                                onClick={()=>handleInquiryClick(inquiry)}
                                            >
                                                Generate
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="View Details">
                                                <IconButton onClick={() => handleToggleView(index)}>
                                                    <Visibility color="primary" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Inquiry">
                                                <IconButton>
                                                    <Edit color="secondary" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Inquiry">
                                                <IconButton>
                                                    <Delete color="error" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
                                            <Collapse in={openRow === index} timeout="auto" unmountOnExit>
                                                <Box margin={2}>
                                                    <Card variant="outlined" sx={{ backgroundColor: "#fafafa", borderRadius: 2, boxShadow: 1 }}>
                                                        <CardContent>
                                                            <Typography variant="body1" sx={{ fontWeight: "bold" }}>Lead Source: {inquiry.lead_source}</Typography>
                                                            <Typography variant="body2">Message: {inquiry.guest_message}</Typography>
                                                            <Typography variant="body2">Verified: {inquiry.verifyed ? "Yes" : "No"}</Typography>
                                                            <Typography variant="body2">Arrival Data: {new Date(inquiry.arrival_date).toLocaleString()}</Typography>
                                                            <Divider sx={{ mt: 1, mb: 1 }} />
                                                        </CardContent>
                                                    </Card>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                        rowsPerPageOptions={[30]}
                        component="div"
                        count={filteredInquiries.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                    />
                </>
            )}
        </Container>
    );
};

export default Inquiry;

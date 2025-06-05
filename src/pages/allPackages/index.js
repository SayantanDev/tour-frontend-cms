import React, { useEffect, useState } from "react";
import {
    Container, Typography, Button, IconButton, TextField, Box, Autocomplete,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import PackageDialog from './PackageDialog';
import { getAllPackages, getSinglePackages } from '../../api/packageAPI';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeSelectedPackage, setSelectedPackage } from "../../reduxcomponents/slices/packagesSlice";

const AllPackages = () => {
    const [allPackages, setAllPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newD, setNewD] = useState(false);
    const [singleRowData, setSingleRowData] = useState({});
    const [filterLocation, setFilterLocation] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [searchLabel, setSearchLabel] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        getAllPackages()
            .then((res) => {
                setAllPackages(res.data);
            })
            .catch((err) => {
                console.error('Failed to fetch packages', err);
            });
    }, []);

    const uniqueLocations = [...new Set(allPackages.map(pkg => pkg.location))];
    const uniqueTypes = [...new Set(allPackages.map(pkg => pkg.type))];

    useEffect(() => {
        let filtered = [...allPackages];

        if (filterLocation) {
            filtered = filtered.filter(pkg => pkg.location?.toLowerCase() === filterLocation.toLowerCase());
        }
        if (filterType) {
            filtered = filtered.filter(pkg => pkg.type?.toLowerCase() === filterType.toLowerCase());
        }
        if (searchLabel) {
            filtered = filtered.filter(pkg => pkg.label?.toLowerCase().includes(searchLabel.toLowerCase()));
        }

        const rows = filtered.map(pkg => ({
            id: pkg._id,
            title: pkg.label,
            type: pkg.type,
            duration: pkg?.details?.header?.h2,
            cost: pkg?.type === 'Trek'
                ? pkg?.details?.cost?.singleCost
                : pkg?.details?.cost?.multipleCost?.[0]?.Budget || 'N/A',
        }));

        setFilteredPackages(rows);
    }, [allPackages, filterLocation, filterType, searchLabel]);

    const handleView = (id) => {
        navigate(`/packages/view/${id}`);
    };

    const handleEdit = async (id) => {
        try {
            const singleData = await getSinglePackages(id);
            dispatch(setSelectedPackage(singleData.data));
            navigate(`/packages/createandedit`);
        } catch (error) {
            console.error('Failed to fetch single package', error);
        }
    };

    const createNewPackage = () => {
        dispatch(removeSelectedPackage());
        navigate(`/packages/createandedit`);
    };

    const handleChangePage = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const paginatedRows = filteredPackages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Container>
            <Typography variant="h6" sx={{ mb: 2 }}>All Packages</Typography>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="Search Title"
                    size="small"
                    value={searchLabel}
                    onChange={(e) => setSearchLabel(e.target.value)}
                    sx={{ width: 250 }}
                />
                <Autocomplete
                    value={filterLocation}
                    onChange={(e, newVal) => setFilterLocation(newVal)}
                    options={uniqueLocations}
                    renderInput={(params) => <TextField {...params} label="Location" size="small" />}
                    sx={{ width: 200 }}
                />
                <Autocomplete
                    value={filterType}
                    onChange={(e, newVal) => setFilterType(newVal)}
                    options={uniqueTypes}
                    renderInput={(params) => <TextField {...params} label="Type" size="small" />}
                    sx={{ width: 200 }}
                />
                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={createNewPackage}
                >
                    Add New Package
                </Button>
            </Box>

            {/* Table */}
            <Paper>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedRows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.title}</TableCell>
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell>{row.duration}</TableCell>
                                    <TableCell>{row.cost}</TableCell>
                                    <TableCell align="center">
                                        <IconButton color="warning" onClick={() => handleView(row.id)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton color="primary" onClick={() => handleEdit(row.id)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error">
                                            <LocationOffIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {paginatedRows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No packages found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredPackages.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 20]}
                />
            </Paper>

            {/* Dialog (Optional) */}
            <PackageDialog
                open={dialogOpen}
                singleRowData={singleRowData}
                newD={newD}
                handleClose={() => {
                    setSingleRowData({});
                    setNewD(false);
                    setDialogOpen(false);
                }}
            />
        </Container>
    );
};

export default AllPackages;

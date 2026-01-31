import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Collapse,
    IconButton,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Grid,
    Alert,
    Snackbar,
    FormControlLabel,
    Checkbox,
    Divider,
    Chip,
    Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { CONFIG_STR } from '../../configuration';
import { getAllPackages } from '../../api/packageAPI';
import { useDispatch, useSelector } from 'react-redux';
import { setNewPackageInfo } from '../../reduxcomponents/slices/packagesSlice';
import FilteredObject from './FilteredObject';
import SelectedPkg from './SelectedPkg';
import useDebounce from '../../utils/useDebounce';

const steps = ['Location & Package', 'Customer Info', 'Trip Details', 'Review & Submit'];

const CreateItinerary = () => {
    const dispatch = useDispatch();
    const { fetchSelectedInquiry: inquiryData } = useSelector((state) => state.inquiries);

    // Filter bar collapse state
    const [filterExpanded, setFilterExpanded] = useState(true);

    // Stepper state
    const [activeStep, setActiveStep] = useState(0);

    // Filter and data states
    const [filterObject, setFilterObject] = useState({
        location: '',
        duration: 3,
        locationSecond: '',
        sandakphuTrek: '',
        sandakphuRover: '',
        rangeValue: [0, 20000]
    });

    const [customerInput, setCustomerInput] = useState({
        name: inquiryData.guest_name || '',
        phone: inquiryData.guest_phone || '',
        email: inquiryData.guest_email || '',
        startDate: inquiryData.arrival_date || '',
        hotel: '',
        car: '',
        carCount: 0,
        pax: inquiryData.pax || 0,
        days: 0,
        rooms: 0,
        trekRate: 0,
        landRate: '',
        transportUpDown: false,
        transportUp: false,
        transportDown: false,
        porterSandakphu: false,
        porterSandakphuPhalut: false
    });

    const [initialData, setInitialData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [secondDropdownOptions, setSecondDropdownOptions] = useState([]);
    const [cardClicked, setCardClicked] = useState(false);
    const [selectedCard, setSelectedCard] = useState({});
    const [totalQuotetionCost, setTotalQuotetionCost] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [loading, setLoading] = useState(false);
    const [seasonRate, setSeasonRate] = useState('rack');

    // Validation states
    const [errors, setErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const debouncedFilterObject = useDebounce(filteredData, 1000);

    // Fetch packages on mount
    React.useEffect(() => {
        fetchPackages();
    }, []);

    // Calculate costs when inputs change
    React.useEffect(() => {
        if (filterObject.location === 'Sandakphu') {
            if (filterObject.locationSecond === 'Trek') {
                calculateSandakphuTrekCost();
            } else if (filterObject.locationSecond === 'Land Rover') {
                calculateSandakphuLandRoverCost();
            } else {
                calculateTotalCost();
            }
        } else {
            calculateTotalCost();
        }
        if (customerInput.days > 0) {
            dispatch(setNewPackageInfo({ duration: Number(customerInput.days) }));
        }
    }, [filterObject, customerInput]);

    // Apply season rate
    React.useEffect(() => {
        applySeasonRate(seasonRate);
    }, [totalCost, seasonRate]);

    const fetchPackages = async () => {
        setLoading(true);
        const start = Date.now();

        try {
            const res = await getAllPackages();
            let allData = [];

            const processPackages = (location, priceExtractor) => {
                res.data
                    .filter(pkg => pkg.location === location)
                    .forEach(pkg => {
                        allData.push({
                            id: pkg._id,
                            location: pkg.location,
                            locSecond: pkg.type,
                            title: pkg.label,
                            duration: pkg.duration,
                            price: priceExtractor(pkg),
                            overview: pkg?.details?.overview,
                            itinerary: pkg?.details?.shortItinerary,
                            inclusions: pkg?.details?.cost?.inclusions,
                            exclusions: pkg?.details?.cost?.exclusions
                        });
                    });
            };

            processPackages('Sandakphu', pkg => pkg?.type === 'Trek' ? pkg?.details?.cost?.singleCost : pkg?.details?.cost?.multipleCost[0]?.Budget);
            processPackages('Sikkim', pkg => pkg?.details?.cost?.valueCost[2]?.price);
            processPackages('North Sikkim', pkg => pkg?.details?.cost?.valueCost[2]?.price);

            setInitialData(allData);
        } catch (err) {
            console.error("Get packages error:", err);
            showError("Failed to load packages. Please try again.");
        } finally {
            const elapsed = Date.now() - start;
            const delay = Math.max(1000 - elapsed, 0);
            setTimeout(() => setLoading(false), delay);
        }
    };

    const calculateTotalCost = () => {
        const days = Number(customerInput.days) || 0;
        const carPrice = CONFIG_STR.additionalCosts.car.find(c => c.type === customerInput.car)?.cost || 0;
        const carCount = Number(customerInput.carCount) || 0;
        const hotelPrice = CONFIG_STR.additionalCosts.hotel.find(h => h.type === customerInput.hotel)?.cost || 0;
        const rooms = Number(customerInput.rooms) || 0;
        const pax = Number(customerInput.pax) || 0;

        if (days > 0) {
            let calculatedCost = ((days * (carPrice * carCount)) + ((days - 1) * ((hotelPrice * rooms) + ((pax % rooms) * 500)))) * 1.2;

            if (filterObject.location === 'North Sikkim') {
                calculatedCost *= 1.05;
            } else if (filterObject.location === 'Darjeeling') {
                calculatedCost *= 0.95;
            }

            setTotalCost(calculatedCost);
        } else {
            setTotalCost(0);
        }
    };

    const calculateSandakphuTrekCost = () => {
        const pax = Number(customerInput.pax) || 0;
        const rate = Number(customerInput.trekRate) || 0;
        let totalCost = rate * pax;
        let numCars = Math.ceil(pax / 8);
        let transportCost = 0;

        if (customerInput.transportUpDown) {
            transportCost += 12000 * numCars;
        } else {
            if (customerInput.transportUp) transportCost += 5000 * numCars;
            if (customerInput.transportDown) transportCost += 7000 * numCars;
        }

        if (customerInput.porterSandakphu) totalCost += 4000;
        if (customerInput.porterSandakphuPhalut) totalCost += 4000;

        totalCost += transportCost;
        totalCost *= 1.2;
        setTotalCost(totalCost);
    };

    const calculateSandakphuLandRoverCost = () => {
        const pax = Number(customerInput.pax) || 0;
        let rate = 0;
        let extraCharge = 0;

        switch (customerInput.landRate) {
            case "Sandakphu_Budget":
                rate = 8500;
                extraCharge = 2400;
                break;
            case "Sandakphu_Standard":
                rate = 8500;
                extraCharge = 3500;
                break;
            case "Sandakphu_Phalut_Budget":
                rate = 13500;
                extraCharge = 3600;
                break;
            case "Sandakphu_Phalut_Standard":
                rate = 13500;
                extraCharge = 5200;
                break;
            default:
                rate = 0;
                extraCharge = 0;
        }

        let totalCost = 0;

        if (pax > 0 && pax <= 6) {
            let perhead = pax > 0 ? (rate / pax) + extraCharge : 0;
            totalCost = perhead * pax;
        } else {
            totalCost = (rate * Math.ceil(pax / 6)) + (extraCharge * pax);
        }

        let numCars = Math.ceil(pax / 8);
        let transportCost = 0;

        if (customerInput.transportUpDown) {
            transportCost += 9000 * numCars;
        } else {
            if (customerInput.transportUp) transportCost += 4500 * numCars;
            if (customerInput.transportDown) transportCost += 4500 * numCars;
        }

        if (customerInput.porterSandakphu) totalCost += 4000;
        if (customerInput.porterSandakphuPhalut) totalCost += 4000;

        totalCost += transportCost;
        totalCost *= 1.2;

        setTotalCost(totalCost);
    };

    const applySeasonRate = (rateType) => {
        let finalCost = totalCost;

        switch (rateType) {
            case 'final':
                finalCost *= 0.9;
                break;
            case 'peak':
                finalCost *= 1.5;
                break;
            case 'offSeason':
                finalCost *= 0.95;
                break;
            case 'b2b':
                finalCost *= filterObject.location === 'Sandakphu' ? 0.95 : 0.9;
                break;
            default:
                break;
        }
        setTotalQuotetionCost(finalCost);
    };

    const handleDropdownChange = (event, arg) => {
        event.preventDefault();
        const value = event.target.value;
        setLoading(true);
        const start = Date.now();

        switch (arg) {
            case 'locationChange':
                dispatch(setNewPackageInfo({ location: value }));
                setFilterObject((prev) => ({
                    ...prev,
                    locationSecond: '',
                    location: value,
                }));
                const locData = initialData.filter((loc) => loc.location === value);
                setFilteredData(locData);

                if (value === 'Sikkim' || value === 'North Sikkim') {
                    setSecondDropdownOptions(['All', 'Tour', 'Adventure', 'Honeymoon', 'Others']);
                } else if (value === 'Sandakphu') {
                    setSecondDropdownOptions(['All', 'Trek', 'Land Rover']);
                } else if (value === 'Darjeeling') {
                    setSecondDropdownOptions(['All', 'Darjeeling', 'Kalimpong', 'Kurseong', 'Dooars']);
                } else {
                    setSecondDropdownOptions([]);
                }
                break;

            case 'locationSecondChange':
                dispatch(setNewPackageInfo({ type: value }));
                setFilterObject((prev) => ({
                    ...prev,
                    sandakphuTrek: '',
                    sandakphuRover: '',
                    locationSecond: value,
                }));

                const currentLocation = filterObject.location;
                const locDataSecond = initialData.filter(loc => loc.location === currentLocation);
                setFilteredData(value === 'All' ? locDataSecond : locDataSecond.filter(loc => loc.locSecond === value));
                break;

            case 'trekChange':
            case 'roverChange':
                setFilterObject((prev) => ({
                    ...prev,
                    [arg === 'trekChange' ? 'sandakphuTrek' : 'sandakphuRover']: value,
                }));
                break;

            default:
                break;
        }

        const elapsed = Date.now() - start;
        const delay = Math.max(1000 - elapsed, 0);
        setTimeout(() => setLoading(false), delay);
    };

    const handleCustomerInputChange = (event) => {
        const { name, type, value, checked } = event.target;
        const newValue = type === "checkbox" ? checked : value;

        // Clear error for this field
        setErrors(prev => ({ ...prev, [name]: '' }));

        setCustomerInput((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const handleCardClick = (title, locn, sndLoc) => {
        const selectCard = initialData.find(loc => loc.title === title && loc.location === locn && loc.locSecond === sndLoc);
        setSelectedCard(selectCard || {});
        setCardClicked(true);
    };

    const handleBack = () => {
        setCardClicked(false);
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setOpenSnackbar(true);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    // Validation functions
    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 0: // Location & Package
                if (!filterObject.location) {
                    newErrors.location = 'Please select a location';
                }
                if (!filterObject.locationSecond) {
                    newErrors.locationSecond = 'Please select a package type';
                }
                break;

            case 1: // Customer Info
                if (!customerInput.name || customerInput.name.trim().length < 2) {
                    newErrors.name = 'Name must be at least 2 characters';
                }
                if (!customerInput.phone || !/^\d{10}$/.test(customerInput.phone)) {
                    newErrors.phone = 'Phone must be 10 digits';
                }
                if (!customerInput.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInput.email)) {
                    newErrors.email = 'Please enter a valid email';
                }
                if (!customerInput.startDate) {
                    newErrors.startDate = 'Please select a start date';
                }
                break;

            case 2: // Trip Details
                if (filterObject.location === 'Sandakphu') {
                    if (!customerInput.pax || customerInput.pax < 1) {
                        newErrors.pax = 'Pax must be at least 1';
                    }
                    if (filterObject.locationSecond === 'Trek' && !customerInput.trekRate) {
                        newErrors.trekRate = 'Please select a trek rate';
                    }
                    if (filterObject.locationSecond === 'Land Rover' && !customerInput.landRate) {
                        newErrors.landRate = 'Please select a land rover rate';
                    }
                } else {
                    if (!customerInput.pax || customerInput.pax < 1) {
                        newErrors.pax = 'Pax must be at least 1';
                    }
                    if (!customerInput.days || customerInput.days < 1) {
                        newErrors.days = 'Days must be at least 1';
                    }
                    if (!customerInput.rooms || customerInput.rooms < 1) {
                        newErrors.rooms = 'Rooms must be at least 1';
                    }
                    if (!customerInput.hotel) {
                        newErrors.hotel = 'Please select a hotel type';
                    }
                    if (!customerInput.car) {
                        newErrors.car = 'Please select a car type';
                    }
                    if (!customerInput.carCount || customerInput.carCount < 1) {
                        newErrors.carCount = 'Car count must be at least 1';
                    }
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
            showError('Please fix the errors before proceeding');
        }
    };

    const handleBackStep = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setFilterObject({
            location: '',
            duration: 0,
            locationSecond: '',
            sandakphuTrek: '',
            sandakphuRover: '',
            rangeValue: [0, 20000]
        });
        setCustomerInput({
            name: '',
            phone: '',
            email: '',
            startDate: '',
            hotel: '',
            car: '',
            carCount: 0,
            pax: 0,
            days: 0,
            rooms: 0,
            trekRate: 0,
            landRate: '',
            transportUpDown: false,
            transportUp: false,
            transportDown: false,
            porterSandakphu: false,
            porterSandakphuPhalut: false
        });
        setTotalQuotetionCost(0);
        setErrors({});
        setCardClicked(false);
    };

    const handleSubmit = () => {
        // Implement submission logic here
        showError('Itinerary created successfully!');
        // Reset or navigate as needed
    };

    // Render step content
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Select Location & Package Type
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth error={!!errors.location}>
                                    <InputLabel>Location</InputLabel>
                                    <Select
                                        value={filterObject.location}
                                        onChange={(e) => handleDropdownChange(e, 'locationChange')}
                                        label="Location"
                                    >
                                        <MenuItem value={'Darjeeling'}>Darjeeling</MenuItem>
                                        <MenuItem value={'Sikkim'}>Sikkim</MenuItem>
                                        <MenuItem value={'North Sikkim'}>North Sikkim</MenuItem>
                                        <MenuItem value={'Sandakphu'}>Sandakphu</MenuItem>
                                    </Select>
                                    {errors.location && <Typography variant="caption" color="error">{errors.location}</Typography>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth disabled={!filterObject.location} error={!!errors.locationSecond}>
                                    <InputLabel>Package Type</InputLabel>
                                    <Select
                                        value={filterObject.locationSecond}
                                        onChange={(e) => handleDropdownChange(e, 'locationSecondChange')}
                                        label="Package Type"
                                    >
                                        {secondDropdownOptions?.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.locationSecond && <Typography variant="caption" color="error">{errors.locationSecond}</Typography>}
                                </FormControl>
                            </Grid>

                            {filterObject.location === 'Sandakphu' && filterObject.locationSecond === 'Trek' && (
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Trek Package</InputLabel>
                                        <Select
                                            value={filterObject.sandakphuTrek}
                                            onChange={(e) => handleDropdownChange(e, 'trekChange')}
                                            label="Trek Package"
                                        >
                                            {CONFIG_STR?.sandakphuPackages.filter(trkPkg => (trkPkg.type === 'Trek'))
                                                .map((trkPkg) => (
                                                    <MenuItem key={trkPkg.url} value={trkPkg.url}>
                                                        {trkPkg.label}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {filterObject.location === 'Sandakphu' && filterObject.locationSecond === 'Land Rover' && (
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Land Rover Package</InputLabel>
                                        <Select
                                            value={filterObject.sandakphuRover}
                                            onChange={(e) => handleDropdownChange(e, 'roverChange')}
                                            label="Land Rover Package"
                                        >
                                            {CONFIG_STR?.sandakphuPackages.filter(rvrPkg => (rvrPkg.type === 'LandRover'))
                                                .map((rvrPkg) => (
                                                    <MenuItem key={rvrPkg.url} value={rvrPkg.url}>
                                                        {rvrPkg.label}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>

                        {filterObject.location && filterObject.locationSecond && !cardClicked && (
                            <Box mt={4}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                    Available Packages
                                </Typography>
                                <FilteredObject
                                    filteredData={debouncedFilterObject}
                                    handleCardClick={handleCardClick}
                                    filteredLocation={filterObject.location}
                                    loading={loading}
                                />
                            </Box>
                        )}

                        {cardClicked && (
                            <Box mt={4}>
                                <SelectedPkg
                                    selectedCard={selectedCard}
                                    cardClicked={cardClicked}
                                    setCardClicked={setCardClicked}
                                    handleBack={handleBack}
                                    customerInput={customerInput}
                                    setCustomerInput={setCustomerInput}
                                    totalQuotetionCost={totalQuotetionCost}
                                />
                            </Box>
                        )}
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Customer Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="name"
                                    label="Full Name"
                                    value={customerInput.name}
                                    onChange={handleCustomerInputChange}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="phone"
                                    label="Phone Number"
                                    value={customerInput.phone}
                                    onChange={handleCustomerInputChange}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    value={customerInput.email}
                                    onChange={handleCustomerInputChange}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="startDate"
                                    label="Start Date"
                                    type="date"
                                    value={customerInput.startDate}
                                    onChange={handleCustomerInputChange}
                                    error={!!errors.startDate}
                                    helperText={errors.startDate}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Trip Details
                        </Typography>

                        {filterObject.location !== 'Sandakphu' ? (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        name="pax"
                                        label="Number of Passengers"
                                        type="number"
                                        value={customerInput.pax}
                                        onChange={handleCustomerInputChange}
                                        error={!!errors.pax}
                                        helperText={errors.pax}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        name="days"
                                        label="Number of Days"
                                        type="number"
                                        value={customerInput.days}
                                        onChange={handleCustomerInputChange}
                                        error={!!errors.days}
                                        helperText={errors.days}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        name="rooms"
                                        label="Number of Rooms"
                                        type="number"
                                        value={customerInput.rooms}
                                        onChange={handleCustomerInputChange}
                                        error={!!errors.rooms}
                                        helperText={errors.rooms}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth error={!!errors.hotel}>
                                        <InputLabel>Hotel Type</InputLabel>
                                        <Select
                                            name="hotel"
                                            value={customerInput.hotel}
                                            onChange={handleCustomerInputChange}
                                            label="Hotel Type"
                                        >
                                            {CONFIG_STR.additionalCosts.hotel.map((ht, index) => (
                                                <MenuItem value={ht.type} key={index}>{ht.type}</MenuItem>
                                            ))}
                                        </Select>
                                        {errors.hotel && <Typography variant="caption" color="error">{errors.hotel}</Typography>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth error={!!errors.car}>
                                        <InputLabel>Car Type</InputLabel>
                                        <Select
                                            name="car"
                                            value={customerInput.car}
                                            onChange={handleCustomerInputChange}
                                            label="Car Type"
                                        >
                                            {CONFIG_STR.additionalCosts.car.map((cr, index) => (
                                                <MenuItem value={cr.type} key={index}>{cr.type}</MenuItem>
                                            ))}
                                        </Select>
                                        {errors.car && <Typography variant="caption" color="error">{errors.car}</Typography>}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        name="carCount"
                                        label="Number of Cars"
                                        type="number"
                                        value={customerInput.carCount}
                                        onChange={handleCustomerInputChange}
                                        error={!!errors.carCount}
                                        helperText={errors.carCount}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            name="pax"
                                            label="Number of Passengers"
                                            type="number"
                                            value={customerInput.pax}
                                            onChange={handleCustomerInputChange}
                                            error={!!errors.pax}
                                            helperText={errors.pax}
                                            required
                                        />
                                    </Grid>

                                    {filterObject.locationSecond === 'Trek' && (
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth error={!!errors.trekRate}>
                                                <InputLabel>Trek Rate</InputLabel>
                                                <Select
                                                    name="trekRate"
                                                    value={customerInput.trekRate}
                                                    onChange={handleCustomerInputChange}
                                                    label="Trek Rate"
                                                >
                                                    <MenuItem value={9600}>Sandakphu Rate (₹9,600/-)</MenuItem>
                                                    <MenuItem value={12800}>Sandakphu-Phalut Rate (₹12,800/-)</MenuItem>
                                                </Select>
                                                {errors.trekRate && <Typography variant="caption" color="error">{errors.trekRate}</Typography>}
                                            </FormControl>
                                        </Grid>
                                    )}

                                    {filterObject.locationSecond === 'Land Rover' && (
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth error={!!errors.landRate}>
                                                <InputLabel>Land Rover Rate</InputLabel>
                                                <Select
                                                    name="landRate"
                                                    value={customerInput.landRate}
                                                    onChange={handleCustomerInputChange}
                                                    label="Land Rover Rate"
                                                >
                                                    <MenuItem value={"Sandakphu_Budget"}>Sandakphu (Budget)</MenuItem>
                                                    <MenuItem value={"Sandakphu_Standard"}>Sandakphu (Standard)</MenuItem>
                                                    <MenuItem value={"Sandakphu_Phalut_Budget"}>Sandakphu-Phalut (Budget)</MenuItem>
                                                    <MenuItem value={"Sandakphu_Phalut_Standard"}>Sandakphu-Phalut (Standard)</MenuItem>
                                                </Select>
                                                {errors.landRate && <Typography variant="caption" color="error">{errors.landRate}</Typography>}
                                            </FormControl>
                                        </Grid>
                                    )}
                                </Grid>

                                <Box mt={3}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                        Add-ons (Optional)
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="transportUpDown"
                                                        checked={customerInput.transportUpDown}
                                                        onChange={handleCustomerInputChange}
                                                    />
                                                }
                                                label="Transport (Up & Down)"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="transportUp"
                                                        checked={customerInput.transportUp}
                                                        onChange={handleCustomerInputChange}
                                                    />
                                                }
                                                label={filterObject.locationSecond === 'Trek' ? "Transport (Siliguri-Dhotry)" : "Transport (Up)"}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="transportDown"
                                                        checked={customerInput.transportDown}
                                                        onChange={handleCustomerInputChange}
                                                    />
                                                }
                                                label={filterObject.locationSecond === 'Trek' ? "Transport (Srikhola-Siliguri)" : "Transport (Down)"}
                                            />
                                        </Grid>
                                        {filterObject.locationSecond === 'Trek' && (
                                            <>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                name="porterSandakphu"
                                                                checked={customerInput.porterSandakphu}
                                                                onChange={handleCustomerInputChange}
                                                            />
                                                        }
                                                        label="Porter (Sandakphu)"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                name="porterSandakphuPhalut"
                                                                checked={customerInput.porterSandakphuPhalut}
                                                                onChange={handleCustomerInputChange}
                                                            />
                                                        }
                                                        label="Porter (Sandakphu-Phalut)"
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                </Box>
                            </>
                        )}
                    </Box>
                );

            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Review & Cost Summary
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                            Customer Details
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Name:</Typography>
                                                <Typography variant="body2" fontWeight={500}>{customerInput.name}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Phone:</Typography>
                                                <Typography variant="body2" fontWeight={500}>{customerInput.phone}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Email:</Typography>
                                                <Typography variant="body2" fontWeight={500}>{customerInput.email}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Start Date:</Typography>
                                                <Typography variant="body2" fontWeight={500}>{customerInput.startDate}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                            Trip Details
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Location:</Typography>
                                                <Typography variant="body2" fontWeight={500}>{filterObject.location}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Package Type:</Typography>
                                                <Typography variant="body2" fontWeight={500}>{filterObject.locationSecond}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Passengers:</Typography>
                                                <Typography variant="body2" fontWeight={500}>{customerInput.pax}</Typography>
                                            </Box>
                                            {filterObject.location !== 'Sandakphu' && (
                                                <>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">Days:</Typography>
                                                        <Typography variant="body2" fontWeight={500}>{customerInput.days}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">Rooms:</Typography>
                                                        <Typography variant="body2" fontWeight={500}>{customerInput.rooms}</Typography>
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12}>
                                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 600 }}>
                                            Cost Breakdown
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>Base Cost:</Typography>
                                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                                ₹{totalCost.toFixed(2)}
                                            </Typography>
                                        </Box>

                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel sx={{ color: '#fff' }}>Season Rate</InputLabel>
                                            <Select
                                                value={seasonRate}
                                                onChange={(e) => setSeasonRate(e.target.value)}
                                                label="Season Rate"
                                                sx={{
                                                    color: '#fff',
                                                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                                                    '.MuiSvgIcon-root': { color: '#fff' }
                                                }}
                                            >
                                                <MenuItem value="rack">Rack Rate (₹{totalCost.toFixed(2)})</MenuItem>
                                                <MenuItem value="final">Final Rate (₹{(totalCost * 0.9).toFixed(2)})</MenuItem>
                                                {filterObject.location !== 'Sandakphu' && (
                                                    <>
                                                        <MenuItem value="peak">Peak Rate (₹{(totalCost * 1.5).toFixed(2)})</MenuItem>
                                                        <MenuItem value="offSeason">Off Season (₹{(totalCost * 0.95).toFixed(2)})</MenuItem>
                                                    </>
                                                )}
                                                <MenuItem value="b2b">B2B (₹{(totalCost * (filterObject.location === 'Sandakphu' ? 0.95 : 0.9)).toFixed(2)})</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', my: 2 }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>Final Quotation:</Typography>
                                            <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 700 }}>
                                                ₹{totalQuotetionCost.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                );

            default:
                return 'Unknown step';
        }
    };

    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, py: 3, mb: 10 }}>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Create Itinerary
                </Typography>
            </Box>

            {/* Collapsible Filter Bar */}
            <Card
                sx={{
                    mb: 4,
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
            >
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                    onClick={() => setFilterExpanded(!filterExpanded)}
                >
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                        Quick Filters
                    </Typography>
                    <IconButton sx={{ color: '#fff' }}>
                        {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
                <Collapse in={filterExpanded}>
                    <CardContent sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Location</InputLabel>
                                    <Select
                                        value={filterObject.location}
                                        onChange={(e) => handleDropdownChange(e, 'locationChange')}
                                        label="Location"
                                    >
                                        <MenuItem value={'Darjeeling'}>Darjeeling</MenuItem>
                                        <MenuItem value={'Sikkim'}>Sikkim</MenuItem>
                                        <MenuItem value={'North Sikkim'}>North Sikkim</MenuItem>
                                        <MenuItem value={'Sandakphu'}>Sandakphu</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small" disabled={!filterObject.location}>
                                    <InputLabel>Package Type</InputLabel>
                                    <Select
                                        value={filterObject.locationSecond}
                                        onChange={(e) => handleDropdownChange(e, 'locationSecondChange')}
                                        label="Package Type"
                                    >
                                        {secondDropdownOptions?.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="pax"
                                    label="Passengers"
                                    type="number"
                                    value={customerInput.pax || ''}
                                    onChange={handleCustomerInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="startDate"
                                    label="Start Date"
                                    type="date"
                                    value={customerInput.startDate}
                                    onChange={handleCustomerInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                        {(filterObject.location || customerInput.pax > 0) && (
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {filterObject.location && (
                                    <Chip
                                        label={`Location: ${filterObject.location}`}
                                        onDelete={() => {
                                            setFilterObject(prev => ({ ...prev, location: '', locationSecond: '' }));
                                            setFilteredData([]);
                                        }}
                                        color="primary"
                                        size="small"
                                    />
                                )}
                                {filterObject.locationSecond && (
                                    <Chip
                                        label={`Type: ${filterObject.locationSecond}`}
                                        onDelete={() => setFilterObject(prev => ({ ...prev, locationSecond: '' }))}
                                        color="primary"
                                        size="small"
                                    />
                                )}
                                {customerInput.pax > 0 && (
                                    <Chip
                                        label={`Pax: ${customerInput.pax}`}
                                        onDelete={() => setCustomerInput(prev => ({ ...prev, pax: 0 }))}
                                        color="secondary"
                                        size="small"
                                    />
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Collapse>
            </Card>

            {/* Stepper */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Step Content */}
                    <Box sx={{ minHeight: 400 }}>
                        {renderStepContent(activeStep)}
                    </Box>

                    {/* Navigation Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBackStep}
                            variant="outlined"
                        >
                            Back
                        </Button>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button onClick={handleReset} variant="outlined" color="error">
                                Reset
                            </Button>
                            {activeStep === steps.length - 1 ? (
                                <Button onClick={handleSubmit} variant="contained" color="success">
                                    Submit Itinerary
                                </Button>
                            ) : (
                                <Button onClick={handleNext} variant="contained">
                                    Next
                                </Button>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Snackbar for errors */}
            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert severity="error" onClose={handleCloseSnackbar}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateItinerary;

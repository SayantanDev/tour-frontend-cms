import React, { useState, useEffect } from "react";
import FilterBar from "./FilterBar";
import FilteredObject from "./FilteredObject";
import SelectedPkg from "./SelectedPkg";
import { Divider, Box, Snackbar, Alert } from "@mui/material";
import { CONFIG_STR } from "../../configuration";
import { getAllPackages } from "../../api/packageAPI";
import { useDispatch, useSelector } from "react-redux";
import { setNewPackageInfo } from "../../reduxcomponents/slices/packagesSlice";
import useDebounce from "../../utils/useDebounce";

const CreateItinerary = () => {
    const dispatch = useDispatch();
    const { fetchSelectedInquiry: inquiryData } = useSelector((state) => state.inquiries);

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
    const [loading, setLoading] = useState(false);

    // Error message state
    const [errorMsg, setErrorMsg] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const debouncedFilterObject = useDebounce(filteredData, 1000);

    const showError = (msg) => {
        setErrorMsg(msg);
        setOpenSnackbar(true);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const fetchPackages = async () => {
        setLoading(true); // Start loading   
        const start = Date.now(); // Track start time
    
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
            const delay = Math.max(1000 - elapsed, 0); // Wait if less than 1 second
    
            setTimeout(() => {
                setLoading(false); // Only hide spinner after 1 sec total
            }, delay);
        }
    };
        

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleDropdownChange = (event, arg) => {
        event.preventDefault();
        const value = event.target.value;
        setLoading(true); // Start loading   
        const start = Date.now(); // Track start time

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
            const delay = Math.max(1000 - elapsed, 0); // Wait if less than 1 second
    
            setTimeout(() => {
                setLoading(false); // Only hide spinner after 1 sec total
            }, delay);
    };

    const handleRangeChange = (event, newValue) => {
        setFilterObject((prev) => ({
            ...prev,
            rangeValue: newValue,
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

    const handleCustomerInputChange = (event) => {
        event.preventDefault();
        const { name, type, value, checked } = event.target;
        const newValue = type === "checkbox" ? checked : value;

        // Basic validation example
        if (name === 'phone' && isNaN(value)) {
            showError("Phone number should be numeric.");
            return;
        }

        if (name === 'email' && value && !value.includes('@')) {
            showError("Invalid email address.");
            return;
        }

        setCustomerInput((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    return (
        <Box display="flex">
            <Box position="relative" height="calc(100vh - 100px)">
                <FilterBar
                    CONFIG_STR={CONFIG_STR}
                    filterObject={filterObject}
                    setFilterObject={setFilterObject}
                    handleDropdownChange={handleDropdownChange}
                    secondDropdownOptions={secondDropdownOptions}
                    handleRangeChange={handleRangeChange}
                    setFilteredData={setFilteredData}
                    handleCustomerInputChange={handleCustomerInputChange}
                    customerInput={customerInput}
                    setCustomerInput={setCustomerInput}
                    totalQuotetionCost={totalQuotetionCost}
                    setTotalQuotetionCost={setTotalQuotetionCost}
                />
                {cardClicked && (
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bgcolor="rgba(255, 255, 255, 0.7)"
                        zIndex={1}
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box flex="0 0 70%" display="flex" alignItems="flex-start" justifyContent="center">
                {!cardClicked && (
                    <FilteredObject
                        filteredData={debouncedFilterObject}
                        handleCardClick={handleCardClick}
                        filteredLocation={filterObject.location}
                        loading={loading}
                    />
                )}
                {cardClicked && (
                    <SelectedPkg
                        selectedCard={selectedCard}
                        cardClicked={cardClicked}
                        setCardClicked={setCardClicked}
                        handleBack={handleBack}
                        customerInput={customerInput}
                        totalQuotetionCost={totalQuotetionCost}
                    />
                )}
            </Box>

            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert severity="error" onClose={handleCloseSnackbar}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateItinerary;

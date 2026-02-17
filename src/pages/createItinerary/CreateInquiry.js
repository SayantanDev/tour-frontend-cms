import React, { useState, useEffect, useRef } from 'react';

import {
    Box, Grid, TextField, Button, Typography, IconButton,
    Collapse, Card, CardContent,
    Alert, Snackbar, CircularProgress, Backdrop, Dialog, DialogTitle, DialogContent,
    DialogActions, Skeleton,
} from '@mui/material';
import {
    ChevronLeft, ChevronRight, Save, Clear, PictureAsPdf,
    Email, SaveAlt, Edit as EditIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPackages } from '../../api/packageAPI';
import { getAllHotels } from '../../api/hotelAPI';
import { setAllHotels } from '../../reduxcomponents/slices/hotelsSlice';
import { setAllPackages } from '../../reduxcomponents/slices/packagesSlice';
import axios from '../../api/interceptor';
import PdfPreview from './PdfPreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import GuestInfoCard from './cards/GuestInfoCard';
import TripDetailsCard from './cards/TripDetailsCard';
import SelectedPackageCard from './cards/SelectedPackageCard';
import ItineraryCard from './cards/ItineraryCard';
import HotelSelectionCard from './cards/HotelSelectionCard';
import CostEstimateCard from './cards/CostEstimateCard';
import {
    filterPackages,
    calculatePackageCost,
    updateItineraryByDuration,
    prePopulateHotelSelections,
    calculatePdfDimensions,
    extractItineraryFromPackage,
    validateForm as validateFormData,
    buildPayload as buildPayloadData,
    generatePdfFilename,
    validateDraftRequirements,
    resetHotelSelections,
    updateItineraryItem,
    updateHotelSelection,
    totalCost,
    hotelCostCalculation,
    calculateCarCost,
} from './createInquiryCalculation';

const CreateInquiry = ({ existingInquiry = null, onClose = null }) => {
    const dispatch = useDispatch();
    const allPackages = useSelector((state) => state.package.allPackages || []);
    const allHotels = useSelector((state) => state.hotels.allHotels || []);
    const configData = useSelector((state) => state.config.configData || {});
    const [currentMargin, setCurrentMargin] = useState(configData?.additionalCosts?.margin_cost_percent);
    const pdfRef = useRef(null);
    const guestNameRef = useRef(null);
    const ignoreSuggestionsRef = useRef(false);

    // Focus guest name on open
    useEffect(() => {
        if (!existingInquiry) {
            setTimeout(() => {
                guestNameRef.current?.focus();
            }, 500);
        }
    }, [existingInquiry]);

    // UI States
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [emailSending, setEmailSending] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Edit mode
    const isEditMode = Boolean(existingInquiry);

    // Form States
    const [guestInfo, setGuestInfo] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        country_code: '+91'
    });

    const [tripDetails, setTripDetails] = useState({
        pax: '',
        kids_above_5: 0,
        car_details: [], // Array of {car_name, car_count}
        location: '',
        keywords: '',
        travel_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        duration: '',
    });

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [hotelSelections, setHotelSelections] = useState({});
    const [cost, setCost] = useState(0);
    const [stayInfo, setStayInfo] = useState({
        rooms: '',
        hotel: '',
    });

    // Package Suggestions
    const [packageSuggestions, setPackageSuggestions] = useState([]);
    const [uniqueLocations, setUniqueLocations] = useState([]);
    const [itinerary, setItinerary] = useState([]);

    // Tab state for hotel selection
    const [selectedDay, setSelectedDay] = useState(0);
    const [season, setSeason] = useState('');

    // Fetch packages and hotels on mount
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load existing inquiry data if in edit mode
    useEffect(() => {
        if (existingInquiry) {
            loadExistingInquiry(existingInquiry);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingInquiry]);

    const fetchData = async () => {
        setDataLoading(true);
        try {
            const [packagesRes, hotelsRes] = await Promise.all([
                getAllPackages(),
                getAllHotels(),
            ]);

            // Save to Redux
            dispatch(setAllPackages(packagesRes.data));
            dispatch(setAllHotels(hotelsRes.data));

            // Extract unique locations from packages
            const locations = [...new Set(packagesRes.data.map(pkg => pkg.location))].filter(Boolean);
            setUniqueLocations(locations);

            showSnackbar('Data loaded successfully', 'success');
        } catch (error) {
            console.error('Error fetching data:', error);
            showSnackbar('Failed to load data. Please refresh.', 'error');
        } finally {
            setDataLoading(false);
        }
    };

    const loadExistingInquiry = (inquiry) => {
        // Load guest info
        if (inquiry.guest_info) {
            setGuestInfo({
                guest_name: inquiry.guest_info.guest_name || '',
                guest_email: inquiry.guest_info.guest_email || '',
                guest_phone: inquiry.guest_info.guest_phone || '',
            });
            setEmailAddress(inquiry.guest_info.guest_email || '');
        }

        // Load trip details
        setTripDetails({
            pax: inquiry.pax?.toString() || '',
            kids_above_5: inquiry.kids_above_5 || 0,
            car_details: inquiry.car_details || [],
            location: inquiry.destination || '',
            keywords: '',
            travel_date: inquiry.travel_date ? new Date(inquiry.travel_date).toISOString().split('T')[0] : '',
            duration: inquiry.duration?.toString() || '',
        });

        // Load stay info
        if (inquiry.stay_info) {
            setStayInfo({
                rooms: inquiry.stay_info.rooms?.toString() || '',
                hotel: inquiry.stay_info.hotel || '',
            });
        }

        // Load cost
        setCost(inquiry.cost || 0);

        // Load package if package_id exists
        if (inquiry.package_id && allPackages.length > 0) {
            const pkg = allPackages.find(p => p._id === inquiry.package_id);
            if (pkg) {
                setSelectedPackage(pkg);
            }
        }
    };

    // Advanced package filtering based on duration, location, and keyword-in-tags match
    useEffect(() => {
        if (!allPackages.length) {
            setPackageSuggestions([]);
            return;
        }

        const filtered = filterPackages(allPackages, tripDetails);
        setPackageSuggestions(filtered);

        if (ignoreSuggestionsRef.current) {
            ignoreSuggestionsRef.current = false;
            setShowSuggestions(false);
        } else if (filtered.length > 0 && (tripDetails.duration || tripDetails.location || tripDetails.keywords)) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [tripDetails.duration, tripDetails.location, tripDetails.keywords, allPackages]);

    // Update itinerary based on duration for custom packages
    useEffect(() => {
        if (!selectedPackage) {
            setItinerary(prev => updateItineraryByDuration(prev, tripDetails.duration));
        }
    }, [tripDetails.duration, selectedPackage]);

    // Auto-calculate Total Cost based on Hotel, Car and Margin selections
    useEffect(() => {
        const shortItinerary = selectedPackage?.details?.shortItinerary || [];

        const hasNorthSikkim = shortItinerary.some(item =>
            item?.tagValue?.toLowerCase().includes("lachung") ||
            item?.tagValue?.toLowerCase().includes("lachen")
        );

        const northSikkimMargin = hasNorthSikkim
            ? configData?.additionalCosts?.north_sikkim_extra : 0;

        if (tripDetails.location && tripDetails.location !== 'Sandakphu') {
            const hCost = hotelCostCalculation(hotelSelections, allHotels, season, tripDetails, stayInfo);
            const cCost = calculateCarCost(tripDetails.car_details, configData, season, tripDetails.duration);
            const tCost = totalCost(hCost, cCost, currentMargin, northSikkimMargin);
            if (tCost > 0) {
                setCost(tCost);
            }
        }
    }, [hotelSelections, tripDetails.car_details, tripDetails.duration, season, currentMargin, allHotels, configData, stayInfo, tripDetails.location]);

    const handleGuestInfoChange = (e) => {
        const { name, value } = e.target;
        setGuestInfo({
            ...guestInfo,
            [name]: value,
        });
        // Auto-fill email address for email dialog
        if (name === 'guest_email') {
            setEmailAddress(value);
        }
    };

    const handleTripDetailsChange = (e) => {
        setTripDetails({
            ...tripDetails,
            [e.target.name]: e.target.value,
        });
    };

    const handleStayInfoChange = (e) => {
        setStayInfo({
            ...stayInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handlePackageSelect = (pkg) => {
        ignoreSuggestionsRef.current = true;
        setShowSuggestions(false);

        if (!pkg || pkg._id === 'custom') {
            setSelectedPackage(null);
            setItinerary([]);
            setHotelSelections({});
            setCost(0);
            setTripDetails(prev => ({ ...prev, duration: '0' }));
            return;
        }

        setSelectedPackage(pkg);
        if (pkg.location) {
            setTripDetails(prev => ({ ...prev, location: pkg.location }));
        }
        if (pkg.duration) {
            setTripDetails(prev => ({ ...prev, duration: pkg.duration.toString() }));
        }

        // Set editable short itinerary
        const extractedItinerary = extractItineraryFromPackage(pkg.details);
        setItinerary(extractedItinerary);

        // Extract locations from shortItinerary and pre-populate hotel selections
        if (pkg.details?.shortItinerary && Array.isArray(pkg.details.shortItinerary)) {
            const newHotelSelections = prePopulateHotelSelections(pkg.details.shortItinerary, allHotels);
            setHotelSelections(newHotelSelections);
        }

        // Auto-calculate cost if package has pricing
        // const calculatedCost = (tripDetails.location === 'Sandakphu') && calculatePackageCost(pkg.details, tripDetails);
        // if (calculatedCost > 0) {
        //     setCost(calculatedCost);
        // }

        setPackageSuggestions([]);
    };

    const handleGuestReset = () => {
        setGuestInfo({
            guest_name: '',
            guest_email: '',
            guest_phone: '',
            country_code: '+91'
        });
        setTripDetails(prev => ({
            ...prev,
            pax: '',
            kids_above_5: 0,
        }));
    };

    const handleTripDetailsReset = () => {
        setTripDetails(prev => ({
            ...prev,
            location: '',
            keywords: '',
            car_details: [],
            travel_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            duration: '0'
        }));
        setStayInfo({ rooms: '', hotel: '' });
        setSelectedPackage(null);
        setCost(0);
        setItinerary([]);
        setHotelSelections({});
        setSeason('');
    };

    const handleLocationChange = (newValue) => {
        setTripDetails(prev => ({ ...prev, location: newValue || '', duration: 0 }));
        setHotelSelections({});
    };

    const handleHotelReset = () => {
        setSeason('');
        setHotelSelections(prev => resetHotelSelections(prev));
    };

    const handleHotelChange = (dayIndex, field, value) => {
        setHotelSelections(prev => updateHotelSelection(prev, dayIndex, field, value));
    };

    const handleCostChange = (e) => {
        setCost(parseFloat(e.target.value) || 0);
    };

    const handleSeasonChange = (e) => setSeason(e.target.value);

    const handleItineraryChange = (index, value) => {
        setItinerary(prev => updateItineraryItem(prev, index, value));
    };

    const handleCarDetailsChange = (carName, newCount) => {
        setTripDetails(prev => {
            const existingCarIndex = prev.car_details.findIndex(car => car.car_name === carName);
            let newCarDetails = [...prev.car_details];

            if (newCount <= 0) {
                // Remove car if count is 0 or less
                if (existingCarIndex !== -1) {
                    newCarDetails.splice(existingCarIndex, 1);
                }
            } else {
                // Update existing or add new car
                if (existingCarIndex !== -1) {
                    newCarDetails[existingCarIndex] = { ...newCarDetails[existingCarIndex], car_count: newCount };
                } else {
                    newCarDetails.push({ car_name: carName, car_count: newCount });
                }
            }

            return { ...prev, car_details: newCarDetails };
        });
    };

    const validateForm = () => {
        const validation = validateFormData(guestInfo, tripDetails, selectedPackage);
        if (!validation.isValid) {
            showSnackbar(validation.message, validation.severity);
            return false;
        }
        return true;
    };

    const buildPayload = (isDraft = false) => {
        return buildPayloadData({
            guestInfo,
            tripDetails,
            selectedPackage,
            cost,
            stayInfo,
            isDraft
        });
    };

    const handleSubmit = async (isDraft = false) => {
        if (!isDraft && !validateForm()) {
            return;
        }

        setLoading(true);

        const payload = buildPayload(isDraft);
        const QRY_URL = `${process.env.REACT_APP_BASE_URL}/queries`;
        console.log('tripDetails===>', tripDetails);
        console.log('payload===>', payload);

        //important code
        // try {
        //     if (isEditMode && existingInquiry?._id) {
        //         await axios.put(`${QRY_URL}/update/${existingInquiry._id}`, payload);
        //         showSnackbar('Inquiry updated successfully!', 'success');
        //     } else {
        //         await axios.post(`${QRY_URL}/create-queries`, payload);
        //         showSnackbar(
        //             isDraft ? 'Draft saved successfully!' : 'Inquiry created successfully!',
        //             'success'
        //         );
        //     }

        //     if (!isDraft) {
        //         setTimeout(() => {
        //             if (onClose) {
        //                 onClose();
        //             } else {
        //                 resetForm();
        //             }
        //         }, 1500);
        //     }
        // } catch (error) {
        //     console.error('Error saving inquiry:', error);
        //     showSnackbar(
        //         error.response?.data?.message || 'Failed to save inquiry',
        //         'error'
        //     );
        // } finally {
        //     setLoading(false);
        // }
    };

    const handleSaveAsDraft = () => {
        const validation = validateDraftRequirements(guestInfo);
        if (!validation.isValid) {
            showSnackbar(validation.message, validation.severity);
            return;
        }
        handleSubmit(true);
    };

    const handleExportPDF = async () => {
        if (!pdfRef.current) {
            showSnackbar('PDF preview not available', 'error');
            return;
        }

        setLoading(true);
        try {
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const { imgX, imgY, imgWidth, imgHeight } = calculatePdfDimensions(canvas, pdf);

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);

            const filename = generatePdfFilename(guestInfo.guest_name, tripDetails.location);
            pdf.save(filename);

            showSnackbar('PDF exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            showSnackbar('Failed to export PDF', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailQuotation = async () => {
        if (!emailAddress || !/\S+@\S+\.\S+/.test(emailAddress)) {
            showSnackbar('Please enter a valid email address', 'error');
            return;
        }

        setEmailSending(true);
        try {
            // Generate PDF as base64
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');

            // Send email via your backend API
            await axios.post(`${process.env.REACT_APP_BASE_URL}/email/send-quotation`, {
                to: emailAddress,
                guestName: guestInfo.guest_name,
                pdfData: imgData,
                packageName: selectedPackage?.label || 'Tour Package',
                destination: tripDetails.location,
            });

            showSnackbar(`Quotation sent successfully to ${emailAddress}!`, 'success');
            setEmailDialogOpen(false);
        } catch (error) {
            console.error('Error sending email:', error);
            showSnackbar('Failed to send email. Please try again.', 'error');
        } finally {
            setEmailSending(false);
        }
    };

    const resetForm = () => {
        setGuestInfo({
            guest_name: '',
            guest_email: '',
            guest_phone: '',
        });
        setTripDetails({
            pax: '',
            kids_above_5: 0,
            car_details: [],
            location: '',
            keywords: '',
            travel_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            duration: '0',
        });
        setSelectedPackage(null);
        setHotelSelections({});
        setCost(0);
        setStayInfo({
            rooms: '',
            hotel: '',
        });
        setEmailAddress('');
        setSeason('');
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (dataLoading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={200} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Loading Backdrop */}
            <Backdrop open={loading} sx={{ zIndex: 9999, color: '#fff' }}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Left Side - Form */}
            <Box
                sx={{
                    p: 3,
                    backgroundColor: '#f8f9fa',
                    width: '100%',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {isEditMode ? 'Edit Inquiry' : 'Create New Inquiry'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<SaveAlt />}
                            onClick={handleSaveAsDraft}
                            disabled={loading}
                            size="small"
                        >
                            Save Draft
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<PictureAsPdf />}
                            onClick={handleExportPDF}
                            disabled={loading || !selectedPackage}
                            size="small"
                        >
                            Export PDF
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Email />}
                            onClick={() => setEmailDialogOpen(true)}
                            disabled={loading || !selectedPackage}
                            size="small"
                        >
                            Email
                        </Button>
                    </Box>
                </Box>

                <GuestInfoCard
                    guestInfo={guestInfo}
                    setGuestInfo={setGuestInfo}
                    handleGuestInfoChange={handleGuestInfoChange}
                    tripDetails={tripDetails}
                    setTripDetails={setTripDetails}
                    handleTripDetailsChange={handleTripDetailsChange}
                    snackbar={snackbar}
                    guestNameRef={guestNameRef}
                    onReset={handleGuestReset}
                />

                {/* Trip Details */}
                <TripDetailsCard
                    tripDetails={tripDetails}
                    handleTripDetailsChange={handleTripDetailsChange}
                    setTripDetails={setTripDetails}
                    selectedPackage={selectedPackage}
                    stayInfo={stayInfo}
                    handleStayInfoChange={handleStayInfoChange}
                    setStayInfo={setStayInfo}
                    uniqueLocations={uniqueLocations}
                    snackbar={snackbar}
                    configData={configData}
                    onReset={handleTripDetailsReset}
                    handleLocationChange={handleLocationChange}
                    allPackages={allPackages}
                    onPackageSelect={handlePackageSelect}
                    season={season}
                    handleSeasonChange={handleSeasonChange}
                    handleCarDetailsChange={handleCarDetailsChange}
                />

                {/* Short Itinerary */}
                <ItineraryCard
                    itinerary={itinerary}
                    onItineraryChange={handleItineraryChange}
                    allPackages={allPackages}
                    onAddDay={() => {
                        setItinerary([...itinerary, '']);
                        setTripDetails(prev => ({ ...prev, duration: (parseInt(prev.duration) || 0) + 1 }));
                        setSelectedPackage(null);
                    }}
                    onRemoveDay={(index) => {
                        const newItinerary = [...itinerary];
                        newItinerary.splice(index, 1);
                        setItinerary(newItinerary);
                        setTripDetails(prev => ({ ...prev, duration: Math.max(0, (parseInt(prev.duration) || 0) - 1) }));
                        setSelectedPackage(null);
                    }}
                />



                {/* Hotel Selection by Day */}
                <HotelSelectionCard
                    tripDetails={tripDetails}
                    allHotels={allHotels}
                    hotelSelections={hotelSelections}
                    stayInfo={stayInfo}
                    season={season}
                    handleSeasonChange={handleSeasonChange}
                    handleHotelReset={handleHotelReset}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    handleHotelChange={handleHotelChange}
                />

                <CostEstimateCard
                    cost={cost}
                    handleCostChange={handleCostChange}
                    carDetails={tripDetails.car_details}
                    hotelSelections={hotelSelections}
                    allHotels={allHotels}
                    stayInfo={stayInfo}
                    tripDetails={tripDetails}
                    configData={configData}
                    season={season}
                    duration={tripDetails.duration}
                    currentMargin={currentMargin}
                    setCurrentMargin={setCurrentMargin}
                />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={isEditMode ? <EditIcon /> : <Save />}
                        onClick={() => handleSubmit(false)}
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? 'Saving...' : isEditMode ? 'Update Inquiry' : 'Create Inquiry'}
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Clear />}
                        onClick={onClose || resetForm}
                        disabled={loading}
                    >
                        {onClose ? 'Cancel' : 'Reset'}
                    </Button>
                </Box>
            </Box>

            {/* Email Dialog */}
            <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Send Quotation via Email</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        sx={{ mt: 2 }}
                        placeholder="guest@example.com"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmailDialogOpen(false)} disabled={emailSending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEmailQuotation}
                        variant="contained"
                        disabled={emailSending}
                        startIcon={emailSending ? <CircularProgress size={20} /> : <Email />}
                    >
                        {emailSending ? 'Sending...' : 'Send Email'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateInquiry;

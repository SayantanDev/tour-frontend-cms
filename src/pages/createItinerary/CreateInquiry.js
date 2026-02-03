import React, { useState, useEffect, useRef } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import {
    Box, Grid, Paper, TextField, Button, Typography, Autocomplete, IconButton,
    Collapse, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Chip,
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

const CreateInquiry = ({ existingInquiry = null, onClose = null }) => {
    const dispatch = useDispatch();
    const allPackages = useSelector((state) => state.package.allPackages || []);
    const allHotels = useSelector((state) => state.hotels.allHotels || []);
    const configData = useSelector((state) => state.config.configData || {});
    const pdfRef = useRef(null);
    const guestNameRef = useRef(null);

    // Focus guest name on open
    useEffect(() => {
        if (!existingInquiry) {
            setTimeout(() => {
                guestNameRef.current?.focus();
            }, 500);
        }
    }, [existingInquiry]);

    // UI States
    const [pdfOpen, setPdfOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [emailSending, setEmailSending] = useState(false);

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
        car_name: '',
        car_count: '',
        location: '',
        keywords: '',
        travel_date: '',
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
    const [season, setSeason] = useState('Normal Season');

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
            car_name: inquiry.car_details?.car_name || '',
            car_count: inquiry.car_details?.car_count?.toString() || '',
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

        // Prepare filters
        const days = tripDetails.duration ? parseInt(tripDetails.duration) : null;
        const keywords = tripDetails.keywords;
        const location = tripDetails.location;

        // Normalize keywords to an array of cleaned lowercase strings
        const keywordList = Array.isArray(keywords)
            ? keywords
            : (typeof keywords === "string" ? keywords.split(",") : []);

        const normalizedKeywords = keywordList
            .map(k => String(k).trim().toLowerCase())
            .filter(Boolean);

        // Normalize location
        const normalizedLocation =
            typeof location === "string" ? location.trim().toLowerCase() : "";

        // Filter packages
        const filtered = allPackages.filter(pkg => {
            if (!pkg || typeof pkg !== "object") return false;

            // --- Duration match ---
            if (typeof days === "number" && Number.isFinite(days)) {
                if (Number(pkg.duration) !== days) return false;
            }

            // --- Location match ---
            if (normalizedLocation) {
                const pkgLocation = String(pkg.location || "").trim().toLowerCase();
                if (pkgLocation !== normalizedLocation) return false;
            }

            // --- Keyword-in-tags match ---
            if (normalizedKeywords.length > 0) {
                const tags = Array.isArray(pkg.tags) ? pkg.tags : [];
                const normalizedTags = tags
                    .map(t => {
                        // Handle both string tags and object tags with tagValue
                        if (typeof t === 'string') return t.trim().toLowerCase();
                        if (typeof t === 'object' && t.tagValue) return String(t.tagValue).trim().toLowerCase();
                        if (typeof t === 'object' && t.tagName) return String(t.tagName).trim().toLowerCase();
                        return '';
                    })
                    .filter(Boolean);

                // Match if any keyword is included in any tag (partial allowed)
                const hasKeyword = normalizedKeywords.some(kw =>
                    normalizedTags.some(tag => tag.includes(kw))
                );

                if (!hasKeyword) return false;
            }

            return true;
        });

        setPackageSuggestions(filtered);
    }, [tripDetails.duration, tripDetails.location, tripDetails.keywords, allPackages]);

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
        setSelectedPackage(pkg);
        if (pkg.location) {
            setTripDetails(prev => ({ ...prev, location: pkg.location }));
        }
        if (pkg.duration) {
            setTripDetails(prev => ({ ...prev, duration: pkg.duration.toString() }));
        }

        // Set editable short itinerary
        if (pkg.details?.shortItinerary && Array.isArray(pkg.details.shortItinerary)) {
            setItinerary(pkg.details.shortItinerary.map(day =>
                typeof day === 'string' ? day : day?.tagValue || day?.tagName || ''
            ));
        } else {
            setItinerary([]);
        }

        // Extract locations from shortItinerary and pre-populate hotel selections
        if (pkg.details?.shortItinerary && Array.isArray(pkg.details.shortItinerary)) {
            const newHotelSelections = {};

            pkg.details.shortItinerary.forEach((item, index) => {
                if (item.tagValue) {
                    // Extract destination from tagValue (e.g., "Gorkhey to Srikhola" -> "Srikhola")
                    const parts = item.tagValue.split(' to ');
                    const destination = parts.length > 1 ? parts[1].trim() : parts[0].trim();

                    // Find hotels at this destination
                    const hotelsAtDestination = allHotels.filter(hotel =>
                        hotel.location?.toLowerCase().includes(destination.toLowerCase()) ||
                        hotel.sub_destination?.toLowerCase().includes(destination.toLowerCase()) ||
                        hotel.destination?.toLowerCase().includes(destination.toLowerCase())
                    );

                    // Set the first matching hotel for this day if available
                    if (hotelsAtDestination.length > 0) {
                        const firstHotel = hotelsAtDestination[0];
                        newHotelSelections[index] = {
                            location: destination,
                            hotelId: firstHotel._id,
                            price: firstHotel.category?.[0]?.season_price?.cp_plan || 0,
                            availableHotels: hotelsAtDestination
                        };
                    } else {
                        // If no hotels found, still set the location
                        newHotelSelections[index] = {
                            location: destination,
                            hotelId: '',
                            price: 0,
                            availableHotels: []
                        };
                    }
                }
            });
            setHotelSelections(newHotelSelections);
        }

        // Auto-calculate cost if package has pricing
        if (pkg.details?.cost?.valueCost?.[0]?.price) {
            const basePrice = pkg.details.cost.valueCost[0].price;
            const paxCount = parseInt(tripDetails.pax) || 1;
            setCost(basePrice * paxCount);
        }

        setPackageSuggestions([]);
    };



    const validateForm = () => {
        if (!guestInfo.guest_name.trim()) {
            showSnackbar('Please enter guest name', 'error');
            return false;
        }

        if (!guestInfo.guest_email.trim() || !/\S+@\S+\.\S+/.test(guestInfo.guest_email)) {
            showSnackbar('Please enter a valid email address', 'error');
            return false;
        }

        // Basic validation for phone number length
        if (!guestInfo.guest_phone.trim() || guestInfo.guest_phone.length < 7) {
            showSnackbar('Please enter a valid phone number', 'error');
            return false;
        }

        if (!tripDetails.pax || parseInt(tripDetails.pax) < 1) {
            showSnackbar('Please enter valid number of guests', 'error');
            return false;
        }

        if (!selectedPackage) {
            showSnackbar('Please select a package', 'error');
            return false;
        }

        if (tripDetails.travel_date) {
            const travelDate = new Date(tripDetails.travel_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (travelDate < today) {
                showSnackbar('Travel date cannot be in the past', 'warning');
            }
        }

        return true;
    };

    const buildPayload = (isDraft = false) => {
        return {
            guest_info: {
                guest_name: guestInfo.guest_name,
                guest_email: guestInfo.guest_email,
                guest_phone: `${guestInfo.country_code}${guestInfo.guest_phone}`,
            },
            pax: parseInt(tripDetails.pax),
            kids_above_5: parseInt(tripDetails.kids_above_5) || 0,
            car_details: {
                car_name: tripDetails.car_name || '',
                car_count: parseInt(tripDetails.car_count) || 0,
            },
            cost: cost,
            destination: tripDetails.location || selectedPackage?.location || '',
            duration: parseInt(tripDetails.duration) || selectedPackage?.duration || 0,
            package_id: selectedPackage._id,
            stay_info: {
                rooms: parseInt(stayInfo.rooms) || 0,
                hotel: stayInfo.hotel,
            },
            travel_date: tripDetails.travel_date || '',
            lead_source: 'website',
            lead_stage: isDraft ? 'draft' : 'new',
            verified: !isDraft,
        };
    };

    const handleSubmit = async (isDraft = false) => {
        if (!isDraft && !validateForm()) {
            return;
        }

        setLoading(true);

        const payload = buildPayload(isDraft);

        try {
            // let response;
            if (isEditMode && existingInquiry?._id) {
                // Update existing inquiry
                await axios.put(
                    `https://tour-backend-live.onrender.com/api/v1/queries/update/${existingInquiry._id}`,
                    payload
                );
                showSnackbar('Inquiry updated successfully!', 'success');
            } else {
                // Create new inquiry
                await axios.post(
                    'https://tour-backend-live.onrender.com/api/v1/queries/create-queries',
                    payload
                );
                showSnackbar(
                    isDraft ? 'Draft saved successfully!' : 'Inquiry created successfully!',
                    'success'
                );
            }

            // Don't reset form if it's a draft save
            if (!isDraft) {
                setTimeout(() => {
                    if (onClose) {
                        onClose();
                    } else {
                        resetForm();
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving inquiry:', error);
            showSnackbar(
                error.response?.data?.message || 'Failed to save inquiry',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAsDraft = () => {
        if (!guestInfo.guest_name || !guestInfo.guest_email) {
            showSnackbar('Please enter at least guest name and email to save draft', 'warning');
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
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

            const filename = `${guestInfo.guest_name || 'inquiry'}_${tripDetails.location || 'package'}_${Date.now()}.pdf`;
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
            await axios.post('https://tour-backend-live.onrender.com/api/v1/email/send-quotation', {
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
            car_name: '',
            car_count: '',
            location: '',
            keywords: '',
            travel_date: '',
            duration: '',
        });
        setSelectedPackage(null);
        setHotelSelections({});
        setCost(0);
        setStayInfo({
            rooms: '',
            hotel: '',
        });
        setEmailAddress('');
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
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* Loading Backdrop */}
            <Backdrop open={loading} sx={{ zIndex: 9999, color: '#fff' }}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Left Side - Form */}
            <Box
                sx={{
                    flex: pdfOpen ? '0 0 70%' : '1 1 100%',
                    transition: 'all 0.3s ease',
                    overflow: 'auto',
                    p: 3,
                    backgroundColor: '#f8f9fa',
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

                {/* Guest Information */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Guest Information
                        </Typography>
                        <Button
                            size="small"
                            color="warning"
                            onClick={() => {
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
                                    kids_below_5: 0
                                }));
                            }}
                        >
                            Reset
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Guest Name"
                                name="guest_name"
                                value={guestInfo.guest_name}
                                onChange={handleGuestInfoChange}
                                required
                                error={!guestInfo.guest_name && snackbar.open}
                                inputRef={guestNameRef}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Guest Email"
                                name="guest_email"
                                type="email"
                                value={guestInfo.guest_email}
                                onChange={handleGuestInfoChange}
                                required
                                error={!guestInfo.guest_email && snackbar.open}
                                helperText="Will be used for sending quotation"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={1}>
                                <Grid item xs={4}>
                                    <PhoneInput
                                        country={'in'}
                                        value={guestInfo.country_code}
                                        onChange={(phone, country) => {
                                            setGuestInfo({ ...guestInfo, country_code: `+${country.dialCode}` });
                                        }}
                                        inputStyle={{
                                            width: '100%',
                                            height: '56px',
                                            fontSize: '16px',
                                            paddingLeft: '48px',
                                            borderRadius: '4px',
                                            borderColor: 'rgba(0, 0, 0, 0.23)',
                                            backgroundColor: '#fff'
                                        }}
                                        containerStyle={{
                                            marginTop: '0px',
                                            marginBottom: '0px',
                                        }}
                                        dropdownStyle={{
                                            zIndex: 1000
                                        }}
                                        specialLabel="Code"
                                        disableDropdown={false}
                                        enableAreaCodes={true}
                                    />
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="guest_phone"
                                        value={guestInfo.guest_phone}
                                        onChange={handleGuestInfoChange}
                                        required
                                        error={!guestInfo.guest_phone && snackbar.open}
                                        type="tel"
                                    />
                                </Grid>
                            </Grid>
                            {!guestInfo.guest_phone && snackbar.open && (
                                <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                                    Phone number is required
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Adults"
                                        name="pax"
                                        type="number"
                                        value={tripDetails.pax}
                                        onChange={(e) => setTripDetails({ ...tripDetails, pax: e.target.value })}
                                        required
                                        error={!tripDetails.pax && snackbar.open}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Kid(s) (>5)"
                                        name="kids_above_5"
                                        type="number"
                                        value={tripDetails.kids_above_5}
                                        onChange={(e) => setTripDetails({ ...tripDetails, kids_above_5: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Trip Details */}
                {/* Trip Details */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Trip Details
                        </Typography>
                        <Button
                            size="small"
                            color="warning"
                            onClick={() => {
                                setTripDetails(prev => ({
                                    ...prev,
                                    location: '',
                                    keywords: '',
                                    car_name: '',
                                    car_count: '',
                                    travel_date: '',
                                    duration: ''
                                }));
                                setStayInfo({ rooms: '', hotel: '' });
                            }}
                        >
                            Reset
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={uniqueLocations}
                                value={tripDetails.location}
                                onChange={(e, newValue) => {
                                    setTripDetails({ ...tripDetails, location: newValue || '' });
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Location" placeholder="Select location" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Keywords"
                                name="keywords"
                                value={tripDetails.keywords}
                                onChange={handleTripDetailsChange}
                                placeholder="e.g., adventure, honeymoon"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Car Type</InputLabel>
                                <Select
                                    label="Car Type"
                                    name="car_name"
                                    value={tripDetails.car_name}
                                    onChange={handleTripDetailsChange}
                                >
                                    {configData?.additionalCosts?.car?.map((car, index) => (
                                        <MenuItem key={index} value={car.type}>
                                            {car.type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Car Count"
                                name="car_count"
                                type="number"
                                value={tripDetails.car_count}
                                onChange={handleTripDetailsChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Travel Date"
                                name="travel_date"
                                type="date"
                                value={tripDetails.travel_date}
                                onChange={handleTripDetailsChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Duration (Days)"
                                name="duration"
                                type="number"
                                value={tripDetails.duration}
                                onChange={handleTripDetailsChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Number of Rooms"
                                name="rooms"
                                type="number"
                                value={stayInfo.rooms}
                                onChange={handleStayInfoChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Hotel Type</InputLabel>
                                <Select
                                    name="hotel"
                                    value={stayInfo.hotel}
                                    onChange={handleStayInfoChange}
                                    label="Hotel Type"
                                >
                                    {configData?.additionalCosts?.hotel?.map((hotelType) => (
                                        <MenuItem key={hotelType.type} value={hotelType.type}>
                                            {hotelType.type}
                                        </MenuItem>
                                    )) || [
                                            <MenuItem key="Budget" value="Budget">Budget</MenuItem>,
                                            <MenuItem key="Standard" value="Standard">Standard</MenuItem>,
                                            <MenuItem key="Premium" value="Premium">Premium</MenuItem>,
                                            <MenuItem key="Luxury" value="Luxury">Luxury</MenuItem>
                                        ]}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Selected Package Info */}
                {selectedPackage && (
                    <Paper sx={{ p: 3, mb: 3, backgroundColor: '#e3f2fd' }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            Selected Package
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Chip label={selectedPackage.label} color="primary" sx={{ mr: 1 }} />
                            <Chip label={selectedPackage.location} />
                        </Box>


                    </Paper>
                )}

                {/* Short Itinerary */}
                {selectedPackage && itinerary.length > 0 && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Short Itinerary
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {itinerary.map((day, index) => (
                                <Grid container key={index} alignItems="flex-start" spacing={2}>
                                    <Grid item xs={12} md={2} sx={{ pt: '24px !important' }}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            Day {index + 1} :
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={10}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={1}
                                            value={day}
                                            onChange={(e) => {
                                                const newItinerary = [...itinerary];
                                                newItinerary[index] = e.target.value;
                                                setItinerary(newItinerary);
                                            }}
                                            placeholder={`Enter details for Day ${index + 1}`}
                                        />
                                    </Grid>
                                </Grid>
                            ))}
                        </Box>
                    </Paper>
                )}



                {/* Hotel Selection by Day */}
                {tripDetails.duration > 0 && allHotels.length > 0 && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Select Hotels Day-Wise
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Season</InputLabel>
                                    <Select
                                        value={season}
                                        label="Season"
                                        onChange={(e) => setSeason(e.target.value)}
                                    >
                                        <MenuItem value="Peak Season">Peak Season</MenuItem>
                                        <MenuItem value="Normal Season">Normal Season</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    size="small"
                                    color="warning"
                                    onClick={() => {
                                        setSeason('Normal Season');
                                        setHotelSelections(prev => {
                                            const nextState = {};
                                            Object.keys(prev).forEach(key => {
                                                if (prev[key]) {
                                                    // Preserve location and availableHotels, reset choices
                                                    nextState[key] = {
                                                        ...prev[key],
                                                        hotelId: '',
                                                        roomType: '',
                                                        mealPlan: ''
                                                    };
                                                }
                                            });
                                            return nextState;
                                        });
                                    }}
                                >
                                    Reset
                                </Button>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {Array.from({ length: parseInt(tripDetails.duration) }, (_, dayIndex) => (
                                <Box
                                    key={dayIndex}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 2,
                                        p: 2,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 2,
                                        backgroundColor: 'transparent',
                                    }}
                                >
                                    {/* Day Label on Left */}
                                    <Box
                                        sx={{
                                            minWidth: 80,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            pt: 2.5
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: 'primary.main',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setSelectedDay(dayIndex)}
                                        >
                                            Day {dayIndex + 1}
                                        </Typography>
                                    </Box>

                                    {/* Hotel Selection Fields on Right */}
                                    <Box sx={{ flex: 1 }}>
                                        <Grid container spacing={2}>
                                            {/* Step 1: Location Selection */}
                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    fullWidth
                                                    label="Location"
                                                    value={hotelSelections[dayIndex]?.location || ''}
                                                    // disabled
                                                    helperText="Location from package"
                                                    size="small"
                                                />
                                            </Grid>

                                            {/* Step 2: Hotel Selection */}
                                            <Grid item xs={12} md={3}>
                                                <Autocomplete
                                                    fullWidth
                                                    size="small"
                                                    options={allHotels}
                                                    getOptionLabel={(option) => `${option.hotel_name} (${option.sub_destination || option.location})`}
                                                    value={allHotels.find(h => h._id === hotelSelections[dayIndex]?.hotelId) || null}
                                                    onChange={(event, newValue) => {
                                                        setHotelSelections({
                                                            ...hotelSelections,
                                                            [dayIndex]: {
                                                                ...hotelSelections[dayIndex],
                                                                hotelId: newValue?._id || '',
                                                            }
                                                        });
                                                    }}
                                                    renderInput={(params) => <TextField {...params} label="Select Hotel" />}
                                                />
                                            </Grid>

                                            {/* Step 3: Room Type */}
                                            <Grid item xs={12} md={3}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Room Type</InputLabel>
                                                    <Select
                                                        value={hotelSelections[dayIndex]?.roomType || ''}
                                                        label="Room Type"
                                                        onChange={(e) => {
                                                            setHotelSelections({
                                                                ...hotelSelections,
                                                                [dayIndex]: {
                                                                    ...hotelSelections[dayIndex],
                                                                    roomType: e.target.value,
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <MenuItem value="a">a</MenuItem>
                                                        <MenuItem value="b">b</MenuItem>
                                                        <MenuItem value="c">c</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            {/* Step 4: Meal Plan */}
                                            <Grid item xs={12} md={3}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Meal Plan</InputLabel>
                                                    <Select
                                                        value={hotelSelections[dayIndex]?.mealPlan || ''}
                                                        label="Meal Plan"
                                                        onChange={(e) => {
                                                            setHotelSelections({
                                                                ...hotelSelections,
                                                                [dayIndex]: {
                                                                    ...hotelSelections[dayIndex],
                                                                    mealPlan: e.target.value,
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <MenuItem value="EP">EP (No Meals)</MenuItem>
                                                        <MenuItem value="CP">CP (Breakfast)</MenuItem>
                                                        <MenuItem value="HB">HB (Breakfast & Dinner)</MenuItem>
                                                        <MenuItem value="AP">AP (All Meals)</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>

                                        {/* Selected Hotel Summary */}
                                        {hotelSelections[dayIndex]?.hotelId && (
                                            <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                                                <Typography variant="body2">
                                                    <strong>Hotel Name:</strong>{' '}
                                                    {allHotels.find(h => h._id === hotelSelections[dayIndex]?.hotelId)?.hotel_name || 'N/A'}
                                                    {hotelSelections[dayIndex]?.roomType && (
                                                        <>
                                                            {' | '}<strong>Room Type:</strong> {hotelSelections[dayIndex].roomType}
                                                        </>
                                                    )}
                                                    {hotelSelections[dayIndex]?.mealPlan && (
                                                        <>
                                                            {' | '}<strong>Meal Plan:</strong> {hotelSelections[dayIndex].mealPlan}
                                                        </>
                                                    )}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                )}

                {/* Cost */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Cost Estimate
                    </Typography>
                    <TextField
                        fullWidth
                        label="Total Cost"
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                        }}
                    />
                </Paper>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={isEditMode ? <EditIcon /> : <Save />}
                        onClick={() => handleSubmit(false)}
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? 'Saving...' : isEditMode ? 'Update Inquiry' : 'Create Inquiry'}
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<Clear />}
                        onClick={onClose || resetForm}
                        disabled={loading}
                    >
                        {onClose ? 'Cancel' : 'Reset'}
                    </Button>
                </Box>
            </Box>

            {/* Right Side - PDF Preview */}
            <Box
                sx={{
                    flex: pdfOpen ? '0 0 30%' : '0 0 0',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    position: 'relative',
                    borderLeft: pdfOpen ? '1px solid #e0e0e0' : 'none',
                    pr: 0,
                    mr: 0,
                }}
            >
                {/* Toggle Button */}
                <IconButton
                    onClick={() => setPdfOpen(!pdfOpen)}
                    sx={{
                        position: pdfOpen ? 'absolute' : 'fixed',
                        left: pdfOpen ? -20 : 'auto',
                        right: pdfOpen ? 'auto' : 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        width: 40,
                        height: 40,
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        boxShadow: 3,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                            backgroundColor: '#1565c0',
                            transform: 'translateY(-50%)',
                        },
                    }}
                >
                    {pdfOpen ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>

                <Collapse in={pdfOpen} orientation="horizontal" sx={{ height: '100%', position: 'relative' }}>
                    <Box ref={pdfRef} sx={{ height: '100%', overflow: 'auto', position: 'relative' }}>
                        <PdfPreview
                            guestInfo={guestInfo}
                            tripDetails={tripDetails}
                            selectedPackage={selectedPackage}
                            hotelSelections={hotelSelections}
                            allHotels={allHotels}
                            cost={cost}
                        />

                        {/* Package Suggestions Overlay */}
                        {packageSuggestions.length > 0 && (tripDetails.duration || tripDetails.location || tripDetails.keywords) && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                    backdropFilter: 'blur(10px)',
                                    overflowY: 'auto',
                                    p: 3,
                                    zIndex: 5,
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                        Package Suggestions ({packageSuggestions.length})
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setTripDetails(prev => ({ ...prev, duration: '', location: '', keywords: '' }));
                                        }}
                                        sx={{
                                            backgroundColor: 'rgba(0,0,0,0.05)',
                                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
                                        }}
                                    >
                                        <Clear fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Grid container spacing={2}>
                                    {packageSuggestions.map((pkg) => (
                                        <Grid item xs={12} key={pkg._id}>
                                            <Card
                                                sx={{
                                                    cursor: 'pointer',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    border: selectedPackage?._id === pkg._id ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.1)',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                                        boxShadow: 3,
                                                        transform: 'translateY(-2px)',
                                                    },
                                                }}
                                                onClick={() => {
                                                    handlePackageSelect(pkg);
                                                    // Clear filters to hide overlay after selection
                                                    setTripDetails(prev => ({ ...prev, keywords: '' }));
                                                }}
                                            >
                                                <CardContent sx={{ p: 2 }}>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {pkg.label}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                        {pkg.location} • {pkg.duration} Days
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }} noWrap>
                                                        {typeof pkg.details?.overview === 'string'
                                                            ? pkg.details.overview.substring(0, 80) + '...'
                                                            : 'No description available'
                                                        }
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Box>
                </Collapse>
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

import React, { useState, useEffect, useRef } from 'react';

import {
    Box, Grid, TextField, Button, Typography, Alert, Snackbar, CircularProgress, Backdrop, Dialog, DialogTitle, DialogContent,
    DialogActions, Skeleton, Chip,
} from '@mui/material';
import { Save, Clear, PictureAsPdf, Email, SaveAlt, Edit as EditIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPackages, createPackage } from '../../api/packageAPI';
import { getAllHotels } from '../../api/hotelAPI';
import { setAllHotels } from '../../reduxcomponents/slices/hotelsSlice';
import { setAllPackages } from '../../reduxcomponents/slices/packagesSlice';
import { setSelectedInquiry } from '../../reduxcomponents/slices/inquirySlice';
import axios from '../../api/interceptor';
// import PdfPreview from './PdfPreview';
import GuestInfoCard from './cards/GuestInfoCard';
import TripDetailsCard from './cards/TripDetailsCard';
// import SelectedPackageCard from './cards/SelectedPackageCard';
import ItineraryCard from './cards/ItineraryCard';
import HotelSelectionCard from './cards/HotelSelectionCard';
import CarSelectionCard from './cards/CarSelectionCard';
import CostEstimateCard from './cards/CostEstimateCard';
import InquiryPreview from './InquiryPreview';
import {
    filterPackages,
    calculatePackageCost,
    updateItineraryByDuration,
    prePopulateHotelSelections,
    mapFollowupToHotelSelections,
    extractItineraryFromPackage,
    validateForm as validateFormData,
    buildPayload as buildPayloadData,
    generatePdfFilename,
    validateDraftRequirements,
    resetHotelSelections,
    updateItineraryItem,
    updateHotelSelection,
    totalCost,
    totalCostSandakphu,
    hotelCostCalculation,
    calculateCarCost,
    exportQuotationPDF,
} from './createInquiryCalculation';

const CreateInquiry = ({ existingInquiry = null, onClose = null }) => {
    const dispatch = useDispatch();
    const reduxSelectedInquiry = useSelector((state) => state.inquiries.fetchSelectedInquiry);
    const allPackages = useSelector((state) => state.package.allPackages || []);
    const allHotels = useSelector((state) => state.hotels.allHotels || []);
    const configData = useSelector((state) => state.config.configData || {});
    const isEditMode = Boolean(existingInquiry) || (reduxSelectedInquiry && Object.keys(reduxSelectedInquiry).length > 0);
    const isInitialLoad = useRef(true);
    const [currentMargin, setCurrentMargin] = useState(configData?.additionalCosts?.margin_cost_percent || 20);
    const pdfRef = useRef(null);
    const guestNameRef = useRef(null);
    const ignoreSuggestionsRef = useRef(false);

    // Sync margin when config loads
    useEffect(() => {
        if (configData?.additionalCosts?.margin_cost_percent && !isEditMode) {
            setCurrentMargin(configData.additionalCosts.margin_cost_percent);
        }
    }, [configData, isEditMode]);

    // Focus guest name on open
    useEffect(() => {
        if (!existingInquiry) {
            setTimeout(() => {
                guestNameRef.current?.focus();
            }, 500);
        }
        return () => {
            dispatch(setSelectedInquiry({}));
        };
    }, [existingInquiry, dispatch]);

    // UI States
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [emailSending, setEmailSending] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [itineraryDialogOpen, setItineraryDialogOpen] = useState(false);
    const [detailedItinerary, setDetailedItinerary] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

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
        pickup_location: 'NJP / IXB',
        dropoff_location: 'NJP / IXB',
        optional_extras: [], // Array of {name, price}
    });

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [hotelSelections, setHotelSelections] = useState({});
    const [carSelections, setCarSelections] = useState({});
    const [cost, setCost] = useState(0);
    const [stayInfo, setStayInfo] = useState({
        rooms: '',
        hotel: '',
        room_type: '',
    });

    // Package Suggestions
    const [packageSuggestions, setPackageSuggestions] = useState([]);
    const [uniqueLocations, setUniqueLocations] = useState([]);
    const [itinerary, setItinerary] = useState([]);

    // Tab state for hotel selection
    const [selectedDay, setSelectedDay] = useState(0);
    const [carSeason, setCarSeason] = useState('');
    const [hotelSeason, setHotelSeason] = useState('');

    // Fetch packages and hotels on mount
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load existing inquiry data if in edit mode
    useEffect(() => {
        const inquiryToLoad = existingInquiry || (Object.keys(reduxSelectedInquiry || {}).length > 0 ? reduxSelectedInquiry : null);
        if (inquiryToLoad) {
            loadExistingInquiry(inquiryToLoad);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingInquiry, reduxSelectedInquiry, allPackages.length > 0]);

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
        const gName = inquiry.guest_info?.guest_name || inquiry.guest_name || '';
        const gEmail = inquiry.guest_info?.guest_email || inquiry.guest_email || '';
        let gPhone = inquiry.guest_info?.guest_phone || inquiry.guest_phone || '';
        const gCountryCode = inquiry.guest_info?.guest_country_code || inquiry.guest_country_code || inquiry.country_code || '+91';

        // Separate country code from phone number if it's "punched"
        if (gPhone.startsWith(gCountryCode)) {
            gPhone = gPhone.replace(gCountryCode, '').trim();
        } else if (gPhone.startsWith('+') && !inquiry.guest_info?.guest_country_code && !inquiry.guest_country_code) {
            // If it starts with + but we didn't have a separate country code, try to guess it or just leave as is if we can't be sure
            // For now, if we have gCountryCode (default or from data), use it to strip.
        }

        setGuestInfo({
            guest_name: gName,
            guest_email: gEmail,
            guest_phone: gPhone,
            country_code: gCountryCode,
        });
        setEmailAddress(gEmail);

        const tripDetailsObj = {
            pax: (inquiry.pax || inquiry.guest_count || '')?.toString() || '',
            kids_above_5: inquiry.kids_above_5 || 0,
            car_details: inquiry.car_details || [],
            location: inquiry.destination || inquiry.location || '',
            keywords: '',
            travel_date: (inquiry.travel_date || inquiry.arrival_date) ? new Date(inquiry.travel_date || inquiry.arrival_date).toISOString().split('T')[0] : '',
            duration: inquiry.duration?.toString() || '',
            pickup_location: inquiry.pickup_location || 'NJP / IXB',
            dropoff_location: inquiry.dropoff_location || 'NJP / IXB',
            optional_extras: [
                ...(Array.isArray(inquiry.optional_extras) ? inquiry.optional_extras : []),
                ...(Array.isArray(inquiry.details?.cost?.optionalExtras) ? inquiry.details.cost.optionalExtras : []),
                ...(Array.isArray(inquiry.trip_details?.optional_extras) ? inquiry.trip_details.optional_extras : [])
            ].map(e => {
                const name = typeof e === 'object' ? (e.name || e.tagValue || e.tagName || e.label || '') : e;
                const price = typeof e === 'object' ? (e.price || 0) : 0;
                return { name: (name || '').trim(), price: Number(price || 0) };
            }).filter((item, index, self) => 
                item.name && self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase()) === index
            ),
        };

        console.log("Final Trip Details loaded:", tripDetailsObj);
        setTripDetails(tripDetailsObj);

        // Load stay info
        if (inquiry.stay_info) {
            setStayInfo({
                rooms: inquiry.stay_info.rooms?.toString() || '',
                hotel: inquiry.stay_info.hotel || '',
                room_type: inquiry.stay_info.room_type || '',
            });
        }

        // Load cost
        setCost(inquiry.cost || 0);
        setCarSeason(inquiry.car_season || 'off_season_price');
        setHotelSeason(inquiry.hotel_season || 'off_season_price');
        if (inquiry.margin !== undefined) {
            setCurrentMargin(inquiry.margin);
        }

        // Load itinerary - Priority: 1. inquiry.itinerary (if complete), 2. followup_details, 3. empty slots
        if (inquiry.itinerary && Array.isArray(inquiry.itinerary) && inquiry.itinerary.length > 1) {
            setItinerary(inquiry.itinerary);
        } else if (inquiry.followup_details && inquiry.followup_details.length > 0) {
            const manualItinerary = inquiry.followup_details.map(item => item.destination || '');
            const duration = parseInt(inquiry.duration) || 0;
            setItinerary(updateItineraryByDuration(manualItinerary, duration));
        } else if (inquiry.itinerary && Array.isArray(inquiry.itinerary) && inquiry.itinerary.length > 0) {
            setItinerary(inquiry.itinerary);
        } else if (inquiry.duration) {
            // If no itinerary but duration exists, create empty slots
            setItinerary(new Array(parseInt(inquiry.duration) + 1).fill(''));
        }

        // Load package - If package_id exists, load its full descriptive itinerary
        const pkgId = inquiry.package_id?._id || inquiry.package_id;
        if (pkgId && allPackages.length > 0) {
            const pkg = allPackages.find(p => p._id.toString() === pkgId.toString());
            if (pkg) {
                // Use handlePackageSelect logic to populate itinerary and hotels
                setSelectedPackage(pkg);

                // Set editable short itinerary from package (if not already set or partial)
                const extractedItinerary = extractItineraryFromPackage(pkg.details);
                const hasExistingItinerary = inquiry.itinerary?.length > 1 || (inquiry.followup_details?.length > 1);
                
                if (extractedItinerary.length > 0 && !hasExistingItinerary) {
                    setItinerary(extractedItinerary);
                }

                // If hotel selections are missing in the inquiry, pre-populate from package
                if (!inquiry.hotel_selections || Object.keys(inquiry.hotel_selections).length === 0) {
                    if (pkg.details?.shortItinerary && Array.isArray(pkg.details.shortItinerary)) {
                        const newHotelSelections = prePopulateHotelSelections(pkg.details.shortItinerary, allHotels);
                        setHotelSelections(newHotelSelections);
                    }
                }
            }
        }

        // Load hotel selections if they exist (overrides package defaults)
        if (inquiry.hotel_selections && Object.keys(inquiry.hotel_selections).length > 0) {
            setHotelSelections(inquiry.hotel_selections);
        } else if (inquiry.followup_details && inquiry.followup_details.length > 0) {
            const reconstructedHotels = mapFollowupToHotelSelections(inquiry.followup_details);
            setHotelSelections(reconstructedHotels);
        }

        // Load car selections
        if (inquiry.car_selections && Object.keys(inquiry.car_selections).length > 0) {
            setCarSelections(inquiry.car_selections);
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

    // Update itinerary based on duration
    useEffect(() => {
        if (isInitialLoad.current && isEditMode) {
            isInitialLoad.current = false;
            return;
        }
        setItinerary(prev => updateItineraryByDuration(prev, tripDetails.duration));
    }, [tripDetails.duration, isEditMode]);

    useEffect(() => {
        const extrasCost = (tripDetails.optional_extras || []).reduce((acc, extra) => acc + (extra.price || 0), 0);
        let tCost = 0;
        if (tripDetails.location && tripDetails.location !== 'Sandakphu') {
            const hCost = hotelCostCalculation(hotelSelections, allHotels, hotelSeason, tripDetails, stayInfo);
            const cCost = calculateCarCost(configData, carSeason, tripDetails, carSelections);
            tCost = totalCost(hCost, cCost, currentMargin, extrasCost);
            setCost(tCost);
        } else if (tripDetails.location === 'Sandakphu') {
            const hCostSandakphu = hotelCostCalculation(hotelSelections, allHotels, hotelSeason, tripDetails, stayInfo);
            const cCostSandakphu = calculateCarCost(configData, carSeason, tripDetails, carSelections);
            tCost = totalCostSandakphu(hCostSandakphu, cCostSandakphu, currentMargin, tripDetails, selectedPackage);
            setCost(tCost + extrasCost);
        }
    }, [hotelSelections, carSelections, tripDetails.car_details, tripDetails.duration, tripDetails.pax, tripDetails.kids_above_5, carSeason, hotelSeason, currentMargin, allHotels, configData, stayInfo, stayInfo.rooms, tripDetails.location, itinerary, selectedPackage, tripDetails.optional_extras]);

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
            setSelectedPackage({ _id: 'custom', label: 'Custom Package', location: tripDetails.location });
            // Don't clear itinerary here, let the useEffect handle it based on duration
            // or keep existing if switching back
            setHotelSelections({});
            setCost(0);
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
        setCarSeason('');
        setHotelSeason('');
    };

    const handleLocationChange = (newValue) => {
        setTripDetails(prev => ({ ...prev, location: newValue || '', duration: 0 }));
        setHotelSelections({});
        setCarSelections({});
    };

    const handleHotelReset = () => {
        setHotelSeason('');
        setHotelSelections(prev => resetHotelSelections(prev));
    };

    const handleCarReset = () => {
        setCarSeason('');
        setCarSelections({});
    };

    const handleHotelChange = (dayIndex, field, value) => {
        setHotelSelections(prev => updateHotelSelection(prev, dayIndex, field, value));
    };

    const handleCostChange = (e) => {
        setCost(parseFloat(e.target.value) || 0);
    };

    const handleCarSeasonChange = (e) => setCarSeason(e.target.value);
    const handleHotelSeasonChange = (e) => setHotelSeason(e.target.value);

    const handleOptionalExtraToggle = (extraName, price) => {
        setTripDetails(prev => {
            const currentExtras = prev.optional_extras || [];
            const isAlreadySelected = currentExtras.some(e => 
                (e.name || '').toLowerCase().trim() === extraName.toLowerCase().trim()
            );
            let newExtras;
            if (isAlreadySelected) {
                newExtras = currentExtras.filter(e => 
                    (e.name || '').toLowerCase().trim() !== extraName.toLowerCase().trim()
                );
            } else {
                newExtras = [...currentExtras, { name: extraName.trim(), price }];
            }
            return { ...prev, optional_extras: newExtras };
        });
    };

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

    const handleCarSelectionChange = (dayIndex, carName, newCount) => {
        setCarSelections(prev => {
            const dayCars = [...(prev[dayIndex] || [])];
            const existingIndex = dayCars.findIndex(c => c.car_name === carName);

            if (newCount <= 0) {
                if (existingIndex !== -1) dayCars.splice(existingIndex, 1);
            } else {
                if (existingIndex !== -1) {
                    dayCars[existingIndex] = { ...dayCars[existingIndex], car_count: newCount };
                } else {
                    dayCars.push({ car_name: carName, car_count: newCount });
                }
            }

            return { ...prev, [dayIndex]: dayCars };
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
            hotelSelections,
            carSelections,
            allHotels,
            hotelSeason,
            carSeason,
            margin: currentMargin,
            itinerary,
            isDraft
        });
    };

    const handleSubmit = async (isDraft = false) => {
        if (!isDraft && !validateForm()) {
            return;
        }

        setLoading(true);

        let payload = buildPayload(isDraft);
        const QRY_URL = `${process.env.REACT_APP_BASE_URL}/queries`;

        //important code
        try {
            const inquiryId = existingInquiry?._id || reduxSelectedInquiry?._id;
            if (isEditMode && inquiryId) {
                await axios.put(`${QRY_URL}/update/${inquiryId}`, payload);
                showSnackbar('Inquiry updated successfully!', 'success');
            } else {
                await axios.post(`${QRY_URL}/create-queries`, payload);
                showSnackbar(
                    isDraft ? 'Draft saved successfully!' : 'Inquiry created successfully!',
                    'success'
                );
            }

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

    const handleCreatePackage = async () => {
        if (!guestInfo.guest_name) {
            showSnackbar('Please enter guest name first', 'warning');
            return;
        }
        if (!tripDetails.location) {
            showSnackbar('Please select a location first', 'warning');
            return;
        }
        if (!tripDetails.duration || parseInt(tripDetails.duration) === 0) {
            showSnackbar('Please enter trip duration (nights)', 'warning');
            return;
        }

        setLoading(true);
        console.log('Creating custom package with payload:', {
            guestName: guestInfo.guest_name,
            location: tripDetails.location,
            duration: tripDetails.duration,
            itineraryCount: itinerary.length
        });

        try {
            const customPackagePayload = {
                label: `Custom Package - ${guestInfo.guest_name}`,
                location: tripDetails.location || '',
                duration: tripDetails.duration || '0',
                type: 'Custom',
                url: `custom-package-${Date.now()}`,
                isActive: false,
                image: '',
                tags: [],
                meta: { title: '', description: '', keywords: [] },
                shortInclusions: [],
                details: {
                    header: { h1: '', h2: '', h3: '' },
                    overview: [],
                    covering: [],
                    shortItinerary: itinerary.map(item => ({
                        tagName: '',
                        tagValue: item || ''
                    })),
                    itinerary: [],
                    howToReach: {
                        para: [],
                        itineraryReach: []
                    },
                    cost: {
                        singleCost: '',
                        multipleCost: [],
                        daysCost: [],
                        valueCost: [],
                        inclusions: [],
                        exclusions: []
                    },
                    thingsToCarry: {
                        Basics: [],
                        Documents: [],
                        Clothing: [],
                        Medicine: [],
                        Toiletries: [],
                        Accessories: [],
                    }
                }
            };

            const pkgRes = await createPackage(customPackagePayload);
            const newPkg = pkgRes.data?.data;

            if (newPkg && newPkg._id) {
                // Refresh packages list to include the new one first
                const packagesRes = await getAllPackages();
                dispatch(setAllPackages(packagesRes.data));

                // Then select the new package (find it in the fresh list for consistency)
                const freshPkg = packagesRes.data.find(p => p._id === newPkg._id);
                setSelectedPackage(freshPkg || newPkg);

                showSnackbar('Custom package created and selected!', 'success');
            } else {
                throw new Error('Could not retrieve new package ID');
            }
        } catch (err) {
            console.error('Error creating custom package:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to create custom package';
            showSnackbar(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAsDraft = () => {
        const validation = validateDraftRequirements(guestInfo);
        if (!validation.isValid) {
            showSnackbar(validation.message, validation.severity);
            return;
        }
        handleSubmit(true);
    };

    const handleOpenPreview = () => {
        if (validateForm()) {
            setPreviewOpen(true);
        }
    };

    const handleExportPDF = () => {
        setItineraryDialogOpen(true);
    };

    const handleConfirmExportPDF = () => {
        setItineraryDialogOpen(false);
        exportQuotationPDF(
            {
                guestInfo,
                tripDetails,
                stayInfo,
                itinerary,
                hotelSelections,
                allHotels,
                selectedPackage,
                carSeason,
                hotelSeason,
                cost,
                configData,
                currentMargin,
                detailedItinerary,
                carSelections,
            },
            setLoading,
            showSnackbar
        );
    };




    const handleEmailQuotation = async () => {
        if (!emailAddress || !/\S+@\S+\.\S+/.test(emailAddress)) {
            showSnackbar('Please enter a valid email address', 'error');
            return;
        }

        setEmailSending(true);
        // try {
        //     // Generate PDF as base64
        //     const canvas = await html2canvas(pdfRef.current, {
        //         scale: 2,
        //         useCORS: true,
        //     });
        //     const imgData = canvas.toDataURL('image/png');

        //     // Send email via your backend API
        //     await axios.post(`${process.env.REACT_APP_BASE_URL}/email/send-quotation`, {
        //         to: emailAddress,
        //         guestName: guestInfo.guest_name,
        //         pdfData: imgData,
        //         packageName: selectedPackage?.label || 'Tour Package',
        //         destination: tripDetails.location,
        //     });

        //     showSnackbar(`Quotation sent successfully to ${emailAddress}!`, 'success');
        //     setEmailDialogOpen(false);
        // } catch (error) {
        //     console.error('Error sending email:', error);
        //     showSnackbar('Failed to send email. Please try again.', 'error');
        // } finally {
        //     setEmailSending(false);
        // }
    };

    const resetForm = () => {
        setGuestInfo({
            guest_name: '',
            guest_email: '',
            guest_phone: '',
            country_code: '+91'
        });
        setTripDetails({
            pax: '',
            kids_above_5: 0,
            car_details: [],
            location: '',
            keywords: '',
            travel_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            duration: '0',
            dropoff_location: 'NJP / IXB',
        });
        setSelectedPackage(null);
        setHotelSelections({});
        setCost(0);
        setStayInfo({
            rooms: '',
            hotel: '',
        });
        setEmailAddress('');
        setCarSeason('');
        setHotelSeason('');
        setCarSelections({});
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {isEditMode ? 'Edit Inquiry' : 'Create New Inquiry'}
                        </Typography>
                        <Chip
                            label={`Total: ₹${(Number(cost) || 0).toLocaleString('en-IN')}`}
                            color="success"
                            variant="filled"
                            sx={{ fontWeight: 800, fontSize: '1.2rem', py: 2.5, px: 2, height: 'auto' }}
                        />
                    </Box>
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
                            disabled={loading}
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
                    carSeason={carSeason}
                    handleCarSeasonChange={handleCarSeasonChange}
                    handleCarDetailsChange={handleCarDetailsChange}
                    handleOptionalExtraToggle={handleOptionalExtraToggle}
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
                    hotelSeason={hotelSeason}
                    handleHotelSeasonChange={handleHotelSeasonChange}
                    handleHotelReset={handleHotelReset}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    handleHotelChange={handleHotelChange}
                />
                
                <CarSelectionCard
                    tripDetails={tripDetails}
                    carSelections={carSelections}
                    carSeason={carSeason}
                    itinerary={itinerary}
                    handleCarSeasonChange={handleCarSeasonChange}
                    handleCarReset={handleCarReset}
                    handleCarSelectionChange={handleCarSelectionChange}
                    configData={configData}
                />

                <CostEstimateCard
                    selectedPackage={selectedPackage}
                    cost={cost}
                    handleCostChange={handleCostChange}
                    hotelSelections={hotelSelections}
                    allHotels={allHotels}
                    stayInfo={stayInfo}
                    tripDetails={tripDetails}
                    configData={configData}
                    carSeason={carSeason}
                    hotelSeason={hotelSeason}
                    currentMargin={currentMargin}
                    setCurrentMargin={setCurrentMargin}
                />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    {(!selectedPackage || selectedPackage?._id === 'custom') && (
                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            startIcon={<Save />}
                            onClick={handleCreatePackage}
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? 'Creating...' : 'Create Package'}
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={isEditMode ? <EditIcon /> : <Save />}
                        onClick={handleOpenPreview}
                        disabled={loading || !selectedPackage}
                        fullWidth
                    >
                        {loading ? 'Saving...' : isEditMode ? 'Update Inquiry' : 'Create Inquiry'}
                    </Button>
                    {!isEditMode && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Clear />}
                            onClick={onClose || resetForm}
                            disabled={loading}
                        >
                            {onClose ? 'Cancel' : 'Reset'}
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Detailed Itinerary Dialog (before PDF export) */}
            <Dialog open={itineraryDialogOpen} onClose={() => setItineraryDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Detailed Itinerary</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        minRows={8}
                        maxRows={20}
                        label="Detailed Itinerary"
                        value={detailedItinerary}
                        onChange={(e) => setDetailedItinerary(e.target.value)}
                        sx={{ mt: 2 }}
                        placeholder="Paste or type the detailed itinerary here..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setItineraryDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmExportPDF}
                        variant="contained"
                        startIcon={<PictureAsPdf />}
                    >
                        Export PDF
                    </Button>
                </DialogActions>
            </Dialog>

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

            {/* Inquiry Preview Dialog */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
                    Preview Inquiry Details
                    <Box>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PictureAsPdf />}
                            onClick={handleConfirmExportPDF}
                            sx={{ mr: 1 }}
                        >
                            Download PDF
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Save />}
                            onClick={() => {
                                setPreviewOpen(false);
                                handleSubmit(false);
                            }}
                        >
                            Confirm & {isEditMode ? 'Update' : 'Create'}
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#eee' }}>
                    <InquiryPreview
                        guestInfo={guestInfo}
                        tripDetails={tripDetails}
                        stayInfo={stayInfo}
                        itinerary={itinerary}
                        hotelSelections={hotelSelections}
                        allHotels={allHotels}
                        selectedPackage={selectedPackage}
                        cost={cost}
                        detailedItinerary={detailedItinerary}
                        onDetailedItineraryChange={setDetailedItinerary}
                        carSelections={carSelections}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)}>Back to Edit</Button>
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

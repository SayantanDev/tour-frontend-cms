export const filterPackages = (allPackages, tripDetails) => {
    if (!allPackages || allPackages.length === 0) {
        return [];
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

    return filtered;
};

export const calculatePackageCost = (packageDetails, paxCount) => {
    if (!packageDetails?.cost?.valueCost?.[0]?.price) {
        return 0;
    }

    const basePrice = packageDetails.cost.valueCost[0].price;
    const pax = parseInt(paxCount) || 1;
    return basePrice * pax;
};

export const updateItineraryByDuration = (currentItinerary, duration) => {
    const days = (parseInt(duration) || 0) + 1;

    if (currentItinerary.length === days) {
        return currentItinerary;
    }

    if (days > currentItinerary.length) {
        return [...currentItinerary, ...new Array(days - currentItinerary.length).fill('')];
    }

    return currentItinerary.slice(0, days);
};

export const prePopulateHotelSelections = (shortItinerary, allHotels) => {
    if (!shortItinerary || !Array.isArray(shortItinerary)) {
        return {};
    }

    const newHotelSelections = {};

    shortItinerary.forEach((item, index) => {
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
                newHotelSelections[index] = {
                    location: destination,
                    hotelId: '', // Default to none
                    price: 0,
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

    return newHotelSelections;
};

export const calculatePdfDimensions = (canvas, pdf) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    return {
        imgX,
        imgY,
        imgWidth: imgWidth * ratio,
        imgHeight: imgHeight * ratio,
        ratio
    };
};

/**
 * Extract itinerary array from package details
 * @param {Object} packageDetails - Package details object
 * @returns {Array} Extracted itinerary array
 */
export const extractItineraryFromPackage = (packageDetails) => {
    if (!packageDetails?.shortItinerary || !Array.isArray(packageDetails.shortItinerary)) {
        return [];
    }

    return packageDetails.shortItinerary.map(day =>
        typeof day === 'string' ? day : day?.tagValue || day?.tagName || ''
    );
};

/**
 * Validate form data and return validation errors
 * @param {Object} guestInfo - Guest information object
 * @param {Object} tripDetails - Trip details object
 * @param {Object} selectedPackage - Selected package object
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateForm = (guestInfo, tripDetails, selectedPackage) => {
    if (!guestInfo.guest_name?.trim()) {
        return { isValid: false, message: 'Please enter guest name', severity: 'error' };
    }

    if (!guestInfo.guest_email?.trim() || !/\S+@\S+\.\S+/.test(guestInfo.guest_email)) {
        return { isValid: false, message: 'Please enter a valid email address', severity: 'error' };
    }

    // Basic validation for phone number length
    if (!guestInfo.guest_phone?.trim() || guestInfo.guest_phone.length < 7) {
        return { isValid: false, message: 'Please enter a valid phone number', severity: 'error' };
    }

    if (!tripDetails.pax || parseInt(tripDetails.pax) < 1) {
        return { isValid: false, message: 'Please enter valid number of guests', severity: 'error' };
    }

    if (!selectedPackage) {
        return { isValid: false, message: 'Please select a package', severity: 'error' };
    }

    if (tripDetails.travel_date) {
        const travelDate = new Date(tripDetails.travel_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (travelDate < today) {
            return { isValid: false, message: 'Travel date cannot be in the past', severity: 'warning' };
        }
    }

    return { isValid: true };
};

/**
 * Build payload object for API submission
 * @param {Object} params - Parameters object
 * @param {Object} params.guestInfo - Guest information
 * @param {Object} params.tripDetails - Trip details
 * @param {Object} params.selectedPackage - Selected package
 * @param {number} params.cost - Total cost
 * @param {Object} params.stayInfo - Stay information
 * @param {boolean} params.isDraft - Whether this is a draft
 * @returns {Object} Payload object
 */
export const buildPayload = ({ guestInfo, tripDetails, selectedPackage, cost, stayInfo, isDraft = false }) => {
    return {
        guest_info: {
            guest_name: guestInfo.guest_name,
            guest_email: guestInfo.guest_email,
            guest_phone: `${guestInfo.country_code}${guestInfo.guest_phone}`,
        },
        pax: parseInt(tripDetails.pax),
        kids_above_5: parseInt(tripDetails.kids_above_5) || 0,
        car_details: tripDetails.car_details?.filter(car => car.car_count > 0) || [],
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

/**
 * Generate PDF filename
 * @param {string} guestName - Guest name
 * @param {string} location - Trip location
 * @returns {string} Generated filename
 */
export const generatePdfFilename = (guestName, location) => {
    return `${guestName || 'inquiry'}_${location || 'package'}_${Date.now()}.pdf`;
};

/**
 * Validate draft requirements
 * @param {Object} guestInfo - Guest information object
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateDraftRequirements = (guestInfo) => {
    if (!guestInfo.guest_name || !guestInfo.guest_email) {
        return {
            isValid: false,
            message: 'Please enter at least guest name and email to save draft',
            severity: 'warning'
        };
    }
    return { isValid: true };
};

/**
 * Reset hotel selections by clearing hotel-specific fields
 * @param {Object} hotelSelections - Current hotel selections object
 * @returns {Object} Reset hotel selections object
 */
export const resetHotelSelections = (hotelSelections) => {
    const nextState = {};
    Object.keys(hotelSelections).forEach(key => {
        if (hotelSelections[key]) {
            nextState[key] = {
                ...hotelSelections[key],
                hotelId: '',
                roomType: '',
                mealPlan: ''
            };
        }
    });
    return nextState;
};

/**
 * Update itinerary item at specific index
 * @param {Array} currentItinerary - Current itinerary array
 * @param {number} index - Index to update
 * @param {string} value - New value
 * @returns {Array} Updated itinerary array
 */
export const updateItineraryItem = (currentItinerary, index, value) => {
    const newItinerary = [...currentItinerary];
    newItinerary[index] = value;
    return newItinerary;
};

/**
 * Update hotel selection for a specific day
 * @param {Object} hotelSelections - Current hotel selections object
 * @param {number} dayIndex - Day index
 * @param {string} field - Field to update
 * @param {*} value - New value
 * @returns {Object} Updated hotel selections object
 */
export const updateHotelSelection = (hotelSelections, dayIndex, field, value) => {
    return {
        ...hotelSelections,
        [dayIndex]: {
            ...hotelSelections[dayIndex],
            [field]: value
        }
    };
};

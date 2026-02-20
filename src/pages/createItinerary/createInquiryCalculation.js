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

export const calculatePackageCost = (packageDetails, tripDetails) => {
    if (!packageDetails?.cost?.valueCost?.[0]?.price) {
        return 0;
    }

    const basePrice = packageDetails.cost.valueCost[0].price;
    const pax = (parseInt(tripDetails.pax) || 0) + (parseInt(tripDetails.kids_above_5) || 0);
    return basePrice * (pax || 1);
};

export const totalCost = (hotelCost, carCost, margin, northSikkimMargin) => {
    const subtotal = (parseFloat(hotelCost) || 0) + (parseFloat(carCost) || 0) + parseFloat(northSikkimMargin);
    const marginAmount = subtotal * (parseFloat(margin) / 100 || 0);
    return Math.round(subtotal + marginAmount);
};

export const totalCostSandakphu = (hotelCost, carCost, discount, tripDetails, selectedPackage) => {

    const hasLandRover = selectedPackage?.label?.includes("Land Rover");
    const head_count = parseInt(tripDetails.pax) + parseInt(tripDetails.kids_above_5) || 0;
    if (hasLandRover) {
        const totalCost = ((parseFloat(hotelCost) || 0) * head_count) + (parseFloat(carCost) || 0);
        const marginAmount = totalCost * (parseFloat(discount) / 100 || 0);
        return (totalCost - marginAmount) * tripDetails.duration;
    } else {
        const singleCost = selectedPackage?.details?.cost?.singleCost;
        const totalCost = singleCost * head_count;
        const marginAmount = totalCost * (parseFloat(discount) / 100 || 0);
        return (totalCost - marginAmount);
    }
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

export const extractItineraryFromPackage = (packageDetails) => {
    if (!packageDetails?.shortItinerary || !Array.isArray(packageDetails.shortItinerary)) {
        return [];
    }

    return packageDetails.shortItinerary.map(day =>
        typeof day === 'string' ? day : day?.tagValue || day?.tagName || ''
    );
};

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

export const generatePdfFilename = (guestName, location) => {
    return `${guestName || 'inquiry'}_${location || 'package'}_${Date.now()}.pdf`;
};

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

export const updateItineraryItem = (currentItinerary, index, value) => {
    const newItinerary = [...currentItinerary];
    newItinerary[index] = value;
    return newItinerary;
};

export const updateHotelSelection = (hotelSelections, dayIndex, field, value) => {
    return {
        ...hotelSelections,
        [dayIndex]: {
            ...hotelSelections[dayIndex],
            [field]: value
        }
    };
};

export const calculateSingleHotelCostWithBreakdown = (selection, allHotels, season, tripDetails, stayInfo) => {
    const defaultBreakdown = {
        baseCost: 0,
        extraAdultCost: 0,
        childCost: 0,
        total: 0,
        details: {
            rooms: 0,
            basePrice: 0,
            extraAdults: 0,
            extraPrice: 0,
            kids: 0,
            childPrice: 0
        }
    };

    if (!selection?.hotelId || !selection?.roomType || !selection?.mealPlan || !allHotels || !season) return defaultBreakdown;

    const rooms = parseInt(stayInfo?.rooms) || 0;
    const adults = parseInt(tripDetails?.pax) || 0;
    const kids = parseInt(tripDetails?.kids_above_5) || 0;

    const hotel = allHotels.find(h => h._id === selection.hotelId);
    if (!hotel) return defaultBreakdown;

    const category = hotel.category?.find(cat => cat.room_cat === selection.roomType);
    if (!category) return defaultBreakdown;

    const pricing = category[season];
    if (!pricing) return defaultBreakdown;

    const planType = selection.mealPlan.split('_')[0];

    // 1. Base Room Cost
    const basePrice = pricing[selection.mealPlan] || 0;
    const baseCost = basePrice * rooms;

    // 2. Extra Mattress Cost
    const extraAdults = Math.max(0, adults - (rooms * 2));
    let extraAdultCost = 0;
    let extraPrice = 0;
    if (extraAdults > 0) {
        const extraMatKey = `extra_mat_${planType}`;
        extraPrice = pricing[extraMatKey] || 0;
        extraAdultCost = extraPrice * extraAdults;
    }

    // 3. Child No Bed (CNB) Cost
    let childCost = 0;
    let childPrice = 0;
    if (kids > 0) {
        const cnbKey = `cnb_${planType}`;
        childPrice = pricing[cnbKey] || 0;
        childCost = childPrice * kids;
    }

    return {
        baseCost,
        extraAdultCost,
        childCost,
        total: baseCost + extraAdultCost + childCost,
        details: {
            rooms,
            basePrice,
            extraAdults,
            extraPrice,
            kids,
            childPrice
        }
    };
};

export const calculateSingleHotelCost = (selection, allHotels, season, tripDetails, stayInfo) => {
    return calculateSingleHotelCostWithBreakdown(selection, allHotels, season, tripDetails, stayInfo).total;
};

export const hotelCostCalculation = (hotelSelections, allHotels, season, tripDetails, stayInfo) => {
    if (!hotelSelections) return 0;
    return Object.values(hotelSelections).reduce((total, selection) => {
        return total + calculateSingleHotelCost(selection, allHotels, season, tripDetails, stayInfo);
    }, 0);
};

export const calculateCarCost = (configData, season, tripDetails) => {
    const carDetails = tripDetails?.car_details || [];
    console.log('carDetails=======>', carDetails);
    const oneNightPerDayCarAmount = 4000;
    const twoNightPerDayCarAmount = 8500;
    const threeNightPerDayCarAmount = 13500;
    if (!carDetails || !configData) return 0;
    const totalDays = (parseInt(tripDetails.duration) || 0) + 1;
    if (tripDetails.location === 'Sandakphu') {
        return totalDays === 3 ? (twoNightPerDayCarAmount * carDetails[0].car_count) :
            totalDays === 4 ? (threeNightPerDayCarAmount * carDetails[0].car_count) : (oneNightPerDayCarAmount * carDetails[0].car_count);
    }
    return carDetails.reduce((acc, carDetail) => {
        const carConfig = configData?.additionalCosts?.car?.find(c => c.type === carDetail.car_name);
        const unitPrice = carConfig?.cost?.[season] || 0;
        return acc + (unitPrice * carDetail.car_count * totalDays);
    }, 0);
};

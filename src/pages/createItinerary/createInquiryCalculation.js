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

export const totalCost = (hotelCost, carCost, margin, northSikkimMargin, optionalExtrasCost = 0) => {
    const subtotal = (parseFloat(hotelCost) || 0) + (parseFloat(carCost) || 0) + parseFloat(northSikkimMargin || 0) + parseFloat(optionalExtrasCost || 0);
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

export const mapFollowupToHotelSelections = (followupDetails) => {
    if (!followupDetails || !Array.isArray(followupDetails)) return {};
    const selections = {};
    followupDetails.forEach((item, index) => {
        selections[index] = {
            location: item.destination || '',
            hotelId: item.hotel_id || '',
            roomType: item.room_type || '',
            mealPlan: item.meal_plan || '',
            availableHotels: [] // Will be populated by component if needed
        };
    });
    return selections;
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

export const buildPayload = ({ guestInfo, tripDetails, selectedPackage, cost, stayInfo, hotelSelections, carSelections, allHotels, hotelSeason,
    carSeason,
    margin,
    itinerary,
    isDraft = false
}) => {
    const gPhone = guestInfo.guest_phone || '';
    const gCountryCode = guestInfo.country_code || '+91';
    const cleanedPhone = gPhone.startsWith(gCountryCode)
        ? gPhone.replace(gCountryCode, '').trim()
        : gPhone;

    // Map selections to followup_details
    const followup_details = [];
    const duration = parseInt(tripDetails.duration) || 0;
    const startDate = tripDetails.travel_date ? new Date(tripDetails.travel_date) : null;

    for (let i = 0; i <= duration; i++) {
        let journeyDate = '';
        let checkinDate = '';
        let checkoutDate = '';

        if (startDate) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            journeyDate = currentDate.toISOString();
            checkinDate = currentDate.toISOString();
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            checkoutDate = nextDay.toISOString();
        }

        const selection = hotelSelections?.[i];
        const carSelection = carSelections?.[i] || [];
        const hotel = allHotels?.find(h => h._id === selection?.hotelId);

        followup_details.push({
            journey_date: journeyDate,
            destination: selection?.location || '',
            hotel_id: selection?.hotelId || '',
            hotel_name: hotel?.hotel_name || '',
            hotel_amount: calculateSingleHotelCost(selection, allHotels, hotelSeason, tripDetails, stayInfo) || 0,
            checkin_date: checkinDate,
            checkout_date: checkoutDate,
            room_type: selection?.roomType || '',
            meal_plan: selection?.mealPlan || '',
            vehicle_name: carSelection.map(c => `${c.car_name} (${c.car_count})`).join(', '),
            approved_status: 'Pending',
            rejected_reason: []
        });
    }

    return {
        guest_info: {
            guest_name: guestInfo.guest_name,
            guest_email: guestInfo.guest_email,
            guest_phone: cleanedPhone,
            guest_country_code: gCountryCode,
        },
        pax: parseInt(tripDetails.pax),
        kids_above_5: parseInt(tripDetails.kids_above_5) || 0,
        car_details: tripDetails.car_details?.filter(car => car.car_count > 0) || [],
        cost: cost,
        destination: tripDetails.location || selectedPackage?.location || '',
        duration: parseInt(tripDetails.duration) || selectedPackage?.duration || 0,
        package_id: selectedPackage?._id,
        stay_info: {
            rooms: parseInt(stayInfo.rooms) || 0,
            hotel: stayInfo.hotel,
            room_type: stayInfo.room_type || "",
        },
        followup_details, // New field for day-wise details
        itinerary: itinerary, // Store the short itinerary strings/objects
        hotel_selections: hotelSelections, // Add raw hotel selections
        car_selections: carSelections, // Add raw car selections
        travel_date: tripDetails.travel_date || '',
        pickup_location: tripDetails.pickup_location || 'NJP / IXB',
        dropoff_location: tripDetails.dropoff_location || 'NJP / IXB',
        optional_extras: tripDetails.optional_extras || [],
        hotel_season: hotelSeason,
        car_season: carSeason,
        margin: margin,
        lead_source: 'website',
        lead_stage: isDraft ? 'Draft' : 'New',
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

export const calculateCarCost = (configData, season, tripDetails, carSelections = null) => {
    // If we have day-wise car selections, use them
    if (carSelections && Object.keys(carSelections).length > 0) {
        return Object.values(carSelections).reduce((dayAcc, dayCars) => {
            if (!Array.isArray(dayCars)) return dayAcc;
            
            const dayCost = dayCars.reduce((carAcc, carDetail) => {
                const carConfig = configData?.additionalCosts?.car?.find(c => c.type === carDetail.car_name);
                let unitPrice = carConfig?.cost?.[season] || 0;

                // Restore Darjeeling Logic
                if (tripDetails.location === 'Darjeeling') {
                    if (carDetail.car_name === 'Bolero') {
                        unitPrice = season === 'off_season_price' ? 3500 : 4000;
                    } else if (carDetail.car_name === 'Innova') {
                        unitPrice = season === 'off_season_price' ? 4000 : 4500;
                    }
                }
                return carAcc + (unitPrice * (carDetail.car_count || 0));
            }, 0);
            
            return dayAcc + dayCost;
        }, 0);
    }

    // Fallback to legacy global car_details
    const carDetails = tripDetails?.car_details || [];
    const oneNightPerDayCarAmount = 4000;
    const twoNightPerDayCarAmount = 8500;
    const threeNightPerDayCarAmount = 13500;

    if (!carDetails || !configData) return 0;

    const totalDays = (parseInt(tripDetails.duration) || 0) + 1;

    if (tripDetails.location === 'Sandakphu') {
        const carCount = carDetails[0]?.car_count || 1;
        return totalDays === 3 ? (twoNightPerDayCarAmount * carCount) :
            totalDays === 4 ? (threeNightPerDayCarAmount * carCount) : (oneNightPerDayCarAmount * carCount);
    }

    return carDetails.reduce((acc, carDetail) => {
        const carConfig = configData?.additionalCosts?.car?.find(c => c.type === carDetail.car_name);
        let unitPrice = carConfig?.cost?.[season] || 0;

        // Restore Darjeeling Logic
        if (tripDetails.location === 'Darjeeling') {
            if (carDetail.car_name === 'Bolero') {
                unitPrice = season === 'off_season_price' ? 3500 : 4000;
            } else if (carDetail.car_name === 'Innova') {
                unitPrice = season === 'off_season_price' ? 4000 : 4500;
            }
        }

        return acc + (unitPrice * carDetail.car_count * totalDays);
    }, 0);
};

/**
 * Parses and renders a formatted detailed itinerary into the PDF.
 * Returns the updated `y` cursor position.
 *
 * Line-type detection (by trimmed prefix):
 *   "Day "          → bold dark-green day header
 *   starts with ⚠   → warning/note highlight box
 *   starts with ● or • → main bullet (filled circle)
 *   starts with ○    → sub-bullet (open circle, indented)
 *   "Overnight Stay:" → bold overnight-stay line
 *   anything else    → regular body text
 */

/**
 * Generates and downloads a professional A4 PDF quotation.
**/
export const exportQuotationPDF = async (
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
        carSelections = {},
    },
    setLoading,
    showSnackbar
) => {
    // jsPDF is a default export — import dynamically to keep this file framework-free
    const { default: jsPDF } = await import('jspdf');

    // ── Pre-load logo ────────────────────────────────────────
    let logoDataUrl = null;
    try {
        const resp = await fetch('/easo.png');
        const blob = await resp.blob();
        logoDataUrl = await new Promise((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (_) {
        // logo not critical — continue without it
    }

    setLoading(true);
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const W = pdf.internal.pageSize.getWidth();
        const H = pdf.internal.pageSize.getHeight();
        const marginL = 14;
        const marginR = W - 14;
        const contentW = marginR - marginL;
        let y = 0;

        // ── Colour palette ──────────────────────────────────────
        const PRIMARY = [122, 124, 209];
        const DARK = [31, 41, 55];
        const MID = [107, 114, 128];
        const LIGHT_BG = [245, 247, 250];
        const WHITE = [255, 255, 255];
        const ACCENT = [34, 197, 94];
        const DARK_GREEN = [27, 94, 32];   // footer / accent

        // ── Helpers ─────────────────────────────────────────────
        const setC = (c) => pdf.setTextColor(...c);
        const fillC = (c) => pdf.setFillColor(...c);
        const drawC = (c) => pdf.setDrawColor(...c);

        const addFooter = () => {
            const pg = pdf.internal.getNumberOfPages();
            pdf.setPage(pg);

            // Dark-green footer bar
            fillC(DARK_GREEN);
            pdf.rect(0, H - 18, W, 18, 'F');

            // Three contact columns — white text
            setC(WHITE); pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
            pdf.text('\u2295  www.easotrip.com', marginL + 10, H - 8);
            pdf.text('\u260E  +91 70017 24300', W / 2, H - 8, { align: 'center' });
            pdf.text('\u2709  easogroup@gmail.com', marginR - 10, H - 8, { align: 'right' });

            // Thin white separator line above footer
            drawC(WHITE); pdf.setLineWidth(0.3);
            pdf.line(0, H - 18, W, H - 18);
        };

        const checkPage = (needed = 8) => {
            if (y + needed > H - 22) {
                addFooter();
                pdf.addPage();
                y = 14;
            }
        };

        const sectionTitle = (title) => {
            checkPage(14);
            fillC(DARK_GREEN);
            pdf.rect(marginL, y, contentW, 7, 'F');
            setC(WHITE); pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
            pdf.text(title.toUpperCase(), marginL + 3, y + 5);
            y += 10;
            pdf.setFont(undefined, 'normal');
        };

        const row = (label, value, indent = 0) => {
            checkPage(7);
            setC(MID); pdf.setFontSize(8);
            pdf.text(label, marginL + indent, y);
            setC(DARK); pdf.setFontSize(8.5); pdf.setFont(undefined, 'bold');
            pdf.text(String(value || '—'), marginL + indent + 52, y);
            pdf.setFont(undefined, 'normal');
            y += 5.5;
        };

        const hRule = (color = [229, 231, 235]) => {
            drawC(color); pdf.setLineWidth(0.3);
            pdf.line(marginL, y, marginR, y);
            y += 3;
        };

        const formatDetailedItineraryInner = (text) => {
            const rawLines = text.trim().split(/\r?\n/);
            rawLines.forEach((rawLine) => {
                const trimmed = rawLine.trim();
                if (!trimmed) {
                    y += 2;
                    return;
                }

                // Day header
                if (/^Day\s+\d+/i.test(trimmed)) {
                    checkPage(12);
                    y += 3;
                    setC(DARK_GREEN); pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
                    const wrapped = pdf.splitTextToSize(trimmed, contentW - 4);
                    wrapped.forEach((wl) => {
                        pdf.text(wl, marginL + 2, y);
                        const lineW = pdf.getStringUnitWidth(wl) * 9 / pdf.internal.scaleFactor;
                        drawC(DARK_GREEN); pdf.setLineWidth(0.3);
                        pdf.line(marginL + 2, y + 0.8, marginL + 2 + lineW, y + 0.8);
                        y += 6;
                    });
                    pdf.setFont(undefined, 'normal');
                    return;
                }

                // Warning / Note
                if (trimmed.startsWith('⚠') || trimmed.startsWith('\u26A0') || trimmed.toLowerCase().startsWith('note:')) {
                    const noteText = trimmed.replace(/^[⚠\u26A0]\s*/, '');
                    const wrapped = pdf.splitTextToSize(noteText, contentW - 16);
                    const boxH = Math.max(7, wrapped.length * 5 + 3);
                    checkPage(boxH + 3);
                    fillC([255, 243, 205]); drawC([255, 193, 7]); pdf.setLineWidth(0.4);
                    pdf.roundedRect(marginL + 2, y - 1, contentW - 4, boxH, 1, 1, 'FD');
                    pdf.setFontSize(8); pdf.setFont(undefined, 'bold'); setC([133, 77, 14]);
                    pdf.text('⚠', marginL + 5, y + 4);
                    pdf.setFont(undefined, 'normal'); pdf.setFontSize(7.5);
                    wrapped.forEach((wl, wi) => { pdf.text(wl, marginL + 11, y + 4 + wi * 5); });
                    y += boxH + 3;
                    return;
                }

                // Overnight Stay
                if (/^Overnight\s+Stay/i.test(trimmed)) {
                    checkPage(8);
                    y += 2;
                    drawC([200, 200, 200]); pdf.setLineWidth(0.2);
                    pdf.line(marginL, y - 1, marginL + contentW, y - 1);
                    setC(DARK_GREEN); pdf.setFontSize(8.5); pdf.setFont(undefined, 'bolditalic');
                    pdf.text(trimmed, marginL + 2, y + 3);
                    y += 8;
                    pdf.setFont(undefined, 'normal');
                    return;
                }

                // Bullets
                if (trimmed.startsWith('●') || trimmed.startsWith('•')) {
                    const bulletText = trimmed.replace(/^[●•]\s*/, '');
                    const wrapped = pdf.splitTextToSize(bulletText, contentW - 14);
                    const rowH = Math.max(6, wrapped.length * 5 + 1);
                    checkPage(rowH + 1);
                    setC(DARK_GREEN); pdf.setFontSize(10);
                    pdf.text('●', marginL + 4, y + 3.5);
                    setC(DARK); pdf.setFontSize(8);
                    wrapped.forEach((wl, wi) => { pdf.text(wl, marginL + 10, y + 3.5 + wi * 5); });
                    y += rowH + 1;
                    return;
                }

                if (trimmed.startsWith('○')) {
                    const subText = trimmed.replace(/^○\s*/, '');
                    const wrapped = pdf.splitTextToSize(subText, contentW - 22);
                    const rowH = Math.max(6, wrapped.length * 5 + 1);
                    checkPage(rowH + 1);
                    setC(MID); pdf.setFontSize(9);
                    pdf.text('○', marginL + 10, y + 3.5);
                    setC(DARK); pdf.setFontSize(7.5);
                    wrapped.forEach((wl, wi) => { pdf.text(wl, marginL + 17, y + 3.5 + wi * 5); });
                    y += rowH + 1;
                    return;
                }

                // Regular body text
                const wrapped = pdf.splitTextToSize(trimmed, contentW - 6);
                const rowH = Math.max(5, wrapped.length * 5);
                checkPage(rowH + 1);
                setC(DARK); pdf.setFontSize(8);
                wrapped.forEach((wl, wi) => { pdf.text(wl, marginL + 3, y + wi * 5); });
                y += rowH + 2;
            });
        };

        // ── HEADER ──────────────────────────────────────────────
        // White page background (jsPDF default is white, but be explicit)
        fillC(WHITE);
        pdf.rect(0, 0, W, 40, 'F');

        // Green decorative large circle — top-left, mostly off-page
        fillC(DARK_GREEN);
        pdf.circle(-18, -10, 38, 'F');

        // Thin separator line under header area
        drawC([220, 220, 220]); pdf.setLineWidth(0.4);
        pdf.line(0, 40, W, 40);

        // Logo — top right
        if (logoDataUrl) {
            // Render at ~40 mm wide, proportional height (~16 mm for typical logo)
            pdf.addImage(logoDataUrl, 'PNG', W - 54, 3, 44, 18);
        } else {
            // Fallback text if logo fails
            setC(DARK_GREEN); pdf.setFontSize(16); pdf.setFont(undefined, 'bold');
            pdf.text('EASOTRIP', W - 14, 16, { align: 'right' });
            pdf.setFont(undefined, 'normal');
        }

        y = 46;

        // ── GUEST INFO ──────────────────────────────────────────
        sectionTitle('Guest Information');
        row('Name', guestInfo.guest_name);
        row('Phone', `${guestInfo.country_code || '+91'} ${guestInfo.guest_phone}`);
        row('Email', guestInfo.guest_email);
        y += 2;

        // ── TRIP DETAILS ────────────────────────────────────────
        sectionTitle('Trip Details');
        y += 1;

        // Two-column helpers
        const colL = marginL;          // left label x
        const colLV = marginL + 42;    // left value x
        const colR = marginL + (contentW / 2) + 4;   // right label x
        const colRV = colR + 38;       // right value x

        const twoCol = (lblL, valL, lblR, valR) => {
            checkPage(7);
            // Left label
            setC(MID); pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
            pdf.text(lblL, colL, y);
            // Left value
            setC(DARK); pdf.setFont(undefined, 'bold'); pdf.setFontSize(8.5);
            pdf.text(String(valL || '—'), colLV, y);
            // Right label (only if provided)
            if (lblR) {
                setC(MID); pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
                pdf.text(lblR, colR, y);
                setC(DARK); pdf.setFont(undefined, 'bold'); pdf.setFontSize(8.5);
                pdf.text(String(valR || '—'), colRV, y);
            }
            pdf.setFont(undefined, 'normal');
            y += 5.5;
        };

        const activeCars = (tripDetails.car_details || []).filter(c => c.car_count > 0);
        const vehicleStr = activeCars.length
            ? activeCars.map(c => `${c.car_name} (${c.car_count})`).join(', ')
            : '—';

        twoCol(
            'Travel Date',
            tripDetails.travel_date
                ? new Date(tripDetails.travel_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—',
            'Adults (Pax)',
            tripDetails.pax || '—',
        );
        twoCol(
            'Duration',
            tripDetails.duration
                ? `${tripDetails.duration} Nights / ${Number(tripDetails.duration) + 1} Days`
                : '—',
            'Kids (5+)',
            tripDetails.kids_above_5 || 0,
        );
        twoCol(
            'Pickup Location',
            tripDetails.pickup_location || '—',
            'Rooms',
            stayInfo.rooms || '—'
        );
        twoCol(
            'Dropoff Location',
            tripDetails.dropoff_location || '—',
            'Vehicles',
            vehicleStr || '—'
        );
        y += 2;


        // ── ITINERARY ───────────────────────────────────────────
        if (itinerary && itinerary.length > 0) {
            sectionTitle('Short Itinerary');
            itinerary.forEach((item, idx) => {
                const itemText = typeof item === 'string' ? item : (item?.tagValue || item?.tagName || '');
                const label = `Day ${idx + 1}:  `;
                const labelWidth = pdf.getStringUnitWidth(label) * 8.5 / pdf.internal.scaleFactor;

                // Word-wrap the content to fit after the label on first line
                const firstLineW = contentW - 6 - labelWidth;
                const bodyLines = itemText
                    ? pdf.splitTextToSize(itemText, firstLineW > 40 ? firstLineW : contentW - 6)
                    : [];

                // Prepare car info if present
                const dayCars = carSelections?.[idx] || [];
                const hasCars = dayCars.length > 0;
                let carLines = [];
                if (hasCars) {
                    const carStr = `Vehicles: ${dayCars.map(c => `${c.car_name} (${c.car_count})`).join(', ')}`;
                    carLines = pdf.splitTextToSize(carStr, contentW - 6 - labelWidth);
                }

                const totalTextLines = bodyLines.length + carLines.length;
                const rowH = Math.max(7, 5 * (totalTextLines || 1) + 2);
                checkPage(rowH + 2);

                // Alternating light bg
                if (idx % 2 === 0) {
                    fillC(LIGHT_BG);
                    pdf.rect(marginL, y - 1, contentW, rowH, 'F');
                }

                // "Day N:" bold dark-green label
                setC(DARK_GREEN); pdf.setFontSize(8.5); pdf.setFont(undefined, 'bold');
                pdf.text(label, marginL + 2, y + 4);

                // Content text — starts right after the label on the same line
                if (bodyLines.length > 0) {
                    setC(DARK); pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
                    pdf.text(bodyLines[0], marginL + 2 + labelWidth, y + 4);
                    // Subsequent wrapped lines (if any) indented to match content start
                    bodyLines.slice(1).forEach((line, li) => {
                        pdf.text(line, marginL + 2 + labelWidth, y + 4 + (li + 1) * 5);
                    });
                }

                // Append day-wise vehicles if present
                if (hasCars) {
                    setC(DARK_GREEN); pdf.setFontSize(7.5); pdf.setFont(undefined, 'bold');
                    carLines.forEach((cLine, ci) => {
                        pdf.text(cLine, marginL + 2 + labelWidth, y + 4 + (bodyLines.length + ci) * 5);
                    });
                    pdf.setFont(undefined, 'normal');
                }

                pdf.setFont(undefined, 'normal');
                y += rowH + 1;
            });
            y += 2;
        }

        // ── DETAILED ITINERARY ──────────────────────────────────
        if (detailedItinerary && detailedItinerary.trim()) {
            sectionTitle('Detailed Itinerary');
            formatDetailedItineraryInner(detailedItinerary);
            y += 4;
        }

        const extras = tripDetails.optional_extras || [];
        if (extras.length > 0) {
            sectionTitle('Optional Extras');
            extras.forEach((extra) => {
                checkPage(7);
                setC(DARK); pdf.setFontSize(8.5);
                pdf.text(`• ${extra.name}`, marginL + 5, y);
                setC(DARK); pdf.setFont(undefined, 'bold');
                pdf.text(`Rs. ${(extra.price || 0).toLocaleString()}/-`, marginR - 5, y, { align: 'right' });
                pdf.setFont(undefined, 'normal');
                y += 5.5;
            });
            y += 4;
        }

        const hotelDays = Object.keys(hotelSelections).filter(d => hotelSelections[d]?.hotelId);
        if (hotelDays.length > 0) {
            sectionTitle('Hotel Selections');
            checkPage(8);
            fillC([100, 100, 100]); pdf.rect(marginL, y - 1, contentW, 6, 'F');
            setC(WHITE); pdf.setFontSize(7.5); pdf.setFont(undefined, 'bold');
            pdf.text('Night', marginL + 2, y + 3.5);
            pdf.text('Hotel', marginL + 20, y + 3.5);
            pdf.text('Room Type', marginL + 100, y + 3.5);
            pdf.text('Meal Plan', marginL + 140, y + 3.5);
            y += 7; pdf.setFont(undefined, 'normal');

            hotelDays.forEach((dayIdx, i) => {
                checkPage(8);
                const sel = hotelSelections[dayIdx];
                const hotel = allHotels.find(h => h._id === sel.hotelId);
                if (i % 2 === 0) { fillC(LIGHT_BG); pdf.rect(marginL, y - 1, contentW, 6.5, 'F'); }
                setC(DARK); pdf.setFontSize(8);
                pdf.text(`Night ${Number(dayIdx) + 1}`, marginL + 2, y + 3.5);
                pdf.text(pdf.splitTextToSize(hotel?.hotel_name || '—', 75)[0], marginL + 20, y + 3.5);
                pdf.text(sel.roomType || '—', marginL + 100, y + 3.5);
                const mealPlanLabel = {
                    cp_plan: 'Breakfast',
                    map_plan: 'Breakfast + 1 major meal',
                    ap_plan: 'All meals',
                }[sel.mealPlan] || sel.mealPlan || '—';
                pdf.text(mealPlanLabel, marginL + 140, y + 3.5);
                y += 7;
            });
            y += 2;
        }

        checkPage(14);
        fillC(DARK_GREEN);
        pdf.rect(marginL, y, contentW, 11, 'F');
        setC(WHITE); pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
        pdf.text('TOTAL QUOTED PRICE : ', marginL + 4, y + 7.5);
        pdf.text(`Rs. ${cost.toLocaleString('en-IN')}`, marginR - 27, y + 7.5);
        pdf.setFont(undefined, 'normal');
        y += 14;

        // ── TERMS ───────────────────────────────────────────────
        checkPage(22);
        y += 4; hRule();
        setC(MID); pdf.setFontSize(7.5); pdf.setFont(undefined, 'bold');
        pdf.text('Terms & Conditions', marginL, y); y += 4;
        pdf.setFont(undefined, 'normal');
        [
            '• This is a preliminary quotation and is subject to change based on availability.',
            '• Rates are valid for the indicated travel dates only.',
            '• 50% advance required to confirm bookings.',
            '• Cancellation charges apply as per policy.',
        ].forEach(t => { checkPage(5); setC(MID); pdf.setFontSize(7.5); pdf.text(t, marginL, y); y += 4.5; });

        addFooter();

        pdf.save(generatePdfFilename(guestInfo.guest_name, tripDetails.location));
        showSnackbar('PDF exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showSnackbar('Failed to export PDF', 'error');
    } finally {
        setLoading(false);
    }
};

/**
 * Maps operation and query data to the format expected by exportQueryViewPDF.
 */
export const mapOperationToPdfData = (operationData, queriesData) => {
    const itineraryData = operationData?.followup_details?.map((item, index) => ({
        id: item._id,
        day: (index + 1).toString(),
        date: item.journey_date || '',
        place: item.destination || '',
        hotelName: item.hotel_name || '',
        hotelAmount: item.hotel_amount || '',
        hotelConfirmation: item.hotel_confirmation || '',
        checkinDate: item.checkin_date || '',
        checkoutDate: item.checkout_date || '',
        mealPlan: item.meal_plan || '',
        vehicleName: item.vehicle_name || '',
        vehiclePayment: item.vehicle_payment || '',
        vehicleStatus: item.vehicle_status || '',
        driverName: item.driver || '',
        hotelId: item.hotel_id || '',
        roomType: item.room_type || item.roomType || '',
        status: item.approved_status || '',
        rejected_reason: item.rejected_reason || [],
    })) || [];

    const guestInfo = {
        name: operationData?.guest_info?.name || '',
        country_code: operationData?.guest_info?.country_code || '+91',
        contact: operationData?.guest_info?.phone || '',
        email: operationData?.guest_info?.email || '',
        pax: operationData?.trip_details?.number_of_adults || '',
        kids_above_5: operationData?.trip_details?.number_of_kids || 0,
        hotel: queriesData?.stay_info?.hotel || '',
        roomType: queriesData?.stay_info?.room_type || queriesData?.stay_info?.roomType || '',
        rooms: queriesData?.stay_info?.rooms || '',
        carname: queriesData?.car_details?.[0]?.car_name || queriesData?.car_details?.car_name || '',
        carcount: queriesData?.car_details?.[0]?.car_count || queriesData?.car_details?.car_count || '',
        source: queriesData?.lead_source || '',
        bookingDate: operationData?.createdAt?.slice(0, 10) || '',
        tourDate: queriesData?.travel_date?.slice(0, 10) || '',
        bookingStatus: queriesData?.lead_stage || '',
        cost: queriesData?.cost || '',
        advancePayment: queriesData?.advance || '',
        location: queriesData?.destination || queriesData?.location || '',
        car_selections: queriesData?.car_selections || {},
        duePayment:
            !isNaN(parseFloat(queriesData?.cost)) && !isNaN(parseFloat(queriesData?.advance))
                ? parseFloat(queriesData.cost) - parseFloat(queriesData.advance)
                : 0,
    };

    return { guestInfo, itineraryData };
};

/**
 * Maps operation and query data specifically for CreateInquiry editing.
 */
export const mapOperationToInquiry = (operationData, queriesData, packageData = null) => {
    if (!operationData || !queriesData) return null;

    const pkg = packageData || queriesData.package_id;
    const pkgDetails = pkg?.details || pkg;

    return {
        ...queriesData,
        _id: queriesData._id,
        operation_id: operationData._id,
        guest_info: {
            guest_name: operationData.guest_info?.name || queriesData.guest_info?.guest_name,
            guest_email: operationData.guest_info?.email || queriesData.guest_info?.guest_email,
            guest_phone: operationData.guest_info?.phone || queriesData.guest_info?.guest_phone,
            guest_country_code: operationData.guest_info?.country_code || queriesData.guest_info?.guest_country_code || '+91',
        },
        pax: operationData.trip_details?.number_of_adults || queriesData.pax,
        kids_above_5: operationData.trip_details?.number_of_kids || queriesData.kids_above_5,
        destination: queriesData.destination || queriesData.location || pkg?.location,
        duration: queriesData.duration || pkg?.duration,
        travel_date: queriesData.travel_date,
        // Prioritize: 1. Followup destinations (most accurate for confirmed), 2. Manual itinerary in query, 3. Package short itinerary
        itinerary: (operationData?.followup_details?.length > 1) 
            ? operationData.followup_details.map(d => d.destination || '')
            : (queriesData?.itinerary?.length > 1) 
                ? queriesData.itinerary 
                : (pkgDetails?.shortItinerary && Array.isArray(pkgDetails.shortItinerary) && pkgDetails.shortItinerary.length > 0
                    ? extractItineraryFromPackage(pkgDetails) 
                    : (queriesData?.itinerary?.length > 0
                        ? queriesData.itinerary
                        : (operationData?.followup_details?.length > 0
                            ? operationData.followup_details.map(d => d.destination || '')
                            : []
                          )
                      )
                  ),
        followup_details: operationData?.followup_details || queriesData?.followup_details,
        car_selections: queriesData?.car_selections || {},
        hotel_season: operationData?.hotel_season || queriesData?.hotel_season || "off_season_price",
        car_season: operationData?.car_season || queriesData?.car_season || "off_season_price",
        margin: operationData?.margin || queriesData?.margin || 20,
        optional_extras: investigationExtras(queriesData, operationData),
    };
};

/**
 * Helper to find optional extras in possibly nested structures.
 * Merges and normalizes found extras.
 */
const investigationExtras = (q, o) => {
    if (!q && !o) return [];

    // Extract relevant query object if it's nested or an array
    const resolveQuery = (input) => {
        if (!input) return null;
        if (Array.isArray(input)) return input[0] || null;
        if (input.data && Array.isArray(input.data)) return input.data[0] || null;
        return input;
    };

    const query = resolveQuery(q);
    const operation = o || {};

    // Collect all potential sources of extras
    const sources = [
        query?.optional_extras,
        query?.details?.cost?.optionalExtras,
        operation?.optional_extras,
        operation?.trip_details?.optional_extras,
        // Add more legacy/variant fields if any
    ];

    const allRaw = [];
    sources.forEach(source => {
        if (Array.isArray(source)) {
            allRaw.push(...source);
        } else if (source && typeof source === 'object') {
            // In case it's a single object (rare but possible)
            allRaw.push(source);
        }
    });

    const uniqueMap = new Map();

    allRaw.forEach(item => {
        if (!item) return;
        let name = '';
        let price = 0;

        if (typeof item === 'string') {
            name = item.trim();
        } else if (typeof item === 'object') {
            name = (item.name || item.tagValue || item.tagName || item.label || '').trim();
            price = Number(item.price || 0);
        }

        if (name) {
            const key = name.toLowerCase();
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, { name, price });
            }
        }
    });

    return Array.from(uniqueMap.values());
};

/**
 * Generates and downloads/previews a PDF for the Single Query View.
 */
export const exportQueryViewPDF = async (
    {
        guestInfo,
        itineraryData,
    },
    { isPreview = false } = {},
    setLoading,
    showSnackbar
) => {
    const { default: jsPDF } = await import('jspdf');

    let logoDataUrl = null;
    try {
        const resp = await fetch('/easo.png');
        const blob = await resp.blob();
        logoDataUrl = await new Promise((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (_) { }

    setLoading(true);
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const W = pdf.internal.pageSize.getWidth();
        const H = pdf.internal.pageSize.getHeight();
        const marginL = 14;
        const marginR = W - 14;
        const contentW = marginR - marginL;
        let y = 0;

        const DARK_GREEN = [27, 94, 32];
        const WHITE = [255, 255, 255];
        const DARK = [31, 41, 55];
        const MID = [107, 114, 128];
        const LIGHT_BG = [245, 247, 250];

        const setC = (c) => pdf.setTextColor(...c);
        const fillC = (c) => pdf.setFillColor(...c);
        const drawC = (c) => pdf.setDrawColor(...c);

        const addFooter = () => {
            const pg = pdf.internal.getNumberOfPages();
            pdf.setPage(pg);
            fillC(DARK_GREEN);
            pdf.rect(0, H - 18, W, 18, 'F');
            setC(WHITE); pdf.setFontSize(8);
            pdf.text('\u2295  www.easotrip.com', marginL + 10, H - 8);
            pdf.text('\u260E  +91 70017 24300', W / 2, H - 8, { align: 'center' });
            pdf.text('\u2709  easogroup@gmail.com', marginR - 10, H - 8, { align: 'right' });
            drawC(WHITE); pdf.setLineWidth(0.3);
            pdf.line(0, H - 18, W, H - 18);
        };

        const checkPage = (needed = 8) => {
            if (y + needed > H - 22) {
                addFooter();
                pdf.addPage();
                y = 14;
            }
        };

        const sectionTitle = (title) => {
            checkPage(14);
            fillC(DARK_GREEN);
            pdf.rect(marginL, y, contentW, 7, 'F');
            setC(WHITE); pdf.setFontSize(9); pdf.setFont(undefined, 'bold');
            pdf.text(title.toUpperCase(), marginL + 3, y + 5);
            y += 10;
            pdf.setFont(undefined, 'normal');
        };

        const twoCol = (lblL, valL, lblR, valR) => {
            checkPage(7);
            const colL = marginL;
            const colLV = marginL + 42;
            const colR = marginL + (contentW / 2) + 4;
            const colRV = colR + 38;

            setC(MID); pdf.setFontSize(8);
            pdf.text(lblL, colL, y);
            setC(DARK); pdf.setFont(undefined, 'bold'); pdf.setFontSize(8.5);
            pdf.text(String(valL || '—'), colLV, y);

            if (lblR) {
                setC(MID); pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
                pdf.text(lblR, colR, y);
                setC(DARK); pdf.setFont(undefined, 'bold'); pdf.setFontSize(8.5);
                pdf.text(String(valR || '—'), colRV, y);
            }
            pdf.setFont(undefined, 'normal');
            y += 5.5;
        };

        // Header Background
        fillC(WHITE); pdf.rect(0, 0, W, 40, 'F');
        fillC(DARK_GREEN); pdf.circle(-18, -10, 38, 'F');
        drawC([220, 220, 220]); pdf.setLineWidth(0.4);
        pdf.line(0, 40, W, 40);

        if (logoDataUrl) {
            pdf.addImage(logoDataUrl, 'PNG', W - 54, 3, 44, 18);
        } else {
            setC(DARK_GREEN); pdf.setFontSize(16); pdf.setFont(undefined, 'bold');
            pdf.text('EASOTRIP', W - 14, 16, { align: 'right' });
        }

        y = 48;

        sectionTitle('Guest & Booking Information');
        twoCol('Guest Name', guestInfo.name, 'Booking Status', guestInfo.bookingStatus);
        twoCol('Contact', `${guestInfo.country_code || '+91'} ${guestInfo.contact}`, 'Source', guestInfo.source);
        twoCol('Email', guestInfo.email, 'Booking Date', guestInfo.bookingDate);
        twoCol('Destination', guestInfo.location || guestInfo.package_location || '—', 'Tour Date', guestInfo.tourDate);
        y += 4;

        sectionTitle('Trip & Stay Details');
        twoCol('Adults (Pax)', guestInfo.pax, 'Rooms', guestInfo.rooms);
        twoCol('Kids (5+)', guestInfo.kids_above_5 || 0, 'Room Type', guestInfo.roomType);
        twoCol('Car Name', guestInfo.carname, 'Car Count', guestInfo.carcount);
        y += 4;

        if (itineraryData && itineraryData.length > 0) {
            sectionTitle('Short Itinerary');
            itineraryData.forEach((item, idx) => {
                const label = `Day ${item.day}:  `;
                const labelWidth = pdf.getStringUnitWidth(label) * 8.5 / pdf.internal.scaleFactor;
                const place = item.place || '—';
                const hotel = item.hotelName ? `Hotel: ${item.hotelName}` : '';
                const vehicle = item.vehicleName ? ` | Vehicle: ${item.vehicleName}` : '';
                
                // Base itinerary content
                const itineraryContent = `${place}${hotel ? ' (' + hotel + ')' : ''}${vehicle}`;
                const bodyLines = pdf.splitTextToSize(itineraryContent, contentW - 10 - labelWidth);

                // Prepare car info if present in car_selections
                const dayCars = guestInfo.car_selections?.[idx] || [];
                const hasCars = dayCars.length > 0;
                let carLines = [];
                if (hasCars) {
                    const carStr = `Vehicles: ${dayCars.map(c => `${c.car_name} (${c.car_count})`).join(', ')}`;
                    carLines = pdf.splitTextToSize(carStr, contentW - 10 - labelWidth);
                }

                const totalTextLines = bodyLines.length + carLines.length;
                const rowH = Math.max(7, 5 * (totalTextLines || 1) + 2);
                checkPage(rowH + 2);

                if (idx % 2 === 0) {
                    fillC(LIGHT_BG);
                    pdf.rect(marginL, y - 1, contentW, rowH, 'F');
                }

                setC(DARK_GREEN); pdf.setFontSize(8.5); pdf.setFont(undefined, 'bold');
                pdf.text(label, marginL + 2, y + 4);

                setC(DARK); pdf.setFontSize(8); pdf.setFont(undefined, 'normal');
                if (bodyLines.length > 0) {
                    pdf.text(bodyLines[0], marginL + 2 + labelWidth, y + 4);
                    bodyLines.slice(1).forEach((line, li) => {
                        pdf.text(line, marginL + 2 + labelWidth, y + 4 + (li + 1) * 5);
                    });
                }
                
                if (hasCars) {
                    setC(DARK_GREEN); pdf.setFontSize(7.5); pdf.setFont(undefined, 'bold');
                    carLines.forEach((cLine, ci) => {
                        pdf.text(cLine, marginL + 2 + labelWidth, y + 4 + (bodyLines.length + ci) * 5);
                    });
                    pdf.setFont(undefined, 'normal');
                }

                y += rowH + 1;
            });
            y += 4;
        }

        checkPage(20);
        fillC(DARK_GREEN);
        pdf.rect(marginL, y, contentW, 11, 'F');
        setC(WHITE); pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
        pdf.text('TOTAL QUOTED PRICE : ', marginL + 4, y + 7.5);
        const costVal = Number(guestInfo.cost || 0);
        pdf.text(`Rs. ${costVal.toLocaleString('en-IN')}`, marginR - 35, y + 7.5, { align: 'right' });
        y += 16;

        const advance = Number(guestInfo.advancePayment || 0);
        const due = Number(guestInfo.duePayment || 0);
        twoCol('Advance Paid', `Rs. ${advance.toLocaleString('en-IN')}`, 'Amount Due', `Rs. ${due.toLocaleString('en-IN')}`);

        addFooter();

        const filename = `${guestInfo.name || 'query'}_quotation_${Date.now()}.pdf`;
        if (isPreview) {
            window.open(pdf.output('bloburl'), '_blank');
        } else {
            pdf.save(filename);
        }
        showSnackbar(isPreview ? 'PDF Preview opened' : 'PDF Downloaded successfully', 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showSnackbar('Failed to generate PDF', 'error');
    } finally {
        setLoading(false);
    }
};


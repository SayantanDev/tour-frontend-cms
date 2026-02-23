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
    const gPhone = guestInfo.guest_phone || '';
    const gCountryCode = guestInfo.country_code || '+91';
    const cleanedPhone = gPhone.startsWith(gCountryCode)
        ? gPhone.replace(gCountryCode, '').trim()
        : gPhone;

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
        package_id: selectedPackage._id,
        stay_info: {
            rooms: parseInt(stayInfo.rooms) || 0,
            hotel: stayInfo.hotel,
        },
        travel_date: tripDetails.travel_date || '',
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

export const calculateCarCost = (configData, season, tripDetails) => {
    const carDetails = tripDetails?.car_details || [];
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
            pdf.text('\u{1F310} www.easotrip.com', marginL + 10, H - 8);
            pdf.text('\u{1F4DE} +91 70017 24300', W / 2, H - 8, { align: 'center' });
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
        row('Destination', tripDetails.location);
        row('Travel Date', tripDetails.travel_date
            ? new Date(tripDetails.travel_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—');
        row('Duration', tripDetails.duration
            ? `${tripDetails.duration} Nights / ${Number(tripDetails.duration) + 1} Days`
            : '—');
        row('Adults (Pax)', tripDetails.pax || '—');
        row('Kids (5+)', tripDetails.kids_above_5 || 0);
        row('Rooms', stayInfo.rooms || '—');

        const activeCars = (tripDetails.car_details || []).filter(c => c.car_count > 0);
        if (activeCars.length) {
            row('Vehicles', activeCars.map(c => `${c.car_name} × ${c.car_count}`).join(', '));
        }
        if (selectedPackage?.label) row('Package', selectedPackage.label);
        y += 2;

        // ── ITINERARY ───────────────────────────────────────────
        if (itinerary && itinerary.length > 0) {
            sectionTitle('Day-by-Day Itinerary');
            itinerary.forEach((item, idx) => {
                checkPage(16);
                fillC(LIGHT_BG);
                pdf.rect(marginL, y - 1, contentW, 7, 'F');
                setC(PRIMARY); pdf.setFontSize(8.5); pdf.setFont(undefined, 'bold');
                pdf.text(`Day ${idx + 1}${item.title ? ` — ${item.title}` : ''}`, marginL + 2, y + 4);
                pdf.setFont(undefined, 'normal');
                y += 8;
                if (item.description) {
                    setC(DARK); pdf.setFontSize(8);
                    const lines = pdf.splitTextToSize(item.description, contentW - 4);
                    lines.forEach(line => { checkPage(6); pdf.text(line, marginL + 4, y); y += 5; });
                }
                y += 2;
            });
        }

        // ── HOTEL SELECTIONS ────────────────────────────────────
        const hotelDays = Object.keys(hotelSelections).filter(d => hotelSelections[d]?.hotelId);
        if (hotelDays.length > 0) {
            sectionTitle('Hotel Selections');
            checkPage(8);
            fillC(DARK_GREEN); pdf.rect(marginL, y - 1, contentW, 6, 'F');
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
                pdf.text(sel.mealPlan || '—', marginL + 140, y + 3.5);
                y += 7;
            });
            y += 2;
        }

        // ── COST SUMMARY ────────────────────────────────────────
        sectionTitle('Cost Summary');
        const hCost = hotelCostCalculation(hotelSelections, allHotels, hotelSeason, tripDetails, stayInfo);
        const cCost = calculateCarCost(configData, carSeason, tripDetails);
        const margin = Number(currentMargin) || 0;
        const totalDays = (Number(tripDetails.duration) || 0) + 1;

        [
            ['Hotel Cost', `₹ ${hCost.toLocaleString('en-IN')}`],
            ['Transport Cost', `₹ ${cCost.toLocaleString('en-IN')}`],
            ['Margin', `${margin}%`],
        ].forEach(([lbl, val]) => {
            checkPage(7);
            setC(MID); pdf.setFontSize(8.5);
            pdf.text(lbl, marginL + 4, y);
            setC(DARK); pdf.setFont(undefined, 'bold');
            pdf.text(val, marginR, y, { align: 'right' });
            pdf.setFont(undefined, 'normal');
            y += 6;
        });

        hRule(DARK_GREEN);

        checkPage(14);
        fillC(DARK_GREEN);
        pdf.rect(marginL, y, contentW, 11, 'F');
        setC(WHITE); pdf.setFontSize(11); pdf.setFont(undefined, 'bold');
        pdf.text('TOTAL QUOTED PRICE', marginL + 4, y + 7.5);
        pdf.text(`₹ ${cost.toLocaleString('en-IN')}`, marginR - 2, y + 7.5, { align: 'right' });
        pdf.setFont(undefined, 'normal');
        y += 14;

        if (tripDetails.pax && Number(tripDetails.pax) > 0) {
            checkPage(7);
            setC(MID); pdf.setFontSize(8);
            const perPerson = Math.round(cost / Number(tripDetails.pax));
            pdf.text(
                `Per person (${tripDetails.pax} adults): ₹ ${perPerson.toLocaleString('en-IN')}`,
                marginR, y, { align: 'right' }
            );
            y += 5;
        }

        if (tripDetails.duration) {
            setC(ACCENT); pdf.setFontSize(8);
            pdf.text(`${tripDetails.duration} Nights · ${totalDays} Days · ${tripDetails.location}`, marginL, y);
            y += 6;
        }

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


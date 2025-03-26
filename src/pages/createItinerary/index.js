import React, { useState, useEffect } from "react";
import FilterBar from "./FilterBar";
import FilteredObject from "./FilteredObject";
import SelectedPkg from "./SelectedPkg";
import { Divider, Box } from '@mui/material';
import { CONFIG_STR } from "../../configuration";
import { getAllPackages } from '../../api/packageAPI';
import { useSelector } from "react-redux";
const CreateItinerary = () => {
    const { fetchSelectedInquiry: inquiryData } = useSelector((state) => state.inquiries);
    // console.log("fetchSelectedInquiry : ", inquiryData);

    const [filterObject, setFilterObject] = useState({
        location: '',
        duration: '',
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
        landRate: "",
        transportUpDown: false,
        transportUp: false,
        transportDown: false,
        porterSandakphu: false,
        porterSandakphuPhalut: false
    });
    const [initalData, setInitialData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [secondDropdownOptions, setSecondDropdownOptions] = useState([]);
    const [cardClicked, setCardClicked] = useState(false);
    const [selectedCard, setSelectedCard] = useState({});
    const [totalQuotetionCost, setTotalQuotetionCost] = useState(0);
    useEffect(() => {
        let allData = [];
        getAllPackages()
            .then((res) => {
                res.data
                    .filter(pkg => pkg.location === 'Sandakphu')
                    .map((pkg) => {
                        let curObj = {
                            id: pkg._id,
                            location: pkg.location,
                            locSecond: pkg.type,
                            title: pkg.label,
                            duration: pkg?.details?.header?.h2,
                            price: (pkg?.type === 'Trek') ? pkg?.details?.cost?.singleCost : pkg?.details?.cost?.multipleCost[0]?.Budget,
                            overview: pkg?.details?.overview,
                            itinerary: pkg?.details?.shortItinerary,
                            inclusions:pkg?.details?.cost?.inclusions,
                            exclusions:pkg?.details?.cost?.exclusions
                        };

                        allData.push(curObj);;
                        return true;
                    });

                res.data
                    .filter(pkg => pkg.location === 'Sikkim')
                    .map((pkg) => {
                        let curObj = {
                            id: pkg._id,
                            location: pkg.location,
                            locSecond: pkg.type,
                            title: pkg.label,
                            duration: pkg?.details?.header?.h2,
                            price: pkg?.details?.cost?.valueCost[2]?.price,
                            overview: pkg?.details?.overview,
                            itinerary: pkg?.details?.shortItinerary,
                            inclusions:pkg?.details?.cost?.inclusions,
                            exclusions:pkg?.details?.cost?.exclusions
                        };

                        allData.push(curObj);;
                        return true;
                    });
                    res.data
                    .filter(pkg => pkg.location === 'North Sikkim')
                    .map((pkg) => {
                        let curObj = {
                            id: pkg._id,
                            location: pkg.location,
                            locSecond: pkg.type,
                            title: pkg.label,
                            duration: pkg?.details?.header?.h2,
                            price: pkg?.details?.cost?.valueCost[2]?.price,
                            overview: pkg?.details?.overview,
                            itinerary: pkg?.details?.shortItinerary,
                            inclusions:pkg?.details?.cost?.inclusions,
                            exclusions:pkg?.details?.cost?.exclusions
                        };

                        allData.push(curObj);;
                        return true;
                    });

                setInitialData(allData);
            })
            .catch((err) => {
                console.log('Get packages error:', err);
            });
    }, []);
    const handleDropdownChange = (event, arg) => {
        event.preventDefault();
        switch (arg) {
            case 'locationChange':
                setFilterObject((prev) => ({
                    ...prev,
                    locationSecond: '',
                    location: event.target.value,
                }));
                if (event.target.value === 'Sikkim') {
                    setSecondDropdownOptions(['All', 'Tour', 'Adventure', 'Honeymoon', 'Others']);
                    const locData = initalData.filter((loc) => loc.location === 'Sikkim');
                    setFilteredData(locData);
                }else if (event.target.value === 'North Sikkim') {
                    setSecondDropdownOptions(['All', 'Tour', 'Adventure', 'Honeymoon', 'Others']);
                    const locData = initalData.filter((loc) => loc.location === 'North Sikkim');
                    setFilteredData(locData);
                }
                 else if (event.target.value === 'Sandakphu') {
                    setSecondDropdownOptions(['All', 'Trek', 'Land Rover']);
                    const locData = initalData.filter((loc) => loc.location === 'Sandakphu');
                    setFilteredData(locData);
                } else if (event.target.value === 'Darjeeling') {
                    setSecondDropdownOptions(['All', 'Darjeeling', 'Kalimpong', 'kurseong', 'Dooars']);
                    const locData = initalData.filter((loc) => loc.location === 'Darjeeling');
                    setFilteredData(locData);
                } else {
                    setSecondDropdownOptions([]);
                }
                break;
            case 'locationSecondChange':
                setFilterObject((prev) => ({
                    ...prev,
                    sandakphuTrek: '',
                    sandakphuRover: '',
                    locationSecond: event.target.value,
                }));
                if (filteredData[0]?.location === 'Sandakphu') {
                    const locData = initalData.filter(loc => (loc.location === 'Sandakphu'));
                    console.log('all', locData)
                    if (event.target.value === 'All') {
                        setFilteredData(locData);
                    } else if (event.target.value === 'Trek') {
                        const locDataTrk = locData.filter(loc => (loc.locSecond === 'Trek'));
                        locDataTrk.length && setFilteredData(locDataTrk);
                    } else if (event.target.value === 'Land Rover') {
                        const locDataRvr = locData.filter(loc => (loc.locSecond === 'LandRover'));
                        locDataRvr.length && setFilteredData(locDataRvr);
                    }
                } else if (filteredData[0]?.location === 'Sikkim') {
                    const locData = initalData.filter(loc => (loc.location === 'Sikkim'));
                    if (event.target.value === 'All') {
                        setFilteredData(locData);
                    } else if (event.target.value === 'Tour') {
                        const locDataTour = locData.filter(loc => (loc.locSecond === 'Tour'));
                        locDataTour.length && setFilteredData(locDataTour);
                    } else if (event.target.value === 'Adventure') {
                        const locDataTrek = locData.filter(loc => (loc.locSecond === 'Adventure'));
                        locDataTrek.length && setFilteredData(locDataTrek);
                    } else if (event.target.value === 'Honeymoon') {
                        const locDataHoneymoon = locData.filter(loc => (loc.locSecond === 'Honeymoon'));
                        locDataHoneymoon.length && setFilteredData(locDataHoneymoon);
                    } else if (event.target.value === 'Others') {
                        const locDataOthers = locData.filter(loc => (loc.locSecond === 'Others'));
                        locDataOthers.length && setFilteredData(locDataOthers);
                    }
                }else if (filteredData[0]?.location === 'North Sikkim') {
                    const locData = initalData.filter(loc => (loc.location === 'North Sikkim'));
                    if (event.target.value === 'All') {
                        setFilteredData(locData);
                    } else if (event.target.value === 'Tour') {
                        const locDataTour = locData.filter(loc => (loc.locSecond === 'Tour'));
                        locDataTour.length && setFilteredData(locDataTour);
                    } else if (event.target.value === 'Adventure') {
                        const locDataTrek = locData.filter(loc => (loc.locSecond === 'Adventure'));
                        locDataTrek.length && setFilteredData(locDataTrek);
                    } else if (event.target.value === 'Honeymoon') {
                        const locDataHoneymoon = locData.filter(loc => (loc.locSecond === 'Honeymoon'));
                        locDataHoneymoon.length && setFilteredData(locDataHoneymoon);
                    } else if (event.target.value === 'Others') {
                        const locDataOthers = locData.filter(loc => (loc.locSecond === 'Others'));
                        locDataOthers.length && setFilteredData(locDataOthers);
                    }
                }
                break;
            case 'trekChange':
                setFilterObject((prev) => ({
                    ...prev,
                    sandakphuTrek: event.target.value,
                }));
                break;
            case 'roverChange':
                setFilterObject((prev) => ({
                    ...prev,
                    sandakphuRover: event.target.value,
                }));
                break;
            case 'durationChange':
                setFilterObject((prev) => ({
                    ...prev,
                    duration: event.target.value,
                }));
                break;
            default:
                break;
        }
    };
    const handleRangeChange = (event, newValue) => {
        setFilterObject((prev) => ({
            ...prev,
            rangeValue: newValue,
        }));
    };

    const handleCardClick = (title, locn, sndLoc) => {
        const selectCard = initalData.filter(loc => (loc.title === title && loc.location === locn && loc.locSecond === sndLoc));
        setSelectedCard(selectCard[0]);
        setCardClicked(!cardClicked);
    };

    const handleBack = () => {
        setCardClicked(!cardClicked);
    };

    // const handleCustomerInputChange = (event) => {
    //     event.preventDefault();
    //     const { name, value } = event.target;
    //     switch (name) {
    //         case 'name':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 name: value,
    //             }));
    //             break;
    //         case 'phone':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 phone: value,
    //             }));
    //             break;
    //         case 'email':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 email: value,
    //             }));
    //             break;
    //         case 'startDate':
    //             console.log('sssssssssss', value)
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 startDate: value,
    //             }));
    //             break;
    //         case 'hotel':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 hotel: value,
    //             }));
    //             break;
    //         case 'car':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 car: value,
    //             }));
    //             break;
    //         case 'pax':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 pax: value,
    //             }));
    //             break;
    //         case 'days':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 days: value,
    //             }));
    //             break;
    //         case 'rooms':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 rooms: value,
    //             }));
    //             break;
    //         case 'carCount':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 carCount: value,
    //             }));
    //             break;
    //         case 'trekRate':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 trekRate: value,
    //             }));
    //             break;
    //         case 'transportUpDown':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 transportUpDown: value,
    //             }));
    //             break;
    //         case 'transportUp':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 transportUp: value,
    //             }));
    //             break;
    //         case 'transportDown':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 transportDown: value,
    //             }));
    //             break;
    //         case 'porterSandakphu':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 porterSandakphu: value,
    //             }));
    //             break;
    //         case 'porterSandakphuPhalut':
    //             setCustomerInput((prev) => ({
    //                 ...prev,
    //                 porterSandakphuPhalut: value,
    //             }));
    //             break;
    //         default:
    //             setCustomerInput((prev) => ({
    //                 ...prev
    //             }));
    //             break;
    //     }
    // };

    const handleCustomerInputChange = (event) => {
        event.preventDefault();
        const { name, type, value, checked } = event.target;

        setCustomerInput((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
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
                {cardClicked && <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgcolor="rgba(255, 255, 255, 0.7)"
                    zIndex={1}
                    onClick={(e) => e.stopPropagation()}
                />}
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box flex="0 0 70%" display="flex" alignItems="left" justifyContent="center">
                {!cardClicked && <FilteredObject
                    filteredData={filteredData}
                    handleCardClick={handleCardClick}
                />}
                {cardClicked && <SelectedPkg
                    selectedCard={selectedCard}
                    cardClicked={cardClicked}
                    setCardClicked={setCardClicked}
                    handleBack={handleBack}
                    customerInput={customerInput}
                    totalQuotetionCost={totalQuotetionCost}
                />}
            </Box>
        </Box>
    );
}

export default CreateItinerary;
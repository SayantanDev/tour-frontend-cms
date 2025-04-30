import React, { useState } from 'react';
import { Button, Box, Tabs, Tab} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Header,
    AlignmentType,
    TabStopType,
    TabStopPosition,
} from "docx";

import { saveAs } from 'file-saver';
import { createQueries } from '../../api/queriesAPI';
// import parse from 'html-react-parser';
// import { TravelExplore } from '@mui/icons-material';
import BasicInfo from '../../components/ItineraryTabs/BasicInfo';
import ShortItinerary from '../../components/ItineraryTabs/ShortItinerary';
import Reach from '../../components/ItineraryTabs/Reach';
import { useDispatch, useSelector } from "react-redux";
import { createPackage } from '../../api/packageAPI';
import useSnackbar from '../../hooks/useSnackbar';
import { removePackageInfo } from '../../reduxcomponents/slices/packagesSlice';
const SelectedPkg = ({ selectedCard, handleBack, customerInput,setCustomerInput, totalQuotetionCost }) => {
    const dispatch = useDispatch();
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const { fetchNewPackageInfo: pakageData } = useSelector((state) => state.package);
    const [tab, setTab] = useState(0);
    console.log("fetchNewPackageInfo :", pakageData);


    const handleChange = (event, newValue) => {
        setTab(newValue);
    };


    const queriesValueObj = {
        guest_info: {
            guest_name: customerInput.name || "",
            guest_email: customerInput.email || "",
            guest_phone: customerInput.phone || "",
        },
        pax: customerInput.pax || "",
        stay_info: {
            rooms: customerInput.rooms || "",
            hotel: customerInput.hotel || "",
        },
        car_details: {
            car_name: customerInput.car || "",
            car_count: customerInput.carCount || "",
        },
        package_id: selectedCard.id,
        travel_date: customerInput.startDate || "",
        duration: customerInput.days || "",
        cost: totalQuotetionCost || 0,
        destination: selectedCard.location,
        lead_stage: "new",
        lead_source: "website",
        verified: true,
    };

    const createPackageObj = {
        location: pakageData?.location,
        type: pakageData?.type,
        url: `${pakageData?.location.toLowerCase()}-tour-${customerInput.days - 1}n-${customerInput.days}d`,
        label: `${pakageData?.location} Tour ${customerInput.days - 1}N ${customerInput.days}D`,
        duration: customerInput.days,
    };
    // useEffect(() => {
    //     console.log("queriesValueObj :", queriesValueObj);

    // },[selectedCard,createPackageObj]);


    const handleNext = async () => {
        try {
            if (selectedCard && Object.keys(selectedCard).length === 0) {
                console.log("AAAAAAAAAAAAAAAA");
                
                const packageObject = { ...pakageData, ...createPackageObj };
                console.log("packageObject :", packageObject);
                
                // const resCreatePakg = await createPackage(packageObject);
                // if (resCreatePakg.success) {
                //     showSnackbar('You created a new package', 'success');
                // } else {
                //     showSnackbar('Something went wrong', 'error');
                // }
            }
    
            const response = await createQueries(queriesValueObj);
    
            if (response.success) {
                showSnackbar('Queries created successfully', 'success');
    
                // Fallback for optional arrays
                const itineraryList = selectedCard?.itinerary || [];
                const inclusionList = selectedCard?.inclusions || [];
                const exclusionList = selectedCard?.exclusions || [];
    
                const doc = new Document({
                    sections: [
                        {
                            properties: {},
                            headers: {
                                default: new Header({
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [
                                                new TextRun({
                                                    text: `${selectedCard.title || "Tour Plan"} Detailed Plan`,
                                                    bold: true,
                                                    size: 36,
                                                }),
                                            ],
                                            spacing: { after: 300 },
                                        }),
                                    ],
                                }),
                            },
                            children: [
                                new Paragraph({
                                    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                                    children: [
                                        new TextRun({ text: "Trip Details:", bold: true }),
                                        new TextRun("\t"),
                                        new TextRun({ text: "Guest Details:", bold: true }),
                                    ],
                                    spacing: { after: 200 },
                                }),
                                new Paragraph({
                                    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                                    children: [
                                        new TextRun(`Hotel: ${customerInput.hotel || "-"}`),
                                        new TextRun("\t"),
                                        new TextRun(`Name: ${customerInput.name || "-"}`),
                                    ],
                                }),
                                new Paragraph({
                                    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                                    children: [
                                        new TextRun(`Rooms: ${customerInput.rooms || "-"}`),
                                        new TextRun("\t"),
                                        new TextRun(`Phone: ${customerInput.phone || "-"}`),
                                    ],
                                }),
                                new Paragraph({
                                    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                                    children: [
                                        new TextRun(`Persons: ${customerInput.pax || "-"}`),
                                        new TextRun("\t"),
                                        new TextRun(`Email: ${customerInput.email || "-"}`),
                                    ],
                                    spacing: { after: 200 },
                                }),
    
                                new Paragraph(`Location: ${selectedCard.location || "-"}`),
                                new Paragraph(`Car Name: ${customerInput.car || "-"}`),
                                new Paragraph(`Total Car: ${customerInput.carCount || "-"}`),
                                new Paragraph(`Journey Date: ${new Date(customerInput.startDate).toLocaleDateString()}`),
    
                                ...(customerInput.days >= 1
                                    ? [new Paragraph(`Duration: ${customerInput.days - 1}N / ${customerInput.days}D`)]
                                    : []),
    
                                new Paragraph({
                                    text: `Cost: Rs. ${totalQuotetionCost}`,
                                    bold: true,
                                    spacing: { after: 200, before: 200 },
                                }),
    
                                new Paragraph({
                                    text: "Itinerary",
                                    bold: true,
                                    spacing: { after: 200 },
                                }),
                                ...itineraryList.map(item =>
                                    new Paragraph(`${item.tagName || "-"}: ${item.tagValue || "-"}`)
                                ),
    
                                new Paragraph({ text: "Inclusion", bold: true, spacing: { before: 200 } }),
                                ...inclusionList.map(item => new Paragraph(item || "-")),
    
                                new Paragraph({ text: "Exclusion", bold: true, spacing: { before: 200 } }),
                                ...exclusionList.map(item => new Paragraph(item || "-")),
                            ],
                        },
                    ],
                });

                const blob = await Packer.toBlob(doc);
                saveAs(blob, "generated-document.docx");
                dispatch(removePackageInfo());
                // console.log("Document generated successfully!");
            }
        } catch (error) {
            console.error("Error generating document or API call:", error);
            showSnackbar("Error generating document", "error");
        }
    };
    

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2 }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 68,
                        right: 56,
                        display: 'flex',
                        gap: 1,
                        pb: 1,
                    }}
                >
                    <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={handleBack}
                        startIcon={<ArrowBack />}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={handleNext}
                    >
                        Generate
                    </Button>
                </Box>
                {/* further contant */}
                <Tabs value={tab} onChange={handleChange} centered>
                    <Tab label="Basic Info" />
                    <Tab label="Short Itinerary" />
                    <Tab label="How to reach" />
                </Tabs>
                {tab === 0 && <BasicInfo customerInput={customerInput} totalQuotetionCost={totalQuotetionCost} />}
                {tab === 1 && <ShortItinerary 
                customerInput={customerInput} 
                selectedCard={selectedCard}
                setCustomerInput={setCustomerInput}
                />}
                {tab === 2 && <Reach selectedCard={selectedCard} />}

            </Box>
            <SnackbarComponent />
        </>
    );
};

export default SelectedPkg;

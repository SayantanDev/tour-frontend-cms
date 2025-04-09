import React from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
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
import parse from 'html-react-parser';
import { TravelExplore } from '@mui/icons-material';

const SelectedPkg = ({ selectedCard, handleBack, customerInput, totalQuotetionCost }) => {
    console.log("selectedCard:", selectedCard);
    console.log("customerInput:", customerInput);

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
    console.log("selectedCard.destination :",selectedCard.location);
    

    const handleNext = async () => {
        try {
            // Make API call first
            const response = await createQueries(queriesValueObj);

            if (response.success) {
                alert("Queries created successfully");
                console.log("Queries created successfully",response);
                

                // Now generate the document
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
                                                    text: `${selectedCard.title} Detailed Plan`,
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
                                // Guest Details & Trip Details Side by Side (Without Table)
                                new Paragraph({
                                    tabStops: [
                                        { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                                    ],
                                    children: [
                                        new TextRun({ text: "Trip Details:", bold: true }),
                                        new TextRun("\t"), // Moves text to the right
                                        new TextRun({ text: "Guest Details:", bold: true }),
                                    ],
                                    spacing: { after: 200 },
                                }),
                
                                new Paragraph({
                                    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                                    children: [
                                        new TextRun(`Hotel: ${customerInput.hotel}`),
                                        new TextRun("\t"),
                                        new TextRun(`Name: ${customerInput.name}`),
                                    ],
                                }),
                
                                new Paragraph({
                                    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                                    children: [
                                        new TextRun(`Rooms: ${customerInput.rooms}`),
                                        new TextRun("\t"),
                                        new TextRun(`Phone: ${customerInput.phone}`),
                                    ],
                                }),
                
                                new Paragraph({
                                    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                                    children: [
                                        new TextRun(`Persons: ${customerInput.pax}`),
                                        new TextRun("\t"),
                                        new TextRun(`Email: ${customerInput.email}`),
                                    ],
                                    spacing: { after: 200 },
                                }),
                
                                new Paragraph(`Location: ${selectedCard.location}`),
                                new Paragraph(`Car Name: ${customerInput.car}`),
                                new Paragraph(`Total Car: ${customerInput.carCount}`),
                                new Paragraph(`Type: ${customerInput.carCount}`),
                                new Paragraph(`Journey Date: ${new Date(customerInput.startDate).toLocaleDateString()}`),
                
                                ...(customerInput.days >= 1
                                    ? [new Paragraph(`Duration: ${customerInput.days - 1}N / ${customerInput.days}D`)]
                                    : []
                                ),
                
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
                                ...selectedCard.itinerary.map(item => new Paragraph(`${item.tagName}: ${item.tagValue}`)),
                
                                new Paragraph({
                                    text: "Inclusion",
                                    bold: true,
                                    spacing: { before: 200 },
                                }),
                                ...selectedCard.inclusions?.map(item => new Paragraph(`${item}`)),
                
                                new Paragraph({
                                    text: "Exclusion",
                                    bold: true,
                                    spacing: { before: 200 },
                                }),
                                ...selectedCard.exclusions?.map(item => new Paragraph(`${item}`)),
                            ],
                        },
                    ],
                });
                

                const blob = await Packer.toBlob(doc);
                saveAs(blob, "generated-document.docx");

                console.log("Document generated successfully!");
            }
        } catch (error) {
            console.error("Error generating document or API call:", error);
        }
    };

    return (
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
            <Paper elevation={3} sx={{ padding: 5, width: '100%' }}>
                <Typography variant="h3" gutterBottom align="center">
                    <b>{selectedCard.title}</b> Detailed Plan
                </Typography>

                <Typography variant="h5" gutterBottom>Guest Details:</Typography>
                <Typography variant="body1" sx={{ pl: 3, pb: 2 }}>
                    <b>Name:</b> {customerInput.name} <br />
                    <b>Phone:</b> {customerInput.phone} <br />
                    <b>Email:</b> {customerInput.email}
                </Typography>

                <Typography variant="h5" gutterBottom>Trip Details:</Typography>
                <Typography variant="body1" sx={{ pl: 3, pb: 2 }}>
                    <b>Location:</b> {selectedCard.location} <br />
                    <b>Hotel:</b> {customerInput.hotel} <br />
                    <b>Rooms:</b> {customerInput.rooms} <br />
                    <b>Number of Person:</b> {customerInput.pax} <br />
                    <b>Car Name:</b> {customerInput.car} <br />
                    <b>Total Car:</b> {customerInput.carCount <= 1 ? 1 : customerInput.carCount} <br />
                    <b>Date of journey:</b> {new Date(customerInput.startDate).toLocaleDateString()} <br />
                    {customerInput.days >= 1 && (
                        <>
                            <b>Duration:</b> {customerInput.days - 1}N / {customerInput.days}D <br />
                        </>
                    )}
                </Typography>
                <Typography variant="h5" gutterBottom>Cost: Rs. {totalQuotetionCost}</Typography>


                <Typography variant="h5" gutterBottom>Short Itinerary:</Typography>
                <Typography variant="body1" sx={{ pl: 3, pb: 2 }}>
                    {selectedCard.itinerary.map((item, index) => (
                        <div key={index}>
                            <b>{item.tagName}:</b> {item.tagValue}
                        </div>
                    ))}
                </Typography>


                <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                    <Box>
                        <Typography variant="h5" gutterBottom>Inclusion</Typography>
                        <Typography variant="body1" sx={{ pl: 1, pb: 2 }}>
                            {selectedCard.inclusions?.map((item, index) => (
                                <div key={index}>{item}</div>
                            ))}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="h5" gutterBottom>Exclusion</Typography>
                        <Typography variant="body1" sx={{ pl: 1, pb: 2 }}>
                            {selectedCard.exclusions?.map((item, index) => (
                                <div key={index}>{item}</div>
                            ))}
                        </Typography>
                    </Box>
                </Box>

                {/* <Typography variant="h5" gutterBottom>Overview :</Typography>
                <Typography variant="body1">
                    {Array.isArray(selectedCard.overview) ? (
                        selectedCard.overview.map((elem, index) => (
                            <div key={index}>
                                <b>{elem.tagName}:</b> {elem.tagValue}
                            </div>
                        ))
                    ) : (
                        parse(selectedCard.overview.para)
                    )}
                </Typography> */}

                {/* <Typography variant="h6" gutterBottom>Details Itinerary:</Typography> */}
                {/* <Typography variant="body1">
                    {selectedCard.itinerary.map((elem, index) => (
                        <div key={index}><b>{elem.tagName}:</b> {elem.tagValue}</div>
                    ))}
                </Typography> */}
            </Paper>
        </Box>
    );
};

export default SelectedPkg;

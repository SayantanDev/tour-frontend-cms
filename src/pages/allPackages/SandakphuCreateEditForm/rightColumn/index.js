import React, {useState} from "react";
import Header from './header';
import Overview from './overview';
import Sitinerary from './sItinerary';
import Itinerary from './itinerary';
import Reach from './reach';
import Cost from './cost';
import Carry from './carry';
import { List, ListItem, Box, Button, TextField, Typography, Grid,  } from '@mui/material';

const RightColumn = ({
    sandakphuFormData, 
    clickedButton, 
    handleSandakDtlChange, 
    handleSandakphuChange
}) => {
    // const [ pageDetails, setPageDetails ] = useState(sandakphuFormData?.details);

    const headerUpdate = (obj) => {
        const newData = {
            ...sandakphuFormData?.details,
            header: obj
        };
        handleSandakDtlChange(newData);
    };
    const overviewUpdate = (obj) => {
        const newData = {
            ...sandakphuFormData?.details,
            overview: obj
        };
        handleSandakDtlChange(newData);
    };
    const reachUpdate = (obj) => {
        const newData = {
            ...sandakphuFormData?.details,
            howToReach: obj
        };
        handleSandakDtlChange(newData);
    };
    const costUpdate = (obj) => {
        const newData = {
            ...sandakphuFormData?.details,
            cost: obj
        };
        handleSandakDtlChange(newData);
    };
    const carryUpdate = (obj) => {
        const newData = {
            ...sandakphuFormData?.details,
            thingsToCarry: obj
        };
        handleSandakDtlChange(newData);
    };

    // const dtlChange = (e) => {
    //     const { name, value} = e.target;
    //     let newData = {};
    //     switch(name) {
    //         case 'headerh1':
    //             newData = {
    //                 ...pageDetails,
    //                 header: {
    //                     ...pageDetails.header,
    //                     h1: value
    //                 }
    //             };
    //             setPageDetails(newData);
    //             handleSandakDtlChange(newData);
    //             break;
    //         case 'headerh2':
    //             newData = {
    //                 ...pageDetails,
    //                 header: {
    //                     ...pageDetails.header,
    //                     h2: value
    //                 }
    //             };
    //             setPageDetails(newData);
    //             handleSandakDtlChange(newData);
    //             break;
    //         case 'headerh3':
    //             newData = {
    //                 ...pageDetails,
    //                 header: {
    //                     ...pageDetails.header,
    //                     h3: value
    //                 }
    //             };
    //             setPageDetails(newData);
    //             handleSandakDtlChange(newData);
    //             break;
    //         case 'overview_Duration':
    //             newData = {
    //                 ...pageDetails,
    //                 overview: pageDetails.overview.map(item => {
    //                     if (item.tagName === 'Duration') {
    //                         return { ...item, tagValue: value };
    //                     }
    //                     return item;
    //                 })
    //             };
    //             setPageDetails(newData);
    //             handleSandakDtlChange(newData);
    //             break;
    //         case 'overview_Difficulty Level':
    //             newData = {
    //                 ...pageDetails,
    //                 overview: pageDetails.overview.map(item => {
    //                     if (item.tagName === 'Difficulty Level') {
    //                         return { ...item, tagValue: value };
    //                     }
    //                     return item;
    //                 })
    //             };
    //             setPageDetails(newData);
    //             handleSandakDtlChange(newData);
    //             break;
    //         case 'overview_Closest Rail Station':
    //             newData = {
    //                 ...pageDetails,
    //                 overview: pageDetails.overview.map(item => {
    //                     if (item.tagName === 'Closest Rail Station') {
    //                         return { ...item, tagValue: value };
    //                     }
    //                     return item;
    //                 })
    //             };
    //             setPageDetails(newData);
    //             handleSandakDtlChange(newData);
    //             break;
    //         case 'overview_Closest Airport':
    //             newData = {
    //                 ...pageDetails,
    //                 overview: pageDetails.overview.map(item => {
    //                     if (item.tagName === 'Closest Airport') {
    //                         return { ...item, tagValue: value };
    //                     }
    //                     return item;
    //                 })
    //             };
    //             setPageDetails(newData);
    //             handleSandakDtlChange(newData);
    //             break;
    //         case 'overview_Best Season':
    //             newData = {
    //                 ...pageDetails,
    //                 overview: pageDetails.overview.map(item => {
    //                     if (item.tagName === 'Best Season') {
    //                         return { ...item, tagValue: value };
    //                     }
    //                     return item;
    //                 })
    //             };
    //             setPageDetails(newData);
    //             handleSandakDtlChange(newData);
    //             break;
    //         default:
    //             setPageDetails(pageDetails);
    //             handleSandakDtlChange(pageDetails);
    //             break;

    //     }
    // }
    
    return (
        <Grid item xs={6}>
            {clickedButton === 'Header' && 
                <Header 
                    headerData={sandakphuFormData?.details.header}
                    headerUpdate={headerUpdate}
                />
            }
            
            {clickedButton === 'Overview' && 
                <Overview 
                    overviewData={sandakphuFormData?.details.overview}
                    overviewUpdate={overviewUpdate}
                />
            }
            
            {clickedButton === 'S. Itinerary' && 
                <>
                    <Grid container spacing={2} sx={{ marginTop: 2 }} >
                        <Box 
                            display="flex" 
                            justifyContent="space-between" 
                            alignItems="left" 
                            padding={1}
                            width="100%"
                        >
                            <Typography variant="h5">Short Itinerary</Typography>
                            <Button variant="contained" color="primary" size="small">
                                +
                            </Button>
                        </Box>
                        <Grid item xs={12}>
                            <List>
                            {sandakphuFormData.details.shortItinerary.map((item, index) => (
                                <ListItem key={index}>
                                    <Typography variant="body1" sx={{ marginRight: 1, width: '60px'  }}>
                                        {item.tagName}:
                                    </Typography>
                                    <TextField
                                        value={item.tagValue}
                                        // onChange={(e) => handleTagValueChange(index, e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                </ListItem>
                            ))}
                            </List>
                        </Grid>
                    </Grid>
                </>
            }
            
            {clickedButton === 'Itinerary' && 
                <>
                    <Grid container spacing={2} sx={{ marginTop: 2 }} >
                        <Typography variant="h5">Itinerary</Typography>
                    </Grid>
                </>
            }
            
            {clickedButton === 'Reach' && 
                <Reach 
                    reachData={sandakphuFormData?.details.howToReach}
                    reachUpdate={reachUpdate}
                />
            }
            
            {clickedButton === 'Cost' && 
                <Cost 
                    costData={sandakphuFormData?.details.cost}
                    costUpdate={costUpdate}
                    tourType={sandakphuFormData?.type}
                />
            }
            
            {clickedButton === 'Carry' && 
                <Carry
                    carryData={sandakphuFormData?.details.thingsToCarry}
                    carryUpdate={carryUpdate}
                    label={sandakphuFormData.label}
                />
            }

        </Grid>
    );
}
  
export default RightColumn;
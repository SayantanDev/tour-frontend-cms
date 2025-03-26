import React from "react";
import { Grid, Typography, TextField } from '@mui/material';

const Overview = ({overviewData, overviewUpdate}) => {

    const overviewChange = (e) => {
        const { name, value} = e.target;
        let newOverview = {};
        switch(name) {
            case 'overview_Duration':
                newOverview = overviewData.map(item => {
                        if (item.tagName === 'Duration') {
                            return { ...item, tagValue: value };
                        }
                        return item;
                    });
                overviewUpdate(newOverview);
                break;
            case 'overview_Difficulty Level':
                newOverview = overviewData.map(item => {
                        if (item.tagName === 'Difficulty Level') {
                            return { ...item, tagValue: value };
                        }
                        return item;
                    });
                overviewUpdate(newOverview);
                // newData = {
                //     ...pageDetails,
                //     overview: pageDetails.overview.map(item => {
                //         if (item.tagName === 'Difficulty Level') {
                //             return { ...item, tagValue: value };
                //         }
                //         return item;
                //     })
                // };
                // handleSandakDtlChange(newData);
                break;
            case 'overview_Closest Rail Station':
                newOverview = overviewData.map(item => {
                        if (item.tagName === 'Closest Rail Station') {
                            return { ...item, tagValue: value };
                        }
                        return item;
                    });
                overviewUpdate(newOverview);
                // newData = {
                //     ...pageDetails,
                //     overview: pageDetails.overview.map(item => {
                //         if (item.tagName === 'Closest Rail Station') {
                //             return { ...item, tagValue: value };
                //         }
                //         return item;
                //     })
                // };
                // handleSandakDtlChange(newData);
                break;
            case 'overview_Closest Airport':
                newOverview = overviewData.map(item => {
                        if (item.tagName === 'Closest Airport') {
                            return { ...item, tagValue: value };
                        }
                        return item;
                    });
                overviewUpdate(newOverview);
                // newData = {
                //     ...pageDetails,
                //     overview: pageDetails.overview.map(item => {
                //         if (item.tagName === 'Closest Airport') {
                //             return { ...item, tagValue: value };
                //         }
                //         return item;
                //     })
                // };
                // handleSandakDtlChange(newData);
                break;
            case 'overview_Best Season':
                newOverview = overviewData.map(item => {
                        if (item.tagName === 'Best Season') {
                            return { ...item, tagValue: value };
                        }
                        return item;
                    });
                overviewUpdate(newOverview);
                // newData = {
                //     ...pageDetails,
                //     overview: pageDetails.overview.map(item => {
                //         if (item.tagName === 'Best Season') {
                //             return { ...item, tagValue: value };
                //         }
                //         return item;
                //     })
                // };
                // handleSandakDtlChange(newData);
                break;
            default:
                overviewUpdate(overviewData);
                break;

        }
    }
    
    return (
        <Grid container spacing={2} sx={{ marginTop: 2 }} >
            <Typography variant="h5">Overview</Typography>
            {overviewData.map((item, index) => (
                <Grid item xs={12} key={index}>
                    <TextField
                        label={item.tagName}
                        name={`overview_${item.tagName}`}
                        value={item.tagValue}
                        onChange={overviewChange}
                        fullWidth
                        size="small"
                />
                </Grid>
            ))}
        </Grid>
    );
}
  
export default Overview;
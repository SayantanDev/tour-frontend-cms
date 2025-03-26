import React from "react";
import { Grid, List, ListItem, ListItemText, AccordionDetails, Accordion, 
    AccordionSummary, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, TextField, Paper, Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Cost = ({costData, costUpdate, tourType}) => {
    const costChange = (e) => {
        const newCost = {
            ...costData,
            singleCost: Number(e.target.value)
        };
        costUpdate(newCost);
    }

    const handleCostInputChange = (row, type, cost) => {
        const updatedCosts = [...costData.multipleCost];
        updatedCosts[row][type] = Number(cost);
        const newCost = {
            ...costData,
            multipleCost: updatedCosts
        };
        costUpdate(newCost);
    }
    
    return (
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Typography variant="h5">Cost</Typography>
            {(tourType ==='Trek') 
                ? <TextField
                    label="Per Head Cost"
                    name="singleCost"
                    value={costData.singleCost}
                    onChange={costChange}
                    fullWidth
                    size="small"
                    margin="normal"
                /> 
                : <Paper style={{ padding: '4px' }}>
                    <Grid container spacing={1} alignItems="center">
                        <Grid container item xs={12} justifyContent="center" style={{ marginBottom: '4px' }}>
                            <Grid item xs={4} align="center"><strong>Pax</strong></Grid>
                            <Grid item xs={4} align="center"><strong>Standard</strong></Grid>
                            <Grid item xs={4} align="center"><strong>Budget</strong></Grid>
                        </Grid>
                        
                        {costData.multipleCost.map((cost, index) => (
                            <Grid container item xs={12} key={index} justifyContent="center">
                                <Grid item xs={4} align="center">{cost.pax}</Grid>
                                <Grid item xs={4} align="center">
                                    <TextField
                                        type="number"
                                        value={cost.Standard}
                                        onChange={(e) => handleCostInputChange(index, 'Standard', e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        style={{ width: '100px' }}
                                    />
                                </Grid>
                                <Grid item xs={4} align="center">
                                    <TextField
                                        type="number"
                                        value={cost.Budget}
                                        onChange={(e) => handleCostInputChange(index, 'Budget', e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        style={{ width: '100px' }}
                                    />
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            }
            
            <Grid spacing={2} xs={12}>
                <Accordion sx={{ width: '100%' }} size="small">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body1">Cost Inclusions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <List>
                        {costData.inclusions.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={item} />
                        </ListItem>
                        ))}
                    </List>
                    </AccordionDetails>
                </Accordion>

                <Accordion sx={{ width: '100%' }} size="small">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1">Cost Exclusions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <List>
                        {costData.exclusions.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={item} />
                        </ListItem>
                        ))}
                    </List>
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </Grid>
    );
}
  
export default Cost;
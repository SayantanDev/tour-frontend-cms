import React, {useEffect} from "react";
import { List, ListItem, ListItemText, Typography, AccordionDetails, 
    Grid, Accordion, AccordionSummary } from '@mui/material';
    import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Carry = ({carryData, carryUpdate, label}) => {
    useEffect(() => {
        const cryObj = carryData;
        if (label.includes("Land Rover")) {
            for (let key in cryObj) {
                if (key !== "Basics") {
                    delete cryObj[key];
                }
            }
        }
        carryUpdate(cryObj);
    }, [label]);
    
    return (
        <Grid container spacing={2} sx={{ marginTop: 2 }} >
            <Typography variant="h5">Things To Carry</Typography>
            
            <div>
                <Accordion sx={{ width: '100%' }} size="small">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body1">Basics</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <List>
                        {carryData.Basics.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={item} />
                        </ListItem>
                        ))}
                    </List>
                    </AccordionDetails>
                </Accordion>
                {/* {(!label.includes("Land Rover")) &&
                <> */}
                     {(!label.includes("Land Rover")) && <Accordion sx={{ width: '100%' }} size="small">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body1">Documents</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <List>
                            {carryData?.Documents.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={item} />
                            </ListItem>
                            ))}
                        </List>
                        </AccordionDetails>
                    </Accordion> }
                    
                    {(!label.includes("Land Rover")) && <Accordion sx={{ width: '100%' }} size="small">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body1">Clothing</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <List>
                            {carryData?.Clothing.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={item} />
                            </ListItem>
                            ))}
                        </List>
                        </AccordionDetails>
                    </Accordion> }
                    
                    {(!label.includes("Land Rover")) && <Accordion sx={{ width: '100%' }} size="small">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body1">Medicine</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <List>
                            {carryData?.Medicine.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={item} />
                            </ListItem>
                            ))}
                        </List>
                        </AccordionDetails>
                    </Accordion> }
                    
                    {(!label.includes("Land Rover")) && <Accordion sx={{ width: '100%' }} size="small">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body1">Toiletries</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <List>
                            {carryData?.Toiletries.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={item} />
                            </ListItem>
                            ))}
                        </List>
                        </AccordionDetails>
                    </Accordion> }
                    
                    {(!label.includes("Land Rover")) && <Accordion sx={{ width: '100%' }} size="small">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body1">Accessories</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <List>
                            {carryData?.Accessories.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={item} />
                            </ListItem>
                            ))}
                        </List>
                        </AccordionDetails>
                    </Accordion> }
                {/* </>} */}
            </div>
        </Grid>
    );
}
  
export default Carry;
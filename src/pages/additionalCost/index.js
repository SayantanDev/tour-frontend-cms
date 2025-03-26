import React, {useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Paper,
    TextField,
    Grid,
    Box
  } from '@mui/material';
  import { CONFIG_STR } from '../../configuration';
  

const AdditionalCost = () => {
    const [carTypes, setCarTypes] = useState(CONFIG_STR.additionalCosts.car);
    const [hotelTypes, setHotelTypes] = useState(CONFIG_STR.additionalCosts.hotel);

    
    return (
        <div style={{ padding: '20px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, padding: 2, width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Car Types</h2>
                        {/* <Button variant="contained" color="primary" onClick={handleAddCarRow} style={{ marginTop: '10px' }}>
                            Add Car
                        </Button> */}
                    </div>
                    <TableContainer component={Paper}>
                        <Table>
                        <TableHead>
                            <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Cost</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {carTypes.map((car, index) => (
                            <TableRow key={index}>
                                <TableCell>{car.type}</TableCell>
                                <TableCell>{car.cost}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Hotel Types</h2>
                        {/* <Button variant="contained" color="primary" onClick={handleAddHotelRow} style={{ marginTop: '10px' }}>
                            Add Hotel
                        </Button> */}
                    </div>    
                    <TableContainer component={Paper}>
                        <Table>
                        <TableHead>
                            <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Cost</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hotelTypes.map((hotel, index) => (
                            <TableRow key={index}>
                                <TableCell>{hotel.type}</TableCell>
                                <TableCell>{hotel.cost}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
            
        
        </div>
    );
}
  
export default AdditionalCost;
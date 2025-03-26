import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,Slider, Button, TextField
  //RadioGroup,FormControlLabel,Radio,Checkbox,TextField,
} from '@mui/material';
import { CONFIG_STR } from "../../configuration";

const FilterBar = ({
    CONFIG_STR,
    filterObject, 
    setFilterObject,
    handleDropdownChange, 
    secondDropdownOptions,
    handleRangeChange,
    setFilteredData,
    handleCustomerInputChange,
    customerInput,
    setCustomerInput,
    totalQuotetionCost,
    setTotalQuotetionCost
  }) => {

  const handleReset = () => {
    setFilterObject({
      location: '',
      duration: 0,
      locationSecond: '',
      sandakphuTrek: '',
      sandakphuRover: '',
      rangeValue: [0, 20000]
    });
    setFilteredData([]);
    setCustomerInput({
      name: '',
      phone: '',
      email: '',
      startDate: '',
      hotel: '',
      car: '',
      pax: 0,
      rooms: 0,
    })
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, width: '100%' }}>
      <Box sx={{ display: 'flex',justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <Button 
          variant="contained" 
          onClick={handleReset} 
          size="small" 
          sx={{ 
            backgroundColor: 'red', 
            color: 'white', 
            '&:hover': { backgroundColor: 'darkred' } 
          }}
        >
            Reset
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl variant="outlined" size="small" fullWidth>
          <InputLabel id="dropdown-location">Location</InputLabel>
          <Select
            // labelId="dropdown-location"
            value={filterObject.location}
            onChange={(e) => handleDropdownChange(e, 'locationChange')}
            label="Dropdown"
            size="small"
          >
            <MenuItem value={'Darjeeling'}>Darjeeling</MenuItem>
            <MenuItem value={'Sikkim'}>Sikkim</MenuItem>
            <MenuItem value={'Sandakphu'}>Sandakphu</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" size="small" fullWidth disabled={!filterObject.location.length}>
          <InputLabel id="second-dropdown-label">Select Item</InputLabel>
          <Select
            // labelId="second-dropdown-label"
            value={filterObject.locationSecond}
            onChange={(e) => handleDropdownChange(e, 'locationSecondChange')}
            label="Select Item"
            size="small"
          >
          {secondDropdownOptions?.map((option) => (
            <MenuItem key={option} value={option}>
            {option}
            </MenuItem>
          ))}
          </Select>
        </FormControl>
      </Box>
      
      {filterObject.location === 'Sandakphu' && filterObject.locationSecond === 'Trek' &&
        <FormControl variant="outlined" size="small" fullWidth disabled={!filterObject.location.length}>
          <InputLabel id="dropdown-trek">Treks</InputLabel>
          <Select
              // labelId="dropdown-trek"
              value={filterObject.sandakphuTrek}
              onChange={(e) => handleDropdownChange(e, 'trekChange')}
              label="Select Item"
              size="small"
          >
            {CONFIG_STR?.sandakphuPackages.filter(trkPkg => (trkPkg.type === 'Trek'))
              .map((trkPkg) =>(
              <MenuItem key={trkPkg.url} value={trkPkg.url}>
              {trkPkg.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
      {filterObject.location === 'Sandakphu' && filterObject.locationSecond === 'Land Rover' &&
        <FormControl variant="outlined" size="small" fullWidth disabled={!filterObject.location.length}>
          <InputLabel id="dropdown-rover">Rover Trip</InputLabel>
          <Select
              // labelId="dropdown-rover"
              value={filterObject.sandakphuRover}
              onChange={(e) => handleDropdownChange(e, 'roverChange')}
              label="Select Item"
              size="small"
          >
            {CONFIG_STR?.sandakphuPackages.filter(rvrPkg => (rvrPkg.type === 'LandRover'))
              .map((rvrPkg) =>(
              <MenuItem key={rvrPkg.url} value={rvrPkg.url}>
              {rvrPkg.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }

      {/* <FormControl variant="outlined" size="small">
          <InputLabel id="dropdown-night">Duration</InputLabel>
          <Select
              // labelId="dropdown-night"
              value={filterObject?.duration}
              onChange={(e) => handleDropdownChange(e, 'durationChange')}
              label="Dropdown"
              size="small"
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value={1}>1N & 2D</MenuItem>
            <MenuItem value={2}>2N & 3D</MenuItem>
            <MenuItem value={3}>3N & 4D</MenuItem>
            <MenuItem value={4}>4N & 5D</MenuItem>
            <MenuItem value={5}>5N & 6D</MenuItem>
            <MenuItem value={6}>6N & 7D</MenuItem>
            <MenuItem value={7}>7N & 8D</MenuItem>
            <MenuItem value={8}>8N & 9D</MenuItem>
            <MenuItem value={9}>9N & 10D</MenuItem>
            <MenuItem value={10}>10N & 11D</MenuItem>
          </Select>
      </FormControl> */}

      {/* <Box>
        <InputLabel id="dropdown-rover">Price Range</InputLabel>
        <Slider
          value={filterObject.rangeValue}
          onChange={handleRangeChange}
          valueLabelDisplay="auto"
          min={0}
          max={20000}
          sx={{ width: 300 }}
        />
      </Box> */}

      
      {(filterObject.location !== '')
        && <>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            name="name"
            // labelId="name"
            label="Name"
            type="text"
            value={customerInput.name}
            onChange={(e) => handleCustomerInputChange(e)}
            variant="outlined"
            size="small"
            fullWidth
            disabled={(filterObject.location === '')}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            name="phone"
            // labelId="phone"
            label="Phone"
            type="text"
            value={customerInput.phone}
            onChange={(e) => handleCustomerInputChange(e)}
            variant="outlined"
            size="small"
            fullWidth
            disabled={(filterObject.location === '')}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            name="email"
            // labelId="email"
            label="Email"
            type="text"
            value={customerInput.email}
            onChange={(e) => handleCustomerInputChange(e)}
            variant="outlined"
            size="small"
            fullWidth
            disabled={(filterObject.location === '')}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" fullWidth disabled={(filterObject.location === '')}>
            <TextField
              name="pax"
              label="Pax"
              type="number"
              value={customerInput.pax}
              onChange={(e) => handleCustomerInputChange(e)}
              variant="outlined"
              size="small"
            />
          </FormControl>
          <FormControl variant="outlined" size="small" fullWidth disabled={(filterObject.location === '')}>
            <TextField
              name="rooms"
              label="Rooms"
              type="number"
              value={customerInput.rooms}
              onChange={(e) => handleCustomerInputChange(e)}
              variant="outlined"
              size="small"
            />
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" fullWidth disabled={(filterObject.location === '')}>
            <TextField
              name="startDate"
              type="date"
              value={customerInput.startDate}
              onChange={(e) => handleCustomerInputChange(e)}
              variant="outlined"
              size="small"
            />
          </FormControl>
          <FormControl variant="outlined" size="small" fullWidth disabled={(filterObject.location === 'Sandakphu' || filterObject.location === '')}>
              <InputLabel id="dropdown-hotel">Hotel</InputLabel>
              <Select
                  name="hotel"
                  value={customerInput.hotel || ''}
                  onChange={(e) => handleCustomerInputChange(e)}
                  label="Select Item"
                  size="small"
              >
                {CONFIG_STR.additionalCosts.hotel.map((ht, index) => (
                  <MenuItem value={ht.type} key={index}>{ht.type}</MenuItem>
                ))}
              </Select>
          </FormControl>
        </Box>


        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" fullWidth disabled={(filterObject.location === 'Sandakphu' || filterObject.location === '')}>
              <InputLabel id="dropdown-car">Car</InputLabel>
              <Select
                name="car"
                value={customerInput.car || ''}
                onChange={(e) => handleCustomerInputChange(e)}
                label="Car Type"
                size="small"
              >
                {CONFIG_STR.additionalCosts.car.map((cr, index) => (
                  <MenuItem value={cr.type} key={index}>{cr.type}</MenuItem>
                ))}
              </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" fullWidth disabled={(filterObject.location === '')}>
            <TextField
              name="carCount"
              label="Car Count"
              type="number"
              value={customerInput.carCount}
              onChange={(e) => handleCustomerInputChange(e)}
              variant="outlined"
              size="small"
            />
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" fullWidth disabled={ (filterObject.location === '')}>
              <InputLabel id="dropdown-car">Choose Season Rate </InputLabel>
              <Select
                name="seasonRate"
                value={''}
                onChange={(e) => handleCustomerInputChange(e)}
                label="Car Type"
                size="small"
              >
                {/* {CONFIG_STR.additionalCosts.car.map((cr, index) => (
                  <MenuItem value={cr.type} key={index}>{cr.type}</MenuItem>
                ))} */}
                  <MenuItem value={""} >Rack Rate{`(${totalQuotetionCost})`}</MenuItem>
              </Select>
          </FormControl>
        </Box>
      </>}
      

    </Box>
  );
};

export default FilterBar;
import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography, Slider, Button, TextField,
  FormControlLabel,
  Checkbox
  //RadioGroup,FormControlLabel,Radio,Checkbox,TextField,
} from '@mui/material';
import { CONFIG_STR } from "../../configuration";
import { useDispatch } from 'react-redux';
import { setNewPackageInfo } from '../../reduxcomponents/slices/packagesSlice';

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
  const dispatch = useDispatch();
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
      days: 0,
      rooms: 0,
    });
    setTotalQuotetionCost(0)
  };
  const [totalCost, setTotalCost] = useState(0);
  useEffect(() => {
    if (filterObject.location === 'Sandakphu') {
      if (filterObject.locationSecond === 'Trek') {
        calculateSandakphuTrekCost();
      } else if (filterObject.locationSecond === 'Land Rover') {
        console.log("1222121");
        calculateSandakphuLandRoverCost();
      } else {
        calculateTotalCost();
      }
    } else {
      calculateTotalCost();
    }
    if (customerInput.days > 0) {
  dispatch(setNewPackageInfo({ duration: Number(customerInput.days) }));
      
    }
  }, [filterObject, customerInput]); // ✅ Added filterObject to dependency array


  const calculateTotalCost = () => {
    const days = Number(customerInput.days) || 0;
    const carPrice = CONFIG_STR.additionalCosts.car.find(c => c.type === customerInput.car)?.cost || 0;
    const carCount = Number(customerInput.carCount) || 0;
    const hotelPrice = CONFIG_STR.additionalCosts.hotel.find(h => h.type === customerInput.hotel)?.cost || 0;
    const rooms = Number(customerInput.rooms) || 0;
    const pax = Number(customerInput.pax) || 0;

    if (days > 0) {
      let calculatedCost = ((days * (carPrice * carCount)) + ((days - 1) * ((hotelPrice * rooms) + ((pax % rooms) * 500)))) * 1.2;

      // Adjust cost based on selected location
      if (filterObject.location === 'North Sikkim') {
        calculatedCost *= 1.05; // Increase by 5%
      } else if (filterObject.location === 'Darjeeling') {
        calculatedCost *= 0.95; // Decrease by 5%
      }

      setTotalCost(calculatedCost);
    } else {
      setTotalCost(0);
    }
  };

  const calculateSandakphuTrekCost = () => {
    const pax = Number(customerInput.pax) || 0;
    const rate = Number(customerInput.trekRate) || 0;
    let totalCost = rate * pax;
    // Determine number of cars required
    let numCars = Math.ceil(pax / 8);
    let transportCost = 0;

    if (customerInput.transportUpDown) {
      transportCost += 12000 * numCars;
    } else {
      if (customerInput.transportUp) transportCost += 5000 * numCars;
      if (customerInput.transportDown) transportCost += 7000 * numCars;
    }

    // Add porter costs
    if (customerInput.porterSandakphu) totalCost += 4000;
    if (customerInput.porterSandakphuPhalut) totalCost += 4000;

    // Add transport cost
    totalCost += transportCost;
    totalCost *= 1.2;
    setTotalCost(totalCost);

    // setTotalQuotetionCost(totalCost);
  };

  const calculateSandakphuLandRoverCost = () => {
    const pax = Number(customerInput.pax) || 0;
    let rate = 0;
    let extraCharge = 0;

    // Assign rate and extra charge based on selection
    switch (customerInput.landRate) {
      case "Sandakphu_Budget":
        rate = 8500;
        extraCharge = 2400;
        break;
      case "Sandakphu_Standard":
        rate = 8500;
        extraCharge = 3500;
        break;
      case "Sandakphu_Phalut_Budget":
        rate = 13500;
        extraCharge = 3600;
        break;
      case "Sandakphu_Phalut_Standard":
        rate = 13500;
        extraCharge = 5200;
        break;
      default:
        rate = 0;
        extraCharge = 0;
    }

    let totalCost = 0;


    // Adjust calculation based on pax count
    if (pax > 0 && pax <= 6) {
      let perhead = pax > 0 ? (rate / pax) + extraCharge : 0;

      totalCost = perhead * pax;
    } else {
      totalCost = (rate * Math.ceil(pax / 6)) + (extraCharge * pax);
    }

    // Determine number of cars required
    let numCars = Math.ceil(pax / 8);
    let transportCost = 0;

    if (customerInput.transportUpDown) {
      transportCost += 9000 * numCars;
    } else {
      if (customerInput.transportUp) transportCost += 4500 * numCars;
      if (customerInput.transportDown) transportCost += 4500 * numCars;
    }

    // Add porter costs
    if (customerInput.porterSandakphu) totalCost += 4000;
    if (customerInput.porterSandakphuPhalut) totalCost += 4000;

    // Add transport cost
    totalCost += transportCost;

    // Apply 20% markup
    totalCost *= 1.2;

    setTotalCost(totalCost);
  };


  const handleSeasonRateChange = (event) => {
    const rateType = event.target.value;
    let finalCost = totalCost;

    switch (rateType) {
      case 'final':
        finalCost *= 0.9;
        break;
      case 'peak':
        finalCost *= 1.5;
        break;
      case 'offSeason':
        finalCost *= 0.95;
        break;
      case 'b2b':
        finalCost *= 0.9;
        break;
      default:
        break;
    }
    setTotalQuotetionCost(finalCost);
  };

  const handleSandakphuRateChange = (event) => {
    const rateType = event.target.value;
    let finalCost = totalCost;

    switch (rateType) {
      case 'final':
        finalCost *= 0.9;
        break;
      case 'b2b':
        finalCost *= 0.95; // 5% off
        break;
      default:
        break;
    }
    setTotalQuotetionCost(finalCost);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
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
      <Box sx={{ display: 'flex', gap: 2, width: '420px' }}>
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
            <MenuItem value={'North Sikkim'}>North Sikkim</MenuItem>
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
              .map((trkPkg) => (
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
              .map((rvrPkg) => (
                <MenuItem key={rvrPkg.url} value={rvrPkg.url}>
                  {rvrPkg.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      }

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
          {(filterObject.location !== 'Sandakphu')
            && <>
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
                    name="days"
                    label="Day(s)"
                    type="number"
                    value={customerInput.days}
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
              <Typography>Total Cost: {totalCost.toFixed(2)}</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Choose Season Rate</InputLabel>
                  <Select  onChange={handleSeasonRateChange}>
                    <MenuItem value="rack">Rack Rate ({totalCost.toFixed(2)})</MenuItem>
                    <MenuItem value="final">Final Rate ({(totalCost * 0.9).toFixed(2)})</MenuItem>
                    <MenuItem value="peak">Peak Rate ({(totalCost * 1.5).toFixed(2)})</MenuItem>
                    <MenuItem value="offSeason">Off Season ({(totalCost * 0.95).toFixed(2)})</MenuItem>
                    <MenuItem value="b2b">B2B ({(totalCost * 0.9).toFixed(2)})</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          }
        </>}

      {filterObject.location === 'Sandakphu' && filterObject.locationSecond === 'Trek' && (
        <>
          {/* Pax Input */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" fullWidth>
              <TextField
                name="pax"
                label="Pax"
                type="number"
                value={customerInput.pax || ''}
                onChange={handleCustomerInputChange}
                variant="outlined"
                size="small"
              />
            </FormControl>
          </Box>

          {/* Trek Rate Selection */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="dropdown-rate">Choose Rate</InputLabel>
              <Select
                name="trekRate"
                value={customerInput.trekRate || ''}
                onChange={handleCustomerInputChange}
                label="Choose Rate"
                size="small"
              >
                <MenuItem value={9600}>Sandakphu Rate (₹9,600/-)</MenuItem>
                <MenuItem value={12800}>Sandakphu-Phalut Rate (₹12,800/-)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Add-on Options */}
          <Box>
            <Typography variant="subtitle1">Add-ons (Optional)</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  name="transportUpDown"
                  checked={customerInput.transportUpDown || false}
                  onChange={handleCustomerInputChange}
                />
              }
              label="Transport (Up & Down)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="transportUp"
                  checked={customerInput.transportUp || false}
                  onChange={handleCustomerInputChange}
                />
              }
              label="Transport (siliguri-dhotry)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="transportDown"
                  checked={customerInput.transportDown || false}
                  onChange={handleCustomerInputChange}
                />
              }
              label="Transport (srikhola-siliguri)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="porterSandakphu"
                  checked={customerInput.porterSandakphu || false}
                  onChange={handleCustomerInputChange}
                />
              }
              label="Porter (Sandakphu)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="porterSandakphuPhalut"
                  checked={customerInput.porterSandakphuPhalut || false}
                  onChange={handleCustomerInputChange}
                />
              }
              label="Porter (Sandakphu-Phalut)"
            />
          </Box>
          <Typography>Total Cost: {totalCost.toFixed(2)}</Typography>

          <Box sx={{ display: 'flex', gap: 2, marginBottom: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Choose Season Rate</InputLabel>
              <Select onChange={handleSandakphuRateChange}>
                <MenuItem value="rack">Rack Rate ({totalCost.toFixed(2)})</MenuItem>
                <MenuItem value="b2b">B2B ({(totalCost * 0.95).toFixed(2)})</MenuItem>
              </Select>
            </FormControl>
          </Box>

        </>
      )}




      {filterObject.location === 'Sandakphu' && filterObject.locationSecond === 'Land Rover' && (
        <>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" fullWidth>
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
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="dropdown-rate">Choose Rate</InputLabel>
              <Select
                name="landRate"
                value={customerInput.landRate || ''}
                onChange={handleCustomerInputChange}
                label="Choose Rate"
                size="small"
              >
                <MenuItem value={"Sandakphu_Budget"}>Sandakphu (Budget)</MenuItem>
                <MenuItem value={"Sandakphu_Standard"}>Sandakphu (Standard)</MenuItem>
                <MenuItem value={"Sandakphu_Phalut_Budget"}>Sandakphu-phalut (Budget)</MenuItem>
                <MenuItem value={"Sandakphu_Phalut_Standard"}>Sandakphu-phalut (Standard)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {/* Add-on Options */}
          <Box>
            <Typography variant="subtitle1">Add-ons (Optional)</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  name="transportUpDown"
                  checked={customerInput.transportUpDown || false}
                  onChange={handleCustomerInputChange}
                />
              }
              label="Transport (Up & Down)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="transportUp"
                  checked={customerInput.transportUp || false}
                  onChange={handleCustomerInputChange}
                />
              }
              label="Transport (Up)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="transportDown"
                  checked={customerInput.transportDown || false}
                  onChange={handleCustomerInputChange}
                />
              }
              label="Transport (Down)"
            />

          </Box>
          <Typography>
            Total Cost: {totalCost.toFixed(2)} ({(totalCost / customerInput.pax).toFixed(2)}/per person)
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, marginBottom: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Choose Season Rate</InputLabel>
              <Select onChange={handleSandakphuRateChange}>
                <MenuItem value="rack">Rack Rate ({totalCost.toFixed(2)})</MenuItem>
                <MenuItem value="b2b">B2B ({(totalCost * 0.95).toFixed(2)})</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </>
      )}

    </Box>
  );
};

export default FilterBar;
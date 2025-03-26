import React, { useState, useEffect } from 'react';
import countryList from 'react-select-country-list';
import { TextField, Button, Typography, Container, Select, MenuItem } from '@mui/material';

function WhatsAppSender() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [options, setOptions] = useState('IN');

  useEffect(() => {
    // Initialize country data
    const options = Object.entries(countryList()).map(([code, name]) => ({
      value: code,
      label: `${code} - ${name}`,
    }));
    setOptions(options);
  }, []);

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleCountryCodeChange = (event) => {
    setCountryCode(event.target.value);
  };

  const handleSendMessage = () => {
    const url = `https://wa.me/${countryCode}${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Send WhatsApp Message
      </Typography>

      <Select
        labelId="country-code-label"
        id="country-code"
        value={countryCode}
        onChange={handleCountryCodeChange}
        style={{ marginBottom: '20px' }}
      >
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      <TextField
        label="Phone Number"
        variant="outlined"
        fullWidth
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        style={{ marginBottom: '20px' }}
      />
      <TextField
        label="Message"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={message}
        onChange={handleMessageChange}
        style={{ marginBottom: '20px' }}
      />
      <Button variant="contained" color="primary" onClick={handleSendMessage} fullWidth>
        Send Message
      </Button>
    </Container>
  );
}

export default WhatsAppSender;
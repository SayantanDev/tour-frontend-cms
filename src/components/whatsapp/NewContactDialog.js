import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
} from '@mui/material';
import { createNewChat } from '../../api/whatsappAPI';

const NewContactDialog = ({ open, onClose, onChatCreated }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        // Remove all non-digit characters except +
        value = value.replace(/[^\d+]/g, '');
        setPhoneNumber(value);
        setError('');
    };

    const handleNameChange = (e) => {
        setCustomerName(e.target.value);
        setError('');
    };

    const validatePhoneNumber = (phone) => {
        // Remove + and spaces, check if it's a valid number
        const cleaned = phone.replace(/[^\d]/g, '');
        // Should be at least 10 digits (country code + number)
        return cleaned.length >= 10;
    };

    const handleSubmit = async () => {
        setError('');

        // Validation
        if (!phoneNumber.trim()) {
            setError('Phone number is required');
            return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid phone number (with country code, e.g., +1234567890)');
            return;
        }

        setLoading(true);
        try {
            const chatData = {
                phoneNumber: phoneNumber.trim(),
                customerName: customerName.trim() || phoneNumber.trim(),
            };

            const result = await createNewChat(chatData);

            // Callback to refresh chat list and select the new chat
            if (onChatCreated) {
                onChatCreated(result.data || result);
            }

            // Reset form
            setPhoneNumber('');
            setCustomerName('');
            onClose();
        } catch (err) {
            console.error('Failed to create chat:', err);
            setError(err.response?.data?.message || err.message || 'Failed to create chat. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setPhoneNumber('');
            setCustomerName('');
            setError('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Enter a phone number to start a new WhatsApp conversation. Make sure to include the country code (e.g., +1234567890).
                    </Typography>

                    <TextField
                        fullWidth
                        label="Phone Number"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        disabled={loading}
                        required
                        sx={{ mb: 2 }}
                        helperText="Include country code (e.g., +1 for US, +91 for India)"
                    />

                    <TextField
                        fullWidth
                        label="Customer Name (Optional)"
                        placeholder="Enter customer name"
                        value={customerName}
                        onChange={handleNameChange}
                        disabled={loading}
                        helperText="Leave empty to use phone number as name"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !phoneNumber.trim()}
                >
                    {loading ? 'Creating...' : 'Start Conversation'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewContactDialog;


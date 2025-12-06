import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { WHATSAPP_API_CONFIG } from '../../api/whatsappAPI';

const WhatsAppConfigDialog = ({ open, onClose }) => {
    const [provider, setProvider] = useState(WHATSAPP_API_CONFIG.provider);
    const [baseURL, setBaseURL] = useState(WHATSAPP_API_CONFIG.baseURL);
    const [apiKey, setApiKey] = useState(WHATSAPP_API_CONFIG.getApiKey());
    const [apiSecret, setApiSecret] = useState(WHATSAPP_API_CONFIG.getApiSecret());
    const [accountSid, setAccountSid] = useState(WHATSAPP_API_CONFIG.getAccountSid());
    const [phoneNumberId, setPhoneNumberId] = useState(WHATSAPP_API_CONFIG.getPhoneNumberId());
    const [businessAccountId, setBusinessAccountId] = useState(WHATSAPP_API_CONFIG.getBusinessAccountId());
    const [apiVersion, setApiVersion] = useState(WHATSAPP_API_CONFIG.getApiVersion());
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (open) {
            // Load current values
            setProvider(WHATSAPP_API_CONFIG.provider);
            setBaseURL(WHATSAPP_API_CONFIG.baseURL);
            setApiKey(WHATSAPP_API_CONFIG.getApiKey());
            setApiSecret(WHATSAPP_API_CONFIG.getApiSecret());
            setAccountSid(WHATSAPP_API_CONFIG.getAccountSid());
            setPhoneNumberId(WHATSAPP_API_CONFIG.getPhoneNumberId());
            setBusinessAccountId(WHATSAPP_API_CONFIG.getBusinessAccountId());
            setApiVersion(WHATSAPP_API_CONFIG.getApiVersion());
            setSaved(false);
        }
    }, [open]);

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem('whatsapp_provider', provider);
        localStorage.setItem('whatsapp_base_url', baseURL);
        localStorage.setItem('whatsapp_api_key', apiKey);
        localStorage.setItem('whatsapp_api_secret', apiSecret);
        localStorage.setItem('whatsapp_account_sid', accountSid);
        localStorage.setItem('whatsapp_phone_number_id', phoneNumberId);
        localStorage.setItem('whatsapp_business_account_id', businessAccountId);
        localStorage.setItem('whatsapp_api_version', apiVersion);

        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
            // Reload page to apply new config
            window.location.reload();
        }, 1500);
    };

    const getProviderInfo = (provider) => {
        switch (provider) {
            case 'twilio':
                return {
                    name: 'Twilio',
                    baseURL: 'https://conversations.twilio.com',
                    fields: ['accountSid', 'apiSecret'],
                    description: 'Twilio Conversations API for WhatsApp',
                };
            case 'whatsapp-business':
            case 'meta-whatsapp':
                return {
                    name: 'Meta WhatsApp Cloud API',
                    baseURL: 'https://graph.facebook.com',
                    fields: ['apiKey', 'phoneNumberId', 'businessAccountId', 'apiVersion'],
                    description: 'Meta WhatsApp Cloud API (Official)',
                };
            case 'chatapi':
                return {
                    name: 'ChatAPI',
                    baseURL: 'https://eu1.chat-api.com/instance12345',
                    fields: ['apiKey'],
                    description: 'ChatAPI WhatsApp service',
                };
            case '360dialog':
                return {
                    name: '360dialog',
                    baseURL: 'https://waba-api.360dialog.io/v1',
                    fields: ['apiKey'],
                    description: '360dialog WhatsApp Business API',
                };
            default:
                return {
                    name: 'Custom',
                    baseURL: '',
                    fields: ['apiKey'],
                    description: 'Custom WhatsApp API provider',
                };
        }
    };

    const providerInfo = getProviderInfo(provider);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">WhatsApp API Configuration</Typography>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                    {saved && (
                        <Alert severity="success">Configuration saved! Reloading...</Alert>
                    )}

                    <FormControl fullWidth>
                        <InputLabel>Provider</InputLabel>
                        <Select
                            value={provider}
                            label="Provider"
                            onChange={(e) => {
                                setProvider(e.target.value);
                                const info = getProviderInfo(e.target.value);
                                setBaseURL(info.baseURL);
                            }}
                        >
                            <MenuItem value="twilio">Twilio</MenuItem>
                            <MenuItem value="whatsapp-business">Meta WhatsApp Cloud API</MenuItem>
                            <MenuItem value="meta-whatsapp">Meta WhatsApp (Alternative)</MenuItem>
                            <MenuItem value="chatapi">ChatAPI</MenuItem>
                            <MenuItem value="360dialog">360dialog</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                        </Select>
                    </FormControl>

                    <Typography variant="body2" color="text.secondary">
                        {providerInfo.description}
                    </Typography>

                    <TextField
                        label="API Base URL"
                        value={baseURL}
                        onChange={(e) => setBaseURL(e.target.value)}
                        fullWidth
                        placeholder={providerInfo.baseURL}
                        helperText="Base URL for the WhatsApp API"
                    />

                    {providerInfo.fields.includes('apiKey') && (
                        <TextField
                            label="API Key / Access Token"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            fullWidth
                            helperText="Your API key or access token"
                        />
                    )}

                    {providerInfo.fields.includes('apiSecret') && (
                        <TextField
                            label="API Secret / Auth Token"
                            type="password"
                            value={apiSecret}
                            onChange={(e) => setApiSecret(e.target.value)}
                            fullWidth
                            helperText="Your API secret or auth token"
                        />
                    )}

                    {providerInfo.fields.includes('accountSid') && (
                        <TextField
                            label="Account SID"
                            value={accountSid}
                            onChange={(e) => setAccountSid(e.target.value)}
                            fullWidth
                            helperText="Twilio Account SID"
                        />
                    )}

                    {providerInfo.fields.includes('phoneNumberId') && (
                        <TextField
                            label="Phone Number ID"
                            value={phoneNumberId}
                            onChange={(e) => setPhoneNumberId(e.target.value)}
                            fullWidth
                            helperText="WhatsApp Business Phone Number ID (Required)"
                            required
                        />
                    )}

                    {providerInfo.fields.includes('businessAccountId') && (
                        <TextField
                            label="Business Account ID (Optional)"
                            value={businessAccountId}
                            onChange={(e) => setBusinessAccountId(e.target.value)}
                            fullWidth
                            helperText="WhatsApp Business Account ID (Optional, for advanced features)"
                        />
                    )}

                    {providerInfo.fields.includes('apiVersion') && (
                        <TextField
                            label="API Version"
                            value={apiVersion}
                            onChange={(e) => setApiVersion(e.target.value)}
                            fullWidth
                            helperText="Graph API version (e.g., v18.0, v19.0)"
                            placeholder="v18.0"
                        />
                    )}

                    <Alert severity="info">
                        <Typography variant="body2">
                            <strong>Note:</strong> These credentials are stored in your browser's localStorage.
                            For production, consider using environment variables or a secure backend proxy.
                        </Typography>
                    </Alert>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon />}>
                    Save Configuration
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WhatsAppConfigDialog;


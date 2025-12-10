import React, { useEffect, useRef, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
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
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { useDispatch, useSelector } from 'react-redux';
import { WHATSAPP_API_CONFIG, getActiveConfig, createConfig, updateConfig, activateConfig, loadConfigFromBackend } from '../../api/whatsappAPI';
import { setWhatsAppConfig } from '../../reduxcomponents/slices/whatsappSlice';

const WhatsAppConfigDialog = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const config = useSelector((state) => state.whatsapp?.config) || {};
    const [saved, setSaved] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [errorDetails, setErrorDetails] = React.useState(null);
    const [loadingError, setLoadingError] = React.useState('');
    const [initialValues, setInitialValues] = React.useState({
        provider: WHATSAPP_API_CONFIG.provider,
        baseURL: WHATSAPP_API_CONFIG.baseURL,
        apiKey: WHATSAPP_API_CONFIG.getApiKey(),
        apiSecret: WHATSAPP_API_CONFIG.getApiSecret(),
        accountSid: WHATSAPP_API_CONFIG.getAccountSid(),
        phoneNumberId: WHATSAPP_API_CONFIG.getPhoneNumberId(),
        businessAccountId: WHATSAPP_API_CONFIG.getBusinessAccountId(),
        apiVersion: WHATSAPP_API_CONFIG.getApiVersion(),
    });
    const hasLoadedRef = useRef(false);
    const formikRef = useRef(null);

    // Get provider info helper
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

    // Create validation schema based on provider
    const getValidationSchema = (provider) => {
        const providerInfo = getProviderInfo(provider);
        let schema = {
            baseURL: Yup.string()
                .required('Base URL is required')
                .matches(/^https?:\/\//, 'Base URL must start with http:// or https://'),
        };

        if (providerInfo.fields.includes('apiKey')) {
            schema.apiKey = Yup.string().required('API Key / Access Token is required');
        }

        if (providerInfo.fields.includes('apiSecret')) {
            schema.apiSecret = Yup.string().required('API Secret / Auth Token is required');
        }

        if (providerInfo.fields.includes('accountSid')) {
            schema.accountSid = Yup.string().required('Account SID is required for Twilio');
        }

        if (providerInfo.fields.includes('phoneNumberId')) {
            schema.phoneNumberId = Yup.string()
                .required('Phone Number ID is required')
                .matches(/^\d+$/, 'Phone Number ID must be numeric');
        }

        if (providerInfo.fields.includes('apiVersion')) {
            schema.apiVersion = Yup.string()
                .required('API Version is required')
                .matches(/^v\d+\.\d+$/, 'API Version must be in format v18.0, v19.0, etc.');
        }

        // Optional fields
        schema.businessAccountId = Yup.string();

        return Yup.object().shape(schema);
    };

    // Load config from backend when dialog opens
    useEffect(() => {
        if (open && !hasLoadedRef.current) {
            const loadConfig = async () => {
                setLoading(true);
                try {
                    // Check backend first - if config exists in DB, load it and sync to Redux
                    const backendConfig = await loadConfigFromBackend(dispatch, setWhatsAppConfig);

                    if (backendConfig) {
                        // Config exists in DB - use it
                        // Note: loadConfigFromBackend already maps accessToken -> apiKey and authToken -> apiSecret
                        // But we also check directly in case the mapping didn't happen
                        const newInitialValues = {
                            provider: backendConfig.provider || WHATSAPP_API_CONFIG.provider,
                            baseURL: backendConfig.baseURL || WHATSAPP_API_CONFIG.baseURL,
                            // For Meta providers, backend stores as accessToken, but loadConfigFromBackend maps it to apiKey
                            // Also check directly for accessToken as fallback
                            apiKey: backendConfig.apiKey || backendConfig.accessToken || WHATSAPP_API_CONFIG.getApiKey(),
                            // For Twilio, backend stores as authToken, but loadConfigFromBackend maps it to apiSecret
                            // Also check directly for authToken as fallback
                            apiSecret: backendConfig.apiSecret || backendConfig.authToken || WHATSAPP_API_CONFIG.getApiSecret(),
                            accountSid: backendConfig.accountSid || WHATSAPP_API_CONFIG.getAccountSid(),
                            phoneNumberId: backendConfig.phoneNumberId || WHATSAPP_API_CONFIG.getPhoneNumberId(),
                            businessAccountId: backendConfig.businessAccountId || WHATSAPP_API_CONFIG.getBusinessAccountId(),
                            apiVersion: backendConfig.apiVersion || WHATSAPP_API_CONFIG.getApiVersion(),
                        };
                        setInitialValues(newInitialValues);
                        // Reset formik form with new values
                        if (formikRef.current) {
                            formikRef.current.resetForm({ values: newInitialValues });
                        }
                    } else {
                        // No config in DB - use Redux or defaults
                        const newInitialValues = {
                            provider: config.provider || WHATSAPP_API_CONFIG.provider,
                            baseURL: config.baseURL || WHATSAPP_API_CONFIG.baseURL,
                            apiKey: config.apiKey || WHATSAPP_API_CONFIG.getApiKey(),
                            apiSecret: config.apiSecret || WHATSAPP_API_CONFIG.getApiSecret(),
                            accountSid: config.accountSid || WHATSAPP_API_CONFIG.getAccountSid(),
                            phoneNumberId: config.phoneNumberId || WHATSAPP_API_CONFIG.getPhoneNumberId(),
                            businessAccountId: config.businessAccountId || WHATSAPP_API_CONFIG.getBusinessAccountId(),
                            apiVersion: config.apiVersion || WHATSAPP_API_CONFIG.getApiVersion(),
                        };
                        setInitialValues(newInitialValues);
                        if (formikRef.current) {
                            formikRef.current.resetForm({ values: newInitialValues });
                        }
                    }
                } catch (error) {
                    console.error('Failed to load config:', error);
                    // Set loading error but don't block the form
                    const errorMsg = error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        'Failed to load configuration from database. Using default values.';
                    setLoadingError(errorMsg);
                } finally {
                    setLoading(false);
                    setSaved(false);
                    setError('');
                    hasLoadedRef.current = true;
                }
            };

            loadConfig();
        } else if (!open) {
            // Reset the ref when dialog closes
            hasLoadedRef.current = false;
        }
    }, [open, dispatch, config]);

    // Helper function to extract error message from API error
    const getErrorMessage = (error, defaultMessage = 'An unexpected error occurred') => {
        // Network errors
        if (!error.response) {
            if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
                return {
                    message: 'Network connection failed. Please check your internet connection and try again.',
                    type: 'network',
                    recoverable: true,
                };
            }
            return {
                message: error.message || defaultMessage,
                type: 'unknown',
                recoverable: true,
            };
        }

        // HTTP errors
        const status = error.response?.status;
        const data = error.response?.data;

        // Extract error message from response
        let message = data?.message || data?.error || data?.errors?.join(', ') || error.message || defaultMessage;

        // Add status-specific context
        switch (status) {
            case 400:
                return {
                    message: `Invalid request: ${message}. Please check your input and try again.`,
                    type: 'validation',
                    recoverable: true,
                    fields: data?.fields || null,
                };
            case 401:
                return {
                    message: 'Authentication failed. Please log in again and try again.',
                    type: 'authentication',
                    recoverable: true,
                };
            case 403:
                return {
                    message: 'You do not have permission to perform this action.',
                    type: 'permission',
                    recoverable: false,
                };
            case 404:
                return {
                    message: 'Configuration endpoint not found. Please contact support.',
                    type: 'not_found',
                    recoverable: false,
                };
            case 409:
                return {
                    message: `Configuration conflict: ${message}. Please refresh and try again.`,
                    type: 'conflict',
                    recoverable: true,
                };
            case 422:
                return {
                    message: `Validation error: ${message}. Please check your input.`,
                    type: 'validation',
                    recoverable: true,
                    fields: data?.fields || null,
                };
            case 500:
            case 502:
            case 503:
                return {
                    message: 'Server error. Please try again in a few moments. If the problem persists, contact support.',
                    type: 'server',
                    recoverable: true,
                };
            default:
                return {
                    message: `Error ${status}: ${message}`,
                    type: 'http',
                    recoverable: status < 500,
                };
        }
    };

    // Helper to set field-level errors from API response
    const setFieldErrorsFromAPI = (setFieldError, error) => {
        const data = error.response?.data;
        if (data?.fields && typeof data.fields === 'object') {
            Object.keys(data.fields).forEach(field => {
                const fieldError = Array.isArray(data.fields[field])
                    ? data.fields[field][0]
                    : data.fields[field];
                setFieldError(field, fieldError);
            });
        }
    };

    const handleSubmit = async (values, { setSubmitting, setFieldError, setStatus }) => {
        setError('');
        setErrorDetails(null);
        setLoading(true);
        setStatus(null);

        try {
            // Prepare config data according to backend API structure
            const configData = {
                provider: values.provider,
                baseURL: values.baseURL?.trim() || '', // Include baseURL in all cases
                isActive: true,
                phoneNumberId: values.phoneNumberId?.trim() || '',
                businessAccountId: values.businessAccountId?.trim() || '',
                apiVersion: values.apiVersion?.trim() || 'v18.0',
            };

            // Map fields based on provider
            if (values.provider === 'meta-whatsapp' || values.provider === 'whatsapp-business') {
                configData.accessToken = values.apiKey?.trim() || '';
            } else if (values.provider === 'twilio') {
                configData.accountSid = values.accountSid?.trim() || '';
                configData.authToken = values.apiSecret?.trim() || '';
            } else {
                configData.apiKey = values.apiKey?.trim() || '';
                if (values.apiSecret?.trim()) {
                    configData.apiSecret = values.apiSecret.trim();
                }
            }

            // Try to save to backend API first (if available)
            const backendUrl = process.env.REACT_APP_BASE_URL;
            if (backendUrl) {
                try {
                    console.log('Saving to backend API:', configData);
                    // Check if active config exists using API function
                    const existingConfigResponse = await getActiveConfig();
                    const existingConfig = existingConfigResponse?.data;

                    let configId = null;
                    if (existingConfig) {
                        configId = existingConfig._id || existingConfig.id;
                    }

                    if (configId) {
                        // Update existing config
                        try {
                            await updateConfig(configId, configData);
                            console.log('Configuration updated successfully');

                            // Activate the configuration
                            try {
                                await activateConfig(configId);
                            } catch (activateError) {
                                const activateErrorInfo = getErrorMessage(activateError, 'Failed to activate configuration');
                                console.warn('Failed to activate config, but update succeeded:', activateErrorInfo);
                                // Don't fail the whole operation if activation fails
                                setErrorDetails({
                                    warning: 'Configuration saved but activation failed. You may need to activate it manually.',
                                    originalError: activateErrorInfo,
                                });
                            }
                        } catch (updateError) {
                            const errorInfo = getErrorMessage(updateError, 'Failed to update configuration');
                            setFieldErrorsFromAPI(setFieldError, updateError);
                            throw { ...updateError, errorInfo };
                        }
                    } else {
                        // Create new config
                        try {
                            const createResponse = await createConfig(configData);
                            console.log('Configuration created successfully:', createResponse.data);

                            // Activate the newly created configuration
                            const newConfigId = createResponse.data?._id || createResponse.data?.id;
                            if (newConfigId) {
                                try {
                                    await activateConfig(newConfigId);
                                } catch (activateError) {
                                    const activateErrorInfo = getErrorMessage(activateError, 'Failed to activate configuration');
                                    console.warn('Failed to activate new config:', activateErrorInfo);
                                    setErrorDetails({
                                        warning: 'Configuration created but activation failed. You may need to activate it manually.',
                                        originalError: activateErrorInfo,
                                    });
                                }
                            } else {
                                throw new Error('Configuration created but no ID returned. Please refresh and try again.');
                            }
                        } catch (createError) {
                            const errorInfo = getErrorMessage(createError, 'Failed to create configuration');
                            setFieldErrorsFromAPI(setFieldError, createError);
                            throw { ...createError, errorInfo };
                        }
                    }

                    // Only save to Redux if backend save was successful
                    dispatch(setWhatsAppConfig({
                        provider: values.provider,
                        baseURL: values.baseURL.trim(),
                        apiKey: values.apiKey?.trim() || '',
                        apiSecret: values.apiSecret?.trim() || '',
                        accountSid: values.accountSid?.trim() || '',
                        phoneNumberId: values.phoneNumberId?.trim() || '',
                        businessAccountId: values.businessAccountId?.trim() || '',
                        apiVersion: values.apiVersion?.trim() || 'v18.0',
                    }));
                    console.log('Configuration saved to Redux after successful backend save');

                    setSaved(true);
                    setSubmitting(false);
                    setLoading(false);

                    // Close dialog and reload after short delay
                    setTimeout(() => {
                        setSaved(false);
                        onClose();
                        window.location.reload();
                    }, 1500);
                } catch (apiError) {
                    console.error('Failed to save to backend API:', apiError);
                    const errorInfo = apiError.errorInfo || getErrorMessage(apiError, 'Failed to save configuration to backend API');

                    // Set field-level errors if available
                    setFieldErrorsFromAPI(setFieldError, apiError);

                    // Set form-level error
                    setError(errorInfo.message);
                    setErrorDetails({
                        type: errorInfo.type,
                        recoverable: errorInfo.recoverable,
                        fields: errorInfo.fields,
                    });

                    setStatus('error');
                    setSubmitting(false);
                    setLoading(false);
                    return; // Exit early
                }
            } else {
                // No backend URL - show error
                const errorInfo = {
                    message: 'Backend URL not configured. Please configure REACT_APP_BASE_URL environment variable.',
                    type: 'configuration',
                    recoverable: false,
                };
                setError(errorInfo.message);
                setErrorDetails(errorInfo);
                setStatus('error');
                setSubmitting(false);
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error('Failed to save configuration:', err);
            const errorInfo = err.errorInfo || getErrorMessage(err, 'Failed to save configuration. Please try again.');

            setError(errorInfo.message);
            setErrorDetails({
                type: errorInfo.type,
                recoverable: errorInfo.recoverable,
            });

            setStatus('error');
            setSubmitting(false);
            setLoading(false);
        }
    };

    // Memoize validation schema based on current provider
    const validationSchema = useMemo(() => {
        return (values) => {
            try {
                const provider = values?.provider || initialValues?.provider || WHATSAPP_API_CONFIG.provider;
                return getValidationSchema(provider);
            } catch (err) {
                console.error('Error creating validation schema:', err);
                // Return a basic schema as fallback
                return Yup.object().shape({
                    baseURL: Yup.string().required('Base URL is required'),
                });
            }
        };
    }, [initialValues.provider]);

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
                <Formik
                    innerRef={formikRef}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {({ values, errors: formikErrors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, status: formikStatus }) => {
                        const currentProviderInfo = getProviderInfo(values?.provider || initialValues.provider);
                        const hasFormErrors = Object.keys(formikErrors || {}).length > 0 && Object.keys(touched || {}).length > 0;
                        const formStatus = formikStatus || (error ? 'error' : null);

                        return (
                            <Form>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                                    {loading && !hasLoadedRef.current && (
                                        <Alert severity="info">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress size={16} />
                                                <Typography variant="body2">Loading configuration from database...</Typography>
                                            </Box>
                                        </Alert>
                                    )}

                                    {loadingError && (
                                        <Alert severity="warning" onClose={() => setLoadingError('')}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                Warning: Failed to load configuration
                                            </Typography>
                                            <Typography variant="body2">{loadingError}</Typography>
                                            <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                                                You can still configure WhatsApp API below.
                                            </Typography>
                                        </Alert>
                                    )}

                                    {saved && (
                                        <Alert severity="success">
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                Configuration saved successfully!
                                            </Typography>
                                            <Typography variant="caption">Reloading page to apply changes...</Typography>
                                        </Alert>
                                    )}

                                    {error && (
                                        <Alert
                                            severity="error"
                                            onClose={() => {
                                                setError('');
                                                setErrorDetails(null);
                                            }}
                                            action={
                                                errorDetails?.recoverable && (
                                                    <Button
                                                        color="inherit"
                                                        size="small"
                                                        onClick={() => {
                                                            setError('');
                                                            setErrorDetails(null);
                                                            // Trigger form submission again if user wants to retry
                                                            if (formikRef.current) {
                                                                formikRef.current.submitForm();
                                                            }
                                                        }}
                                                        disabled={isSubmitting || loading}
                                                    >
                                                        Retry
                                                    </Button>
                                                )
                                            }
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                {errorDetails?.type === 'network' ? 'Connection Error' :
                                                    errorDetails?.type === 'validation' ? 'Validation Error' :
                                                        errorDetails?.type === 'authentication' ? 'Authentication Error' :
                                                            errorDetails?.type === 'server' ? 'Server Error' :
                                                                errorDetails?.type === 'permission' ? 'Permission Denied' :
                                                                    errorDetails?.type === 'not_found' ? 'Resource Not Found' :
                                                                        errorDetails?.type === 'configuration' ? 'Configuration Error' :
                                                                            'Error'}
                                            </Typography>
                                            <Typography variant="body2">{error}</Typography>
                                            {errorDetails?.recoverable && (
                                                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                                    {errorDetails?.type === 'network'
                                                        ? 'Please check your internet connection and try again.'
                                                        : errorDetails?.type === 'validation'
                                                            ? 'Please check your input fields and correct any errors.'
                                                            : errorDetails?.type === 'authentication'
                                                                ? 'Please log in again and try again.'
                                                                : errorDetails?.type === 'server'
                                                                    ? 'The server is temporarily unavailable. Please try again in a few moments.'
                                                                    : 'Please try again.'}
                                                </Typography>
                                            )}
                                            {!errorDetails?.recoverable && (
                                                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'error.dark' }}>
                                                    This error cannot be automatically recovered. Please contact support if the problem persists.
                                                </Typography>
                                            )}
                                            {errorDetails?.fields && Object.keys(errorDetails.fields).length > 0 && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                                        Fields with errors:
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        {Object.keys(errorDetails.fields).join(', ')}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Alert>
                                    )}

                                    {errorDetails?.warning && (
                                        <Alert severity="warning">
                                            <Typography variant="body2">{errorDetails.warning}</Typography>
                                        </Alert>
                                    )}

                                    {hasFormErrors && (
                                        <Alert severity="error">
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                Please fix the following errors:
                                            </Typography>
                                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                {Object.entries(formikErrors).map(([field, errorMsg]) => (
                                                    touched[field] && (
                                                        <li key={field}>
                                                            <Typography variant="caption">
                                                                <strong>{field}:</strong> {errorMsg}
                                                            </Typography>
                                                        </li>
                                                    )
                                                ))}
                                            </Box>
                                        </Alert>
                                    )}

                                    <FormControl fullWidth error={!!(formikErrors.provider && touched.provider)}>
                                        <InputLabel>Provider</InputLabel>
                                        <Select
                                            name="provider"
                                            value={values.provider}
                                            label="Provider"
                                            onChange={(e) => {
                                                const newProvider = e.target.value;
                                                const info = getProviderInfo(newProvider);
                                                setFieldValue('provider', newProvider);
                                                setFieldValue('baseURL', info.baseURL);
                                                // Clear errors when provider changes
                                                setError('');
                                                setErrorDetails(null);
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
                                        {currentProviderInfo.description}
                                    </Typography>

                                    <Field name="baseURL">
                                        {({ field, meta }) => (
                                            <TextField
                                                {...field}
                                                label="API Base URL"
                                                fullWidth
                                                placeholder={currentProviderInfo.baseURL}
                                                helperText={meta.touched && meta.error ? meta.error : "Base URL for the WhatsApp API"}
                                                error={meta.touched && !!meta.error}
                                                required
                                            />
                                        )}
                                    </Field>

                                    {currentProviderInfo.fields.includes('apiKey') && (
                                        <Field name="apiKey">
                                            {({ field, meta }) => (
                                                <TextField
                                                    {...field}
                                                    label="API Key / Access Token"
                                                    type="text"
                                                    fullWidth
                                                    helperText={meta.touched && meta.error ? meta.error : "Your API key or access token"}
                                                    error={meta.touched && !!meta.error}
                                                    required
                                                />
                                            )}
                                        </Field>
                                    )}

                                    {currentProviderInfo.fields.includes('apiSecret') && (
                                        <Field name="apiSecret">
                                            {({ field, meta }) => (
                                                <TextField
                                                    {...field}
                                                    label="API Secret / Auth Token"
                                                    type="text"
                                                    fullWidth
                                                    helperText={meta.touched && meta.error ? meta.error : "Your API secret or auth token"}
                                                    error={meta.touched && !!meta.error}
                                                    required
                                                />
                                            )}
                                        </Field>
                                    )}

                                    {currentProviderInfo.fields.includes('accountSid') && (
                                        <Field name="accountSid">
                                            {({ field, meta }) => (
                                                <TextField
                                                    {...field}
                                                    label="Account SID"
                                                    fullWidth
                                                    helperText={meta.touched && meta.error ? meta.error : "Twilio Account SID"}
                                                    error={meta.touched && !!meta.error}
                                                    required
                                                />
                                            )}
                                        </Field>
                                    )}

                                    {currentProviderInfo.fields.includes('phoneNumberId') && (
                                        <Field name="phoneNumberId">
                                            {({ field, meta }) => (
                                                <TextField
                                                    {...field}
                                                    label="Phone Number ID"
                                                    fullWidth
                                                    helperText={meta.touched && meta.error ? meta.error : "WhatsApp Business Phone Number ID (Required)"}
                                                    error={meta.touched && !!meta.error}
                                                    required
                                                />
                                            )}
                                        </Field>
                                    )}

                                    {currentProviderInfo.fields.includes('businessAccountId') && (
                                        <Field name="businessAccountId">
                                            {({ field, meta }) => (
                                                <TextField
                                                    {...field}
                                                    label="Business Account ID (Optional)"
                                                    fullWidth
                                                    helperText="WhatsApp Business Account ID (Optional, for advanced features)"
                                                    error={meta.touched && !!meta.error}
                                                />
                                            )}
                                        </Field>
                                    )}

                                    {currentProviderInfo.fields.includes('apiVersion') && (
                                        <Field name="apiVersion">
                                            {({ field, meta }) => (
                                                <TextField
                                                    {...field}
                                                    label="API Version"
                                                    fullWidth
                                                    helperText={meta.touched && meta.error ? meta.error : "Graph API version (e.g., v18.0, v19.0)"}
                                                    error={meta.touched && !!meta.error}
                                                    placeholder="v18.0"
                                                    required
                                                />
                                            )}
                                        </Field>
                                    )}

                                    <Alert severity="info">
                                        <Typography variant="body2">
                                            <strong>Note:</strong> Configuration is stored in Redux state and persisted to your backend API.
                                            For production, ensure your backend API is properly secured.
                                        </Typography>
                                    </Alert>

                                    <DialogActions sx={{ px: 0, pb: 0 }}>
                                        <Button onClick={onClose} disabled={isSubmitting || loading}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={(isSubmitting || loading) ? <CircularProgress size={20} /> : <SaveIcon />}
                                            disabled={isSubmitting || loading || saved}
                                            color={formStatus === 'error' ? 'error' : 'primary'}
                                        >
                                            {(isSubmitting || loading) ? 'Saving...' : saved ? 'Saved!' : 'Save Configuration'}
                                        </Button>
                                    </DialogActions>
                                </Box>
                            </Form>
                        );
                    }}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default WhatsAppConfigDialog;

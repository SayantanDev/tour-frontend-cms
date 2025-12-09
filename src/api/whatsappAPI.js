import axios from 'axios';
import axiosServices from './interceptor'; // Import your existing axios instance with interceptors

// External WhatsApp API Configuration
// Supports: Twilio, WhatsApp Business API, ChatAPI, etc.
const WHATSAPP_API_CONFIG = {
    // Provider: 'twilio' | 'whatsapp-business' | 'chatapi' | '360dialog' | 'custom'
    get provider() {
        return localStorage.getItem('whatsapp_provider') || process.env.REACT_APP_WHATSAPP_PROVIDER || 'twilio';
    },

    // API Base URL (varies by provider)
    get baseURL() {
        const provider = this.provider;
        // For Meta WhatsApp Cloud API, default to graph.facebook.com
        if ((provider === 'whatsapp-business' || provider === 'meta-whatsapp') && !localStorage.getItem('whatsapp_base_url')) {
            return 'https://graph.facebook.com';
        }
        return localStorage.getItem('whatsapp_base_url') || process.env.REACT_APP_WHATSAPP_API_URL || '';
    },

    // API Key/Token (stored in localStorage for security)
    getApiKey: () => localStorage.getItem('whatsapp_api_key') || process.env.REACT_APP_WHATSAPP_API_KEY || '',
    getApiSecret: () => localStorage.getItem('whatsapp_api_secret') || process.env.REACT_APP_WHATSAPP_API_SECRET || '',
    getAccountSid: () => localStorage.getItem('whatsapp_account_sid') || process.env.REACT_APP_WHATSAPP_ACCOUNT_SID || '',
    getPhoneNumberId: () => localStorage.getItem('whatsapp_phone_number_id') || process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID || '',
    getBusinessAccountId: () => localStorage.getItem('whatsapp_business_account_id') || process.env.REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    getApiVersion: () => localStorage.getItem('whatsapp_api_version') || process.env.REACT_APP_WHATSAPP_API_VERSION || 'v18.0',
};

// Create axios instance for WhatsApp API (baseURL will be set dynamically)
const whatsappAxios = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for WhatsApp API authentication
whatsappAxios.interceptors.request.use(
    (config) => {
        // Set baseURL dynamically
        const baseURL = WHATSAPP_API_CONFIG.baseURL;
        if (baseURL) {
            config.baseURL = baseURL;
        }

        const provider = WHATSAPP_API_CONFIG.provider;
        const apiKey = WHATSAPP_API_CONFIG.getApiKey();
        const apiSecret = WHATSAPP_API_CONFIG.getApiSecret();
        const accountSid = WHATSAPP_API_CONFIG.getAccountSid();

        // Configure headers based on provider
        switch (provider) {
            case 'twilio':
                // Twilio uses Basic Auth with Account SID and Auth Token
                if (accountSid && apiSecret) {
                    const credentials = btoa(`${accountSid}:${apiSecret}`);
                    config.headers.Authorization = `Basic ${credentials}`;
                }
                break;

            case 'whatsapp-business':
            case 'meta-whatsapp':
                // Meta WhatsApp Cloud API uses Bearer token
                if (apiKey) {
                    config.headers.Authorization = `Bearer ${apiKey}`;
                }
                // Meta API doesn't use X-Phone-Number-Id header, it's in the URL path
                break;

            case 'chatapi':
                // ChatAPI uses API token in header
                if (apiKey) {
                    config.headers['apiKey'] = apiKey;
                }
                break;

            case '360dialog':
                // 360dialog uses API key in header
                if (apiKey) {
                    config.headers['D360-API-KEY'] = apiKey;
                }
                break;

            default:
                // Custom provider - use API key as Bearer token
                if (apiKey) {
                    config.headers.Authorization = `Bearer ${apiKey}`;
                }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
whatsappAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('WhatsApp API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Helper function to format phone numbers (E.164 format)
const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    // Add country code if not present (default to +1 for US)
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
        cleaned = '1' + cleaned;
    }
    return '+' + cleaned;
};

// ========== CHAT OPERATIONS ==========

/**
 * Get all chats/conversations
 * Maps to provider-specific endpoints
 */
export function getAllChats(filters = {}) {
    const provider = WHATSAPP_API_CONFIG.provider;
    console.log('getAllChats - Provider:', provider);

    switch (provider) {
        case 'twilio':
            // Twilio Conversations API
            return whatsappAxios.get('/v1/Conversations', { params: filters });

        case 'whatsapp-business':
        case 'meta-whatsapp':
            // Try to fetch from backend API
            const backendUrl = process.env.REACT_APP_BASE_URL;

            if (backendUrl) {
                // Fetch from your backend API
                return axiosServices.get('/whatsapp/chats', { params: filters })
                    .then(response => {
                        console.log('Fetched chats from backend:', response.data);
                        // Return data - components will dispatch to Redux
                        if (response.data?.data && Array.isArray(response.data.data)) {
                            return { data: response.data.data };
                        } else if (Array.isArray(response.data)) {
                            return { data: response.data };
                        }
                        return { data: [] };
                    })
                    .catch(error => {
                        console.warn('Backend API not available:', error.message);
                        // Return empty array - data should come from Redux state
                        return Promise.resolve({ data: [] });
                    });
            } else {
                // No backend URL - return empty, data should be in Redux
                console.log('No backend URL configured - using Redux state');
                return Promise.resolve({ data: [] });
            }

        case 'chatapi':
            // ChatAPI - Get dialogs
            return whatsappAxios.get('/dialogs', { params: filters });

        default:
            // Generic endpoint - try backend first
            const defaultBackendUrl = process.env.REACT_APP_BASE_URL;
            if (defaultBackendUrl) {
                return axiosServices.get('/whatsapp/chats', { params: filters })
                    .then(response => {
                        if (response.data?.data && Array.isArray(response.data.data)) {
                            return { data: response.data.data };
                        } else if (Array.isArray(response.data)) {
                            return { data: response.data };
                        }
                        return { data: [] };
                    })
                    .catch(() => {
                        // Fallback to generic endpoint
                        return whatsappAxios.get('/chats', { params: filters });
                    });
            }
            return whatsappAxios.get('/chats', { params: filters });
    }
}

/**
 * Create a new chat/conversation
 * @param {object} chatData - { phoneNumber, customerName }
 */
export function createNewChat(chatData) {
    const provider = WHATSAPP_API_CONFIG.provider;
    const backendUrl = process.env.REACT_APP_BASE_URL;

    console.log('createNewChat - Provider:', provider, 'Data:', chatData);

    // Try backend API first
    if (backendUrl) {
        return axiosServices.post('/whatsapp/chats', chatData)
            .then(response => {
                console.log('Chat created via backend:', response.data);
                // Return data - components will dispatch to Redux
                return response.data?.data ? { data: response.data.data } : { data: response.data };
            })
            .catch(error => {
                console.warn('Backend API failed:', error.message);
                // Fallback: Create chat object (components will add to Redux)
                const newChat = {
                    id: chatData.phoneNumber.replace(/[^\d]/g, ''),
                    phoneNumber: chatData.phoneNumber,
                    customerName: chatData.customerName || chatData.phoneNumber,
                    status: 'unassigned',
                    createdAt: new Date().toISOString(),
                    lastMessage: null,
                    lastMessageTime: null,
                    unreadCount: 0,
                };
                return Promise.resolve({ data: newChat });
            });
    }

    // No backend, create chat object (components will add to Redux)
    const newChat = {
        id: chatData.phoneNumber.replace(/[^\d]/g, ''),
        phoneNumber: chatData.phoneNumber,
        customerName: chatData.customerName || chatData.phoneNumber,
        status: 'unassigned',
        createdAt: new Date().toISOString(),
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0,
    };

    return Promise.resolve({ data: newChat });
}

/**
 * Get chat by ID
 */
export function getChatById(chatId) {
    const provider = WHATSAPP_API_CONFIG.provider;

    switch (provider) {
        case 'twilio':
            return whatsappAxios.get(`/v1/Conversations/${chatId}`);

        case 'whatsapp-business':
        case 'meta-whatsapp':
            // Try backend API first
            const backendUrl = process.env.REACT_APP_BASE_URL;
            if (backendUrl) {
                return axiosServices.get(`/whatsapp/chats/${chatId}`)
                    .then(response => {
                        if (response.data?.data) {
                            return { data: response.data.data };
                        } else if (response.data) {
                            return { data: response.data };
                        }
                        return { data: null };
                    })
                    .catch(() => {
                        // Return null if not found - data should be in Redux
                        return Promise.resolve({ data: null });
                    });
            }
            // No backend - return null, data should be in Redux
            return Promise.resolve({ data: null });

        case 'chatapi':
            return whatsappAxios.get(`/dialogs/${chatId}`);

        default:
            return whatsappAxios.get(`/chats/${chatId}`);
    }
}

/**
 * Get messages for a chat
 */
export function getChatMessages(chatId, page = 1, limit = 50) {
    const provider = WHATSAPP_API_CONFIG.provider;
    console.log('getChatMessages - ChatId:', chatId, 'Provider:', provider);

    switch (provider) {
        case 'twilio':
            return whatsappAxios.get(`/v1/Conversations/${chatId}/Messages`, {
                params: { PageSize: limit, Page: page }
            });

        case 'whatsapp-business':
        case 'meta-whatsapp':
            // Try to fetch from backend API
            const backendUrl = process.env.REACT_APP_BASE_URL;

            if (backendUrl) {
                // Fetch from your backend API
                return axiosServices.get(`/whatsapp/chats/${chatId}/messages`, {
                    params: { page, limit }
                })
                    .then(response => {
                        console.log('Fetched messages from backend:', response.data);
                        // Return data - components will dispatch to Redux
                        let messages = [];
                        if (response.data?.data && Array.isArray(response.data.data)) {
                            messages = response.data.data;
                        } else if (Array.isArray(response.data)) {
                            messages = response.data;
                        }

                        // Paginate if needed
                        const startIndex = (page - 1) * limit;
                        const paginatedMessages = messages.slice(startIndex, startIndex + limit);
                        return { data: paginatedMessages };
                    })
                    .catch(error => {
                        console.warn('Backend API not available for messages:', error.message);
                        // Return empty - data should be in Redux state
                        return Promise.resolve({ data: [] });
                    });
            } else {
                // No backend URL - return empty, data should be in Redux
                console.log('No backend URL - using Redux state for messages');
                return Promise.resolve({ data: [] });
            }

        case 'chatapi':
            return whatsappAxios.get(`/dialogs/${chatId}/messages`, {
                params: { limit, page }
            });

        default:
            // Try backend first
            const defaultBackendUrl = process.env.REACT_APP_BASE_URL;
            if (defaultBackendUrl) {
                return axiosServices.get(`/whatsapp/chats/${chatId}/messages`, {
                    params: { page, limit }
                })
                    .then(response => {
                        if (response.data?.data && Array.isArray(response.data.data)) {
                            return { data: response.data.data };
                        } else if (Array.isArray(response.data)) {
                            return { data: response.data };
                        }
                        return { data: [] };
                    })
                    .catch(() => {
                        // Fallback to generic endpoint
                        return whatsappAxios.get(`/chats/${chatId}/messages`, {
                            params: { page, limit }
                        });
                    });
            }
            return whatsappAxios.get(`/chats/${chatId}/messages`, {
                params: { page, limit }
            });
    }
}

/**
 * Send a reply message (convenience function)
 * @param {string} chatId - Phone number or chat ID
 * @param {string} messageText - Text content of the message
 * @param {string} replyToMessageId - Message ID to reply to (wamid)
 * @param {object} options - Optional: preview_url, etc.
 */
export function sendReplyMessage(chatId, messageText, replyToMessageId, options = {}) {
    return sendMessage(chatId, {
        text: messageText,
        to: chatId,
        context: {
            message_id: replyToMessageId
        },
        preview_url: options.preview_url || false
    });
}

/**
 * Send a message
 * @param {string} chatId - Phone number or chat ID
 * @param {object} message - Message object with text, to, context (optional), preview_url (optional)
 */
export function sendMessage(chatId, message) {
    const provider = WHATSAPP_API_CONFIG.provider;
    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const to = formatPhoneNumber(message.to || chatId);

    switch (provider) {
        case 'twilio':
            return whatsappAxios.post(`/v1/Conversations/${chatId}/Messages`, {
                Body: message.text,
                Author: message.senderId || 'agent',
            });

        case 'whatsapp-business':
        case 'meta-whatsapp':
            // Meta WhatsApp Cloud API message format
            const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();
            if (!phoneNumberId) {
                return Promise.reject(new Error('Phone Number ID is required for Meta WhatsApp API'));
            }
            if (!to) {
                return Promise.reject(new Error('Recipient phone number is required'));
            }

            // Build message payload according to Meta API structure
            const messagePayload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
                type: 'text',
                text: {
                    preview_url: message.preview_url !== undefined ? message.preview_url : false,
                    body: message.text
                }
            };

            // Add context if replying to a message
            if (message.context && message.context.message_id) {
                messagePayload.context = {
                    message_id: message.context.message_id
                };
            }

            // Meta API endpoint: /v18.0/{phone-number-id}/messages
            return whatsappAxios.post(`/${apiVersion}/${phoneNumberId}/messages`, messagePayload);

        case 'chatapi':
            return whatsappAxios.post('/sendMessage', {
                phone: to,
                body: message.text,
                chatId: chatId
            });

        default:
            return whatsappAxios.post(`/chats/${chatId}/messages`, message);
    }
}

/**
 * Mark message as read
 * @param {string} messageId - The WhatsApp message ID (wamid) to mark as read (required for Meta API)
 * @param {string} chatId - Optional: Phone number or chat ID (for other providers or backward compatibility)
 */
export function markChatAsRead(messageId, chatId = null) {
    const provider = WHATSAPP_API_CONFIG.provider;

    switch (provider) {
        case 'twilio':
            return whatsappAxios.post(`/v1/Conversations/${chatId}/Messages`, {
                Body: '',
                Author: 'system',
                Attributes: JSON.stringify({ read: true })
            });

        case 'whatsapp-business':
        case 'meta-whatsapp':
            // Meta WhatsApp Cloud API - Mark message as read using PUT method
            // According to Postman collection: PUT /{{Version}}/{{Phone-Number-ID}}/messages
            const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
            const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();

            if (!phoneNumberId) {
                return Promise.reject(new Error('Phone Number ID is required for Meta WhatsApp API'));
            }
            if (!messageId) {
                return Promise.reject(new Error('Message ID is required to mark message as read'));
            }

            return whatsappAxios.put(`/${apiVersion}/${phoneNumberId}/messages`, {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId
            });

        default:
            return whatsappAxios.put(`/chats/${chatId}/read`);
    }
}

// ========== AGENT OPERATIONS ==========
// Note: These are typically managed in your own system, not the WhatsApp API
// Keeping them for internal state management

export function getAllAgents() {
    // Try backend API first
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.get('/whatsapp/agents')
            .then(response => {
                if (response.data?.data && Array.isArray(response.data.data)) {
                    return { data: response.data.data };
                } else if (Array.isArray(response.data)) {
                    return { data: response.data };
                }
                return { data: [] };
            })
            .catch(() => {
                // Return empty - data should be in Redux
                return Promise.resolve({ data: [] });
            });
    }
    // No backend - return empty, data should be in Redux
    return Promise.resolve({ data: [] });
}

export function getAgentById(agentId) {
    // Try backend API first
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.get(`/whatsapp/agents/${agentId}`)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: null };
            })
            .catch(() => {
                return Promise.resolve({ data: null });
            });
    }
    // No backend - return null, data should be in Redux
    return Promise.resolve({ data: null });
}

export function updateAgentStatus(agentId, status) {
    // Try backend API first
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.put(`/whatsapp/agents/${agentId}/status`, { status })
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: { id: agentId, status } };
            })
            .catch(() => {
                // Return status update - components will dispatch to Redux
                return Promise.resolve({ data: { id: agentId, status } });
            });
    }
    // No backend - return status update, components will dispatch to Redux
    return Promise.resolve({ data: { id: agentId, status } });
}

// ========== ASSIGNMENT OPERATIONS ==========
// These are internal operations, stored in localStorage or your backend

export function assignChat(chatId, agentId) {
    // Try backend API first
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.post(`/whatsapp/chats/${chatId}/assign`, { agentId })
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: { chatId, agentId } };
            })
            .catch(() => {
                // Return assignment - components will dispatch to Redux
                return Promise.resolve({ data: { chatId, agentId } });
            });
    }
    // No backend - return assignment, components will dispatch to Redux
    return Promise.resolve({ data: { chatId, agentId } });
}

export function unassignChat(chatId) {
    // Try backend API first
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.put(`/whatsapp/chats/${chatId}/unassign`)
            .then(() => {
                return Promise.resolve({ data: { chatId } });
            })
            .catch(() => {
                return Promise.resolve({ data: { chatId } });
            });
    }
    // No backend - return unassign, components will dispatch to Redux
    return Promise.resolve({ data: { chatId } });
}

export function transferChat(chatId, toAgentId) {
    // Try backend API first
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.post(`/whatsapp/chats/${chatId}/transfer`, { toAgentId })
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: { chatId, toAgentId } };
            })
            .catch(() => {
                return Promise.resolve({ data: { chatId, toAgentId } });
            });
    }
    // No backend - return transfer, components will dispatch to Redux
    return Promise.resolve({ data: { chatId, toAgentId } });
}

export function autoAssignChat(chatId) {
    // Try backend API first
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.post(`/whatsapp/chats/${chatId}/auto-assign`)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return Promise.reject(new Error('Auto-assign failed'));
            })
            .catch(() => {
                return Promise.reject(new Error('No online agents available'));
            });
    }
    // No backend - reject (components should handle this)
    return Promise.reject(new Error('Auto-assign requires backend API'));
}

// ========== LABELS, TEMPLATES, NOTES, etc. ==========
// These are internal features, stored in localStorage or your backend

export function getAllLabels() {
    // Try backend API first
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.get('/whatsapp/labels')
            .then(response => {
                if (response.data?.data && Array.isArray(response.data.data)) {
                    return { data: response.data.data };
                } else if (Array.isArray(response.data)) {
                    return { data: response.data };
                }
                return { data: [] };
            })
            .catch(() => Promise.resolve({ data: [] }));
    }
    return Promise.resolve({ data: [] });
}

export function createLabel(label) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    const newLabel = { ...label, id: Date.now().toString() };
    if (backendUrl) {
        return axiosServices.post('/whatsapp/labels', newLabel)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: newLabel };
            })
            .catch(() => Promise.resolve({ data: newLabel }));
    }
    return Promise.resolve({ data: newLabel });
}

export function updateLabel(labelId, label) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.put(`/whatsapp/labels/${labelId}`, label)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: { id: labelId, ...label } };
            })
            .catch(() => Promise.resolve({ data: { id: labelId, ...label } }));
    }
    return Promise.resolve({ data: { id: labelId, ...label } });
}

export function deleteLabel(labelId) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.delete(`/whatsapp/labels/${labelId}`)
            .then(() => Promise.resolve({ data: { id: labelId } }))
            .catch(() => Promise.resolve({ data: { id: labelId } }));
    }
    return Promise.resolve({ data: { id: labelId } });
}

export function addLabelToChat(chatId, labelId) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.post(`/whatsapp/chats/${chatId}/labels`, { labelId })
            .then(() => Promise.resolve({ data: { chatId, labelId } }))
            .catch(() => Promise.resolve({ data: { chatId, labelId } }));
    }
    return Promise.resolve({ data: { chatId, labelId } });
}

export function removeLabelFromChat(chatId, labelId) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.delete(`/whatsapp/chats/${chatId}/labels/${labelId}`)
            .then(() => Promise.resolve({ data: { chatId, labelId } }))
            .catch(() => Promise.resolve({ data: { chatId, labelId } }));
    }
    return Promise.resolve({ data: { chatId, labelId } });
}

// Templates
export function getAllTemplates() {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.get('/whatsapp/templates')
            .then(response => {
                if (response.data?.data && Array.isArray(response.data.data)) {
                    return { data: response.data.data };
                } else if (Array.isArray(response.data)) {
                    return { data: response.data };
                }
                return { data: [] };
            })
            .catch(() => Promise.resolve({ data: [] }));
    }
    return Promise.resolve({ data: [] });
}

export function createTemplate(template) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    const newTemplate = { ...template, id: Date.now().toString() };
    if (backendUrl) {
        return axiosServices.post('/whatsapp/templates', newTemplate)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: newTemplate };
            })
            .catch(() => Promise.resolve({ data: newTemplate }));
    }
    return Promise.resolve({ data: newTemplate });
}

export function updateTemplate(templateId, template) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.put(`/whatsapp/templates/${templateId}`, template)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: { id: templateId, ...template } };
            })
            .catch(() => Promise.resolve({ data: { id: templateId, ...template } }));
    }
    return Promise.resolve({ data: { id: templateId, ...template } });
}

export function deleteTemplate(templateId) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.delete(`/whatsapp/templates/${templateId}`)
            .then(() => Promise.resolve({ data: { id: templateId } }))
            .catch(() => Promise.resolve({ data: { id: templateId } }));
    }
    return Promise.resolve({ data: { id: templateId } });
}

// Team Notes
export function getTeamNote(chatId) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.get(`/whatsapp/chats/${chatId}/notes`)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: null };
            })
            .catch(() => Promise.resolve({ data: null }));
    }
    return Promise.resolve({ data: null });
}

export function saveTeamNote(chatId, note) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    const noteData = { ...note, updatedAt: new Date().toISOString() };
    if (backendUrl) {
        return axiosServices.post(`/whatsapp/chats/${chatId}/notes`, noteData)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: noteData };
            })
            .catch(() => Promise.resolve({ data: noteData }));
    }
    return Promise.resolve({ data: noteData });
}

export function updateTeamNote(chatId, note) {
    return saveTeamNote(chatId, note);
}

// Customer Info
export function getCustomerInfo(phoneNumber) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.get(`/whatsapp/customers/${phoneNumber}`)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: null };
            })
            .catch(() => Promise.resolve({ data: null }));
    }
    return Promise.resolve({ data: null });
}

export function updateCustomerInfo(phoneNumber, info) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    const customerData = { ...info, updatedAt: new Date().toISOString() };
    if (backendUrl) {
        return axiosServices.put(`/whatsapp/customers/${phoneNumber}`, customerData)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: customerData };
            })
            .catch(() => Promise.resolve({ data: customerData }));
    }
    return Promise.resolve({ data: customerData });
}

// Follow-ups
export function getFollowUps(chatId = null) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    const params = chatId ? { chatId } : {};
    if (backendUrl) {
        return axiosServices.get('/whatsapp/followups', { params })
            .then(response => {
                if (response.data?.data && Array.isArray(response.data.data)) {
                    return { data: response.data.data };
                } else if (Array.isArray(response.data)) {
                    return { data: response.data };
                }
                return { data: [] };
            })
            .catch(() => Promise.resolve({ data: [] }));
    }
    return Promise.resolve({ data: [] });
}

export function createFollowUp(followUp) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    const newFollowUp = { ...followUp, id: Date.now().toString() };
    if (backendUrl) {
        return axiosServices.post('/whatsapp/followups', newFollowUp)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: newFollowUp };
            })
            .catch(() => Promise.resolve({ data: newFollowUp }));
    }
    return Promise.resolve({ data: newFollowUp });
}

export function updateFollowUp(followUpId, followUp) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.put(`/whatsapp/followups/${followUpId}`, followUp)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: { id: followUpId, ...followUp } };
            })
            .catch(() => Promise.resolve({ data: { id: followUpId, ...followUp } }));
    }
    return Promise.resolve({ data: { id: followUpId, ...followUp } });
}

export function deleteFollowUp(followUpId) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.delete(`/whatsapp/followups/${followUpId}`)
            .then(() => Promise.resolve({ data: { id: followUpId } }))
            .catch(() => Promise.resolve({ data: { id: followUpId } }));
    }
    return Promise.resolve({ data: { id: followUpId } });
}

// Blocked Numbers
export function getBlockedNumbers() {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.get('/whatsapp/blocked')
            .then(response => {
                if (response.data?.data && Array.isArray(response.data.data)) {
                    return { data: response.data.data };
                } else if (Array.isArray(response.data)) {
                    return { data: response.data };
                }
                return { data: [] };
            })
            .catch(() => Promise.resolve({ data: [] }));
    }
    return Promise.resolve({ data: [] });
}

export function blockNumber(phoneNumber, reason = '') {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    const newBlock = { phoneNumber, reason, blockedAt: new Date().toISOString() };
    if (backendUrl) {
        return axiosServices.post('/whatsapp/blocked', newBlock)
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: newBlock };
            })
            .catch(() => Promise.resolve({ data: newBlock }));
    }
    return Promise.resolve({ data: newBlock });
}

export function unblockNumber(phoneNumber) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.delete(`/whatsapp/blocked/${phoneNumber}`)
            .then(() => Promise.resolve({ data: { phoneNumber } }))
            .catch(() => Promise.resolve({ data: { phoneNumber } }));
    }
    return Promise.resolve({ data: { phoneNumber } });
}

// Admin Stats
export function getAdminStats(filters = {}) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.get('/whatsapp/admin/stats', { params: filters })
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: { totalChats: 0, activeChats: 0, avgResponseTime: 0, agentPerformance: [] } };
            })
            .catch(() => Promise.resolve({ data: { totalChats: 0, activeChats: 0, avgResponseTime: 0, agentPerformance: [] } }));
    }
    return Promise.resolve({ data: { totalChats: 0, activeChats: 0, avgResponseTime: 0, agentPerformance: [] } });
}

export function getAgentPerformance(agentId = null, dateRange = {}) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    const params = { ...dateRange, ...(agentId && { agentId }) };
    if (backendUrl) {
        return axiosServices.get('/whatsapp/admin/performance', { params })
            .then(response => {
                if (response.data?.data) {
                    return { data: response.data.data };
                } else if (response.data) {
                    return { data: response.data };
                }
                return { data: [] };
            })
            .catch(() => Promise.resolve({ data: [] }));
    }
    return Promise.resolve({ data: [] });
}

export function getOnlineAgents() {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        return axiosServices.get('/whatsapp/agents/online')
            .then(response => {
                if (response.data?.data && Array.isArray(response.data.data)) {
                    return { data: response.data.data };
                } else if (Array.isArray(response.data)) {
                    return { data: response.data };
                }
                return { data: [] };
            })
            .catch(() => Promise.resolve({ data: [] }));
    }
    return Promise.resolve({ data: [] });
}

// Typing Indicators
/**
 * Send typing indicator and read receipt
 * @param {string} chatId - Phone number to send typing indicator to
 * @param {boolean} isTyping - Whether user is typing
 * @param {string} messageId - Optional: Message ID to mark as read simultaneously
 */
export function sendTypingIndicator(chatId, isTyping, messageId = null) {
    const provider = WHATSAPP_API_CONFIG.provider;

    switch (provider) {
        case 'whatsapp-business':
        case 'meta-whatsapp':
            // Meta WhatsApp Cloud API - Send typing indicator
            const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
            const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();
            const to = formatPhoneNumber(chatId);

            if (!phoneNumberId) {
                return Promise.reject(new Error('Phone Number ID is required for Meta WhatsApp API'));
            }

            const payload = {
                messaging_product: 'whatsapp',
                to: to
            };

            // Add typing indicator if typing
            if (isTyping) {
                payload.typing_indicator = {
                    type: 'text'
                };
            }

            // Add read status if messageId provided
            if (messageId) {
                payload.status = 'read';
                payload.message_id = messageId;
            }

            return whatsappAxios.post(`/${apiVersion}/${phoneNumberId}/messages`, payload);

        default:
            // For other providers, this would typically be handled via WebSocket/Socket.io
            return Promise.resolve({ data: { chatId, isTyping } });
    }
}

// ========== META WHATSAPP CLOUD API SPECIFIC FUNCTIONS ==========

/**
 * Get phone number information (Meta API)
 */
export function getPhoneNumberInfo() {
    const provider = WHATSAPP_API_CONFIG.provider;
    if (provider !== 'whatsapp-business' && provider !== 'meta-whatsapp') {
        return Promise.reject(new Error('This function is only for Meta WhatsApp API'));
    }

    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();

    return whatsappAxios.get(`/${apiVersion}/${phoneNumberId}`);
}

/**
 * Get business profile (Meta API)
 * @param {array} fields - Optional: Array of fields to retrieve (e.g., ['about', 'address', 'description', 'email', 'profile_picture_url', 'websites', 'vertical'])
 */
export function getBusinessProfile(fields = null) {
    const provider = WHATSAPP_API_CONFIG.provider;
    if (provider !== 'whatsapp-business' && provider !== 'meta-whatsapp') {
        return Promise.reject(new Error('This function is only for Meta WhatsApp API'));
    }

    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();

    // Build query parameters
    const params = {};
    if (fields && Array.isArray(fields)) {
        params.fields = fields.join(',');
    }

    return whatsappAxios.get(`/${apiVersion}/${phoneNumberId}/whatsapp_business_profile`, { params });
}

/**
 * Update business profile (Meta API)
 * @param {object} profileData - Profile data object with fields like messaging_product, address, description, email, etc.
 */
export function updateBusinessProfile(profileData) {
    const provider = WHATSAPP_API_CONFIG.provider;
    if (provider !== 'whatsapp-business' && provider !== 'meta-whatsapp') {
        return Promise.reject(new Error('This function is only for Meta WhatsApp API'));
    }

    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();

    // Ensure messaging_product is set
    const payload = {
        messaging_product: 'whatsapp',
        ...profileData
    };

    return whatsappAxios.post(`/${apiVersion}/${phoneNumberId}/whatsapp_business_profile`, payload);
}

/**
 * Send media message (Meta API)
 * @param {string} chatId - Phone number to send media to
 * @param {string} mediaUrlOrId - Media URL (http/https) or Media ID (for uploaded media)
 * @param {string} mediaType - Type of media: 'image', 'audio', 'video', 'document', 'sticker'
 * @param {string} caption - Optional: Caption for image, document, or video
 * @param {object} options - Optional: { useMediaId: boolean, context: { message_id } for replies }
 */
export function sendMediaMessage(chatId, mediaUrlOrId, mediaType = 'image', caption = '', options = {}) {
    const provider = WHATSAPP_API_CONFIG.provider;
    if (provider !== 'whatsapp-business' && provider !== 'meta-whatsapp') {
        return Promise.reject(new Error('This function is only for Meta WhatsApp API'));
    }

    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();
    const to = formatPhoneNumber(chatId);

    if (!phoneNumberId) {
        return Promise.reject(new Error('Phone Number ID is required for Meta WhatsApp API'));
    }

    const messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: mediaType,
    };

    // Build media object - use ID if provided, otherwise use link
    const mediaObject = options.useMediaId ? { id: mediaUrlOrId } : { link: mediaUrlOrId };

    // Add caption for image, document, or video
    if ((mediaType === 'image' || mediaType === 'document' || mediaType === 'video') && caption) {
        mediaObject.caption = caption;
    }

    // Add filename for documents
    if (mediaType === 'document' && options.filename) {
        mediaObject.filename = options.filename;
    }

    messagePayload[mediaType] = mediaObject;

    // Add context if replying to a message
    if (options.context && options.context.message_id) {
        messagePayload.context = {
            message_id: options.context.message_id
        };
    }

    return whatsappAxios.post(`/${apiVersion}/${phoneNumberId}/messages`, messagePayload);
}

/**
 * Send template message (Meta API) - Required for first-time conversations
 * @param {string} chatId - Phone number to send template to
 * @param {string} templateName - Name of the template
 * @param {string} languageCode - Language code (e.g., 'en', 'en_US')
 * @param {array} components - Optional: Array of component objects (body, header, buttons, etc.)
 */
export function sendTemplateMessage(chatId, templateName, languageCode = 'en', components = []) {
    const provider = WHATSAPP_API_CONFIG.provider;
    if (provider !== 'whatsapp-business' && provider !== 'meta-whatsapp') {
        return Promise.reject(new Error('This function is only for Meta WhatsApp API'));
    }

    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();
    const to = formatPhoneNumber(chatId);

    const templatePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: languageCode
            }
        }
    };

    // Add components if provided
    if (components && components.length > 0) {
        templatePayload.template.components = components;
    }

    return whatsappAxios.post(`/${apiVersion}/${phoneNumberId}/messages`, templatePayload);
}

/**
 * Verify webhook (Meta API)
 */
export function verifyWebhook(mode, token, challenge) {
    // This is typically handled server-side
    // Meta sends a GET request with these parameters for webhook verification
    const verifyToken = localStorage.getItem('whatsapp_webhook_verify_token') || 'your_verify_token';

    if (mode === 'subscribe' && token === verifyToken) {
        return Promise.resolve({ data: { challenge } });
    }

    return Promise.reject(new Error('Webhook verification failed'));
}

/**
 * Process incoming webhook (Meta API)
 * Call this when you receive a webhook from Meta
 * Returns processed data that should be dispatched to Redux
 */
export function processWebhook(webhookData) {
    // Process incoming webhook data from Meta
    // Returns data to be dispatched to Redux by the calling component

    const processedData = {
        messages: [],
        chats: [],
        statusUpdates: []
    };

    if (webhookData.object === 'whatsapp_business_account') {
        const entries = webhookData.entry || [];

        entries.forEach(entry => {
            const changes = entry.changes || [];

            changes.forEach(change => {
                if (change.field === 'messages') {
                    const value = change.value;

                    // Handle incoming message
                    if (value.messages) {
                        value.messages.forEach(message => {
                            const phoneNumber = value.contacts?.[0]?.wa_id || message.from;
                            const messageId = message.id;
                            const messageText = message.text?.body || '';
                            const timestamp = message.timestamp;

                            const newMessage = {
                                id: messageId,
                                from: phoneNumber,
                                text: messageText,
                                timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
                                type: message.type,
                                senderType: 'customer'
                            };

                            processedData.messages.push({
                                chatId: phoneNumber,
                                message: newMessage
                            });

                            // Create or update chat
                            const existingChat = processedData.chats.find(c => c.phoneNumber === phoneNumber);
                            if (existingChat) {
                                existingChat.lastMessage = { text: messageText };
                                existingChat.lastMessageTime = newMessage.timestamp;
                                existingChat.unreadCount = (existingChat.unreadCount || 0) + 1;
                            } else {
                                processedData.chats.push({
                                    id: phoneNumber,
                                    phoneNumber: phoneNumber,
                                    customerName: value.contacts?.[0]?.profile?.name || phoneNumber,
                                    lastMessage: { text: messageText },
                                    lastMessageTime: newMessage.timestamp,
                                    unreadCount: 1,
                                    status: 'unassigned',
                                    createdAt: newMessage.timestamp
                                });
                            }
                        });
                    }

                    // Handle status updates (delivered, read, etc.)
                    if (value.statuses) {
                        value.statuses.forEach(status => {
                            processedData.statusUpdates.push(status);
                            console.log('Message status update:', status);
                        });
                    }
                }
            });
        });
    }

    return Promise.resolve({ data: processedData });
}

// Export configuration for external use
export { WHATSAPP_API_CONFIG };

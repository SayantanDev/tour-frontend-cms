import axiosServices from './interceptor'; // Import your existing axios instance with interceptors

// External WhatsApp API Configuration
// Configuration is now stored in Redux, not localStorage
// This object provides getters that can access Redux state via a store reference
let storeRef = null;

// Function to set the Redux store reference
export const setStoreRef = (store) => {
    storeRef = store;
};

// Helper to get Redux state
const getReduxState = () => {
    if (storeRef) {
        return storeRef.getState();
    }
    return null;
};

// External WhatsApp API Configuration
// Supports: Twilio, WhatsApp Business API, ChatAPI, etc.
const WHATSAPP_API_CONFIG = {
    // Provider: 'twilio' | 'whatsapp-business' | 'chatapi' | '360dialog' | 'custom'
    get provider() {
        const state = getReduxState();
        if (state?.whatsapp?.config?.provider) {
            return state.whatsapp.config.provider;
        }
        return process.env.REACT_APP_WHATSAPP_PROVIDER || 'twilio';
    },

    // API Base URL (varies by provider)
    get baseURL() {
        const state = getReduxState();
        const provider = this.provider;

        // For Meta WhatsApp Cloud API, default to graph.facebook.com
        if ((provider === 'whatsapp-business' || provider === 'meta-whatsapp')) {
            if (state?.whatsapp?.config?.baseURL) {
                return state.whatsapp.config.baseURL;
            }
            return 'https://graph.facebook.com';
        }

        if (state?.whatsapp?.config?.baseURL) {
            return state.whatsapp.config.baseURL;
        }
        return process.env.REACT_APP_WHATSAPP_API_URL || '';
    },

    // API Key/Token (stored in Redux)
    getApiKey: () => {
        const state = getReduxState();
        if (state?.whatsapp?.config?.apiKey) {
            return state.whatsapp.config.apiKey;
        }
        return process.env.REACT_APP_WHATSAPP_API_KEY || '';
    },
    getApiSecret: () => {
        const state = getReduxState();
        if (state?.whatsapp?.config?.apiSecret) {
            return state.whatsapp.config.apiSecret;
        }
        return process.env.REACT_APP_WHATSAPP_API_SECRET || '';
    },
    getAccountSid: () => {
        const state = getReduxState();
        if (state?.whatsapp?.config?.accountSid) {
            return state.whatsapp.config.accountSid;
        }
        return process.env.REACT_APP_WHATSAPP_ACCOUNT_SID || '';
    },
    getPhoneNumberId: () => {
        const state = getReduxState();
        if (state?.whatsapp?.config?.phoneNumberId) {
            return state.whatsapp.config.phoneNumberId;
        }
        return process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID || '';
    },
    getBusinessAccountId: () => {
        const state = getReduxState();
        if (state?.whatsapp?.config?.businessAccountId) {
            return state.whatsapp.config.businessAccountId;
        }
        return process.env.REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID || '';
    },
    getApiVersion: () => {
        const state = getReduxState();
        if (state?.whatsapp?.config?.apiVersion) {
            return state.whatsapp.config.apiVersion;
        }
        return process.env.REACT_APP_WHATSAPP_API_VERSION || 'v18.0';
    },

    // Check if configuration is active and valid
    isActive: () => {
        // Check if using backend API (backend handles config)
        const backendUrl = process.env.REACT_APP_BASE_URL;
        if (backendUrl) {
            // If backend is configured, assume config is managed there
            // We'll check backend config status when making API calls
            return true;
        }

        // For direct provider integration, check if config is set
        const provider = WHATSAPP_API_CONFIG.provider;
        const baseURL = WHATSAPP_API_CONFIG.baseURL;

        if (!baseURL || baseURL.trim() === '') {
            return false;
        }

        // Check provider-specific required fields
        switch (provider) {
            case 'twilio':
                return !!(WHATSAPP_API_CONFIG.getAccountSid() && WHATSAPP_API_CONFIG.getApiSecret());

            case 'whatsapp-business':
            case 'meta-whatsapp':
                return !!(WHATSAPP_API_CONFIG.getApiKey() && WHATSAPP_API_CONFIG.getPhoneNumberId());

            case 'chatapi':
            case '360dialog':
                return !!WHATSAPP_API_CONFIG.getApiKey();

            case 'custom':
                return !!WHATSAPP_API_CONFIG.getApiKey();

            default:
                return false;
        }
    },

    // Get configuration status message
    getStatusMessage: () => {
        if (WHATSAPP_API_CONFIG.isActive()) {
            return 'Configuration is active';
        }

        const provider = WHATSAPP_API_CONFIG.provider;
        const missing = [];

        if (!WHATSAPP_API_CONFIG.baseURL || WHATSAPP_API_CONFIG.baseURL.trim() === '') {
            missing.push('Base URL');
        }

        switch (provider) {
            case 'twilio':
                if (!WHATSAPP_API_CONFIG.getAccountSid()) missing.push('Account SID');
                if (!WHATSAPP_API_CONFIG.getApiSecret()) missing.push('API Secret');
                break;

            case 'whatsapp-business':
            case 'meta-whatsapp':
                if (!WHATSAPP_API_CONFIG.getApiKey()) missing.push('Access Token');
                if (!WHATSAPP_API_CONFIG.getPhoneNumberId()) missing.push('Phone Number ID');
                break;

            case 'chatapi':
            case '360dialog':
            case 'custom':
                if (!WHATSAPP_API_CONFIG.getApiKey()) missing.push('API Key');
                break;
        }

        return `Configuration is incomplete. Missing: ${missing.join(', ')}. Please configure WhatsApp API in Settings.`;
    }
};

// All API calls now go through axiosServices (backend API)
// Direct provider API calls have been removed

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

// Helper function to validate configuration before API calls
// Only validates for direct provider integration, not for backend API
const validateConfigurationSync = (skipForBackend = true) => {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    // If using backend API, always allow the call
    // Backend will handle configuration validation and return appropriate errors
    if (backendUrl && skipForBackend) {
        return { valid: true };
    }

    // For direct provider integration, check local config
    // Only block if we're directly calling WhatsApp provider APIs
    if (!WHATSAPP_API_CONFIG.isActive()) {
        return {
            valid: false,
            error: new Error(WHATSAPP_API_CONFIG.getStatusMessage())
        };
    }

    return { valid: true };
};

// ========== CHAT OPERATIONS ==========

/**
 * Get all chats/conversations
 * Uses backend API: GET /whatsapp/chats
 */
export function getAllChats(filters = {}) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        console.warn('REACT_APP_BASE_URL not configured. Cannot fetch chats.');
        return Promise.resolve({ data: [] });
    }

    // Fetch from your backend API - matches documentation: GET /chats
    return axiosServices.get('/whatsapp/chats', { params: filters })
        .then(response => {
            console.log('Fetched chats from backend:', response.data);
            // Handle response structure: { success: true, data: [...] } or direct array
            if (response.data?.data && Array.isArray(response.data.data)) {
                return { data: response.data.data };
            } else if (Array.isArray(response.data)) {
                return { data: response.data };
            }
            return { data: [] };
        })
        .catch(error => {
            console.error('Failed to fetch chats from backend:', error);
            return Promise.resolve({ data: [] });
        });
}

/**
 * Create a new chat/conversation
 * Uses backend API: POST /whatsapp/chats
 * @param {object} chatData - { phoneNumber, customerName, customerId?, status?, source?, provider? }
 */
export function createNewChat(chatData) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        console.warn('REACT_APP_BASE_URL not configured. Cannot create chat.');
        // Fallback: Create chat object locally
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

    // Prepare chat data according to documentation structure
    const requestData = {
        phoneNumber: chatData.phoneNumber,
        customerName: chatData.customerName || chatData.phoneNumber,
        customerId: chatData.customerId,
        status: chatData.status || 'unassigned',
        source: chatData.source || 'whatsapp',
        provider: chatData.provider || WHATSAPP_API_CONFIG.provider,
    };

    // Create chat via backend API - matches documentation: POST /chats
    return axiosServices.post('/whatsapp/chats', requestData)
        .then(response => {
            console.log('Chat created via backend:', response.data);
            // Handle response structure: { success: true, data: {...} } or direct object
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: requestData };
        })
        .catch(error => {
            console.error('Failed to create chat via backend:', error);
            // Fallback: Create chat object locally
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

/**
 * Get chat by ID
 * Uses backend API: GET /whatsapp/chats/:id
 */
export function getChatById(chatId) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        console.warn('REACT_APP_BASE_URL not configured. Cannot fetch chat.');
        return Promise.resolve({ data: null });
    }

    // Fetch chat from backend API - matches documentation: GET /chats/:id
    return axiosServices.get(`/whatsapp/chats/${chatId}`)
        .then(response => {
            // Handle response structure: { success: true, data: {...} } or direct object
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: null };
        })
        .catch(error => {
            console.error('Failed to fetch chat from backend:', error);
            return Promise.resolve({ data: null });
        });
}

/**
 * Get messages for a chat
 * Uses backend API: GET /whatsapp/messages/chat/:chatId
 */
export function getChatMessages(chatId, page = 1, limit = 50) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        console.warn('REACT_APP_BASE_URL not configured. Cannot fetch messages.');
        return Promise.resolve({ data: [] });
    }

    // Fetch messages from backend API - matches documentation: GET /messages/chat/:chatId
    return axiosServices.get(`/whatsapp/messages/chat/${chatId}`, {
        params: { page, limit, sortOrder: -1 }
    })
        .then(response => {
            console.log('Fetched messages from backend:', response.data);
            // Handle response structure: { success: true, data: [...] } or direct array
            let messages = [];
            if (response.data?.data && Array.isArray(response.data.data)) {
                messages = response.data.data;
            } else if (Array.isArray(response.data)) {
                messages = response.data;
            }
            return { data: messages };
        })
        .catch(error => {
            console.error('Failed to fetch messages from backend:', error);
            return Promise.resolve({ data: [] });
        });
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
 * Uses backend API: POST /whatsapp/messages/chat/:chatId
 * @param {string} chatId - Phone number or chat ID
 * @param {object} message - Message object with text, type, direction
 */
export function sendMessage(chatId, message) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.reject(new Error('REACT_APP_BASE_URL not configured. Cannot send message.'));
    }

    // Prepare message data according to documentation structure
    const messageData = {
        text: message.text,
        type: message.type || 'text',
        direction: 'outbound'
    };

    // Send message via backend API - matches documentation: POST /messages/chat/:chatId
    return axiosServices.post(`/whatsapp/messages/chat/${chatId}`, messageData)
        .then(response => {
            console.log('Message sent via backend:', response.data);
            // Handle response structure: { success: true, data: {...} } or direct object
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: { chatId, text: message.text, type: message.type || 'text' } };
        })
        .catch(error => {
            console.error('Failed to send message via backend:', error);
            return Promise.reject(error);
        });
}

/**
 * Mark message as read
 * Uses backend API: PUT /whatsapp/messages/:id/read
 * @param {string} messageId - The WhatsApp message ID (wamid) to mark as read
 * @param {string} chatId - Optional: Chat ID (for backward compatibility)
 */
export function markChatAsRead(messageId, chatId = null) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.reject(new Error('REACT_APP_BASE_URL not configured. Cannot mark message as read.'));
    }

    if (!messageId) {
        return Promise.reject(new Error('Message ID is required to mark message as read'));
    }

    // Mark message as read via backend API - matches documentation: PUT /messages/:id/read
    return axiosServices.put(`/whatsapp/messages/${messageId}/read`, { messageId })
        .then(response => {
            // Handle response structure: { success: true, data: {...} } or direct object
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: { messageId, read: true } };
        })
        .catch(error => {
            console.error('Failed to mark message as read via backend:', error);
            return Promise.reject(error);
        });
}

// ========== AGENT OPERATIONS ==========
// Note: These are typically managed in your own system, not the WhatsApp API
// Keeping them for internal state management

export function getAllAgents() {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    // Agents are managed in backend/local, not dependent on WhatsApp provider config
    // Always allow this call

    // Try backend API first
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
    const backendUrl = process.env.REACT_APP_BASE_URL;

    // Labels are managed in backend/local, not dependent on WhatsApp provider config
    // Always allow this call

    // Try backend API first
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

    // Templates are managed in backend/local, not dependent on WhatsApp provider config
    // Always allow this call

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
        // Try /notes endpoint with chatId filter (matches documentation: GET /notes?chatId=...)
        return axiosServices.get('/whatsapp/notes', { params: { chatId } })
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
    const noteData = { chatId, note: note.note || note.content || note, authorId: note.authorId };
    if (backendUrl) {
        // Matches documentation: POST /notes
        return axiosServices.post('/whatsapp/notes', noteData)
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
        // Try by phone number first, then by ID
        return axiosServices.get('/whatsapp/customers', { params: { phoneNumber } })
            .then(response => {
                if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                    return { data: response.data.data[0] };
                } else if (Array.isArray(response.data) && response.data.length > 0) {
                    return { data: response.data[0] };
                }
                // Try as ID
                return axiosServices.get(`/whatsapp/customers/${phoneNumber}`)
                    .then(idResponse => {
                        if (idResponse.data?.data) {
                            return { data: idResponse.data.data };
                        } else if (idResponse.data) {
                            return { data: idResponse.data };
                        }
                        return { data: null };
                    });
            })
            .catch(() => {
                // Try as ID if phone search fails
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
            });
    }
    return Promise.resolve({ data: null });
}

export function updateCustomerInfo(phoneNumber, info) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    // For backend API, always allow - backend will handle validation
    // Customer info is stored in backend, not dependent on WhatsApp provider config
    const customerData = { ...info };
    if (backendUrl) {
        // First get customer by phone number to get ID
        return getCustomerInfo(phoneNumber)
            .then(customerRes => {
                const customerId = customerRes.data?._id || customerRes.data?.id || phoneNumber;
                // Matches documentation: PUT /customers/:id
                return axiosServices.put(`/whatsapp/customers/${customerId}`, customerData)
                    .then(response => {
                        if (response.data?.data) {
                            return { data: response.data.data };
                        } else if (response.data) {
                            return { data: response.data };
                        }
                        return { data: customerData };
                    })
                    .catch(() => Promise.resolve({ data: customerData }));
            })
            .catch(() => Promise.resolve({ data: customerData }));
    }
    return Promise.resolve({ data: customerData });
}

// Follow-ups
export function getFollowUps(chatId = null) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    // Follow-ups are managed in backend/local, not dependent on WhatsApp provider config
    // Always allow this call

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

    // Blocked numbers are managed in backend/local, not dependent on WhatsApp provider config
    // Always allow this call

    if (backendUrl) {
        // Matches documentation: GET /blocked-numbers
        return axiosServices.get('/whatsapp/blocked-numbers')
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
    const newBlock = { phoneNumber, reason };
    if (backendUrl) {
        // Matches documentation: POST /blocked-numbers
        return axiosServices.post('/whatsapp/blocked-numbers', newBlock)
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
        // First get blocked number by phone to get ID, then delete
        return axiosServices.get('/whatsapp/blocked-numbers', { params: { phoneNumber } })
            .then(response => {
                const blockedId = response.data?.data?.[0]?._id || response.data?.data?.[0]?.id ||
                    (Array.isArray(response.data) && response.data[0]?._id) ||
                    (Array.isArray(response.data) && response.data[0]?.id) ||
                    phoneNumber;
                // Matches documentation: DELETE /blocked-numbers/:id
                return axiosServices.delete(`/whatsapp/blocked-numbers/${blockedId}`)
                    .then(() => Promise.resolve({ data: { phoneNumber } }))
                    .catch(() => Promise.resolve({ data: { phoneNumber } }));
            })
            .catch(() => Promise.resolve({ data: { phoneNumber } }));
    }
    return Promise.resolve({ data: { phoneNumber } });
}

// Admin Stats
export function getAdminStats(filters = {}) {
    const backendUrl = process.env.REACT_APP_BASE_URL;
    if (backendUrl) {
        // Matches documentation: GET /performance (for admin stats, could also be /stats/admin)
        return axiosServices.get('/whatsapp/performance', { params: filters })
            .catch(() => {
                // Fallback to admin/stats if performance endpoint doesn't exist
                return axiosServices.get('/whatsapp/admin/stats', { params: filters });
            })
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

    // Agents are managed in backend/local, not dependent on WhatsApp provider config
    // Always allow this call

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
 * Send typing indicator
 * Uses backend API: POST /whatsapp/messages/typing
 * @param {string} chatId - Phone number to send typing indicator to
 * @param {boolean} isTyping - Whether user is typing
 * @param {string} messageId - Optional: Message ID to mark as read simultaneously
 */
export function sendTypingIndicator(chatId, isTyping, messageId = null) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        console.warn('REACT_APP_BASE_URL not configured. Cannot send typing indicator.');
        return Promise.resolve({ data: { chatId, isTyping } });
    }

    // Send typing indicator via backend API
    return axiosServices.post('/whatsapp/messages/typing', {
        chatId,
        isTyping,
        messageId
    })
        .then(response => {
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: { chatId, isTyping } };
        })
        .catch(error => {
            console.error('Failed to send typing indicator via backend:', error);
            return Promise.resolve({ data: { chatId, isTyping } });
        });
}

// ========== META WHATSAPP CLOUD API SPECIFIC FUNCTIONS ==========

/**
 * Get phone number information
 * Uses backend API: GET /whatsapp/config/phone-number
 */
export function getPhoneNumberInfo() {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.reject(new Error('REACT_APP_BASE_URL not configured. Cannot fetch phone number info.'));
    }

    // Fetch phone number info via backend API
    return axiosServices.get('/whatsapp/config/phone-number')
        .then(response => {
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: null };
        })
        .catch(error => {
            console.error('Failed to fetch phone number info via backend:', error);
            return Promise.reject(error);
        });
}

/**
 * Get business profile
 * Uses backend API: GET /whatsapp/business-profile
 * @param {array} fields - Optional: Array of fields to retrieve (e.g., ['about', 'address', 'description', 'email', 'profile_picture_url', 'websites', 'vertical'])
 */
export function getBusinessProfile(fields = null) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.reject(new Error('REACT_APP_BASE_URL not configured. Cannot fetch business profile.'));
    }

    // Build query parameters
    const params = {};
    if (fields && Array.isArray(fields)) {
        params.fields = fields.join(',');
    }

    // Fetch business profile via backend API
    return axiosServices.get('/whatsapp/business-profile', { params })
        .then(response => {
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: null };
        })
        .catch(error => {
            console.error('Failed to fetch business profile via backend:', error);
            return Promise.reject(error);
        });
}

/**
 * Update business profile
 * Uses backend API: PUT /whatsapp/business-profile
 * @param {object} profileData - Profile data object with fields like address, description, email, etc.
 */
export function updateBusinessProfile(profileData) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.reject(new Error('REACT_APP_BASE_URL not configured. Cannot update business profile.'));
    }

    // Update business profile via backend API
    return axiosServices.put('/whatsapp/business-profile', profileData)
        .then(response => {
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: profileData };
        })
        .catch(error => {
            console.error('Failed to update business profile via backend:', error);
            return Promise.reject(error);
        });
}


/**
 * Send template message - Required for first-time conversations
 * Uses backend API: POST /whatsapp/messages/template
 * @param {string} chatId - Phone number to send template to
 * @param {string} templateName - Name of the template
 * @param {string} languageCode - Language code (e.g., 'en', 'en_US')
 * @param {array} components - Optional: Array of component objects (body, header, buttons, etc.)
 */
export function sendTemplateMessage(chatId, templateName, languageCode = 'en', components = []) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.reject(new Error('REACT_APP_BASE_URL not configured. Cannot send template message.'));
    }

    // Prepare template message data
    const templateData = {
        chatId,
        templateName,
        languageCode,
        components: components || []
    };

    // Send template message via backend API
    return axiosServices.post('/whatsapp/messages/template', templateData)
        .then(response => {
            console.log('Template message sent via backend:', response.data);
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: { chatId, templateName, languageCode } };
        })
        .catch(error => {
            console.error('Failed to send template message via backend:', error);
            return Promise.reject(error);
        });
}

/**
 * Verify webhook (Meta API)
 */
export function verifyWebhook(mode, token, challenge) {
    // This is typically handled server-side
    // Meta sends a GET request with these parameters for webhook verification
    // Webhook verify token should come from backend config
    const state = getReduxState();
    const verifyToken = state?.whatsapp?.config?.webhookVerifyToken || 'your_verify_token';

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

// ========== CONFIGURATION MANAGEMENT ==========

/**
 * Get active configuration
 * Uses backend API: GET /whatsapp/config/active
 */
export function getActiveConfig() {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.resolve({ data: null });
    }

    return axiosServices.get('/whatsapp/config/active')
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

/**
 * Load configuration from backend and sync to Redux
 * @param {function} dispatch - Redux dispatch function
 * @param {function} setWhatsAppConfig - Redux action to set config
 * @returns {Promise<object|null>} - Configuration data or null
 */
export async function loadConfigFromBackend(dispatch, setWhatsAppConfig) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        console.warn('Backend URL not configured. Cannot load config from database.');
        return null;
    }

    try {
        const response = await getActiveConfig();
        console.log("getActiveConfig : ", getActiveConfig);

        const configData = response?.data;

        // Check if config exists (either isActive is true, or configData exists)
        if (configData && (configData.isActive !== false)) {
            console.log("configData from backend:", configData);
            // Map backend config structure to Redux structure
            // For Meta providers: accessToken -> apiKey
            // For Twilio: authToken -> apiSecret
            const reduxConfig = {
                provider: configData.provider || 'twilio',
                baseURL: configData.baseURL || '',
                // Map accessToken (Meta) or apiKey (others) to apiKey
                apiKey: configData.accessToken || configData.apiKey || '',
                // Map authToken (Twilio) or apiSecret (others) to apiSecret
                apiSecret: configData.authToken || configData.apiSecret || '',
                accountSid: configData.accountSid || '',
                phoneNumberId: configData.phoneNumberId || '',
                businessAccountId: configData.businessAccountId || '',
                apiVersion: configData.apiVersion || 'v18.0',
                _id: configData._id || configData.id, // Store backend ID
                id: configData._id || configData.id,
                isActive: configData.isActive !== false,
            };

            // Store in Redux only if config exists in database
            dispatch(setWhatsAppConfig(reduxConfig));
            console.log('Configuration loaded from backend and stored in Redux:', reduxConfig);
            return reduxConfig;
        } else {
            console.log('No active configuration found in database.');
            return null;
        }
    } catch (error) {
        console.error('Failed to load configuration from backend:', error);
        return null;
    }
}

/**
 * Create configuration
 * Uses backend API: POST /whatsapp/config
 * @param {object} configData - Configuration data object
 */
export function createConfig(configData) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.reject(new Error('REACT_APP_BASE_URL not configured. Cannot create configuration.'));
    }

    return axiosServices.post('/whatsapp/config', configData)
        .then(response => {
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: configData };
        })
        .catch(error => {
            console.error('Failed to create configuration:', error);
            return Promise.reject(error);
        });
}

/**
 * Update configuration
 * Uses backend API: PUT /whatsapp/config/:id
 * @param {string} configId - Configuration ID
 * @param {object} configData - Configuration data object
 */
export function updateConfig(configId, configData) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.reject(new Error('REACT_APP_BASE_URL not configured. Cannot update configuration.'));
    }

    return axiosServices.put(`/whatsapp/config/${configId}`, configData)
        .then(response => {
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: { id: configId, ...configData } };
        })
        .catch(error => {
            console.error('Failed to update configuration:', error);
            return Promise.reject(error);
        });
}

/**
 * Activate configuration
 * Uses backend API: PUT /whatsapp/config/:id/activate
 * @param {string} configId - Configuration ID
 */
export function activateConfig(configId) {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (!backendUrl) {
        return Promise.reject(new Error('REACT_APP_BASE_URL not configured. Cannot activate configuration.'));
    }

    return axiosServices.put(`/whatsapp/config/${configId}/activate`)
        .then(response => {
            if (response.data?.data) {
                return { data: response.data.data };
            } else if (response.data) {
                return { data: response.data };
            }
            return { data: { id: configId, isActive: true } };
        })
        .catch(error => {
            console.error('Failed to activate configuration:', error);
            return Promise.reject(error);
        });
}

// Export configuration and validation functions for external use
export { WHATSAPP_API_CONFIG, validateConfigurationSync };

/**
 * Check if WhatsApp configuration is active and valid
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function checkConfigurationStatus() {
    const backendUrl = process.env.REACT_APP_BASE_URL;

    if (backendUrl) {
        try {
            const configResponse = await axiosServices.get('/whatsapp/config/active')
                .catch(() => null);

            if (configResponse?.data?.data) {
                const config = configResponse.data.data;
                return {
                    valid: config.isActive === true,
                    message: config.isActive
                        ? 'Configuration is active'
                        : 'Configuration is not active. Please activate it in Settings.',
                    config: config
                };
            }

            return {
                valid: false,
                message: 'No active configuration found. Please configure WhatsApp API in Settings.'
            };
        } catch (err) {
            return {
                valid: false,
                message: 'Failed to check configuration status. Please verify your backend API is running.'
            };
        }
    }

    // For direct provider integration
    const isValid = WHATSAPP_API_CONFIG.isActive();
    return {
        valid: isValid,
        message: isValid
            ? 'Configuration is active'
            : WHATSAPP_API_CONFIG.getStatusMessage()
    };
}

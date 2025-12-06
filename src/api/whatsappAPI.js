import axios from 'axios';

// External WhatsApp API Configuration
// Supports: Twilio, WhatsApp Business API, ChatAPI, etc.
const WHATSAPP_API_CONFIG = {
    // Provider: 'twilio' | 'whatsapp-business' | 'chatapi' | '360dialog' | 'custom'
    get provider() {
        return localStorage.getItem('whatsapp_provider') || process.env.REACT_APP_WHATSAPP_PROVIDER || 'twilio';
    },

    // API Base URL (varies by provider)
    get baseURL() {
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

    switch (provider) {
        case 'twilio':
            // Twilio Conversations API
            return whatsappAxios.get('/v1/Conversations', { params: filters });

        case 'whatsapp-business':
        case 'meta-whatsapp':
            // Meta WhatsApp Cloud API - Conversations are managed via webhooks
            // For now, return conversations from localStorage (populated by webhooks)
            // In production, you'd fetch from your webhook handler/database
            const conversations = JSON.parse(localStorage.getItem('meta_whatsapp_conversations') || '[]');
            return Promise.resolve({ data: conversations });

        case 'chatapi':
            // ChatAPI - Get dialogs
            return whatsappAxios.get('/dialogs', { params: filters });

        default:
            // Generic endpoint
            return whatsappAxios.get('/chats', { params: filters });
    }
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
            // Get conversation from localStorage (populated by webhooks)
            const conversations = JSON.parse(localStorage.getItem('meta_whatsapp_conversations') || '[]');
            const conversation = conversations.find(c => c.id === chatId || c.phoneNumber === chatId);
            return Promise.resolve({ data: conversation || null });

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

    switch (provider) {
        case 'twilio':
            return whatsappAxios.get(`/v1/Conversations/${chatId}/Messages`, {
                params: { PageSize: limit, Page: page }
            });

        case 'whatsapp-business':
        case 'meta-whatsapp':
            // Meta WhatsApp Cloud API - Messages are received via webhooks
            // For now, return messages from localStorage (populated by webhooks)
            const messages = JSON.parse(localStorage.getItem(`meta_whatsapp_messages_${chatId}`) || '[]');
            const startIndex = (page - 1) * limit;
            const paginatedMessages = messages.slice(startIndex, startIndex + limit);
            return Promise.resolve({ data: paginatedMessages });

        case 'chatapi':
            return whatsappAxios.get(`/dialogs/${chatId}/messages`, {
                params: { limit, page }
            });

        default:
            return whatsappAxios.get(`/chats/${chatId}/messages`, {
                params: { page, limit }
            });
    }
}

/**
 * Send a message
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

            // Meta API endpoint: /v18.0/{phone-number-id}/messages
            return whatsappAxios.post(`/${apiVersion}/${phoneNumberId}/messages`, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
                type: 'text',
                text: {
                    preview_url: false, // Set to true if you want link previews
                    body: message.text
                }
            });

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
 * Mark chat as read
 */
export function markChatAsRead(chatId) {
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
            // Meta WhatsApp Cloud API - Mark messages as read
            // Note: Meta API doesn't have a direct "mark as read" endpoint
            // Read receipts are automatically sent when messages are delivered
            // This is handled by webhooks in production
            return Promise.resolve({ data: { success: true } });

        default:
            return whatsappAxios.put(`/chats/${chatId}/read`);
    }
}

// ========== AGENT OPERATIONS ==========
// Note: These are typically managed in your own system, not the WhatsApp API
// Keeping them for internal state management

export function getAllAgents() {
    // This would typically come from your own backend/user management
    // For now, return empty or use localStorage
    return Promise.resolve({ data: JSON.parse(localStorage.getItem('whatsapp_agents') || '[]') });
}

export function getAgentById(agentId) {
    const agents = JSON.parse(localStorage.getItem('whatsapp_agents') || '[]');
    const agent = agents.find(a => a.id === agentId);
    return Promise.resolve({ data: agent || null });
}

export function updateAgentStatus(agentId, status) {
    // Update in localStorage (in production, this would go to your backend)
    const agents = JSON.parse(localStorage.getItem('whatsapp_agents') || '[]');
    const updated = agents.map(a => a.id === agentId ? { ...a, status } : a);
    localStorage.setItem('whatsapp_agents', JSON.stringify(updated));
    return Promise.resolve({ data: updated.find(a => a.id === agentId) });
}

// ========== ASSIGNMENT OPERATIONS ==========
// These are internal operations, stored in localStorage or your backend

export function assignChat(chatId, agentId) {
    const assignments = JSON.parse(localStorage.getItem('whatsapp_assignments') || '{}');
    assignments[chatId] = { agentId, assignedAt: new Date().toISOString() };
    localStorage.setItem('whatsapp_assignments', JSON.stringify(assignments));
    return Promise.resolve({ data: { chatId, agentId } });
}

export function unassignChat(chatId) {
    const assignments = JSON.parse(localStorage.getItem('whatsapp_assignments') || '{}');
    delete assignments[chatId];
    localStorage.setItem('whatsapp_assignments', JSON.stringify(assignments));
    return Promise.resolve({ data: { chatId } });
}

export function transferChat(chatId, toAgentId) {
    const assignments = JSON.parse(localStorage.getItem('whatsapp_assignments') || '{}');
    assignments[chatId] = {
        agentId: toAgentId,
        assignedAt: new Date().toISOString(),
        transferred: true
    };
    localStorage.setItem('whatsapp_assignments', JSON.stringify(assignments));
    return Promise.resolve({ data: { chatId, toAgentId } });
}

export function autoAssignChat(chatId) {
    // Simple round-robin assignment
    const agents = JSON.parse(localStorage.getItem('whatsapp_agents') || '[]');
    const onlineAgents = agents.filter(a => a.status === 'online');
    if (onlineAgents.length === 0) {
        return Promise.reject(new Error('No online agents available'));
    }
    const existingAssignments = JSON.parse(localStorage.getItem('whatsapp_assignments') || '{}');
    const assignedCounts = Object.values(existingAssignments).reduce((acc, a) => {
        acc[a.agentId] = (acc[a.agentId] || 0) + 1;
        return acc;
    }, {});

    const agent = onlineAgents.reduce((min, a) =>
        (assignedCounts[a.id] || 0) < (assignedCounts[min.id] || 0) ? a : min
    );

    return assignChat(chatId, agent.id);
}

// ========== LABELS, TEMPLATES, NOTES, etc. ==========
// These are internal features, stored in localStorage or your backend

export function getAllLabels() {
    return Promise.resolve({
        data: JSON.parse(localStorage.getItem('whatsapp_labels') || '[]')
    });
}

export function createLabel(label) {
    const labels = JSON.parse(localStorage.getItem('whatsapp_labels') || '[]');
    const newLabel = { ...label, id: Date.now().toString() };
    labels.push(newLabel);
    localStorage.setItem('whatsapp_labels', JSON.stringify(labels));
    return Promise.resolve({ data: newLabel });
}

export function updateLabel(labelId, label) {
    const labels = JSON.parse(localStorage.getItem('whatsapp_labels') || '[]');
    const updated = labels.map(l => l.id === labelId ? { ...l, ...label } : l);
    localStorage.setItem('whatsapp_labels', JSON.stringify(updated));
    return Promise.resolve({ data: updated.find(l => l.id === labelId) });
}

export function deleteLabel(labelId) {
    const labels = JSON.parse(localStorage.getItem('whatsapp_labels') || '[]');
    const filtered = labels.filter(l => l.id !== labelId);
    localStorage.setItem('whatsapp_labels', JSON.stringify(filtered));
    return Promise.resolve({ data: { id: labelId } });
}

export function addLabelToChat(chatId, labelId) {
    const chatLabels = JSON.parse(localStorage.getItem('whatsapp_chat_labels') || '{}');
    if (!chatLabels[chatId]) chatLabels[chatId] = [];
    if (!chatLabels[chatId].includes(labelId)) {
        chatLabels[chatId].push(labelId);
    }
    localStorage.setItem('whatsapp_chat_labels', JSON.stringify(chatLabels));
    return Promise.resolve({ data: { chatId, labelId } });
}

export function removeLabelFromChat(chatId, labelId) {
    const chatLabels = JSON.parse(localStorage.getItem('whatsapp_chat_labels') || '{}');
    if (chatLabels[chatId]) {
        chatLabels[chatId] = chatLabels[chatId].filter(id => id !== labelId);
    }
    localStorage.setItem('whatsapp_chat_labels', JSON.stringify(chatLabels));
    return Promise.resolve({ data: { chatId, labelId } });
}

// Templates
export function getAllTemplates() {
    return Promise.resolve({
        data: JSON.parse(localStorage.getItem('whatsapp_templates') || '[]')
    });
}

export function createTemplate(template) {
    const templates = JSON.parse(localStorage.getItem('whatsapp_templates') || '[]');
    const newTemplate = { ...template, id: Date.now().toString() };
    templates.push(newTemplate);
    localStorage.setItem('whatsapp_templates', JSON.stringify(templates));
    return Promise.resolve({ data: newTemplate });
}

export function updateTemplate(templateId, template) {
    const templates = JSON.parse(localStorage.getItem('whatsapp_templates') || '[]');
    const updated = templates.map(t => t.id === templateId ? { ...t, ...template } : t);
    localStorage.setItem('whatsapp_templates', JSON.stringify(updated));
    return Promise.resolve({ data: updated.find(t => t.id === templateId) });
}

export function deleteTemplate(templateId) {
    const templates = JSON.parse(localStorage.getItem('whatsapp_templates') || '[]');
    const filtered = templates.filter(t => t.id !== templateId);
    localStorage.setItem('whatsapp_templates', JSON.stringify(filtered));
    return Promise.resolve({ data: { id: templateId } });
}

// Team Notes
export function getTeamNote(chatId) {
    const notes = JSON.parse(localStorage.getItem('whatsapp_notes') || '{}');
    return Promise.resolve({ data: notes[chatId] || null });
}

export function saveTeamNote(chatId, note) {
    const notes = JSON.parse(localStorage.getItem('whatsapp_notes') || '{}');
    notes[chatId] = { ...note, updatedAt: new Date().toISOString() };
    localStorage.setItem('whatsapp_notes', JSON.stringify(notes));
    return Promise.resolve({ data: notes[chatId] });
}

export function updateTeamNote(chatId, note) {
    return saveTeamNote(chatId, note);
}

// Customer Info
export function getCustomerInfo(phoneNumber) {
    const customers = JSON.parse(localStorage.getItem('whatsapp_customers') || '{}');
    return Promise.resolve({ data: customers[phoneNumber] || null });
}

export function updateCustomerInfo(phoneNumber, info) {
    const customers = JSON.parse(localStorage.getItem('whatsapp_customers') || '{}');
    customers[phoneNumber] = { ...customers[phoneNumber], ...info, updatedAt: new Date().toISOString() };
    localStorage.setItem('whatsapp_customers', JSON.stringify(customers));
    return Promise.resolve({ data: customers[phoneNumber] });
}

// Follow-ups
export function getFollowUps(chatId = null) {
    const followUps = JSON.parse(localStorage.getItem('whatsapp_followups') || '[]');
    if (chatId) {
        return Promise.resolve({ data: followUps.filter(f => f.chatId === chatId) });
    }
    return Promise.resolve({ data: followUps });
}

export function createFollowUp(followUp) {
    const followUps = JSON.parse(localStorage.getItem('whatsapp_followups') || '[]');
    const newFollowUp = { ...followUp, id: Date.now().toString() };
    followUps.push(newFollowUp);
    localStorage.setItem('whatsapp_followups', JSON.stringify(followUps));
    return Promise.resolve({ data: newFollowUp });
}

export function updateFollowUp(followUpId, followUp) {
    const followUps = JSON.parse(localStorage.getItem('whatsapp_followups') || '[]');
    const updated = followUps.map(f => f.id === followUpId ? { ...f, ...followUp } : f);
    localStorage.setItem('whatsapp_followups', JSON.stringify(updated));
    return Promise.resolve({ data: updated.find(f => f.id === followUpId) });
}

export function deleteFollowUp(followUpId) {
    const followUps = JSON.parse(localStorage.getItem('whatsapp_followups') || '[]');
    const filtered = followUps.filter(f => f.id !== followUpId);
    localStorage.setItem('whatsapp_followups', JSON.stringify(filtered));
    return Promise.resolve({ data: { id: followUpId } });
}

// Blocked Numbers
export function getBlockedNumbers() {
    return Promise.resolve({
        data: JSON.parse(localStorage.getItem('whatsapp_blocked') || '[]')
    });
}

export function blockNumber(phoneNumber, reason = '') {
    const blocked = JSON.parse(localStorage.getItem('whatsapp_blocked') || '[]');
    const newBlock = { phoneNumber, reason, blockedAt: new Date().toISOString() };
    blocked.push(newBlock);
    localStorage.setItem('whatsapp_blocked', JSON.stringify(blocked));
    return Promise.resolve({ data: newBlock });
}

export function unblockNumber(phoneNumber) {
    const blocked = JSON.parse(localStorage.getItem('whatsapp_blocked') || '[]');
    const filtered = blocked.filter(b => b.phoneNumber !== phoneNumber);
    localStorage.setItem('whatsapp_blocked', JSON.stringify(filtered));
    return Promise.resolve({ data: { phoneNumber } });
}

// Admin Stats
export function getAdminStats(filters = {}) {
    // Calculate stats from localStorage data
    const chats = JSON.parse(localStorage.getItem('whatsapp_chats') || '[]');

    return Promise.resolve({
        data: {
            totalChats: chats.length,
            activeChats: chats.filter(c => c.status === 'active').length,
            avgResponseTime: 0, // Calculate from message timestamps if available
            agentPerformance: []
        }
    });
}

export function getAgentPerformance(agentId = null, dateRange = {}) {
    return Promise.resolve({ data: [] });
}

export function getOnlineAgents() {
    const agents = JSON.parse(localStorage.getItem('whatsapp_agents') || '[]');
    return Promise.resolve({
        data: agents.filter(a => a.status === 'online')
    });
}

// Typing Indicators
export function sendTypingIndicator(chatId, isTyping) {
    // This would typically be handled via WebSocket/Socket.io
    // For now, just return success
    return Promise.resolve({ data: { chatId, isTyping } });
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
 */
export function getBusinessProfile() {
    const provider = WHATSAPP_API_CONFIG.provider;
    if (provider !== 'whatsapp-business' && provider !== 'meta-whatsapp') {
        return Promise.reject(new Error('This function is only for Meta WhatsApp API'));
    }

    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();

    return whatsappAxios.get(`/${apiVersion}/${phoneNumberId}/whatsapp_business_profile`);
}

/**
 * Update business profile (Meta API)
 */
export function updateBusinessProfile(profileData) {
    const provider = WHATSAPP_API_CONFIG.provider;
    if (provider !== 'whatsapp-business' && provider !== 'meta-whatsapp') {
        return Promise.reject(new Error('This function is only for Meta WhatsApp API'));
    }

    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();

    return whatsappAxios.post(`/${apiVersion}/${phoneNumberId}/whatsapp_business_profile`, profileData);
}

/**
 * Send media message (Meta API)
 */
export function sendMediaMessage(chatId, mediaUrl, mediaType = 'image', caption = '') {
    const provider = WHATSAPP_API_CONFIG.provider;
    if (provider !== 'whatsapp-business' && provider !== 'meta-whatsapp') {
        return Promise.reject(new Error('This function is only for Meta WhatsApp API'));
    }

    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();
    const to = formatPhoneNumber(chatId);

    const messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: mediaType,
    };

    if (mediaType === 'image' || mediaType === 'document') {
        messagePayload[mediaType] = {
            link: mediaUrl,
            caption: caption
        };
    } else if (mediaType === 'audio' || mediaType === 'video') {
        messagePayload[mediaType] = {
            link: mediaUrl
        };
    }

    return whatsappAxios.post(`/${apiVersion}/${phoneNumberId}/messages`, messagePayload);
}

/**
 * Send template message (Meta API) - Required for first-time conversations
 */
export function sendTemplateMessage(chatId, templateName, languageCode = 'en', components = []) {
    const provider = WHATSAPP_API_CONFIG.provider;
    if (provider !== 'whatsapp-business' && provider !== 'meta-whatsapp') {
        return Promise.reject(new Error('This function is only for Meta WhatsApp API'));
    }

    const phoneNumberId = WHATSAPP_API_CONFIG.getPhoneNumberId();
    const apiVersion = WHATSAPP_API_CONFIG.getApiVersion();
    const to = formatPhoneNumber(chatId);

    return whatsappAxios.post(`/${apiVersion}/${phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: languageCode
            },
            components: components
        }
    });
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
 */
export function processWebhook(webhookData) {
    // Process incoming webhook data from Meta
    // This should be called by your webhook handler

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

                            // Store message in localStorage
                            const messagesKey = `meta_whatsapp_messages_${phoneNumber}`;
                            const existingMessages = JSON.parse(localStorage.getItem(messagesKey) || '[]');

                            const newMessage = {
                                id: messageId,
                                from: phoneNumber,
                                text: messageText,
                                timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
                                type: message.type,
                                senderType: 'customer'
                            };

                            existingMessages.push(newMessage);
                            localStorage.setItem(messagesKey, JSON.stringify(existingMessages));

                            // Update conversation list
                            const conversationsKey = 'meta_whatsapp_conversations';
                            const conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
                            const existingConv = conversations.find(c => c.phoneNumber === phoneNumber);

                            if (existingConv) {
                                existingConv.lastMessage = messageText;
                                existingConv.lastMessageTime = newMessage.timestamp;
                                existingConv.unreadCount = (existingConv.unreadCount || 0) + 1;
                            } else {
                                conversations.push({
                                    id: phoneNumber,
                                    phoneNumber: phoneNumber,
                                    customerName: value.contacts?.[0]?.profile?.name || phoneNumber,
                                    lastMessage: messageText,
                                    lastMessageTime: newMessage.timestamp,
                                    unreadCount: 1,
                                    status: 'unassigned',
                                    createdAt: newMessage.timestamp
                                });
                            }

                            localStorage.setItem(conversationsKey, JSON.stringify(conversations));
                        });
                    }

                    // Handle status updates (delivered, read, etc.)
                    if (value.statuses) {
                        value.statuses.forEach(status => {
                            // Update message status in localStorage
                            // This would typically update your database
                            console.log('Message status update:', status);
                        });
                    }
                }
            });
        });
    }

    return Promise.resolve({ data: { success: true } });
}

// Export configuration for external use
export { WHATSAPP_API_CONFIG };

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chats: [],
    selectedChat: null,
    messages: {}, // Store messages by chatId: { [chatId]: [messages] }
    agents: [],
    currentAgent: null,
    templates: [],
    labels: [],
    blockedNumbers: [],
    onlineAgents: [],
    typingIndicators: {},
    unreadCounts: {},
    filters: {
        status: 'all', // all, unassigned, assigned, resolved
        label: null,
        agent: null,
        search: '',
    },
    adminStats: {
        totalChats: 0,
        activeChats: 0,
        avgResponseTime: 0,
        agentPerformance: [],
    },
    followUps: [],
    teamNotes: {},
    isLoading: false,
    error: null,
};

const whatsappSlice = createSlice({
    name: 'whatsapp',
    initialState,
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        addChat: (state, action) => {
            const newChat = action.payload;
            // Ensure chats array exists
            if (!Array.isArray(state.chats)) {
                state.chats = [];
            }
            // Check if chat already exists (by id or phoneNumber)
            const exists = state.chats.find(c => {
                const cId = c.id || c.phoneNumber?.replace(/[^\d]/g, '');
                const newId = newChat.id || newChat.phoneNumber?.replace(/[^\d]/g, '');
                const cPhone = c.phoneNumber || c.id;
                const newPhone = newChat.phoneNumber || newChat.id;
                return (cId && newId && cId === newId) || (cPhone && newPhone && cPhone === newPhone);
            });
            if (!exists) {
                state.chats.unshift(newChat);
                console.log('Chat added to Redux. Total chats:', state.chats.length, 'New chat:', newChat);
            } else {
                console.log('Chat already exists in Redux, skipping duplicate');
            }
        },
        updateChat: (state, action) => {
            const index = state.chats.findIndex(chat => chat.id === action.payload.id);
            if (index !== -1) {
                state.chats[index] = { ...state.chats[index], ...action.payload };
            }
        },
        setSelectedChat: (state, action) => {
            state.selectedChat = action.payload;
        },
        addMessage: (state, action) => {
            const { chatId, message } = action.payload;
            // Ensure messages object exists
            if (!state.messages || typeof state.messages !== 'object') {
                state.messages = {};
            }
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                // Store message in messages object
                if (!state.messages[chatId] || !Array.isArray(state.messages[chatId])) {
                    state.messages[chatId] = [];
                }
                // Avoid duplicates
                const exists = state.messages[chatId].some(m => m.id === message.id || (m.timestamp === message.timestamp && m.text === message.text));
                if (!exists) {
                    state.messages[chatId].push(message);
                }
                // Update chat last message
                chat.lastMessage = message;
                chat.lastMessageTime = message.timestamp;
            }
        },
        setMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            // Ensure messages object exists
            if (!state.messages || typeof state.messages !== 'object') {
                state.messages = {};
            }
            // Ensure messages is an array
            state.messages[chatId] = Array.isArray(messages) ? messages : [];
        },
        clearMessages: (state, action) => {
            const chatId = action.payload;
            // Ensure messages object exists
            if (!state.messages || typeof state.messages !== 'object') {
                state.messages = {};
            }
            if (state.messages[chatId]) {
                delete state.messages[chatId];
            }
        },
        setAgents: (state, action) => {
            state.agents = action.payload;
        },
        setCurrentAgent: (state, action) => {
            state.currentAgent = action.payload;
        },
        updateAgentStatus: (state, action) => {
            const { agentId, status } = action.payload;
            const agent = state.agents.find(a => a.id === agentId);
            if (agent) {
                agent.status = status;
                agent.lastSeen = new Date().toISOString();
            }
            if (state.currentAgent?.id === agentId) {
                state.currentAgent.status = status;
            }
        },
        assignChat: (state, action) => {
            const { chatId, agentId } = action.payload;
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                chat.assignedTo = agentId;
                chat.status = 'assigned';
            }
        },
        unassignChat: (state, action) => {
            const chatId = action.payload;
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                chat.assignedTo = null;
                chat.status = 'unassigned';
            }
        },
        transferChat: (state, action) => {
            const { chatId, fromAgentId, toAgentId } = action.payload;
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                chat.assignedTo = toAgentId;
                chat.transferredFrom = fromAgentId;
                chat.transferredAt = new Date().toISOString();
            }
        },
        setTemplates: (state, action) => {
            state.templates = action.payload;
        },
        addTemplate: (state, action) => {
            state.templates.push(action.payload);
        },
        updateTemplate: (state, action) => {
            const index = state.templates.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.templates[index] = action.payload;
            }
        },
        deleteTemplate: (state, action) => {
            state.templates = state.templates.filter(t => t.id !== action.payload);
        },
        setLabels: (state, action) => {
            state.labels = action.payload;
        },
        addLabelToChat: (state, action) => {
            const { chatId, labelId } = action.payload;
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                if (!chat.labels) chat.labels = [];
                if (!chat.labels.includes(labelId)) {
                    chat.labels.push(labelId);
                }
            }
        },
        removeLabelFromChat: (state, action) => {
            const { chatId, labelId } = action.payload;
            const chat = state.chats.find(c => c.id === chatId);
            if (chat && chat.labels) {
                chat.labels = chat.labels.filter(l => l !== labelId);
            }
        },
        setBlockedNumbers: (state, action) => {
            state.blockedNumbers = action.payload;
        },
        blockNumber: (state, action) => {
            state.blockedNumbers.push(action.payload);
        },
        unblockNumber: (state, action) => {
            state.blockedNumbers = state.blockedNumbers.filter(
                b => b.number !== action.payload
            );
        },
        setOnlineAgents: (state, action) => {
            state.onlineAgents = action.payload;
        },
        setTypingIndicator: (state, action) => {
            const { chatId, isTyping } = action.payload;
            state.typingIndicators[chatId] = isTyping;
        },
        setReadReceipt: (state, action) => {
            const { chatId, messageId, status } = action.payload;
            const chat = state.chats.find(c => c.id === chatId);
            if (chat && chat.messages) {
                const message = chat.messages.find(m => m.id === messageId);
                if (message) {
                    message.readStatus = status;
                }
            }
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setAdminStats: (state, action) => {
            state.adminStats = action.payload;
        },
        setFollowUps: (state, action) => {
            state.followUps = action.payload;
        },
        addFollowUp: (state, action) => {
            state.followUps.push(action.payload);
        },
        updateFollowUp: (state, action) => {
            const index = state.followUps.findIndex(f => f.id === action.payload.id);
            if (index !== -1) {
                state.followUps[index] = action.payload;
            }
        },
        deleteFollowUp: (state, action) => {
            state.followUps = state.followUps.filter(f => f.id !== action.payload);
        },
        setTeamNote: (state, action) => {
            const { chatId, note } = action.payload;
            state.teamNotes[chatId] = note;
        },
        updateUnreadCount: (state, action) => {
            const { chatId, count } = action.payload;
            state.unreadCounts[chatId] = count;
        },
        markChatAsRead: (state, action) => {
            const chatId = action.payload;
            state.unreadCounts[chatId] = 0;
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                chat.unreadCount = 0;
            }
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setChats,
    addChat,
    updateChat,
    setSelectedChat,
    addMessage,
    setMessages,
    clearMessages,
    setAgents,
    setCurrentAgent,
    updateAgentStatus,
    assignChat,
    unassignChat,
    transferChat,
    setTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setLabels,
    addLabelToChat,
    removeLabelFromChat,
    setBlockedNumbers,
    blockNumber,
    unblockNumber,
    setOnlineAgents,
    setTypingIndicator,
    setReadReceipt,
    setFilters,
    setAdminStats,
    setFollowUps,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp,
    setTeamNote,
    updateUnreadCount,
    markChatAsRead,
    setLoading,
    setError,
} = whatsappSlice.actions;

export default whatsappSlice.reducer;


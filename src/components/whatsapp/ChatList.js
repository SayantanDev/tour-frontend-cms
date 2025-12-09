import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { setSelectedChat, setFilters, assignChat, unassignChat, addChat, setChats } from '../../reduxcomponents/slices/whatsappSlice';
import { autoAssignChat, assignChat as assignChatAPI, unassignChat as unassignChatAPI, getAllChats } from '../../api/whatsappAPI';
import moment from 'moment';
import NewContactDialog from './NewContactDialog';
import AddIcon from '@mui/icons-material/Add';

const ChatList = ({ socket }) => {
  const dispatch = useDispatch();
  const { chats, selectedChat, filters, agents, currentAgent, unreadCounts, labels } = useSelector(
    (state) => state.whatsapp
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedChatForMenu, setSelectedChatForMenu] = useState(null);
  const [newContactDialogOpen, setNewContactDialogOpen] = useState(false);

  const filteredChats = useMemo(() => {
    let filtered = [...chats];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (chat) =>
          chat.customerName?.toLowerCase().includes(query) ||
          chat.phoneNumber?.includes(query) ||
          chat.lastMessage?.text?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((chat) => chat.status === filters.status);
    }

    // Agent filter
    if (filters.agent) {
      filtered = filtered.filter((chat) => chat.assignedTo === filters.agent);
    }

    // Label filter
    if (filters.label) {
      filtered = filtered.filter((chat) => chat.labels?.includes(filters.label));
    }

    // Sort by last message time
    filtered.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || a.createdAt).getTime();
      const timeB = new Date(b.lastMessageTime || b.createdAt).getTime();
      return timeB - timeA;
    });

    return filtered;
  }, [chats, searchQuery, filters]);

  // Debug: Log chats when they change (moved after filteredChats definition)
  React.useEffect(() => {
    console.log('ChatList - Current chats in Redux:', chats);
    console.log('ChatList - Number of chats:', chats.length);
    console.log('ChatList - Current filters:', filters);
    console.log('ChatList - Filtered chats count:', filteredChats.length);
    console.log('ChatList - Filtered chats:', filteredChats);
  }, [chats, filters, filteredChats]);

  const handleChatSelect = (chat) => {
    dispatch(setSelectedChat(chat));
    if (socket && chat.id) {
      socket.emit('chat:join', { chatId: chat.id });
    }
  };

  const handleMenuOpen = (event, chat) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedChatForMenu(chat);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChatForMenu(null);
  };

  const handleAssign = async (agentId) => {
    if (selectedChatForMenu) {
      try {
        await assignChatAPI(selectedChatForMenu.id, agentId);
        dispatch(assignChat({ chatId: selectedChatForMenu.id, agentId }));
        handleMenuClose();
      } catch (error) {
        console.error('Failed to assign chat:', error);
      }
    }
  };

  const handleAutoAssign = async () => {
    if (selectedChatForMenu) {
      try {
        const res = await autoAssignChat(selectedChatForMenu.id);
        dispatch(assignChat({ chatId: selectedChatForMenu.id, agentId: res.data.agentId }));
        handleMenuClose();
      } catch (error) {
        console.error('Failed to auto-assign chat:', error);
      }
    }
  };

  const handleUnassign = async () => {
    if (selectedChatForMenu) {
      try {
        await unassignChatAPI(selectedChatForMenu.id);
        dispatch(unassignChat(selectedChatForMenu.id));
        handleMenuClose();
      } catch (error) {
        console.error('Failed to unassign chat:', error);
        alert('Failed to unassign chat. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unassigned':
        return 'error';
      case 'assigned':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getAssignedAgentName = (agentId) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent ? agent.name : 'Unknown';
  };

  const handleNewChatCreated = async (newChat) => {
    console.log('=== NEW CHAT CREATED ===');
    console.log('Raw newChat:', newChat);

    // Ensure newChat has all required fields with proper structure
    const chatToAdd = {
      id: newChat.id || newChat.phoneNumber?.replace(/[^\d]/g, '') || `chat_${Date.now()}`,
      phoneNumber: newChat.phoneNumber || newChat.id || '',
      customerName: newChat.customerName || newChat.phoneNumber || 'Unknown',
      status: newChat.status || 'unassigned',
      createdAt: newChat.createdAt || new Date().toISOString(),
      lastMessage: newChat.lastMessage || null,
      lastMessageTime: newChat.lastMessageTime || newChat.createdAt || new Date().toISOString(),
      unreadCount: newChat.unreadCount || 0,
      ...newChat, // Spread to include any additional fields from API
    };

    console.log('Chat to add (formatted):', chatToAdd);
    console.log('Current chats before add:', chats.length);

    // Add chat to Redux state immediately
    dispatch(addChat(chatToAdd));

    // Select the new chat
    dispatch(setSelectedChat(chatToAdd));

    // Try to refresh chat list from backend (but preserve the new chat)
    try {
      const res = await getAllChats(filters);
      const fetchedChats = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

      console.log('Fetched chats from backend:', fetchedChats.length, fetchedChats);

      // Create identifiers for matching
      const chatIdToMatch = chatToAdd.id;
      const phoneToMatch = chatToAdd.phoneNumber;

      // Check if backend has this chat
      const backendHasChat = fetchedChats.some(c => {
        const cId = c.id || c.phoneNumber?.replace(/[^\d]/g, '');
        const cPhone = c.phoneNumber || c.id;
        return (cId === chatIdToMatch || cId === phoneToMatch) ||
          (cPhone === phoneToMatch || cPhone === chatIdToMatch);
      });

      if (fetchedChats.length > 0) {
        // Backend returned chats - merge with new chat
        const mergedChats = [...fetchedChats];

        // If backend doesn't have the new chat, add it to the top
        if (!backendHasChat) {
          mergedChats.unshift(chatToAdd);
          console.log('New chat not in backend, adding to merged list. Total:', mergedChats.length);
        } else {
          console.log('New chat found in backend response');
        }

        dispatch(setChats(mergedChats));

        // Find and select the chat
        const createdChat = mergedChats.find(c => {
          const cId = c.id || c.phoneNumber?.replace(/[^\d]/g, '');
          const cPhone = c.phoneNumber || c.id;
          return (cId === chatIdToMatch || cId === phoneToMatch) ||
            (cPhone === phoneToMatch || cPhone === chatIdToMatch);
        });
        if (createdChat) {
          dispatch(setSelectedChat(createdChat));
        }
      } else {
        // Backend returned empty - DON'T call setChats([]), keep what's in Redux
        console.log('Backend returned empty array - NOT calling setChats, keeping locally created chat');
        console.log('Chat was added via addChat. It should be visible now.');
        // The chat is already in Redux via addChat, so it should be visible
        // DO NOT call setChats([]) as that would remove the newly added chat
      }
    } catch (error) {
      console.error('Failed to refresh chats:', error);
      // The chat is already in Redux via addChat, so it will remain
      console.log('Error occurred, but chat was already added to Redux via addChat');
    }

    console.log('=== END NEW CHAT CREATED ===');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            WhatsApp Inbox
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setNewContactDialogOpen(true)}
            sx={{ minWidth: 'auto' }}
          >
            New
          </Button>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="unassigned">Unassigned</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Agent</InputLabel>
            <Select
              value={filters.agent || ''}
              label="Agent"
              onChange={(e) => dispatch(setFilters({ agent: e.target.value || null }))}
            >
              <MenuItem value="">All Agents</MenuItem>
              {agents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Chat List */}
      <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
        {filteredChats.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {chats.length === 0
                ? 'No chats available. Chats will appear here when messages are received.'
                : 'No chats match your filters'}
            </Typography>
            {chats.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Check console for debugging information
              </Typography>
            )}
          </Box>
        ) : (
          filteredChats.map((chat) => (
            <ListItem key={chat.id} disablePadding>
              <ListItemButton
                selected={selectedChat?.id === chat.id}
                onClick={() => handleChatSelect(chat)}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={unreadCounts[chat.id] || chat.unreadCount || 0}
                    color="error"
                    overlap="circular"
                  >
                    <Avatar src={chat.customerAvatar} alt={chat.customerName}>
                      {chat.customerName?.charAt(0) || '?'}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1 }}>
                        {chat.customerName || chat.phoneNumber}
                      </Typography>
                      <Chip
                        label={chat.status}
                        size="small"
                        color={getStatusColor(chat.status)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {chat.lastMessage?.text || 'No messages'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {chat.lastMessageTime
                            ? moment(chat.lastMessageTime).fromNow()
                            : moment(chat.createdAt).fromNow()}
                        </Typography>
                        {chat.assignedTo && (
                          <Typography variant="caption" color="primary">
                            • {getAssignedAgentName(chat.assignedTo)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, chat)}
                  sx={{ ml: 1 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleAutoAssign}>Auto Assign</MenuItem>
        <MenuItem onClick={handleUnassign} disabled={!selectedChatForMenu?.assignedTo}>
          Unassign
        </MenuItem>
        <Divider />
        <MenuItem disabled>Assign to:</MenuItem>
        {agents.map((agent) => (
          <MenuItem
            key={agent.id}
            onClick={() => handleAssign(agent.id)}
            disabled={selectedChatForMenu?.assignedTo === agent.id}
          >
            {agent.name}
          </MenuItem>
        ))}
      </Menu>

      {/* New Contact Dialog */}
      <NewContactDialog
        open={newContactDialogOpen}
        onClose={() => setNewContactDialogOpen(false)}
        onChatCreated={handleNewChatCreated}
      />
    </Box>
  );
};

export default ChatList;


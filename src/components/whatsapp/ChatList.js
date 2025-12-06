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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { setSelectedChat, setFilters, assignChat, unassignChat } from '../../reduxcomponents/slices/whatsappSlice';
import { autoAssignChat, assignChat as assignChatAPI } from '../../api/whatsappAPI';
import moment from 'moment';

const ChatList = ({ socket }) => {
  const dispatch = useDispatch();
  const { chats, selectedChat, filters, agents, currentAgent, unreadCounts, labels } = useSelector(
    (state) => state.whatsapp
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedChatForMenu, setSelectedChatForMenu] = useState(null);

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
        await unassignChat(selectedChatForMenu.id);
        dispatch(unassignChat(selectedChatForMenu.id));
        handleMenuClose();
      } catch (error) {
        console.error('Failed to unassign chat:', error);
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          WhatsApp Inbox
        </Typography>

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
              No chats found
            </Typography>
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
    </Box>
  );
};

export default ChatList;


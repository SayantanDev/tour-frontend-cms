import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LabelIcon from '@mui/icons-material/Label';
import NoteIcon from '@mui/icons-material/Note';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BlockIcon from '@mui/icons-material/Block';
import { sendMessage, getChatMessages, markChatAsRead as markMessageRead } from '../../api/whatsappAPI';
import { addMessage, markChatAsRead, setMessages } from '../../reduxcomponents/slices/whatsappSlice';
import moment from 'moment';
import MessageTemplateDialog from './MessageTemplateDialog';
import LabelsDialog from './LabelsDialog';
import TeamNotesDialog from './TeamNotesDialog';
import FollowUpDialog from './FollowUpDialog';
import ChatTransferDialog from './ChatTransferDialog';
import BlockedListDialog from './BlockedListDialog';

const ChatWindow = ({ socket }) => {
  const dispatch = useDispatch();
  const { selectedChat, currentAgent, typingIndicators, templates, messages: reduxMessages } = useSelector((state) => state.whatsapp);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);

  // Get messages from Redux state for this chat - safely handle undefined
  const messages = (selectedChat?.id && reduxMessages && typeof reduxMessages === 'object')
    ? (reduxMessages[selectedChat.id] || [])
    : [];
  const messagesEndRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [labelsDialogOpen, setLabelsDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [blockedListDialogOpen, setBlockedListDialogOpen] = useState(false);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat?.id) {
      loadMessages();
      // Mark chat as read in Redux (for UI state)
      dispatch(markChatAsRead(selectedChat.id));
      if (socket) {
        socket.emit('chat:read', { chatId: selectedChat.id });
      }
    }
  }, [selectedChat?.id, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !selectedChat?.id) return;

    const handleNewMessage = ({ chatId, message }) => {
      if (chatId === selectedChat.id) {
        // Add to Redux (which will update the messages state)
        dispatch(addMessage({ chatId, message }));
      }
    };

    socket.on('message:new', handleNewMessage);
    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, selectedChat?.id, dispatch]);

  const loadMessages = async () => {
    if (!selectedChat?.id) return;
    setLoading(true);
    try {
      const res = await getChatMessages(selectedChat.id);
      // Handle different response structures
      const fetchedMessages = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

      // Update Redux with all messages for this chat
      dispatch(setMessages({ chatId: selectedChat.id, messages: fetchedMessages }));
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Clear messages on error
      dispatch(setMessages({ chatId: selectedChat.id, messages: [] }));
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat?.id) return;

    const message = {
      text: messageText,
      type: 'text',
      senderId: currentAgent?.id,
      senderType: 'agent',
      timestamp: new Date().toISOString(),
    };

    try {
      // Send message via API - API expects { text, to, ... }
      const response = await sendMessage(selectedChat.id, {
        text: messageText,
        to: selectedChat.phoneNumber || selectedChat.id,
        preview_url: false
      });

      // Create message object
      const sentMessage = {
        ...message,
        id: response.data?.messages?.[0]?.id || `temp_${Date.now()}`,
      };

      // Add to Redux (which will update the messages state)
      dispatch(addMessage({ chatId: selectedChat.id, message: sentMessage }));
      setMessageText('');

      if (socket) {
        socket.emit('message:send', { chatId: selectedChat.id, message: sentMessage });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (isTyping) => {
    if (socket && selectedChat?.id) {
      socket.emit('typing', { chatId: selectedChat.id, isTyping });
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTemplateSelect = (template) => {
    setMessageText(template.content);
    setTemplateDialogOpen(false);
    handleMenuClose();
  };

  if (!selectedChat) {
    return null;
  }

  const isTyping = typingIndicators[selectedChat.id];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={selectedChat.customerAvatar}>
            {selectedChat.customerName?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">{selectedChat.customerName || selectedChat.phoneNumber}</Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedChat.phoneNumber}
              {isTyping && ' • Typing...'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={selectedChat.status} size="small" color="primary" />
          <IconButton size="small" onClick={handleMenuOpen}>
            <AttachFileIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'grey.50',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Loading messages...
          </Typography>
        ) : messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          messages.map((message) => {
            const isAgent = message.senderType === 'agent';
            return (
              <Box
                key={message.id || message.timestamp}
                sx={{
                  display: 'flex',
                  justifyContent: isAgent ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    bgcolor: isAgent ? 'primary.main' : 'white',
                    color: isAgent ? 'white' : 'text.primary',
                    p: 1.5,
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, gap: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {moment(message.timestamp).format('HH:mm')}
                    </Typography>
                    {isAgent && (
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {message.readStatus === 'read' ? '✓✓' : message.readStatus === 'delivered' ? '✓' : ''}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            handleTyping(true);
          }}
          onKeyPress={handleKeyPress}
          onBlur={() => handleTyping(false)}
          variant="outlined"
          size="small"
        />
        <IconButton color="primary" onClick={handleSendMessage} disabled={!messageText.trim()}>
          <SendIcon />
        </IconButton>
        <IconButton onClick={handleMenuOpen}>
          <AttachFileIcon />
        </IconButton>
      </Paper>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { setTemplateDialogOpen(true); handleMenuClose(); }}>
          <NoteIcon sx={{ mr: 1 }} /> Templates
        </MenuItem>
        <MenuItem onClick={() => { setLabelsDialogOpen(true); handleMenuClose(); }}>
          <LabelIcon sx={{ mr: 1 }} /> Labels
        </MenuItem>
        <MenuItem onClick={() => { setNotesDialogOpen(true); handleMenuClose(); }}>
          <NoteIcon sx={{ mr: 1 }} /> Team Notes
        </MenuItem>
        <MenuItem onClick={() => { setFollowUpDialogOpen(true); handleMenuClose(); }}>
          <ScheduleIcon sx={{ mr: 1 }} /> Schedule Follow-up
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setTransferDialogOpen(true); handleMenuClose(); }}>
          <SwapHorizIcon sx={{ mr: 1 }} /> Transfer Chat
        </MenuItem>
        <MenuItem onClick={() => { setBlockedListDialogOpen(true); handleMenuClose(); }}>
          <BlockIcon sx={{ mr: 1 }} /> Blocked List
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <MessageTemplateDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSelect={handleTemplateSelect}
      />
      <LabelsDialog
        open={labelsDialogOpen}
        onClose={() => setLabelsDialogOpen(false)}
        chatId={selectedChat?.id}
      />
      <TeamNotesDialog
        open={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        chatId={selectedChat?.id}
      />
      <FollowUpDialog
        open={followUpDialogOpen}
        onClose={() => setFollowUpDialogOpen(false)}
        chatId={selectedChat?.id}
      />
      <ChatTransferDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        chatId={selectedChat?.id}
      />
      <BlockedListDialog
        open={blockedListDialogOpen}
        onClose={() => setBlockedListDialogOpen(false)}
      />
    </Box>
  );
};

export default ChatWindow;


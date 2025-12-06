import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Paper, Typography, IconButton, Tooltip, Button } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import WhatsAppConfigDialog from '../../components/whatsapp/WhatsAppConfigDialog';
import ChatList from '../../components/whatsapp/ChatList';
import ChatWindow from '../../components/whatsapp/ChatWindow';
import CustomerInfoPanel from '../../components/whatsapp/CustomerInfoPanel';
import AdminMonitoringPanel from '../../components/whatsapp/AdminMonitoringPanel';
import { getAllChats, getAllAgents, getOnlineAgents } from '../../api/whatsappAPI';
import {
  setChats,
  setAgents,
  setOnlineAgents,
  setCurrentAgent,
  updateChat,
  addMessage,
  setTypingIndicator,
  updateAgentStatus,
  setReadReceipt,
} from '../../reduxcomponents/slices/whatsappSlice';
import io from 'socket.io-client';

const WhatsappInbox = () => {
  const dispatch = useDispatch();
  const { selectedChat, currentAgent, filters } = useSelector((state) => state.whatsapp);
  const { loggedinUser } = useSelector((state) => state.loggedinUser);
  const [socket, setSocket] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      // Join agent room
      if (currentAgent?.id) {
        newSocket.emit('agent:join', { agentId: currentAgent.id });
      }
    });

    newSocket.on('chat:new', (chat) => {
      // Reload chats when a new one arrives
      getAllChats(filters).then((res) => {
        dispatch(setChats(res.data || []));
      }).catch(err => console.error('Failed to reload chats:', err));
    });

    newSocket.on('chat:update', (chat) => {
      dispatch(updateChat(chat));
    });

    newSocket.on('message:new', ({ chatId, message }) => {
      dispatch(addMessage({ chatId, message }));
    });

    newSocket.on('typing:start', ({ chatId }) => {
      dispatch(setTypingIndicator({ chatId, isTyping: true }));
    });

    newSocket.on('typing:stop', ({ chatId }) => {
      dispatch(setTypingIndicator({ chatId, isTyping: false }));
    });

    newSocket.on('agent:status', ({ agentId, status }) => {
      dispatch(updateAgentStatus({ agentId, status }));
    });

    newSocket.on('read:receipt', ({ chatId, messageId, status }) => {
      dispatch(setReadReceipt({ chatId, messageId, status }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [dispatch, currentAgent]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatsRes, agentsRes, onlineRes] = await Promise.all([
          getAllChats(filters),
          getAllAgents(),
          getOnlineAgents(),
        ]);

        dispatch(setChats(chatsRes.data || []));
        dispatch(setAgents(agentsRes.data || []));
        dispatch(setOnlineAgents(onlineRes.data || []));

        // Set current agent from logged in user
        if (loggedinUser && agentsRes.data) {
          const agent = agentsRes.data.find(a => a.userId === loggedinUser._id);
          if (agent) {
            dispatch(setCurrentAgent(agent));
          }
        }
      } catch (error) {
        console.error('Failed to fetch WhatsApp data:', error);
      }
    };

    fetchData();
  }, [dispatch, filters, loggedinUser]);

  // Check if user is admin
  const isAdmin = loggedinUser?.role === 'admin' || loggedinUser?.permissions?.includes('whatsapp:admin');

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Chat List Sidebar */}
        <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Configure WhatsApp API">
              <IconButton size="small" onClick={() => setConfigDialogOpen(true)}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <ChatList socket={socket} />
        </Box>

        {/* Main Chat Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedChat ? (
            <ChatWindow socket={socket} />
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Select a chat to start conversation
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Panel - Customer Info or Admin Panel */}
        {rightPanelOpen && (
          <Box sx={{ width: 350, borderLeft: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            {/* Panel Toggle */}
            {isAdmin && (
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Tooltip title="Customer Info">
                  <IconButton
                    size="small"
                    color={!showAdminPanel ? 'primary' : 'default'}
                    onClick={() => setShowAdminPanel(false)}
                  >
                    <PersonIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Admin Panel">
                  <IconButton
                    size="small"
                    color={showAdminPanel ? 'primary' : 'default'}
                    onClick={() => setShowAdminPanel(true)}
                  >
                    <AdminPanelSettingsIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {showAdminPanel && isAdmin ? (
              <AdminMonitoringPanel />
            ) : selectedChat ? (
              <CustomerInfoPanel chatId={selectedChat?.id} />
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {isAdmin ? 'Select a chat or switch to Admin Panel' : 'Select a chat to view customer info'}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Configuration Dialog */}
      <WhatsAppConfigDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
      />
    </Box>
  );
};

export default WhatsappInbox;


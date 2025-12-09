import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { transferChat } from '../../api/whatsappAPI';
import { transferChat as transferChatRedux } from '../../reduxcomponents/slices/whatsappSlice';

const ChatTransferDialog = ({ open, onClose, chatId }) => {
  const dispatch = useDispatch();
  const { agents, currentAgent } = useSelector((state) => state.whatsapp);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [transferNote, setTransferNote] = useState('');
  const [loading, setLoading] = useState(false);

  const availableAgents = agents.filter((agent) => agent.id !== currentAgent?.id && agent.status === 'online');

  const handleTransfer = async () => {
    if (!chatId || !selectedAgent) return;
    setLoading(true);
    try {
      await transferChat(chatId, selectedAgent.id);
      dispatch(
        transferChatRedux({
          chatId,
          fromAgentId: currentAgent?.id,
          toAgentId: selectedAgent.id,
        })
      );
      onClose();
      setSelectedAgent(null);
      setTransferNote('');
    } catch (error) {
      console.error('Failed to transfer chat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Transfer Chat</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Select an agent to transfer this chat to:
          </Typography>

          <List>
            {availableAgents.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No available agents online
              </Typography>
            ) : (
              availableAgents.map((agent) => (
                <ListItem key={agent.id} disablePadding>
                  <ListItemButton
                    selected={selectedAgent?.id === agent.id}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <ListItemAvatar>
                      <Avatar src={agent.avatar}>{agent.name?.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={agent.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip label={agent.status} size="small" color="success" />
                          <Typography variant="caption" color="text.secondary">
                            {agent.activeChats || 0} active chats
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>

          <TextField
            label="Transfer Note (Optional)"
            multiline
            rows={3}
            value={transferNote}
            onChange={(e) => setTransferNote(e.target.value)}
            fullWidth
            placeholder="Add a note about why you're transferring this chat..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleTransfer}
          disabled={!selectedAgent || loading}
        >
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatTransferDialog;


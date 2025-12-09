import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  getAllLabels,
  createLabel,
  addLabelToChat,
  removeLabelFromChat,
  getChatById,
} from '../../api/whatsappAPI';
import {
  setLabels,
  addLabelToChat as addLabelToChatRedux,
  removeLabelFromChat as removeLabelFromChatRedux,
} from '../../reduxcomponents/slices/whatsappSlice';

const LabelsDialog = ({ open, onClose, chatId }) => {
  const dispatch = useDispatch();
  const { labels, selectedChat } = useSelector((state) => state.whatsapp);
  const [chatLabels, setChatLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#1976d2');

  useEffect(() => {
    if (open) {
      loadLabels();
      if (chatId) {
        loadChatLabels();
      }
    }
  }, [open, chatId]);

  const loadLabels = async () => {
    try {
      const res = await getAllLabels();
      dispatch(setLabels(res.data || []));
    } catch (error) {
      console.error('Failed to load labels:', error);
    }
  };

  const loadChatLabels = () => {
    if (selectedChat?.labels) {
      const chatLabelIds = selectedChat.labels;
      const chatLabelsData = labels.filter((label) => chatLabelIds.includes(label.id));
      setChatLabels(chatLabelsData);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;

    try {
      const res = await createLabel({
        name: newLabelName,
        color: newLabelColor,
      });
      dispatch(setLabels([...labels, res.data]));
      setNewLabelName('');
    } catch (error) {
      console.error('Failed to create label:', error);
    }
  };

  const handleAddLabel = async (labelId) => {
    if (!chatId) return;
    try {
      await addLabelToChat(chatId, labelId);
      dispatch(addLabelToChatRedux({ chatId, labelId }));
      const label = labels.find((l) => l.id === labelId);
      if (label) {
        setChatLabels([...chatLabels, label]);
      }
    } catch (error) {
      console.error('Failed to add label:', error);
    }
  };

  const handleRemoveLabel = async (labelId) => {
    if (!chatId) return;
    try {
      await removeLabelFromChat(chatId, labelId);
      dispatch(removeLabelFromChatRedux({ chatId, labelId }));
      setChatLabels(chatLabels.filter((l) => l.id !== labelId));
    } catch (error) {
      console.error('Failed to remove label:', error);
    }
  };

  const availableLabels = labels.filter((label) => !chatLabels.find((cl) => cl.id === label.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Manage Labels</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Create New Label */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Create New Label
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                type="color"
                size="small"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                sx={{ width: 80 }}
              />
              <Button variant="contained" onClick={handleCreateLabel} startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>
          </Box>

          {/* Chat Labels */}
          {chatId && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Current Labels
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {chatLabels.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No labels assigned
                  </Typography>
                ) : (
                  chatLabels.map((label) => (
                    <Chip
                      key={label.id}
                      label={label.name}
                      onDelete={() => handleRemoveLabel(label.id)}
                      sx={{ bgcolor: label.color, color: 'white' }}
                    />
                  ))
                )}
              </Box>
            </Box>
          )}

          {/* Available Labels */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Available Labels
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {availableLabels.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No available labels
                </Typography>
              ) : (
                availableLabels.map((label) => (
                  <Chip
                    key={label.id}
                    label={label.name}
                    onClick={() => handleAddLabel(label.id)}
                    sx={{ bgcolor: label.color, color: 'white', cursor: 'pointer' }}
                  />
                ))
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabelsDialog;


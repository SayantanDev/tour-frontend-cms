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
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { getTeamNote, saveTeamNote, updateTeamNote } from '../../api/whatsappAPI';
import { setTeamNote } from '../../reduxcomponents/slices/whatsappSlice';
import moment from 'moment';

const TeamNotesDialog = ({ open, onClose, chatId }) => {
  const dispatch = useDispatch();
  const { teamNotes, currentAgent } = useSelector((state) => state.whatsapp);
  const [note, setNote] = useState('');
  const [noteHistory, setNoteHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && chatId) {
      loadNote();
    }
  }, [open, chatId]);

  const loadNote = async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const res = await getTeamNote(chatId);
      if (res.data) {
        setNote(res.data.note || '');
        setNoteHistory(res.data.history || []);
      }
    } catch (error) {
      console.error('Failed to load team note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const noteData = {
        note,
        updatedBy: currentAgent?.id,
        updatedAt: new Date().toISOString(),
      };

      const existingNote = teamNotes[chatId];
      if (existingNote) {
        await updateTeamNote(chatId, noteData);
      } else {
        await saveTeamNote(chatId, noteData);
      }

      dispatch(setTeamNote({ chatId, note: noteData }));
      onClose();
    } catch (error) {
      console.error('Failed to save team note:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Team Notes</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Add or edit team note"
            multiline
            rows={6}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            placeholder="Add notes about this conversation that your team can see..."
          />

          {noteHistory.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Note History
              </Typography>
              <List dense>
                {noteHistory.map((historyItem, index) => (
                  <ListItem key={index}>
                    <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                      {historyItem.updatedBy?.name?.charAt(0) || '?'}
                    </Avatar>
                    <ListItemText
                      primary={historyItem.note}
                      secondary={`${historyItem.updatedBy?.name || 'Unknown'} • ${moment(historyItem.updatedAt).format('MMM DD, YYYY HH:mm')}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading} startIcon={<SaveIcon />}>
          Save Note
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamNotesDialog;


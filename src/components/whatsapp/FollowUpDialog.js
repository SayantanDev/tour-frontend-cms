import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { createFollowUp } from '../../api/whatsappAPI';
import { addFollowUp } from '../../reduxcomponents/slices/whatsappSlice';
import moment from 'moment';

const FollowUpDialog = ({ open, onClose, chatId }) => {
  const dispatch = useDispatch();
  const [scheduledDate, setScheduledDate] = useState(moment().add(1, 'day').format('YYYY-MM-DD'));
  const [scheduledTime, setScheduledTime] = useState(moment().add(1, 'hour').format('HH:mm'));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!chatId || !scheduledDate) return;
    setLoading(true);
    try {
      const dateTime = moment(`${scheduledDate} ${scheduledTime}`).toISOString();
      const followUp = {
        chatId,
        scheduledDate: dateTime,
        notes,
        status: 'pending',
      };

      const res = await createFollowUp(followUp);
      dispatch(addFollowUp(res.data));
      onClose();
      setNotes('');
      setScheduledDate(moment().add(1, 'day').format('YYYY-MM-DD'));
      setScheduledTime(moment().add(1, 'hour').format('HH:mm'));
    } catch (error) {
      console.error('Failed to create follow-up:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Schedule Follow-up</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Schedule Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Schedule Time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <TextField
            label="Notes"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            placeholder="Add any notes about this follow-up..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading} startIcon={<SaveIcon />}>
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowUpDialog;


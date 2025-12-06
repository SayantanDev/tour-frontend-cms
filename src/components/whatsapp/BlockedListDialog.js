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
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UnblockIcon from '@mui/icons-material/Block';
import { getBlockedNumbers, blockNumber, unblockNumber } from '../../api/whatsappAPI';
import { setBlockedNumbers, blockNumber as blockNumberRedux, unblockNumber as unblockNumberRedux } from '../../reduxcomponents/slices/whatsappSlice';
import moment from 'moment';

const BlockedListDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { blockedNumbers } = useSelector((state) => state.whatsapp);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadBlockedNumbers();
    }
  }, [open]);

  const loadBlockedNumbers = async () => {
    try {
      const res = await getBlockedNumbers();
      dispatch(setBlockedNumbers(res.data || []));
    } catch (error) {
      console.error('Failed to load blocked numbers:', error);
    }
  };

  const handleBlockNumber = async () => {
    if (!newPhoneNumber.trim()) return;
    setLoading(true);
    try {
      const blocked = {
        phoneNumber: newPhoneNumber,
        reason: blockReason,
        blockedAt: new Date().toISOString(),
        blockedBy: 'current-user', // Replace with actual user ID
      };
      const res = await blockNumber(newPhoneNumber, blockReason);
      dispatch(blockNumberRedux(res.data));
      setNewPhoneNumber('');
      setBlockReason('');
    } catch (error) {
      console.error('Failed to block number:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockNumber = async (phoneNumber) => {
    try {
      await unblockNumber(phoneNumber);
      dispatch(unblockNumberRedux(phoneNumber));
    } catch (error) {
      console.error('Failed to unblock number:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Blocked Numbers</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Block New Number */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Block New Number
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                size="small"
                label="Phone Number"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                fullWidth
              />
              <TextField
                size="small"
                label="Reason (Optional)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Reason for blocking..."
                fullWidth
              />
              <Button
                variant="contained"
                color="error"
                onClick={handleBlockNumber}
                disabled={!newPhoneNumber.trim() || loading}
                sx={{ alignSelf: 'flex-start' }}
              >
                Block Number
              </Button>
            </Box>
          </Box>

          {/* Blocked Numbers List */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Blocked Numbers ({blockedNumbers.length})
            </Typography>
            {blockedNumbers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No blocked numbers
              </Typography>
            ) : (
              <List dense>
                {blockedNumbers.map((blocked, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={blocked.phoneNumber}
                      secondary={
                        <Box>
                          {blocked.reason && (
                            <Typography variant="caption" display="block">
                              Reason: {blocked.reason}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Blocked {moment(blocked.blockedAt).fromNow()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleUnblockNumber(blocked.phoneNumber)}
                        color="primary"
                      >
                        <UnblockIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockedListDialog;


import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { getCustomerInfo, updateCustomerInfo } from '../../api/whatsappAPI';
import moment from 'moment';

const CustomerInfoPanel = ({ chatId }) => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state) => state.whatsapp);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedChat?.phoneNumber) {
      loadCustomerInfo();
    }
  }, [selectedChat?.phoneNumber]);

  const loadCustomerInfo = async () => {
    if (!selectedChat?.phoneNumber) return;
    setLoading(true);
    try {
      const res = await getCustomerInfo(selectedChat.phoneNumber);
      setCustomerInfo(res.data);
      setEditedInfo(res.data || {});
    } catch (error) {
      console.error('Failed to load customer info:', error);
      // Initialize with chat data if API fails
      setCustomerInfo({
        phoneNumber: selectedChat.phoneNumber,
        name: selectedChat.customerName,
        email: '',
        address: '',
        notes: '',
        tags: [],
        totalOrders: 0,
        totalSpent: 0,
        lastContact: selectedChat.lastMessageTime,
      });
      setEditedInfo({
        phoneNumber: selectedChat.phoneNumber,
        name: selectedChat.customerName,
        email: '',
        address: '',
        notes: '',
        tags: [],
        totalOrders: 0,
        totalSpent: 0,
        lastContact: selectedChat.lastMessageTime,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo({ ...customerInfo });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({ ...customerInfo });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateCustomerInfo(selectedChat.phoneNumber, editedInfo);
      setCustomerInfo(res.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update customer info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedInfo((prev) => ({ ...prev, [field]: value }));
  };

  if (!selectedChat) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Select a chat to view customer info
        </Typography>
      </Box>
    );
  }

  const info = isEditing ? editedInfo : customerInfo;

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Paper elevation={0} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Customer Information</Typography>
          {!isEditing ? (
            <IconButton size="small" onClick={handleEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          ) : (
            <Box>
              <IconButton size="small" onClick={handleSave} disabled={loading}>
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancel}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {loading && !customerInfo ? (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar src={selectedChat.customerAvatar} sx={{ width: 64, height: 64 }}>
                {selectedChat.customerName?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedChat.customerName || 'Unknown'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedChat.phoneNumber}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={info?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                disabled={!isEditing}
                size="small"
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={info?.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                disabled={!isEditing}
                size="small"
                fullWidth
              />
              <TextField
                label="Address"
                multiline
                rows={2}
                value={info?.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                disabled={!isEditing}
                size="small"
                fullWidth
              />
              <TextField
                label="Notes"
                multiline
                rows={3}
                value={info?.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                disabled={!isEditing}
                size="small"
                fullWidth
              />

              {info?.tags && info.tags.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {info.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider />

              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Total Orders"
                    secondary={info?.totalOrders || 0}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Spent"
                    secondary={`$${info?.totalSpent?.toFixed(2) || '0.00'}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Contact"
                    secondary={
                      info?.lastContact
                        ? moment(info.lastContact).format('MMM DD, YYYY HH:mm')
                        : 'Never'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Chat Started"
                    secondary={
                      selectedChat.createdAt
                        ? moment(selectedChat.createdAt).format('MMM DD, YYYY')
                        : 'Unknown'
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CustomerInfoPanel;


import { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../api/whatsappAPI';
import { setTemplates, addTemplate, updateTemplate as updateTemplateRedux, deleteTemplate as deleteTemplateRedux } from '../../reduxcomponents/slices/whatsappSlice';

const MessageTemplateDialog = ({ open, onClose, onSelect }) => {
  const dispatch = useDispatch();
  const { templates } = useSelector((state) => state.whatsapp);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      const res = await getAllTemplates();
      dispatch(setTemplates(res.data || []));
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
    setShowAddForm(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateContent(template.content);
    setShowAddForm(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) return;

    try {
      if (editingTemplate) {
        const res = await updateTemplate(editingTemplate.id, {
          name: templateName,
          content: templateContent,
        });
        dispatch(updateTemplateRedux(res.data));
      } else {
        const res = await createTemplate({
          name: templateName,
          content: templateContent,
        });
        dispatch(addTemplate(res.data));
      }
      setShowAddForm(false);
      setEditingTemplate(null);
      setTemplateName('');
      setTemplateContent('');
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteTemplate(templateId);
      dispatch(deleteTemplateRedux(templateId));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleSelectTemplate = (template) => {
    if (onSelect) {
      onSelect(template);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Message Templates</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {showAddForm ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Template Content"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              multiline
              rows={6}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={handleSaveTemplate}>
                Save
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTemplate(null);
                  setTemplateName('');
                  setTemplateContent('');
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button startIcon={<AddIcon />} onClick={handleAddTemplate} variant="outlined" size="small">
                Add Template
              </Button>
            </Box>
            <List>
              {templates.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No templates found. Create one to get started.
                </Typography>
              ) : (
                templates.map((template) => (
                  <Fragment key={template.id}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton size="small" onClick={() => handleEditTemplate(template)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteTemplate(template.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemButton onClick={() => handleSelectTemplate(template)}>
                        <ListItemText
                          primary={template.name}
                          secondary={template.content}
                          secondaryTypographyProps={{ noWrap: true }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                  </Fragment>
                ))
              )}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageTemplateDialog;


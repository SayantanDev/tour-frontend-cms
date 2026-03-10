import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Snackbar,
    Alert,
    Paper,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getContactedSayantan, deleteContactedSayantan } from '../../api/sayantanAPI';

const Sayantan = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await getContactedSayantan();
            // Adjust based on conventional generic responses, assuming res.data or res.data.data or res.data.items
            let fetchedContacts = [];
            if (res.data && Array.isArray(res.data)) {
                fetchedContacts = res.data;
            } else if (res.data && Array.isArray(res.data.data)) {
                fetchedContacts = res.data.data;
            } else if (res.data && Array.isArray(res.data.items)) {
                fetchedContacts = res.data.items;
            } else if (Array.isArray(res)) {
                fetchedContacts = res;
            } else if (res.items && Array.isArray(res.items)) {
                fetchedContacts = res.items;
            }
            setContacts(fetchedContacts);
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to fetch contacts', severity: 'error' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Query?')) return;
        try {
            await deleteContactedSayantan(id);
            setSnackbar({ open: true, message: 'Query deleted successfully', severity: 'success' });
            fetchContacts();
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to delete Query', severity: 'error' });
            console.error(error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Contacted Sayantan
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Name</b></TableCell>
                                <TableCell><b>Email</b></TableCell>
                                <TableCell><b>Message</b></TableCell>
                                <TableCell align="right"><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {contacts.length > 0 ? (
                                contacts.map((contact) => (
                                    <TableRow key={contact._id || contact.id || Math.random()}>
                                        <TableCell>{contact.name || contact.fullName || 'N/A'}</TableCell>
                                        <TableCell>{contact.email || 'N/A'}</TableCell>
                                        <TableCell>{contact.message || contact.msg || 'N/A'}</TableCell>
                                        <TableCell align="right">
                                            <IconButton color="error" onClick={() => handleDelete(contact._id || contact.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No contacts found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Sayantan;

import React, { useEffect,useState } from 'react';
import io from "socket.io-client"
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';

// Sample data
const tours = [
    {
        title: 'Beach Paradise',
        description: 'Enjoy a relaxing day at the beach.',
        imageUrl: 'https://via.placeholder.com/150',
        price: '$100',
    },
    {
        title: 'Mountain Adventure',
        description: 'Explore the beautiful mountains.',
        imageUrl: 'https://via.placeholder.com/150',
        price: '$150',
    },
    {
        title: 'City Tour',
        description: 'Discover the city’s hidden gems.',
        imageUrl: 'https://via.placeholder.com/150',
        price: '$80',
    },
];

const users = [
    { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210' },
];

const transactions = [
    { id: 'T001', user: 'John Doe', amount: '$100', date: '2023-10-01' },
    { id: 'T002', user: 'Jane Smith', amount: '$150', date: '2023-10-02' },
];

const payments = [
    { id: 'P001', transactionId: 'T001', status: 'Completed' },
    { id: 'P002', transactionId: 'T002', status: 'Pending' },
];

const Dashboard = () => {
    const socketUrl ="http://localhost:8000"
    const [inquiries, setInquiries] = useState([]);
    console.log("inquiries", inquiries);
    
    // const [chat, setChat] = useState([]);
    useEffect(() => {
        const socket = io(socketUrl);

        socket.on('connect', () => {
            console.log("Connected to socket server");
        });
        // socket.emit("chatMessage", "hii");
        // socket.on("chatMessage", (msg) => {
        //     setChat((prev) => [...prev, msg]);
        //   });

        socket.on('inquiry', (inquiry) => {
            console.log("Received inquiry:", inquiry);
            setInquiries((prev) => [inquiry, ...prev]);
        });

        return () => {
            socket.off("chatMessage");
            socket.disconnect();
        };
    }, []);

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">Tour Operation Dashboard</Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ padding: 2 }}>
                <Grid container spacing={2}>
                    {/* Tour Cards */}
                    <Grid item xs={12}>
                        <Typography variant="h4" gutterBottom>
                            Available Tours
                        </Typography>
                    </Grid>
                    {tours.map((tour, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={tour.imageUrl}
                                    alt={tour.title}
                                />
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {tour.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {tour.description}
                                    </Typography>
                                    <Typography variant="h6">{tour.price}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {/* User Data Section */}
                    <Grid item xs={12}>
                        <Typography variant="h4" gutterBottom>
                            User Data
                        </Typography>
                        <List>
                            {users.map((user, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={user.name}
                                        secondary={`${user.email} | ${user.phone}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>

                    <Divider sx={{ width: '100%', margin: '20px 0' }} />

                    {/* Transaction Data Section */}
                    <Grid item xs={12}>
                        <Typography variant="h4" gutterBottom>
                            Transaction Data
                        </Typography>
                        <List>
                            {transactions.map((transaction, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`Transaction ID: ${transaction.id}`}
                                        secondary={`:User  ${transaction.user} | Amount: ${transaction.amount} | Date: ${transaction.date}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>

                    <Divider sx={{ width: '100%', margin: '20px 0' }} />

                    {/* Payment Data Section */}
 <Grid item xs={12}>
                        <Typography variant="h4" gutterBottom>
                            Payment Data
                        </Typography>
                        <List>
                            {payments.map((payment, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`Payment ID: ${payment.id}`}
                                        secondary={`Transaction ID: ${payment.transactionId} | Status: ${payment.status}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Dashboard;
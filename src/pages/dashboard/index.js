import React, { useEffect,useState } from 'react';
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
import TotalInquiry from '../../components/dashbord/totalInquiry';

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
    

    return (
        <>
            <TotalInquiry/>
        </>
    );
};

export default Dashboard;
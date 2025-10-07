import React, { useEffect, useState } from 'react';

import { Box, Button, Container, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DataTable from '../../components/dataTable';
import AddUserDialog from '../users/AddUserDialog';
import DeleteUserDialog from '../users/DeleteUserDialog';
import { getAllPermission } from '../../api/permissionsAPI';

const AllPermissions = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [allPermissions, setAllPermissions] = useState([]);

    useEffect(() => {
      
    }, []);


  return (
    <Container maxWidth="lg" sx={{ pt: 1, pb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'center'}
        gap={2}
        mb={3}
      >
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color="text.primary">
          Manage Permission
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}

export default AllPermissions;
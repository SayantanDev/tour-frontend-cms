import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import usePermissions from '../../hooks/UsePermissions';

import TotalQuiry from '../../components/dashbord/totalQuiry';
import TotalInquiry from '../../components/dashbord/totalInquiry';
import TotalPackage from '../../components/dashbord/totalPackage';
import TotalPlace from '../../components/dashbord/totalPlace';
import AdminDashboard from '../../components/dashbord/AdminDashboard';

const Dashboard = () => {
  const user = useSelector(state => state.tokens?.user);
  const role = user?.permission;
  const getPermission = usePermissions();

  // Admin gets the full graphical analytics view
  if (role === 'Admin') {
    return (
      <Box
        className="fade-in"
        sx={{ minHeight: 'calc(100vh - 100px)', px: { xs: 2, md: 3 }, py: 3 }}
      >
        <AdminDashboard />
      </Box>
    );
  }

  // For all other roles, show sections based on their permissions
  const canViewQueries = getPermission('queries', 'view');
  const canViewInquiry = getPermission('inquiry', 'view');
  const canViewPackages = getPermission('packages', 'view');
  const canViewPlaces = getPermission('places', 'view');

  const hasAnything = canViewQueries || canViewInquiry || canViewPackages || canViewPlaces;

  return (
    <Box
      className="fade-in"
      sx={{ minHeight: 'calc(100vh - 100px)', px: { xs: 2, md: 3 }, py: 3 }}
    >
      {/* Personalised greeting */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Here's a quick overview of your workspace.
        </Typography>
      </Box>

      {!hasAnything && (
        <Typography color="text.secondary">
          No dashboard sections are available for your role.
        </Typography>
      )}

      {canViewQueries && (
        <Box sx={{ mb: 4 }}>
          <TotalQuiry />
        </Box>
      )}

      {canViewInquiry && (
        <Box sx={{ mb: 4 }}>
          <TotalInquiry />
        </Box>
      )}

      {canViewPackages && (
        <Box sx={{ mb: 4 }}>
          <TotalPackage />
        </Box>
      )}

      {canViewPlaces && (
        <Box sx={{ mb: 4 }}>
          <TotalPlace />
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { getAdminStats, getAgentPerformance, getOnlineAgents } from '../../api/whatsappAPI';
import { setAdminStats, setOnlineAgents } from '../../reduxcomponents/slices/whatsappSlice';
import moment from 'moment';

const AdminMonitoringPanel = () => {
  const dispatch = useDispatch();
  const { adminStats, onlineAgents, agents } = useSelector((state) => state.whatsapp);
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [dateRange]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, performanceRes, onlineRes] = await Promise.all([
        getAdminStats({ dateRange }),
        getAgentPerformance(null, { dateRange }),
        getOnlineAgents(),
      ]);

      dispatch(setAdminStats(statsRes.data));
      dispatch(setOnlineAgents(onlineRes.data || []));
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'away':
        return 'warning';
      case 'busy':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <Paper elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Admin Monitoring</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select value={dateRange} label="Date Range" onChange={(e) => setDateRange(e.target.value)}>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : (
          <>
            {/* Statistics Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4">{adminStats?.totalChats || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Chats
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4">{adminStats?.activeChats || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Chats
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h4">
                      {adminStats?.avgResponseTime
                        ? `${adminStats.avgResponseTime.toFixed(1)} min`
                        : '0 min'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Online Agents */}
            <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Online Agents ({onlineAgents.length})
              </Typography>
              <List dense>
                {onlineAgents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No agents online
                  </Typography>
                ) : (
                  onlineAgents.map((agent) => (
                    <ListItem key={agent.id}>
                      <ListItemAvatar>
                        <Avatar src={agent.avatar}>{agent.name?.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={agent.name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={agent.status}
                              size="small"
                              color={getStatusColor(agent.status)}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {agent.activeChats || 0} active chats
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>

            {/* Agent Performance */}
            {adminStats?.agentPerformance && adminStats.agentPerformance.length > 0 && (
              <Paper elevation={0} sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Agent Performance
                </Typography>
                <List dense>
                  {adminStats.agentPerformance.map((perf) => {
                    const agent = agents.find((a) => a.id === perf.agentId);
                    return (
                      <ListItem key={perf.agentId}>
                        <ListItemText
                          primary={agent?.name || 'Unknown Agent'}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Chats Handled: {perf.chatsHandled || 0}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Avg Response: {perf.avgResponseTime?.toFixed(1) || 0} min
                              </Typography>
                              <Typography variant="caption" display="block">
                                Satisfaction: {perf.satisfactionRating || 0}/5
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AdminMonitoringPanel;


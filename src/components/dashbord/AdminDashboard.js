import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Avatar, Divider, IconButton, Tooltip,
} from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  BarChart, Bar,
} from 'recharts';
import moment from 'moment';

import { getAllQueries } from '../../api/queriesAPI';
import { getAllInquiries } from '../../api/inquiryAPI';
import { getAllPackages } from '../../api/packageAPI';
import { getAllUsers } from '../../api/userAPI';
import { getAllplaces } from '../../api/placeApi';

// ─── Icons ───────────────────────────────────────────────────────────────────
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// ─── Color palette ────────────────────────────────────────────────────────────
const STAGE_COLORS = {
  New: '#4facfe',
  Confirm: '#11998e',
  Postponed: '#fa709a',
  Cancel: '#f5576c',
  Other: '#a29bfe',
};

const CHART_PALETTE = ['#667eea', '#11998e', '#fa709a', '#f6d365', '#a29bfe', '#fd79a8'];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon, gradient, loading, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      borderRadius: 3,
      background: gradient,
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      '&:hover': onClick ? { transform: 'translateY(-6px)', boxShadow: '0 14px 40px rgba(0,0,0,0.18)' } : {},
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* decorative circle */}
    <Box sx={{
      position: 'absolute', top: -20, right: -20,
      width: 100, height: 100, borderRadius: '50%',
      background: 'rgba(255,255,255,0.08)',
    }} />
    <CardContent sx={{ p: 3 }}>
      {loading ? (
        <>
          <Skeleton variant="circular" width={44} height={44} sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
          <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
          <Skeleton variant="text" width="40%" height={50} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          }}>
            {React.cloneElement(icon, { sx: { color: '#fff', fontSize: 24 } })}
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, mt: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1 }}>
            {value ?? '—'}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, icon, children, action }) => (
  <Box sx={{ mb: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>{title}</Typography>
      </Box>
      {action}
    </Box>
    {children}
  </Box>
);

// ─── Chart Card wrapper ───────────────────────────────────────────────────────
const ChartCard = ({ children, height = 280 }) => (
  <Card sx={{
    borderRadius: 3,
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    p: 2,
    height: '100%',
    minHeight: height,
  }}>
    <CardContent sx={{ p: 1, height: '100%' }}>
      {children}
    </CardContent>
  </Card>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function groupByWeek(items, dateField = 'created_at') {
  const map = {};
  items.forEach(item => {
    const wk = moment(item[dateField]).format('MMM DD');
    map[wk] = (map[wk] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => moment(a[0], 'MMM DD') - moment(b[0], 'MMM DD'))
    .slice(-10)
    .map(([week, count]) => ({ week, count }));
}

function groupByField(items, field) {
  const map = {};
  items.forEach(item => {
    const key = item[field] || 'Unknown';
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

const stageColor = (stage) => STAGE_COLORS[stage] || STAGE_COLORS.Other;

const stageChip = (stage) => {
  const colorMap = { New: 'info', Confirm: 'success', Postponed: 'warning', Cancel: 'error' };
  return <Chip label={stage} size="small" color={colorMap[stage] || 'default'} sx={{ fontWeight: 600 }} />;
};

// ─── Main component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.tokens?.user);

  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [places, setPlaces] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [qRes, iRes, pkgRes, uRes, plRes] = await Promise.allSettled([
      getAllQueries(1, 500),
      getAllInquiries(1, 500),
      getAllPackages(),
      getAllUsers(),
      getAllplaces(),
    ]);

    if (qRes.status === 'fulfilled') {
      const data = qRes.value?.items || qRes.value?.data || [];
      setQueries(Array.isArray(data) ? data : []);
    }
    if (iRes.status === 'fulfilled') {
      const data = iRes.value?.data || iRes.value || [];
      setInquiries(Array.isArray(data) ? data : []);
    }
    if (pkgRes.status === 'fulfilled') {
      const data = pkgRes.value?.data || pkgRes.value || [];
      setPackages(Array.isArray(data) ? data : []);
    }
    if (uRes.status === 'fulfilled') {
      const data = uRes.value?.data || uRes.value || [];
      setUsers(Array.isArray(data) ? data : []);
    }
    if (plRes.status === 'fulfilled') {
      const data = plRes.value || [];
      setPlaces(Array.isArray(data) ? data : []);
    }

    setTimeout(() => setLoading(false), 600);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived data
  const confirmed = queries.filter(q => q.lead_stage === 'Confirm').length;
  const newQ = queries.filter(q => q.lead_stage === 'New').length;
  const postponed = queries.filter(q => q.lead_stage === 'Postponed').length;
  const cancelled = queries.filter(q => q.lead_stage === 'Cancel').length;

  const queryStageData = [
    { name: 'New', value: newQ },
    { name: 'Confirmed', value: confirmed },
    { name: 'Postponed', value: postponed },
    { name: 'Cancelled', value: cancelled },
  ].filter(d => d.value > 0);

  const queryTrendData = groupByWeek(queries);
  const inquiryTrendData = groupByWeek(inquiries);
  const packagesByLocation = groupByField(packages, 'location').slice(0, 8);
  const recentQueries = [...queries]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  const conversionRate = queries.length > 0
    ? ((confirmed / queries.length) * 100).toFixed(1)
    : '0.0';

  return (
    <Box sx={{ pb: 4 }}>
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{
        mb: 4, p: 3, borderRadius: 3,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(102,126,234,0.15)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -30, left: '30%',
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(17,153,142,0.1)',
        }} />
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Welcome back, <strong style={{ color: '#a29bfe' }}>{user?.name || 'Admin'}</strong> — here's your holistic business overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          {[
            { label: `${conversionRate}% Conversion`, color: '#11998e' },
            { label: `${queries.length} Total Leads`, color: '#667eea' },
            { label: moment().format('dddd, MMM D'), color: '#fa709a' },
          ].map(b => (
            <Box key={b.label} sx={{
              px: 2, py: 0.5, borderRadius: 2,
              background: `${b.color}22`, border: `1px solid ${b.color}44`,
            }}>
              <Typography variant="caption" sx={{ color: b.color, fontWeight: 700 }}>{b.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── KPI Row ─────────────────────────────────────────────────────────── */}
      <Section
        title="Key Metrics"
        icon={<TrendingUpIcon sx={{ color: 'primary.main' }} />}
      >
        <Grid container spacing={2}>
          {[
            { label: 'Total Queries', value: queries.length, icon: <NotificationsActiveIcon />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', path: '/query' },
            { label: 'Confirmed', value: confirmed, icon: <CheckCircleIcon />, gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', path: '/query?stage=Confirm' },
            { label: 'Total Inquiries', value: inquiries.length, icon: <AssignmentIcon />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', path: '/inquiry' },
            { label: 'Packages', value: packages.length, icon: <CardTravelIcon />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', path: '/packages' },
            { label: 'Places', value: places.length, icon: <TravelExploreIcon />, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', path: '/places/view' },
            { label: 'Users', value: users.length, icon: <PeopleIcon />, gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', path: '/users' },
          ].map(kpi => (
            <Grid item xs={6} sm={4} md={2} key={kpi.label}>
              <KpiCard
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                gradient={kpi.gradient}
                loading={loading}
                onClick={() => navigate(kpi.path)}
              />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ─── Charts Row 1: Pie + Line ─────────────────────────────────────────── */}
      <Section title="Queries Overview" icon={<NotificationsActiveIcon sx={{ color: '#667eea' }} />}>
        <Grid container spacing={2}>
          {/* Pie – query stages */}
          <Grid item xs={12} md={5}>
            <ChartCard>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Queries by Stage
              </Typography>
              {loading ? <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mt: 3 }} /> : (
                queryStageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie
                        data={queryStageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {queryStageData.map((entry, i) => (
                          <Cell key={i} fill={stageColor(entry.name === 'Confirmed' ? 'Confirm' : entry.name)} />
                        ))}
                      </Pie>
                      <RTooltip formatter={(v, n) => [v, n]} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                    <Typography color="text.secondary">No query data</Typography>
                  </Box>
                )
              )}
            </ChartCard>
          </Grid>

          {/* Line – queries over time */}
          <Grid item xs={12} md={7}>
            <ChartCard>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Queries Trend (last 10 dates)
              </Typography>
              {loading ? <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={queryTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RTooltip />
                    <Area type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2.5} fill="url(#qGrad)" dot={{ r: 4, fill: '#667eea' }} name="Queries" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>
        </Grid>
      </Section>

      {/* ─── Charts Row 2: Bar + Area ─────────────────────────────────────────── */}
      <Section title="Packages & Inquiries" icon={<CardTravelIcon sx={{ color: '#4facfe' }} />}>
        <Grid container spacing={2}>
          {/* Bar – packages by location */}
          <Grid item xs={12} md={7}>
            <ChartCard>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Packages by Location
              </Typography>
              {loading ? <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={packagesByLocation} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RTooltip />
                    <Bar dataKey="value" name="Packages" radius={[6, 6, 0, 0]}>
                      {packagesByLocation.map((_, i) => (
                        <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>

          {/* Area – inquiries over time */}
          <Grid item xs={12} md={5}>
            <ChartCard>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Inquiries Trend
              </Typography>
              {loading ? <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={inquiryTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RTooltip />
                    <Line type="monotone" dataKey="count" stroke="#f093fb" strokeWidth={2.5} dot={{ r: 4, fill: '#f093fb' }} name="Inquiries" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Grid>
        </Grid>
      </Section>

      {/* ─── Recent Activity Table ────────────────────────────────────────────── */}
      <Section
        title="Recent Queries"
        icon={<AccessTimeIcon sx={{ color: '#fa709a' }} />}
        action={
          <Tooltip title="View all queries">
            <IconButton size="small" onClick={() => navigate('/query')}>
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      >
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(90deg, #f8f9fa, #fff)' }}>
                  {['Client', 'Destination', 'Travel Date', 'Stage', 'Created'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 13 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : recentQueries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography py={3} color="text.secondary">No queries yet</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentQueries.map((q, i) => (
                    <TableRow
                      key={q._id || i}
                      hover
                      sx={{ cursor: 'pointer', '&:hover': { background: 'rgba(102,126,234,0.04)' } }}
                      onClick={() => navigate('/query')}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: CHART_PALETTE[i % CHART_PALETTE.length] }}>
                            {(q.client_name || q.name || 'U')[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {q.client_name || q.name || '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{q.destination || q.place || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {q.travel_date ? moment(q.travel_date).format('DD MMM YYYY') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{stageChip(q.lead_stage)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {q.created_at ? moment(q.created_at).fromNow() : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Section>
    </Box>
  );
};

export default AdminDashboard;

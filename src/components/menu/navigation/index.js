// ===============================
// components/Navigation.js (With Badge Notification Counts + Clear on Click)
// ===============================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer, List, ListItem, ListItemText, ListItemButton, Badge, ListItemIcon,
  Typography, useMediaQuery,
} from "@mui/material";
import usePermissions from "../../../hooks/UsePermissions";
import { useSelector, useDispatch } from "react-redux";
import { removeNotification } from "../../../reduxcomponents/slices/notificationSlice";

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import AttachEmailOutlinedIcon from '@mui/icons-material/AttachEmailOutlined';
import AddToHomeScreenOutlinedIcon from '@mui/icons-material/AddToHomeScreenOutlined';
import CasesOutlinedIcon from '@mui/icons-material/CasesOutlined';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { AirportShuttleOutlined, CardTravelOutlined, ContactMailOutlined, HotelOutlined } from "@mui/icons-material";

const Navigation = ({ drawerOpen, setDrawerOpen }) => {
  const checkPermission = usePermissions();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobileOrTablet = useMediaQuery('(max-width:900px)');
  const [currentTab, setCurrentTab] = useState("Dashboard");

  const notifications = useSelector((state) => state.notification.list);
  const fetchConfigData = useSelector((state) => state.config.configData);

  const inquiryCount = notifications.filter(n => n.type === 'inquiry').length;
  const operationCount = notifications.filter(n => n.type === 'operation').length;

  const navLinkClicked = (link, label) => {
    // Remove related notifications
    if (label === "Inquiry") {
      notifications.filter(n => n.type === 'inquiry')
        .forEach(n => dispatch(removeNotification(n.notifiId)));
    }
    if (label === "Leads") {
      notifications.filter(n => n.type === 'operation')
        .forEach(n => dispatch(removeNotification(n.notifiId)));
    }

    navigate(link);
    setCurrentTab(label);
    isMobileOrTablet && setDrawerOpen(!drawerOpen);
  };

  const iconMap = {
    DashboardOutlined: DashboardOutlined,
    ContactMailOutlined: ContactMailOutlined,
    TrendingUpOutlined: TrendingUpOutlined,
    CardTravelOutlined: CardTravelOutlined,
    HotelOutlined: HotelOutlined,
    AirportShuttleOutlined: AirportShuttleOutlined,
    People: PeopleIcon,
    AttachMoneyOutlined: AttachMoneyOutlined,
    PeopleAltOutlined: PeopleAltOutlined,
    Settings: SettingsIcon,
    AttachEmailOutlined: AttachEmailOutlinedIcon,
    AddToHomeScreenOutlined: AddToHomeScreenOutlinedIcon,
    CasesOutlined: CasesOutlinedIcon,
    AddTaskOutlined: AddTaskOutlinedIcon,
    PermIdentityOutlined: PermIdentityOutlinedIcon,
    LogoutOutlined: LogoutOutlinedIcon
    // Add more mappings here
  };

  const drawer = (
    <div>
      <List>
        {fetchConfigData.navigationStrings
          .filter((element) => checkPermission(element.module, "view"))
          .map((element) => {
            const IconComponent = iconMap[element.icon];
            const showBadge =
              (element.label === "Inquiry" && inquiryCount > 0) ||
              (element.label === "Leads" && operationCount > 0);

            const badgeCount =
              element.label === "Inquiry" ? inquiryCount :
                element.label === "Leads" ? operationCount : 0;

            return (
              <ListItem
                disablePadding
                key={element.link}
                className={currentTab === element.label ? "active" : ""}
              >
                <ListItemButton
                  onClick={() => navLinkClicked(element.link, element.label)}
                >
                  {IconComponent && <IconComponent sx={{ mr: 1 }} />}

                  {showBadge ? (
                    <Badge badgeContent={badgeCount} color="error">
                      <ListItemText primary={element.label} />
                    </Badge>
                  ) : (
                    <ListItemText primary={element.label} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>
    </div>
  );

  return (
    // <Drawer
    //   sx={{
    //     width: CONFIG_STR.drawerWidth,
    //     flexShrink: 0,
    //     "& .MuiDrawer-paper": {
    //       width: CONFIG_STR.drawerWidth,
    //       boxSizing: "border-box",
    //       marginTop: "64px",
    //       backgroundColor: "#fafafa",
    //       borderRight: "1px solid #ddd",
    //     },
    //   }}
    //   variant="persistent"
    //   anchor="left"
    //   open={drawerOpen}
    // >
    //   {drawer}
    // </Drawer>
    <Drawer
      sx={{
        width: fetchConfigData.drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: fetchConfigData.drawerWidth,
          boxSizing: "border-box",
          marginTop: "64px",
          background: '#e8e1e1',
          color: '#2c3e50',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        },
      }}
      variant="persistent"
      anchor="left"
      open={drawerOpen}
    >
      <List sx={{ p: 0 }}>
        {fetchConfigData.navigationStrings
          .filter((item) => checkPermission(item.module, "view"))
          .map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = currentTab === item.label;

            const showBadge =
              (item.label === "Inquiry" && inquiryCount > 0) ||
              (item.label === "Leads" && operationCount > 0);

            const badgeCount =
              item.label === "Inquiry" ? inquiryCount :
                item.label === "Leads" ? operationCount : 0;

            return (
              <ListItem disablePadding key={item.link}>
                <ListItemButton
                  onClick={() => navLinkClicked(item.link, item.label)}
                  selected={isActive}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    backgroundColor: isActive ? '#1976d2' : 'transparent',
                    color: isActive ? '#fff' : '#2c3e50',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: 'linear-gradient(180deg, #42a5f5 0%, #1976d2 100%)',
                      borderRadius: '0 4px 4px 0',
                    } : {},
                    '&:hover': {
                      backgroundColor: isActive ? '#1565c0' : 'rgba(25, 118, 210, 0.1)',
                      transform: 'translateX(4px)',
                      boxShadow: isActive ? '0 4px 12px rgba(25, 118, 210, 0.4)' : 'none',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#fff' : '#546e7a',
                      minWidth: 40,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {Icon && <Icon fontSize="small" />}
                  </ListItemIcon>

                  {showBadge ? (
                    <Badge
                      badgeContent={badgeCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          right: -12,
                          top: 10,
                          fontWeight: 600,
                          fontSize: '0.65rem',
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography noWrap variant="body2" fontWeight={isActive ? 600 : 500}>
                            {item.label}
                          </Typography>
                        }
                      />
                    </Badge>
                  ) : (
                    <ListItemText
                      primary={
                        <Typography noWrap variant="body2" fontWeight={isActive ? 600 : 500}>
                          {item.label}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>
    </Drawer>

  );
};

export default Navigation;

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
import { AirportShuttleOutlined, CardTravelOutlined, ContactMailOutlined, HotelOutlined, AdminPanelSettingsOutlined, ManageAccountsOutlined } from "@mui/icons-material";

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
    LogoutOutlined: LogoutOutlinedIcon,
    AdminPanelSettingsOutlined: AdminPanelSettingsOutlined,
    ManageAccountsOutlined: ManageAccountsOutlined
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
    <Drawer
      sx={{
        width: fetchConfigData.drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: fetchConfigData.drawerWidth,
          boxSizing: "border-box",
          marginTop: "64px",
          background: '#dde0ce',
          borderRight: '1px solid #e3e8ef',
        },
      }}
      variant="persistent"
      anchor="left"
      open={drawerOpen}
    >
      <List sx={{ p: 2, pt: 3 }}>
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
              <ListItem disablePadding key={item.link} sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navLinkClicked(item.link, item.label)}
                  selected={isActive}
                  sx={{
                    px: 2.5,
                    py: 1.75,
                    borderRadius: 3,
                    background: isActive
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'transparent',
                    color: isActive ? '#ffffff' : '#4a5568',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isActive ? 'none' : '1px solid transparent',
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '60%',
                      width: '4px',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '0 8px 8px 0',
                    } : {},
                    '&::after': !isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      borderRadius: 3,
                    } : {},
                    '&:hover': {
                      transform: 'translateX(6px)',
                      background: isActive
                        ? 'linear-gradient(135deg, #5568d3 0%, #6b3f91 100%)'
                        : 'transparent',
                      border: isActive ? 'none' : '1px solid #e3e8ef',
                      '&::after': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#ffffff' : '#667eea',
                      minWidth: 42,
                      transition: 'all 0.3s ease',
                      opacity: isActive ? 1 : 0.85,
                    }}
                  >
                    {Icon && <Icon fontSize="medium" />}
                  </ListItemIcon>

                  {showBadge ? (
                    <Badge
                      badgeContent={badgeCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          right: -12,
                          top: 11,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          minWidth: 20,
                          height: 20,
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #f56565 0%, #c53030 100%)',
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            noWrap
                            variant="body2"
                            fontWeight={isActive ? 600 : 500}
                            sx={{
                              fontSize: '0.925rem',
                              letterSpacing: '0.01em'
                            }}
                          >
                            {item.label}
                          </Typography>
                        }
                      />
                    </Badge>
                  ) : (
                    <ListItemText
                      primary={
                        <Typography
                          noWrap
                          variant="body2"
                          fontWeight={isActive ? 600 : 500}
                          sx={{
                            fontSize: '0.925rem',
                            letterSpacing: '0.01em'
                          }}
                        >
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

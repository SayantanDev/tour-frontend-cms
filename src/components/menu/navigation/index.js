// ===============================
// components/Navigation.js (With Badge Notification Counts + Clear on Click)
// ===============================

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer, List, ListItem, ListItemText, ListItemButton, Badge, ListItemIcon,
  Typography, useMediaQuery,
  Box,
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

  const [drawerWidth, setDrawerWidth] = useState(180);
  const isResizing = useRef(false);

  const startResizing = (e) => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.body.style.cursor = "default";
  };

  const resize = (e) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth > 180 && newWidth < 480) {
      setDrawerWidth(newWidth);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    };
  }, []);

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

  // const drawer = (
  //   <div>
  //     <List>
  //       {fetchConfigData.navigationStrings
  //         .filter((element) => checkPermission(element.module, "view"))
  //         .map((element) => {
  //           const IconComponent = iconMap[element.icon];
  //           const showBadge =
  //             (element.label === "Inquiry" && inquiryCount > 0) ||
  //             (element.label === "Leads" && operationCount > 0);

  //           const badgeCount =
  //             element.label === "Inquiry" ? inquiryCount :
  //               element.label === "Leads" ? operationCount : 0;

  //           return (
  //             <ListItem
  //               disablePadding
  //               key={element.link}
  //               className={currentTab === element.label ? "active" : ""}
  //             >
  //               <ListItemButton
  //                 onClick={() => navLinkClicked(element.link, element.label)}
  //               >
  //                 {IconComponent && <IconComponent sx={{ mr: 1 }} />}

  //                 {showBadge ? (
  //                   <Badge badgeContent={badgeCount} color="error">
  //                     <ListItemText primary={element.label} />
  //                   </Badge>
  //                 ) : (
  //                   <ListItemText primary={element.label} />
  //                 )}
  //               </ListItemButton>
  //             </ListItem>
  //           );
  //         })}
  //     </List>
  //   </div>
  // );

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
    <> <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          marginTop: "64px",
          color: '#fff',
          borderRight: 'none',
        },
      }}
      variant="persistent"
      anchor="left"
      open={drawerOpen}
    >
      {/* <Toolbar /> */}

      <List sx={{ p: 0 }}>
        {fetchConfigData.navigationStrings
          .filter((item) => checkPermission(item.module, "view"))
          .map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = currentTab === item.label;

            return (
              <ListItem disablePadding key={item.link}>
                <ListItemButton
                  onClick={() => navLinkClicked(item.link, item.label)}
                  selected={isActive}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                    backgroundColor: isActive ? '#00e676' : 'transparent', // Green highlight
                    color: isActive ? '#1a237e' : '#fff',
                    '&:hover': {
                      backgroundColor: isActive ? '#00c853' : 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      // color: isActive ? '#1a237e' : '#fff',
                      minWidth: 36,
                    }}
                  >
                    {Icon && <Icon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography noWrap variant="body2" fontWeight={500}>
                        {item.label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>
    </Drawer>

    <Box
    onMouseDown={startResizing}
    sx={{
      width: "5px",
      cursor: "w-resize",
      zIndex: 999,
    }}></Box>
    </>
  );
};

export default Navigation;



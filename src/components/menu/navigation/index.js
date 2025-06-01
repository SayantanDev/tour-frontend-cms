import React, { useState } from "react";
import { CONFIG_STR } from "../../../configuration";
import { useNavigate } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, Toolbar, ListItemIcon, Typography,
  ListItemButton
 } from "@mui/material";
import usePermissions from "../../../hooks/UsePermissions";

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import HotelOutlined from '@mui/icons-material/HotelOutlined';
import AirportShuttleOutlined from '@mui/icons-material/AirportShuttleOutlined';
import ContactMailOutlined from '@mui/icons-material/ContactMailOutlined';
import CardTravelOutlined from '@mui/icons-material/CardTravelOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';


const Navigation = ({ drawerOpen }) => {
  const checkPermission = usePermissions();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("Dashboard");

  const navLinkClicked = (link, label) => {
    navigate(link);
    setCurrentTab(label);
  };
  const iconMap = {
    DashboardOutlined: DashboardOutlined,
    ContactMailOutlined: ContactMailOutlined,
    TrendingUpOutlined:TrendingUpOutlined,
    CardTravelOutlined:CardTravelOutlined,
    HotelOutlined: HotelOutlined,
    AirportShuttleOutlined: AirportShuttleOutlined,
    People: PeopleIcon,
    Settings: SettingsIcon,
    AttachMoneyOutlined:AttachMoneyOutlined,
    PeopleAltOutlined:PeopleAltOutlined,
    LogoutOutlined:LogoutOutlinedIcon
    // Add more mappings here
  };

  const drawer = (
    <div>
      <List>
        {CONFIG_STR.navigationStrings
          .filter((element) => checkPermission(element.module, "view")) // Check permission
          .map((element) => {
            const IconComponent = iconMap[element.icon];

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
                  <ListItemText primary={element.label} />
                </ListItemButton>
              </ListItem>
            )
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
        width: CONFIG_STR.drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: CONFIG_STR.drawerWidth,
          boxSizing: "border-box",
          // pt: "64px",
          marginTop: "64px",
          // background: 'linear-gradient(180deg, #1a237e, #3949ab)', // Blue gradient
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
        {CONFIG_STR.navigationStrings
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

  );
};

export default Navigation;

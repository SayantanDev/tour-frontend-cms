import React, { useState } from "react";
import { CONFIG_STR } from "../../../configuration";
import { useNavigate } from "react-router-dom";
import {
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import usePermissions from "../../../hooks/UsePermissions";

import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
// import AttachEmailIcon from '@mui/icons-material/AttachEmail';
import AttachEmailOutlinedIcon from '@mui/icons-material/AttachEmailOutlined';
import AddToHomeScreenOutlinedIcon from '@mui/icons-material/AddToHomeScreenOutlined';
import CasesOutlinedIcon from '@mui/icons-material/CasesOutlined';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
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
    InsertChartOutlined: InsertChartOutlinedIcon,
    People: PeopleIcon,
    Settings: SettingsIcon,
    AttachEmailOutlined: AttachEmailOutlinedIcon,
    AddToHomeScreenOutlined:AddToHomeScreenOutlinedIcon,
    CasesOutlined:CasesOutlinedIcon,
    AddTaskOutlined:AddTaskOutlinedIcon,
    PermIdentityOutlined:PermIdentityOutlinedIcon,
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
    <Drawer
      sx={{
        width: CONFIG_STR.drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: CONFIG_STR.drawerWidth,
          boxSizing: "border-box",
          marginTop: "64px",
        },
      }}
      variant="persistent"
      anchor="left"
      open={drawerOpen}
    >
      <Toolbar />
      {drawer}
    </Drawer>
  );
};

export default Navigation;

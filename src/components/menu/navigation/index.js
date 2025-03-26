import React, {useState} from "react";
import { CONFIG_STR } from "../../../configuration"
import { useNavigate } from 'react-router-dom';
import {
    Toolbar,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
  } from '@mui/material';

const Navigation = ({drawerOpen}) => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('Dashboard');

  const drawer = (
    <div>
      <List>
        {CONFIG_STR.navigationStrings.map((element) => (
          <ListItem
            disablePadding
            key={element.link}
            className={currentTab === element.label ? 'active' : ''}
          >
            <ListItemButton
              onClick={() => navLinkClicked(element.link, element.label)}
            >
              <ListItemText primary={element.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const navLinkClicked = (links, label) => {
    navigate(links);
    setCurrentTab(label);
  };
  
  return (
    <Drawer
      sx={{
        width: CONFIG_STR.drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: CONFIG_STR.drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
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
}
  
export default Navigation;
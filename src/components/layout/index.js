import React, {useState} from "react";
import { Outlet } from "react-router-dom";
import Footer from "../menu/footer";
import Navigation from "../menu/navigation";
import Top from "../menu/top";
import { CssBaseline, Box, } from '@mui/material';
import { useSelector } from "react-redux";

  const Layout = () => {
    const fetchConfigData = useSelector((state) => state.config.configData);
    const [drawerOpen, setDrawerOpen] = useState(true);
  
    const toggleDrawer = () => {
      setDrawerOpen(!drawerOpen);
    };
  
    return (  
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Top toggleDrawer={toggleDrawer} />
        <Navigation drawerOpen={drawerOpen} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            p: 3,
            mt: 8,
            transition: 'margin-left 0.3s ease',
            width: drawerOpen ? `calc(100% - ${fetchConfigData.drawerWidth}px)` : '100%', 
            marginLeft: drawerOpen ? '0' : `${-fetchConfigData.drawerWidth}px`, 
          }}
        >
          <Outlet />  
        </Box>
        <Footer />
      </Box>
    );
  };
  
  export default Layout;
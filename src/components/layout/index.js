import React, {useState, useEffect} from "react";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from '@mui/material';
import Footer from "../menu/footer";
import Navigation from "../menu/navigation";
import Top from "../menu/top";
import { CONFIG_STR } from "../../configuration"
import { CssBaseline, Box, } from '@mui/material';

  const Layout = () => {
    const isMobileOrTablet = useMediaQuery('(max-width:900px)');
    const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    setDrawerOpen(!isMobileOrTablet);
  }, [isMobileOrTablet]);
  
    const toggleDrawer = () => {
      setDrawerOpen(!drawerOpen);
    };
  
    return (  
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Top toggleDrawer={toggleDrawer} />
        <Navigation drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            p: 3,
            mt: 8,
            transition: 'margin-left 0.3s ease',
            width: drawerOpen ? `calc(100% - ${CONFIG_STR.drawerWidth}px)` : '100%', 
            marginLeft: drawerOpen ? '0' : `${-CONFIG_STR.drawerWidth}px`, 
          }}
        >
          <Outlet />  
        </Box>
        <Footer />
      </Box>
    );
  };
  
  export default Layout;
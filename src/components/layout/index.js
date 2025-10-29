import React, {useState, useEffect} from "react";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from '@mui/material';
import Footer from "../menu/footer";
import Navigation from "../menu/navigation";
import Top from "../menu/top";
import { CssBaseline, Box, } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { setConfigData } from "../../reduxcomponents/slices/configSlice";

  const Layout = () => {
    const isMobileOrTablet = useMediaQuery('(max-width:900px)');
    const fetchConfigData = useSelector((state) => state.config.configData);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const dispatch = useDispatch();

  useEffect(() => {
    setDrawerOpen(!isMobileOrTablet); 
  }, [isMobileOrTablet]);
  
    const toggleDrawer = () => {
      const newDrawerState = !drawerOpen;
      setDrawerOpen(newDrawerState);
      dispatch(setConfigData({drawerOpen: newDrawerState}));
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
import React, { useEffect, useState } from "react";
import {
 AppBar,
 Toolbar,
 Typography,
 IconButton,
 Popover,
 Button,
 Box,
 Link,
} from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import io from "socket.io-client"
import moment from "moment/moment";
import { useDispatch, useSelector } from "react-redux";
import { addNotification, removeAllNotifications, removeNotification } from "../../../reduxcomponents/slices/notificationSlice";

function Notification() {

 const socketUrl = "http://localhost:8000"

 const dispatch = useDispatch();
 const notifications = useSelector((state) => state.notification.list);
 console.log("notyfi is is :", notifications);


 useEffect(() => {
  const socket = io(socketUrl);

  socket.on('connect', () => {
   console.log("Connected to socket server");
  });


  socket.on('inquiry', (notify) => {
   console.log("Received inquiry:", notify);

   dispatch(addNotification(notify))
  });

  return () => {
   socket.off("chatMessage");
   socket.disconnect();
  };
 }, [dispatch]);

 /////
 const [anchorEl, setAnchorEl] = React.useState(null);

 const handleClick = (event) => {
  setAnchorEl(event.currentTarget);
 };

 const handleClose = () => {
  setAnchorEl(null);
 };
 const handleRead = (id) => {
  dispatch(removeNotification(id));
 };

 const open = Boolean(anchorEl);
 const id = open ? 'simple-popover' : undefined;
 return (
  <Typography>
   <Button aria-describedby={id} variant="contained" onClick={handleClick}>
    <NotificationImportantIcon />
    {notifications.length}
   </Button>
   <Popover
    id={id}
    open={open}
    anchorEl={anchorEl}
    onClose={handleClose}
    anchorOrigin={{
     vertical: 'bottom',
     horizontal: 'left',
    }}
    PaperProps={{
     sx: {
      width: 300,
      maxHeight: 400,
      overflowY: 'auto',
      p: 2,
     }
    }}
   >
    {notifications.length > 1 && <Link sx={{
     cursor: "pointer",
     fontSize: "14px",
     textAlign: "right",
     display: "block",
     mb: 1,
     color: "primary.main",
    }} onClick={() => dispatch(removeAllNotifications())}>Mark all as read</Link>}
    {notifications.length > 0 ? (
     notifications.map((notify, index) => (
      <Box
       sx={{
        mb: 1.5,
        p: 1.5,
        borderRadius: 2,
        backgroundColor: "#f5f5f5",
        boxShadow: 1,
        border: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
       }}
      >
       <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
        {`${notify.notify}`}. <Link sx={{ cursor: "pointer" }} onClick={() => handleRead(notify.notifiId)} >Mark as read</Link>

       </Typography>
       <Typography sx={{ fontSize: "10px", color: "gray" }}>
        {moment(notify.time).fromNow()}
       </Typography>
      </Box>

     ))
    ) : (
     <Typography>No new Notification</Typography>
    )}
   </Popover>
  </Typography>
 )
}

export default Notification

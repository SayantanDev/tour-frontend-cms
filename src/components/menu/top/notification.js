// ===============================
// components/Notification.js (Enhanced with URL Navigation per Notification Type)
// ===============================

import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Box,
  Link,
  Popover,
} from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import io from "socket.io-client";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { addNotification, removeAllNotifications, removeNotification } from "../../../reduxcomponents/slices/notificationSlice";
import { useNavigate } from "react-router-dom";

// export const PKG_URL = `${process.env.REACT_APP_BASE_URL}/cat-package`;
const socketUrl = process.env.REACT_APP_BASE_URL;

function Notification() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector((state) => state.notification.list);
  const user = useSelector((state) => state.tokens.user);

  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const socket = io(socketUrl);

    socket.on("connect", () => {
      if (user && user._id && user.permission) {
        socket.emit("register", {
          userId: user._id,
          permission: user.permission,
        });
      }
    });

    socket.on("notification", (notify) => {
      dispatch(addNotification({
        notifiId: Date.now(),
        notify: notify.message,
        type: notify.type || 'general',
        time: new Date()
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, user]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleReadAndRedirect = (id, type) => {
    dispatch(removeNotification(id));

    switch (type) {
      case 'inquiry':
        navigate('/inquiry');
        break;
      case 'operation':
      case 'followup':
        navigate('/query');
        break;
      default:
        navigate('/dashboard');
    }
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Typography>
      <Button
        aria-describedby={id}
        sx={{ color: "white", position: "relative", p: 0 }}
        onClick={handleClick}
      >
        <Box sx={{ position: "relative" }}>
          <NotificationImportantIcon fontSize="large" />
          <Typography
            sx={{
              position: "absolute",
              top: -5,
              right: -5,
              background: "red",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {notifications.length}
          </Typography>
        </Box>
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
        {notifications.length > 1 && (
          <Link
            sx={{
              cursor: "pointer",
              fontSize: "14px",
              textAlign: "right",
              display: "block",
              mb: 1,
              color: "primary.main",
            }}
            onClick={() => dispatch(removeAllNotifications())}
          >
            Mark all as read
          </Link>
        )}

        {notifications.length > 0 ? (
          notifications.map((notify) => (
            <Box
              key={notify.notifiId}
              sx={{
                mb: 1.5,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
                boxShadow: 1,
                border: "1px solid #e0e0e0",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
                {notify.notify}.{' '}
                <Link
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleReadAndRedirect(notify.notifiId, notify.type)}
                >
                  View
                </Link>
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
  );
}

export default Notification;

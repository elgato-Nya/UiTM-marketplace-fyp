import React, { useState, useEffect, useCallback } from "react";
import {
  Popover,
  Box,
  Typography,
  List,
  Divider,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DoneAll as DoneAllIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useNotificationContext } from "../../contexts/NotificationContext";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../../services/notificationService";
import NotificationItem from "./NotificationItem";

/**
 * NotificationDropdown Component
 *
 * PURPOSE: Shows a quick-view dropdown of recent notifications from the header bell
 * PATTERN: Popover anchored to the notification bell IconButton
 */
function NotificationDropdown({ anchorEl, onClose }) {
  const navigate = useNavigate();
  const { markAllRead, decrementUnread, forceRefresh } =
    useNotificationContext();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getNotifications({ page: 1, limit: 5 });
      setNotifications(response?.notifications || []);
    } catch (error) {
      console.error("Failed to fetch dropdown notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on open
  useEffect(() => {
    if (open) {
      fetchRecentNotifications();
    }
  }, [open, fetchRecentNotifications]);

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      decrementUnread();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const target = notifications.find((n) => n._id === notificationId);
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notificationId)
      );
      if (target && !target.read) {
        decrementUnread();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleViewAll = () => {
    onClose();
    navigate(ROUTES.NOTIFICATIONS);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          sx: {
            width: 380,
            maxHeight: 500,
            borderRadius: 2,
            mt: 1,
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Notifications
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Mark all as read">
            <IconButton size="small" onClick={handleMarkAllRead}>
              <DoneAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View all notifications">
            <IconButton size="small" onClick={handleViewAll}>
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      {/* Notification List */}
      <Box sx={{ maxHeight: 360, overflow: "auto" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
              px: 2,
            }}
          >
            <Typography variant="h5" sx={{ mb: 1 }}>
              🔔
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <NotificationItem
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  compact
                />
                {index < notifications.length - 1 && (
                  <Divider component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
            <Button
              size="small"
              onClick={handleViewAll}
              sx={{ textTransform: "none" }}
            >
              View all notifications
            </Button>
          </Box>
        </>
      )}
    </Popover>
  );
}

export default NotificationDropdown;

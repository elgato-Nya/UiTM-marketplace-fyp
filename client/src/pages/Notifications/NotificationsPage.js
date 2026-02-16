import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  List,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Pagination,
  Stack,
  Paper,
} from "@mui/material";
import {
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import { useNotificationContext } from "../../contexts/NotificationContext";
import BackButton from "../../components/common/Navigation/BackButton";
import NotificationItem from "../../components/notification/NotificationItem";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "../../services/notificationService";

/**
 * NotificationsPage
 *
 * Full notification center with category filtering, pagination, and bulk actions
 */

const CATEGORY_TABS = [
  { label: "All", value: "" },
  { label: "Orders", value: "order" },
  { label: "Shopping", value: "shopping" },
  { label: "Merchant", value: "merchant" },
  { label: "Quotes", value: "quote" },
  { label: "System", value: "system" },
];

const NotificationsPage = () => {
  const { success, error: showError } = useSnackbar();
  const { markAllRead, decrementUnread, forceRefresh } =
    useNotificationContext();

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("");

  const fetchNotifications = useCallback(
    async (page = 1, category = currentCategory) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: 15,
          sort: "-createdAt",
        };

        if (category) {
          params.category = category;
        }

        const response = await getNotifications(params);
        setNotifications(response?.notifications || []);
        setPagination(
          response?.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
          }
        );
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setError("Unable to load notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [currentCategory]
  );

  useEffect(() => {
    fetchNotifications(1, currentCategory);
  }, [currentCategory, fetchNotifications]);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    const category = CATEGORY_TABS[newValue].value;
    setCurrentCategory(category);
  };

  const handlePageChange = (_, page) => {
    fetchNotifications(page, currentCategory);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      decrementUnread();
    } catch (err) {
      showError("Failed to mark notification as read");
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
      success("Notification dismissed");
    } catch (err) {
      showError("Failed to delete notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      success("All notifications marked as read");
    } catch (err) {
      showError("Failed to mark all as read");
    }
  };

  const handleClearAllRead = async () => {
    try {
      const result = await deleteAllReadNotifications();
      success(
        `Cleared ${result?.modifiedCount || 0} read notification(s)`
      );
      // Re-fetch to get updated list
      await fetchNotifications(1, currentCategory);
      forceRefresh();
    } catch (err) {
      showError("Failed to clear read notifications");
    }
  };

  const unreadInView = notifications.filter((n) => !n.read).length;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <BackButton />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Notifications
            </Typography>
            {pagination.totalCount > 0 && (
              <Chip
                label={pagination.totalCount}
                size="small"
                color="default"
                variant="outlined"
              />
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            {unreadInView > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllRead}
                sx={{ textTransform: "none" }}
              >
                Mark all read
              </Button>
            )}
            <Button
              size="small"
              startIcon={<DeleteSweepIcon />}
              onClick={handleClearAllRead}
              color="inherit"
              sx={{ textTransform: "none" }}
            >
              Clear read
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Category Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              minWidth: 80,
            },
          }}
        >
          {CATEGORY_TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Content */}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 8,
            px: 3,
          }}
        >
          <Typography variant="h3" sx={{ mb: 2 }}>
            🔔
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notifications
          </Typography>
          <Typography
            variant="body2"
            color="text.disabled"
            textAlign="center"
          >
            {currentCategory
              ? `No ${currentCategory} notifications to show`
              : "You're all caught up! New notifications will appear here."}
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <List disablePadding>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <NotificationItem
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                  {index < notifications.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default NotificationsPage;

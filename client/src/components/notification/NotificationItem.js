import React from "react";
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

/**
 * Format a relative time string from a date
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time (e.g., "2m ago", "3h ago", "5d ago")
 */
const formatTimeAgo = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return then.toLocaleDateString();
};

/**
 * Priority color mapper
 */
const getPriorityColor = (priority) => {
  const colorMap = {
    urgent: "error",
    high: "warning",
    normal: "default",
    low: "default",
  };
  return colorMap[priority] || "default";
};

/**
 * NotificationItem Component
 *
 * PURPOSE: Renders a single notification in a list
 * USAGE: Used in both NotificationDropdown and NotificationsPage
 */
function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  compact = false,
}) {
  const { _id, icon, title, message, read, priority, category, createdAt } =
    notification;

  const handleClick = () => {
    if (!read && onMarkRead) {
      onMarkRead(_id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(_id);
    }
  };

  return (
    <ListItem
      onClick={handleClick}
      sx={{
        cursor: !read ? "pointer" : "default",
        bgcolor: read ? "transparent" : "action.hover",
        borderLeft: !read ? 3 : 0,
        borderColor: !read ? "primary.main" : "transparent",
        py: compact ? 1 : 1.5,
        px: 2,
        "&:hover": {
          bgcolor: "action.selected",
        },
        transition: "background-color 0.2s ease",
      }}
      secondaryAction={
        onDelete && (
          <Tooltip title="Dismiss">
            <IconButton
              edge="end"
              size="small"
              onClick={handleDelete}
              aria-label="dismiss notification"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      }
    >
      <ListItemIcon sx={{ minWidth: compact ? 36 : 44, fontSize: "1.3rem" }}>
        {icon || "🔔"}
      </ListItemIcon>

      <ListItemText
        primary={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.3,
            }}
          >
            <Typography
              variant={compact ? "body2" : "subtitle2"}
              sx={{
                fontWeight: read ? 400 : 600,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
            {priority === "urgent" || priority === "high" ? (
              <Chip
                label={priority}
                color={getPriorityColor(priority)}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                }}
              />
            ) : null}
          </Box>
        }
        secondary={
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: compact ? 1 : 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.4,
                mb: 0.5,
              }}
            >
              {message}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="caption"
                color="text.disabled"
              >
                {formatTimeAgo(createdAt)}
              </Typography>
              {!compact && (
                <Chip
                  label={category}
                  variant="outlined"
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: "0.6rem",
                    textTransform: "capitalize",
                  }}
                />
              )}
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
}

export default NotificationItem;

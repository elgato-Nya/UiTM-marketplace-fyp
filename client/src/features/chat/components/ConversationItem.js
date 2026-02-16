import React from "react";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Badge,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

/**
 * Truncate text to a maximum character length with ellipsis
 */
const truncateContent = (text, maxLen = 50) => {
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
};

/**
 * Format a timestamp into a relative "time ago" string
 */
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
};

/**
 * Get display name for the other participant in the conversation
 */
const getOtherParticipantName = (participants, currentUserId) => {
  if (!participants || participants.length === 0) return "Unknown";
  const other = participants.find((p) => {
    const pId =
      typeof p.userId === "object" ? p.userId._id || p.userId.id : p.userId;
    return String(pId) !== String(currentUserId);
  });
  if (!other) return "Unknown";

  const profile = other.userId?.profile || other.userId;
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  if (profile?.firstName) return profile.firstName;
  if (other.userId?.email) return other.userId.email;
  return "User";
};

/**
 * Get avatar URL for the other participant
 */
const getOtherParticipantAvatar = (participants, currentUserId) => {
  if (!participants || participants.length === 0) return null;
  const other = participants.find((p) => {
    const pId =
      typeof p.userId === "object" ? p.userId._id || p.userId.id : p.userId;
    return String(pId) !== String(currentUserId);
  });
  return other?.userId?.profile?.avatar || null;
};

/**
 * Get unread count for the current user in a conversation
 */
const getUnreadForUser = (participants, currentUserId) => {
  if (!participants) return 0;
  const self = participants.find((p) => {
    const pId =
      typeof p.userId === "object" ? p.userId._id || p.userId.id : p.userId;
    return String(pId) === String(currentUserId);
  });
  return self?.unreadCount || 0;
};

/**
 * Individual conversation item for the chat sidebar/inbox
 *
 * @param {Object} props
 * @param {Object} props.conversation - Conversation document
 * @param {string} props.currentUserId - Current authenticated user's ID
 * @param {boolean} props.isSelected - Whether this conversation is active
 * @param {Function} props.onClick - Click handler
 */
function ConversationItem({
  conversation,
  currentUserId,
  isSelected = false,
  onClick,
}) {
  const name = getOtherParticipantName(
    conversation.participants,
    currentUserId
  );
  const avatarUrl = getOtherParticipantAvatar(
    conversation.participants,
    currentUserId
  );
  const unread = getUnreadForUser(conversation.participants, currentUserId);
  const lastMsg = conversation.lastMessage;
  const isImage = lastMsg?.type === "image";

  const previewText = isImage ? "📷 Image" : truncateContent(lastMsg?.content);
  const timeStr = formatTimeAgo(lastMsg?.createdAt || conversation.updatedAt);

  return (
    <ListItem
      component="div"
      onClick={onClick}
      sx={{
        cursor: "pointer",
        px: 2,
        py: 1.5,
        bgcolor: isSelected
          ? "action.selected"
          : unread > 0
            ? "action.hover"
            : "transparent",
        borderLeft: isSelected ? 3 : 0,
        borderColor: "primary.main",
        "&:hover": {
          bgcolor: isSelected ? "action.selected" : "action.hover",
        },
        transition: "background-color 0.15s ease",
      }}
    >
      <ListItemAvatar>
        <Badge
          badgeContent={unread}
          color="error"
          max={99}
          invisible={unread === 0}
        >
          <Avatar src={avatarUrl} alt={name}>
            {!avatarUrl && <PersonIcon />}
          </Avatar>
        </Badge>
      </ListItemAvatar>

      <ListItemText
        disableTypography
        primary={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.25,
            }}
          >
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                fontWeight: unread > 0 ? 700 : 400,
                maxWidth: "60%",
              }}
            >
              {name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ flexShrink: 0 }}
            >
              {timeStr}
            </Typography>
          </Box>
        }
        secondary={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{
                fontWeight: unread > 0 ? 600 : 400,
                maxWidth: conversation.listing ? "55%" : "100%",
              }}
            >
              {isImage && (
                <ImageIcon
                  sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }}
                />
              )}
              {previewText || "No messages yet"}
            </Typography>

            {conversation.listing && (
              <Chip
                label={truncateContent(
                  conversation.listing.title || "Listing",
                  18
                )}
                size="small"
                variant="outlined"
                sx={{ ml: 0.5, maxWidth: 120, fontSize: "0.7rem" }}
              />
            )}
          </Box>
        }
      />
    </ListItem>
  );
}

export default ConversationItem;

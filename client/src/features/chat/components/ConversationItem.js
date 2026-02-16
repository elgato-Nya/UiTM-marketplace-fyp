import React, { memo } from "react";
import {
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Badge,
  Chip,
} from "@mui/material";
import { Storefront as StoreIcon } from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import {
  resolveOtherParticipant,
  resolveListingInfo,
} from "../utils/participantUtils";

/** Truncate text with ellipsis */
const truncateText = (text, maxLen = 50) => {
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
};

/** Relative "time ago" string */
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: false });
  } catch {
    return "";
  }
};

/** Unread count for the current user */
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
 * A single conversation row in the sidebar inbox.
 *
 * Uses semantic ListItemButton for keyboard/screen-reader accessibility.
 */
function ConversationItem({
  conversation,
  currentUserId,
  isSelected = false,
  onClick,
}) {
  const participant = resolveOtherParticipant(
    conversation.participants,
    currentUserId
  );
  const listing = resolveListingInfo(conversation.listing);
  const unread = getUnreadForUser(conversation.participants, currentUserId);
  const lastMsg = conversation.lastMessage;
  const isImage = lastMsg?.type === "image";

  const previewText = isImage ? "📷 Image" : truncateText(lastMsg?.content);
  const timeStr = formatTimeAgo(lastMsg?.sentAt || conversation.updatedAt);

  return (
    <ListItemButton
      role="option"
      aria-selected={isSelected}
      aria-label={`Conversation with ${participant.name}${unread > 0 ? `, ${unread} unread` : ""}`}
      onClick={onClick}
      selected={isSelected}
      sx={{
        py: 1.5,
        px: 2,
        gap: 1.5,
        borderLeft: 3,
        borderColor: isSelected ? "primary.main" : "transparent",
        "&.Mui-selected": {
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(106, 90, 205, 0.12)"
              : "rgba(72, 61, 139, 0.06)",
        },
        "&.Mui-selected:hover": {
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(106, 90, 205, 0.18)"
              : "rgba(72, 61, 139, 0.10)",
        },
        "&:hover": {
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.02)",
        },
        transition: "all 0.15s ease-in-out",
      }}
    >
      {/* Avatar with unread badge */}
      <ListItemAvatar sx={{ minWidth: "auto" }}>
        <Badge
          badgeContent={unread}
          color="error"
          max={99}
          invisible={unread === 0}
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Avatar
            src={participant.avatar}
            alt={participant.name}
            sx={{
              width: 44,
              height: 44,
              bgcolor: participant.avatar ? "transparent" : "primary.main",
              color: "primary.contrastText",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {!participant.avatar && participant.initials}
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
              gap: 1,
              mb: 0.25,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                minWidth: 0,
                flex: 1,
              }}
            >
              {participant.isMerchant && (
                <StoreIcon
                  sx={{ fontSize: 14, color: "primary.main", flexShrink: 0 }}
                  aria-label="Merchant"
                />
              )}
              <Typography
                variant="subtitle2"
                noWrap
                component="span"
                sx={{
                  fontWeight: unread > 0 ? 700 : 500,
                  color: "text.primary",
                  lineHeight: 1.3,
                }}
              >
                {participant.name}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              component="time"
              sx={{ flexShrink: 0, fontSize: "0.7rem" }}
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
              gap: 0.5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              component="span"
              sx={{
                fontWeight: unread > 0 ? 600 : 400,
                flex: 1,
                minWidth: 0,
                fontSize: "0.8125rem",
              }}
            >
              {previewText || "No messages yet"}
            </Typography>

            {listing && (
              <Chip
                label={truncateText(listing.title, 16)}
                size="small"
                variant="outlined"
                sx={{
                  ml: 0.5,
                  maxWidth: 110,
                  height: 20,
                  fontSize: "0.65rem",
                  borderColor: "divider",
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            )}
          </Box>
        }
      />
    </ListItemButton>
  );
}

export default memo(ConversationItem);

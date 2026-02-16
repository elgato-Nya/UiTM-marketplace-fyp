import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { format, isToday, isYesterday } from "date-fns";

/**
 * Format message timestamp for display
 */
const formatMessageTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`;
    return format(date, "MMM d, h:mm a");
  } catch {
    return "";
  }
};

/**
 * Single chat message bubble
 *
 * @param {Object} props
 * @param {Object} props.message - Message document
 * @param {boolean} props.isMine - Whether this message was sent by the current user
 * @param {boolean} props.showAvatar - Show sender avatar (for group-first message)
 * @param {string} props.senderName - Display name of the sender
 * @param {string} props.senderAvatar - Avatar URL of the sender
 */
function ChatMessage({
  message,
  isMine = false,
  showAvatar = true,
  senderName = "",
  senderAvatar = null,
}) {
  const isSystemMessage = message.type === "system";

  if (isSystemMessage) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 1,
          px: 2,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            bgcolor: "action.hover",
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontStyle: "italic",
          }}
        >
          {message.content}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMine ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 1,
        px: 2,
        py: 0.5,
        maxWidth: "100%",
      }}
    >
      {/* Avatar (only for received messages) */}
      {!isMine && showAvatar ? (
        <Avatar
          src={senderAvatar}
          alt={senderName}
          sx={{ width: 32, height: 32 }}
        >
          {!senderAvatar && <PersonIcon fontSize="small" />}
        </Avatar>
      ) : !isMine ? (
        <Box sx={{ width: 32, flexShrink: 0 }} />
      ) : null}

      {/* Message bubble */}
      <Box
        sx={{
          maxWidth: "70%",
          minWidth: 60,
        }}
      >
        <Box
          sx={{
            bgcolor: isMine ? "primary.main" : "grey.100",
            color: isMine ? "primary.contrastText" : "text.primary",
            px: 2,
            py: 1,
            borderRadius: 2,
            borderTopRightRadius: isMine ? 4 : 16,
            borderTopLeftRadius: isMine ? 16 : 4,
            wordBreak: "break-word",
          }}
        >
          {message.type === "image" && message.imageUrl && (
            <Box
              component="img"
              src={message.imageUrl}
              alt="Shared image"
              sx={{
                maxWidth: "100%",
                maxHeight: 240,
                borderRadius: 1,
                mb: message.content ? 1 : 0,
                display: "block",
              }}
            />
          )}
          {message.content && (
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {message.content}
            </Typography>
          )}
        </Box>

        {/* Timestamp */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: isMine ? "right" : "left",
            mt: 0.25,
            px: 0.5,
            fontSize: "0.65rem",
          }}
        >
          {formatMessageTime(message.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
}

export default ChatMessage;

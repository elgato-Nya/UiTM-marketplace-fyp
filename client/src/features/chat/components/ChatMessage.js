import React, { memo, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { DeleteOutline as DeleteIcon } from "@mui/icons-material";
import { format, isToday, isYesterday } from "date-fns";
import { generateInitials } from "../utils/participantUtils";

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
 * Single chat message bubble.
 *
 * Uses semantic `<article>` wrapper, proper color contrast based on
 * theme mode, and accessible time labels.
 */
function ChatMessage({
  message,
  isMine = false,
  showAvatar = true,
  senderName = "",
  senderAvatar = null,
  onDelete,
}) {
  const [hovered, setHovered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isSystemMessage = message.type === "system";

  // Determine if this message qualifies for "unsend" (sender + < 15min)
  const ageMs = isMine
    ? Date.now() - new Date(message.createdAt).getTime()
    : Infinity;
  const canUnsend = isMine && ageMs < 15 * 60 * 1000;

  if (isSystemMessage) {
    return (
      <Box
        component="article"
        role="status"
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
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
            px: 2,
            py: 0.5,
            borderRadius: 10,
            fontStyle: "italic",
            fontSize: "0.7rem",
          }}
        >
          {message.content}
        </Typography>
      </Box>
    );
  }

  const initials = generateInitials(senderName);

  return (
    <Box
      component="article"
      aria-label={`Message from ${isMine ? "you" : senderName}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        flexDirection: isMine ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 1,
        px: { xs: 1.5, md: 2.5 },
        py: 0.4,
        maxWidth: "100%",
        position: "relative",
      }}
    >
      {/* Avatar — only for received messages */}
      {!isMine && showAvatar ? (
        <Avatar
          src={senderAvatar}
          alt={senderName}
          sx={{
            width: 30,
            height: 30,
            fontSize: "0.7rem",
            fontWeight: 600,
            bgcolor: senderAvatar ? "transparent" : "primary.main",
            color: "primary.contrastText",
          }}
        >
          {!senderAvatar && initials}
        </Avatar>
      ) : !isMine ? (
        <Box sx={{ width: 30, flexShrink: 0 }} aria-hidden="true" />
      ) : null}

      {/* Bubble + timestamp + delete action container */}
      <Box
        sx={{
          maxWidth: "72%",
          minWidth: 48,
          display: "flex",
          flexDirection: isMine ? "row-reverse" : "row",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {/* Delete action — appears on hover */}
        {onDelete && hovered && (
          <Tooltip title={canUnsend ? "Unsend message" : "Delete for me"}>
            <IconButton
              onClick={() => setConfirmOpen(true)}
              size="small"
              aria-label={
                canUnsend ? "Unsend this message" : "Delete this message"
              }
              sx={{
                width: 28,
                height: 28,
                color: "text.disabled",
                "&:hover": { color: "error.main" },
                flexShrink: 0,
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              px: 1.75,
              py: 1,
              borderRadius: 2.5,
              borderTopRightRadius: isMine ? 4 : 20,
              borderTopLeftRadius: isMine ? 20 : 4,
              wordBreak: "break-word",
              bgcolor: isMine
                ? "primary.main"
                : (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "grey.100",
              color: isMine ? "primary.contrastText" : "text.primary",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "none"
                  : "0 1px 2px rgba(0,0,0,0.06)",
            }}
          >
            {message.type === "image" && message.imageUrl && (
              <Box
                component="img"
                src={message.imageUrl}
                alt="Shared image"
                loading="lazy"
                sx={{
                  maxWidth: "100%",
                  maxHeight: 240,
                  borderRadius: 1.5,
                  mb: message.content ? 1 : 0,
                  display: "block",
                }}
              />
            )}
            {message.content && (
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  fontSize: { xs: "0.85rem", md: "0.875rem" },
                }}
              >
                {message.content}
              </Typography>
            )}
          </Box>

          {/* Timestamp */}
          <Typography
            variant="caption"
            component="time"
            dateTime={message.createdAt}
            color="text.disabled"
            sx={{
              display: "block",
              textAlign: isMine ? "right" : "left",
              mt: 0.25,
              px: 0.5,
              fontSize: "0.625rem",
              letterSpacing: 0.2,
            }}
          >
            {formatMessageTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby={`del-msg-title-${message._id}`}
        aria-describedby={`del-msg-desc-${message._id}`}
        PaperProps={{ sx: { borderRadius: 2.5, maxWidth: 340 } }}
      >
        <DialogTitle id={`del-msg-title-${message._id}`} sx={{ pb: 1 }}>
          {canUnsend ? "Unsend message?" : "Delete message?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id={`del-msg-desc-${message._id}`}>
            {canUnsend
              ? "This message will be removed for everyone in the conversation."
              : "This message will only be hidden from your view."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              onDelete();
            }}
            color="error"
            variant="contained"
            disableElevation
          >
            {canUnsend ? "Unsend" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default memo(ChatMessage);

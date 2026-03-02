import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  DeleteOutline as DeleteIcon,
  Storefront as StoreIcon,
  ChatBubbleOutline as EmptyIcon,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import {
  resolveOtherParticipant,
  resolveListingInfo,
} from "../utils/participantUtils";

/**
 * Chat window — header, scrollable messages area, and input bar.
 *
 * Semantic structure: header → main (messages) → footer (input).
 * ARIA live region for typing indicator. Keyboard-accessible controls.
 */
function ChatWindow({
  conversation,
  messages = [],
  currentUserId,
  isLoadingMessages = false,
  isSubmitting = false,
  onSendMessage,
  onBack,
  onDelete,
  onDeleteMessage,
  onTyping,
  onStopTyping,
  typingUser = "",
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Delete-conversation confirmation dialog state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const scrollToBottom = useCallback((instant = false) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: instant ? "instant" : "smooth",
    });
  }, []);

  // Scroll to bottom when messages change (instant on first load, smooth on new)
  useEffect(() => {
    // Small delay to allow DOM to render new messages
    const id = setTimeout(() => scrollToBottom(isLoadingMessages), 80);
    return () => clearTimeout(id);
  }, [messages.length, scrollToBottom, isLoadingMessages]);

  /* ── Empty state ── */
  if (!conversation) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          bgcolor: "background.default",
          px: 4,
          gap: 2,
        }}
        role="status"
      >
        <EmptyIcon sx={{ fontSize: 48, color: "text.disabled" }} />
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight={600}
            gutterBottom
            sx={{ fontSize: "1.1rem" }}
          >
            Your messages
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Select a conversation to start chatting
          </Typography>
        </Box>
      </Box>
    );
  }

  const participant = resolveOtherParticipant(
    conversation.participants,
    currentUserId,
  );
  const listing = resolveListingInfo(conversation.listing);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* ── Header ── */}
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 1, md: 1.5 },
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          minHeight: { xs: 56, md: 64 },
        }}
      >
        {/* Back button — mobile only */}
        {onBack && (
          <IconButton
            onClick={onBack}
            size="small"
            aria-label="Back to conversations"
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "text.secondary",
              mr: -0.5,
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        {/* Participant avatar */}
        <Avatar
          src={participant.avatar}
          alt={participant.name}
          sx={{
            width: { xs: 36, md: 40 },
            height: { xs: 36, md: 40 },
            bgcolor: participant.avatar ? "transparent" : "primary.main",
            color: "primary.contrastText",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {!participant.avatar && participant.initials}
        </Avatar>

        {/* Name + listing context */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {participant.isMerchant && (
              <StoreIcon
                sx={{ fontSize: 15, color: "primary.main", flexShrink: 0 }}
                aria-label="Merchant"
              />
            )}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              noWrap
              sx={{
                fontSize: { xs: "0.9rem", md: "1rem" },
                lineHeight: 1.3,
              }}
            >
              {participant.name}
            </Typography>
          </Box>
          {listing && (
            <Chip
              label={listing.title}
              size="small"
              variant="outlined"
              sx={{
                mt: 0.25,
                height: 18,
                fontSize: "0.65rem",
                borderColor: "divider",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </Box>

        {/* Delete action */}
        {onDelete && (
          <Tooltip title="Delete conversation">
            <IconButton
              onClick={() => setConfirmDeleteOpen(true)}
              size="small"
              aria-label="Delete conversation"
              sx={{
                color: "text.disabled",
                "&:hover": { color: "error.main" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* ── Delete confirmation dialog ── */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        aria-labelledby="delete-convo-dialog-title"
        aria-describedby="delete-convo-dialog-desc"
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            maxWidth: 360,
          },
        }}
      >
        <DialogTitle id="delete-convo-dialog-title" sx={{ pb: 1 }}>
          Delete conversation?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-convo-dialog-desc">
            This will remove the conversation from your inbox. The other
            participant can still see it.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmDeleteOpen(false);
              onDelete(conversation._id);
            }}
            color="error"
            variant="contained"
            disableElevation
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Messages area ── */}
      <Box
        component="main"
        ref={containerRef}
        role="log"
        aria-label="Message history"
        aria-live="polite"
        sx={{
          flex: 1,
          overflow: "auto",
          py: { xs: 1, md: 2 },
          display: "flex",
          flexDirection: "column",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 2,
          },
        }}
      >
        {isLoadingMessages ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
            role="status"
            aria-label="Loading messages"
          >
            <CircularProgress size={28} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.disabled">
              No messages yet — say hello! 👋
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const senderId =
                typeof msg.sender === "object"
                  ? msg.sender._id || msg.sender.id
                  : msg.sender;
              const isMine = String(senderId) === String(currentUserId);

              const prevMsg = messages[idx - 1];
              const prevSenderId = prevMsg
                ? typeof prevMsg.sender === "object"
                  ? prevMsg.sender._id || prevMsg.sender.id
                  : prevMsg.sender
                : null;
              const showAvatar =
                !isMine && String(senderId) !== String(prevSenderId);

              return (
                <ChatMessage
                  key={msg._id}
                  message={msg}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  senderName={isMine ? "You" : participant.name}
                  senderAvatar={isMine ? null : participant.avatar}
                  onDelete={
                    onDeleteMessage
                      ? () => onDeleteMessage(conversation._id, msg._id)
                      : undefined
                  }
                />
              );
            })}
            <div ref={messagesEndRef} aria-hidden="true" />
          </>
        )}

        {/* Typing indicator — ARIA live region */}
        {typingUser && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 2.5,
              py: 0.5,
            }}
            role="status"
            aria-live="polite"
          >
            <Box sx={{ display: "flex", gap: 0.3, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <DotIcon
                  key={i}
                  sx={{
                    fontSize: 8,
                    color: "text.disabled",
                    animation: "typingDot 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                    "@keyframes typingDot": {
                      "0%, 60%, 100%": { opacity: 0.3, transform: "scale(1)" },
                      "30%": { opacity: 1, transform: "scale(1.3)" },
                    },
                  }}
                />
              ))}
            </Box>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontSize: "0.7rem" }}
            >
              {typingUser} is typing
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Input bar ── */}
      <ChatInput
        onSend={onSendMessage}
        disabled={false}
        isSubmitting={isSubmitting}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
      />
    </Box>
  );
}

export default ChatWindow;

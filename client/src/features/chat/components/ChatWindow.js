import React, { useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  DeleteOutline as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

/**
 * Resolve the "other" participant's display info from a conversation
 */
const getOtherParticipant = (participants, currentUserId) => {
  if (!participants || participants.length === 0) {
    return { name: "Unknown", avatar: null, userId: null };
  }
  const other = participants.find((p) => {
    const pId =
      typeof p.userId === "object" ? p.userId._id || p.userId.id : p.userId;
    return String(pId) !== String(currentUserId);
  });
  if (!other) return { name: "Unknown", avatar: null, userId: null };

  const profile = other.userId?.profile || other.userId;
  const firstName = profile?.firstName || "";
  const lastName = profile?.lastName || "";
  const name =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || other.userId?.email || "User";

  return {
    name,
    avatar: profile?.avatar || null,
    userId:
      typeof other.userId === "object"
        ? other.userId._id || other.userId.id
        : other.userId,
  };
};

/**
 * Chat window — header + scrollable messages + input
 *
 * @param {Object} props
 * @param {Object} props.conversation - Active conversation document
 * @param {Array} props.messages - Messages array
 * @param {string} props.currentUserId - Authenticated user's ID
 * @param {boolean} props.isLoadingMessages - Loading state
 * @param {boolean} props.isSubmitting - Sending state
 * @param {Function} props.onSendMessage - Send handler (receives content string)
 * @param {Function} props.onBack - Back button handler (mobile)
 * @param {Function} props.onDelete - Delete conversation handler
 * @param {Function} props.onTyping - Typing indicator start
 * @param {Function} props.onStopTyping - Typing indicator stop
 * @param {string} props.typingUser - Name of user currently typing (if any)
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
  onTyping,
  onStopTyping,
  typingUser = "",
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

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
          px: 3,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          💬
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Select a conversation to start chatting
        </Typography>
      </Box>
    );
  }

  const other = getOtherParticipant(conversation.participants, currentUserId);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {onBack && (
          <IconButton
            onClick={onBack}
            size="small"
            aria-label="Back to conversations"
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Avatar src={other.avatar} alt={other.name} sx={{ width: 36, height: 36 }}>
          {!other.avatar && <PersonIcon />}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {other.name}
          </Typography>
          {conversation.listing && (
            <Typography variant="caption" color="text.secondary" noWrap>
              Re: {conversation.listing.title || "Listing"}
            </Typography>
          )}
        </Box>

        {onDelete && (
          <Tooltip title="Delete conversation">
            <IconButton
              onClick={() => onDelete(conversation._id)}
              size="small"
              color="error"
              aria-label="Delete conversation"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      {/* Messages area */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          py: 2,
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
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
          >
            <CircularProgress size={28} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No messages yet — say hello!
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

              // Show avatar for first message or when sender changes
              const prevMsg = messages[idx - 1];
              const prevSenderId = prevMsg
                ? typeof prevMsg.sender === "object"
                  ? prevMsg.sender._id || prevMsg.sender.id
                  : prevMsg.sender
                : null;
              const showAvatar = !isMine && String(senderId) !== String(prevSenderId);

              return (
                <ChatMessage
                  key={msg._id}
                  message={msg}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  senderName={isMine ? "You" : other.name}
                  senderAvatar={isMine ? null : other.avatar}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing indicator */}
        {typingUser && (
          <Box sx={{ px: 2, py: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              {typingUser} is typing…
            </Typography>
          </Box>
        )}
      </Box>

      {/* Input */}
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

import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

/**
 * Chat message input with send button
 *
 * @param {Object} props
 * @param {Function} props.onSend - Handler called with message content string
 * @param {boolean} props.disabled - Disable input (e.g., when submitting)
 * @param {boolean} props.isSubmitting - Show loading indicator on send button
 * @param {Function} props.onTyping - Called when user starts typing
 * @param {Function} props.onStopTyping - Called when user stops typing
 */
function ChatInput({
  onSend,
  disabled = false,
  isSubmitting = false,
  onTyping,
  onStopTyping,
}) {
  const [content, setContent] = useState("");
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleTypingStart = useCallback(() => {
    if (!isTypingRef.current && onTyping) {
      isTypingRef.current = true;
      onTyping();
    }

    // Reset the stop-typing timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && onStopTyping) {
        isTypingRef.current = false;
        onStopTyping();
      }
    }, 2000);
  }, [onTyping, onStopTyping]);

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed || disabled || isSubmitting) return;

    // Stop typing indicator
    if (isTypingRef.current && onStopTyping) {
      isTypingRef.current = false;
      onStopTyping();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    onSend(trimmed);
    setContent("");
  }, [content, disabled, isSubmitting, onSend, onStopTyping]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e) => {
      setContent(e.target.value);
      handleTypingStart();
    },
    [handleTypingStart]
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        p: { xs: 1, md: 2 },
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        size="small"
        placeholder="Type a message..."
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Message input"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
          },
        }}
      />
      <Tooltip title="Send message">
        <span>
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!content.trim() || disabled || isSubmitting}
            aria-label="Send message"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SendIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

export default ChatInput;

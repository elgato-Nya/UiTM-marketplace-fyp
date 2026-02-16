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
 * Chat message input bar with send button.
 *
 * Features:
 * - Multiline auto-expand (max 4 rows)
 * - Enter to send, Shift+Enter for new line
 * - Typing indicators via onTyping/onStopTyping callbacks
 * - Accessible labels and keyboard navigation
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

  const canSend = content.trim().length > 0 && !disabled && !isSubmitting;

  return (
    <Box
      component="form"
      role="form"
      aria-label="Message composer"
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        p: { xs: 1.25, md: 2 },
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
        placeholder="Type a message…"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        inputProps={{
          "aria-label": "Type a message",
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.03)",
            "& fieldset": { borderColor: "transparent" },
            "&:hover fieldset": { borderColor: "divider" },
            "&.Mui-focused fieldset": { borderColor: "primary.main" },
          },
        }}
      />
      <Tooltip title={canSend ? "Send message (Enter)" : "Type a message to send"}>
        <span>
          <IconButton
            type="submit"
            color="primary"
            disabled={!canSend}
            aria-label="Send message"
            sx={{
              bgcolor: canSend ? "primary.main" : "action.disabledBackground",
              color: canSend ? "primary.contrastText" : "action.disabled",
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: canSend ? "primary.dark" : "action.disabledBackground",
                transform: canSend ? "scale(1.05)" : "none",
              },
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

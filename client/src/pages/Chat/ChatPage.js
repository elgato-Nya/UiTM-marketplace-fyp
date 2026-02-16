import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Chat as ChatIcon } from "@mui/icons-material";
import { useChat } from "../../features/chat/hooks/useChat";
import { useChatActions } from "../../features/chat/hooks/useChatActions";
import { ChatSidebar, ChatWindow } from "../../features/chat/components";
import { useSocket } from "../../contexts/SocketContext";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import { ROUTES } from "../../constants/routes";

/**
 * ChatPage
 *
 * PURPOSE: Full-screen inbox + conversation view for real-time messaging
 * LAYOUT: Sidebar (conversation list) + Main area (messages) — responsive
 */
const ChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { conversationId: routeConvoId } = useParams();
  const { error: showError } = useSnackbar();
  const { socket, isConnected } = useSocket();

  // Chat state + actions from hooks
  const {
    conversations,
    activeConversation,
    messages,
    currentUserId,
    isLoading,
    isSubmitting,
    isLoadingMessages,
    error,
    loadConversations,
    loadConversation,
    loadMessages,
    sendMessage,
    markAsRead,
    selectConversation,
    deselectConversation,
    clearError,
  } = useChat({ autoFetch: true });

  const { deleteConversation } = useChatActions();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUser, setTypingUser] = useState("");

  // Show mobile sidebar when no active conversation
  const [showSidebar, setShowSidebar] = useState(true);

  // Handle route-based conversation selection (e.g., /chat/:conversationId)
  useEffect(() => {
    if (routeConvoId && routeConvoId !== activeConversation?._id) {
      loadConversation(routeConvoId);
    }
  }, [routeConvoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation?._id) {
      loadMessages(activeConversation._id);
      markAsRead(activeConversation._id);

      if (isMobile) {
        setShowSidebar(false);
      }
    }
  }, [activeConversation?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show error via snackbar
  useEffect(() => {
    if (error?.message) {
      showError(error.message);
      clearError();
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  // Socket typing indicator
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTyping = ({ userId, userName }) => {
      if (String(userId) !== String(currentUserId)) {
        setTypingUser(userName || "Someone");
      }
    };

    const handleStopTyping = ({ userId }) => {
      if (String(userId) !== String(currentUserId)) {
        setTypingUser("");
      }
    };

    socket.on("chat:typing", handleTyping);
    socket.on("chat:stop_typing", handleStopTyping);

    return () => {
      socket.off("chat:typing", handleTyping);
      socket.off("chat:stop_typing", handleStopTyping);
    };
  }, [socket, isConnected, currentUserId]);

  // Handlers
  const handleSelectConversation = useCallback(
    (convo) => {
      selectConversation(convo);
      navigate(ROUTES.CHAT.DETAIL(convo._id), { replace: true });
    },
    [selectConversation, navigate]
  );

  const handleBack = useCallback(() => {
    deselectConversation();
    setShowSidebar(true);
    navigate(ROUTES.CHAT.INDEX, { replace: true });
  }, [deselectConversation, navigate]);

  const handleSendMessage = useCallback(
    async (content) => {
      if (!activeConversation?._id) return;
      await sendMessage(activeConversation._id, { content });
    },
    [activeConversation, sendMessage]
  );

  const handleDeleteConversation = useCallback(
    async (convoId) => {
      const ok = await deleteConversation(convoId);
      if (ok && activeConversation?._id === convoId) {
        deselectConversation();
        if (isMobile) setShowSidebar(true);
      }
    },
    [deleteConversation, activeConversation, deselectConversation, isMobile]
  );

  const handleRefresh = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  const handleTyping = useCallback(() => {
    if (socket && activeConversation?._id) {
      socket.emit("chat:typing", {
        conversationId: activeConversation._id,
      });
    }
  }, [socket, activeConversation]);

  const handleStopTyping = useCallback(() => {
    if (socket && activeConversation?._id) {
      socket.emit("chat:stop_typing", {
        conversationId: activeConversation._id,
      });
    }
  }, [socket, activeConversation]);

  // Responsive layout
  const sidebarWidth = 360;

  return (
    <Box sx={{ py: { xs: 0.5, sm: 2 }, px: { xs: 0.5, sm: 2, md: 3 } }}>
      {/* Page header */}
      <Box sx={{ mb: { xs: 1, md: 2 }, display: "flex", alignItems: "center", gap: 1 }}>
        <ChatIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Chat
        </Typography>
      </Box>

      {/* Main chat container */}
      <Paper
        elevation={1}
        sx={{
          display: "flex",
          height: { xs: "calc(100vh - 140px)", md: "calc(100vh - 200px)" },
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: "100%", md: sidebarWidth },
            minWidth: { md: sidebarWidth },
            display: {
              xs: showSidebar ? "flex" : "none",
              md: "flex",
            },
            flexDirection: "column",
          }}
        >
          <ChatSidebar
            conversations={conversations}
            currentUserId={currentUserId}
            activeConversation={activeConversation}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectConversation={handleSelectConversation}
            onRefresh={handleRefresh}
          />
        </Box>

        {/* Chat window */}
        <Box
          sx={{
            flex: 1,
            display: {
              xs: showSidebar ? "none" : "flex",
              md: "flex",
            },
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            isLoadingMessages={isLoadingMessages}
            isSubmitting={isSubmitting}
            onSendMessage={handleSendMessage}
            onBack={isMobile ? handleBack : undefined}
            onDelete={handleDeleteConversation}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
            typingUser={typingUser}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatPage;

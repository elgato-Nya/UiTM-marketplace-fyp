import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useChat } from "../../features/chat/hooks/useChat";
import { useChatActions } from "../../features/chat/hooks/useChatActions";
import { removeMessage } from "../../features/chat/store/chatSlice";
import { ChatSidebar, ChatWindow } from "../../features/chat/components";
import { useSocket } from "../../contexts/SocketContext";
import { useSnackbarContext as useSnackbar } from "../../contexts/SnackbarContext";
import { ROUTES } from "../../constants/routes";

/**
 * ChatPage
 *
 * Full-screen inbox + conversation view for real-time messaging.
 * Responsive layout: sidebar + main area on desktop, toggle on mobile.
 * Uses semantic HTML structure and ARIA landmarks.
 */
const ChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { conversationId: routeConvoId } = useParams();
  const { error: showError } = useSnackbar();
  const { socket, isConnected } = useSocket();

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

  const { deleteConversation, deleteMessage } = useChatActions();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  // Route-based conversation selection
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
      if (isMobile) setShowSidebar(false);
    }
  }, [activeConversation?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show errors via snackbar
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

  // Socket: real-time message unsend from other participant
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRemoteDelete = ({ messageId, conversationId }) => {
      dispatch(removeMessage({ messageId, conversationId }));
    };

    socket.on("chat:message_deleted", handleRemoteDelete);
    return () => {
      socket.off("chat:message_deleted", handleRemoteDelete);
    };
  }, [socket, isConnected, dispatch]);

  /* ── Handlers ── */

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

  const handleDeleteMessage = useCallback(
    async (conversationId, messageId) => {
      await deleteMessage(conversationId, messageId);
    },
    [deleteMessage]
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

  /* ── Layout constants ── */
  const sidebarWidth = 340;

  return (
    <Box
      component="section"
      aria-label="Chat"
      sx={{
        height: {
          xs: "calc(100dvh - 64px)",
          md: "calc(100dvh - 80px)",
        },
        display: "flex",
        flexDirection: "column",
        px: { xs: 0, sm: 2, md: 3 },
        py: { xs: 0, sm: 2 },
      }}
    >
      {/* Main chat container */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          borderRadius: { xs: 0, sm: 2 },
          border: 1,
          borderColor: { xs: "transparent", sm: "divider" },
          bgcolor: "background.paper",
          minHeight: 0,
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
            minHeight: 0,
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
            minHeight: 0,
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
            onDeleteMessage={handleDeleteMessage}
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

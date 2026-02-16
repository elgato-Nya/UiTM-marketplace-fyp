import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  fetchConversation,
  fetchMessages,
  startConversation,
  sendMessage,
  markConversationAsRead,
  deleteConversation,
  fetchUnreadCount,
  setActiveConversation,
  clearActiveConversation,
  clearError,
  addIncomingMessage,
  updateUnreadCount,
  markMessagesReadLocal,
  selectConversations,
  selectChatPagination,
  selectActiveConversation,
  selectMessages,
  selectMessagePagination,
  selectTotalUnread,
  selectChatLoading,
  selectChatSubmitting,
  selectMessagesLoading,
  selectChatError,
} from "../store/chatSlice";
import { useSocket } from "../../../contexts/SocketContext";
import { useAuth } from "../../auth/hooks/useAuth";

/**
 * Custom hook for chat feature
 *
 * PURPOSE: Manage inbox + active conversation state, wire socket events
 * PATTERN: Matches usePayout / useWishlist hook pattern
 *
 * @param {Object} options - { autoFetch: boolean }
 * @returns {Object} Chat state and action dispatchers
 */
export function useChat(options = {}) {
  const { autoFetch = false } = options;
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  // Selectors
  const conversations = useSelector(selectConversations);
  const pagination = useSelector(selectChatPagination);
  const activeConversation = useSelector(selectActiveConversation);
  const messages = useSelector(selectMessages);
  const messagePagination = useSelector(selectMessagePagination);
  const totalUnread = useSelector(selectTotalUnread);
  const isLoading = useSelector(selectChatLoading);
  const isSubmitting = useSelector(selectChatSubmitting);
  const isLoadingMessages = useSelector(selectMessagesLoading);
  const error = useSelector(selectChatError);

  // Action dispatchers
  const loadConversations = useCallback(
    (params = {}) => {
      dispatch(fetchConversations(params));
    },
    [dispatch]
  );

  const loadConversation = useCallback(
    (conversationId) => {
      return dispatch(fetchConversation(conversationId));
    },
    [dispatch]
  );

  const loadMessages = useCallback(
    (conversationId, params = {}) => {
      return dispatch(fetchMessages({ conversationId, params }));
    },
    [dispatch]
  );

  const handleStartConversation = useCallback(
    (data) => {
      return dispatch(startConversation(data));
    },
    [dispatch]
  );

  const handleSendMessage = useCallback(
    (conversationId, data) => {
      return dispatch(sendMessage({ conversationId, data }));
    },
    [dispatch]
  );

  const handleMarkAsRead = useCallback(
    (conversationId) => {
      return dispatch(markConversationAsRead(conversationId));
    },
    [dispatch]
  );

  const handleDeleteConversation = useCallback(
    (conversationId) => {
      return dispatch(deleteConversation(conversationId));
    },
    [dispatch]
  );

  const loadUnreadCount = useCallback(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const selectConversation = useCallback(
    (conversation) => {
      dispatch(setActiveConversation(conversation));
    },
    [dispatch]
  );

  const deselectConversation = useCallback(() => {
    dispatch(clearActiveConversation());
  }, [dispatch]);

  const clearChatError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Auto-fetch inbox on mount
  useEffect(() => {
    if (autoFetch) {
      loadConversations();
      loadUnreadCount();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Socket event listeners for real-time chat
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleIncomingMessage = (message) => {
      dispatch(addIncomingMessage(message));
    };

    const handleUnreadUpdate = (data) => {
      dispatch(updateUnreadCount(data));
    };

    const handleMessagesRead = (data) => {
      dispatch(
        markMessagesReadLocal({
          conversationId: data.conversationId,
          userId: data.userId,
        })
      );
    };

    socket.on("chat:message", handleIncomingMessage);
    socket.on("chat:unread_update", handleUnreadUpdate);
    socket.on("chat:messages_read", handleMessagesRead);

    return () => {
      socket.off("chat:message", handleIncomingMessage);
      socket.off("chat:unread_update", handleUnreadUpdate);
      socket.off("chat:messages_read", handleMessagesRead);
    };
  }, [socket, isConnected, dispatch]);

  // Join/leave conversation room when active conversation changes
  useEffect(() => {
    if (!socket || !isConnected || !activeConversation) return;

    const conversationId = activeConversation._id;
    socket.emit("chat:join", { conversationId });

    return () => {
      socket.emit("chat:leave", { conversationId });
    };
  }, [socket, isConnected, activeConversation]);

  return {
    // State
    conversations,
    pagination,
    activeConversation,
    messages,
    messagePagination,
    totalUnread,
    isLoading,
    isSubmitting,
    isLoadingMessages,
    error,
    currentUserId: user?._id || user?.id,

    // Actions
    loadConversations,
    loadConversation,
    loadMessages,
    startConversation: handleStartConversation,
    sendMessage: handleSendMessage,
    markAsRead: handleMarkAsRead,
    deleteConversation: handleDeleteConversation,
    loadUnreadCount,
    selectConversation,
    deselectConversation,
    clearError: clearChatError,

    // Socket state
    isSocketConnected: isConnected,
  };
}

import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbarContext as useSnackbar } from "../../../contexts/SnackbarContext";
import {
  startConversation,
  sendMessage,
  markConversationAsRead,
  deleteConversation,
  selectChatSubmitting,
} from "../store/chatSlice";

/**
 * Custom hook for chat mutation actions with snackbar feedback
 *
 * PURPOSE: Provide action handlers with user feedback (snackbar)
 * PATTERN: Matches useQuoteActions / usePayoutActions convention
 */
export function useChatActions() {
  const dispatch = useDispatch();
  const { showSnackbar } = useSnackbar();
  const isSubmitting = useSelector(selectChatSubmitting);
  const [actionLoading, setActionLoading] = useState(null);

  const handleStartConversation = useCallback(
    async (data) => {
      setActionLoading("start");
      try {
        const result = await dispatch(startConversation(data)).unwrap();
        return result;
      } catch (error) {
        const isAuthError =
          error?.type === "authentication" || error?.statusCode === 401;
        const userMsg = isAuthError
          ? "Your session has expired. Please log in again."
          : error?.message || "Failed to start conversation";
        showSnackbar(userMsg, "error");
        return null;
      } finally {
        setActionLoading(null);
      }
    },
    [dispatch, showSnackbar]
  );

  const handleSendMessage = useCallback(
    async (conversationId, data) => {
      try {
        const result = await dispatch(
          sendMessage({ conversationId, data })
        ).unwrap();
        return result;
      } catch (error) {
        showSnackbar(
          error?.message || "Failed to send message",
          "error"
        );
        return null;
      }
    },
    [dispatch, showSnackbar]
  );

  const handleMarkAsRead = useCallback(
    async (conversationId) => {
      try {
        await dispatch(markConversationAsRead(conversationId)).unwrap();
        return true;
      } catch (error) {
        // Silently fail — not critical to UX
        console.debug("Failed to mark as read:", error);
        return false;
      }
    },
    [dispatch]
  );

  const handleDeleteConversation = useCallback(
    async (conversationId) => {
      setActionLoading("delete");
      try {
        await dispatch(deleteConversation(conversationId)).unwrap();
        showSnackbar("Conversation deleted", "success");
        return true;
      } catch (error) {
        showSnackbar(
          error?.message || "Failed to delete conversation",
          "error"
        );
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [dispatch, showSnackbar]
  );

  return {
    isSubmitting,
    actionLoading,
    startConversation: handleStartConversation,
    sendMessage: handleSendMessage,
    markAsRead: handleMarkAsRead,
    deleteConversation: handleDeleteConversation,
  };
}

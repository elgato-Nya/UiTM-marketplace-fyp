import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "../service/chatService";
import { extractThunkError } from "../../../store/utils/thunkErrorHandler";

/**
 * Chat Slice
 *
 * PURPOSE: Manage chat state — conversations (inbox), active conversation, messages
 * PATTERN: Matches payout/quote/wishlist slice conventions
 */

const initialState = {
  conversations: [],
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    total: 0,
  },
  activeConversation: null,
  messages: [],
  messagePagination: {
    page: 1,
    limit: 50,
    totalPages: 1,
    total: 0,
  },
  totalUnread: 0,
  isLoading: false,
  isSubmitting: false,
  isLoadingMessages: false,
  error: null,
};

// --- Async thunks ---

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (params, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load conversations")
      );
    }
  }
);

export const fetchConversation = createAsyncThunk(
  "chat/fetchConversation",
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversation(conversationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load conversation")
      );
    }
  }
);

export const startConversation = createAsyncThunk(
  "chat/startConversation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await chatService.startConversation(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to start conversation")
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, data }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(conversationId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to send message")
      );
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conversationId, params }, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(conversationId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load messages")
      );
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  "chat/markAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await chatService.markAsRead(conversationId);
      return { ...response.data, conversationId };
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to mark conversation as read")
      );
    }
  }
);

export const deleteConversation = createAsyncThunk(
  "chat/deleteConversation",
  async (conversationId, { rejectWithValue }) => {
    try {
      await chatService.deleteConversation(conversationId);
      return { conversationId };
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to delete conversation")
      );
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "chat/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getUnreadCount();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        extractThunkError(error, "Failed to load unread count")
      );
    }
  }
);

// --- Slice ---

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    clearActiveConversation: (state) => {
      state.activeConversation = null;
      state.messages = [];
      state.messagePagination = initialState.messagePagination;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChatState: () => initialState,

    // Real-time reducers — called from socket event handlers
    addIncomingMessage: (state, action) => {
      const msg = action.payload;

      // Add to messages list if viewing this conversation
      if (
        state.activeConversation &&
        state.activeConversation._id === msg.conversationId
      ) {
        const exists = state.messages.some((m) => m._id === msg._id);
        if (!exists) {
          state.messages.push(msg);
        }
      }

      // Update conversation's lastMessage in the inbox
      const convoIdx = state.conversations.findIndex(
        (c) => c._id === msg.conversationId
      );
      if (convoIdx !== -1) {
        state.conversations[convoIdx].lastMessage = {
          content: msg.content,
          sender: msg.sender,
          createdAt: msg.createdAt,
        };
        // Move to top of list
        const [updated] = state.conversations.splice(convoIdx, 1);
        state.conversations.unshift(updated);
      }
    },
    updateUnreadCount: (state, action) => {
      const { totalUnread } = action.payload;
      if (typeof totalUnread === "number") {
        state.totalUnread = totalUnread;
      }
    },
    markMessagesReadLocal: (state, action) => {
      const { conversationId, userId } = action.payload;

      // Update conversation unread count to 0
      const convo = state.conversations.find((c) => c._id === conversationId);
      if (convo) {
        const participant = convo.participants?.find(
          (p) => (p.userId?._id || p.userId) === userId
        );
        if (participant) {
          participant.unreadCount = 0;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        state.conversations = data.conversations || [];
        state.pagination = {
          page: data.page || 1,
          limit: data.limit || 20,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
        };
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchConversation
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeConversation =
          action.payload.conversation || action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // startConversation
      .addCase(startConversation.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const conversation =
          action.payload.conversation || action.payload;
        state.activeConversation = conversation;

        // Prepend to inbox if not already there
        const existsInList = state.conversations.some(
          (c) => c._id === conversation._id
        );
        if (!existsInList) {
          state.conversations.unshift(conversation);
        }
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const message = action.payload.message || action.payload;
        const exists = state.messages.some((m) => m._id === message._id);
        if (!exists) {
          state.messages.push(message);
        }

        // Update lastMessage for the conversation in inbox
        const convoIdx = state.conversations.findIndex(
          (c) => c._id === message.conversationId
        );
        if (convoIdx !== -1) {
          state.conversations[convoIdx].lastMessage = {
            content: message.content,
            sender: message.sender,
            createdAt: message.createdAt,
          };
          const [updated] = state.conversations.splice(convoIdx, 1);
          state.conversations.unshift(updated);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        const data = action.payload;
        state.messages = data.messages || [];
        state.messagePagination = {
          page: data.page || 1,
          limit: data.limit || 50,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload;
      })

      // markConversationAsRead
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const convo = state.conversations.find(
          (c) => c._id === conversationId
        );
        if (convo) {
          convo.participants?.forEach((p) => {
            if (p.unreadCount !== undefined) {
              p.unreadCount = 0;
            }
          });
        }
      })

      // deleteConversation
      .addCase(deleteConversation.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const { conversationId } = action.payload;
        state.conversations = state.conversations.filter(
          (c) => c._id !== conversationId
        );
        if (state.activeConversation?._id === conversationId) {
          state.activeConversation = null;
          state.messages = [];
        }
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.totalUnread = action.payload.totalUnread ?? 0;
      });
  },
});

export const {
  setActiveConversation,
  clearActiveConversation,
  clearError,
  resetChatState,
  addIncomingMessage,
  updateUnreadCount,
  markMessagesReadLocal,
} = chatSlice.actions;

// --- Selectors ---
export const selectConversations = (state) => state.chat.conversations;
export const selectChatPagination = (state) => state.chat.pagination;
export const selectActiveConversation = (state) =>
  state.chat.activeConversation;
export const selectMessages = (state) => state.chat.messages;
export const selectMessagePagination = (state) =>
  state.chat.messagePagination;
export const selectTotalUnread = (state) => state.chat.totalUnread;
export const selectChatLoading = (state) => state.chat.isLoading;
export const selectChatSubmitting = (state) => state.chat.isSubmitting;
export const selectMessagesLoading = (state) => state.chat.isLoadingMessages;
export const selectChatError = (state) => state.chat.error;

export default chatSlice.reducer;

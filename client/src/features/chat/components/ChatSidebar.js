import React from "react";
import {
  Box,
  List,
  Typography,
  TextField,
  InputAdornment,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import ConversationItem from "./ConversationItem";

/**
 * Chat sidebar — shows inbox conversation list with search
 *
 * @param {Object} props
 * @param {Array} props.conversations - List of conversation objects
 * @param {string} props.currentUserId - Authenticated user ID
 * @param {Object|null} props.activeConversation - Currently selected conversation
 * @param {boolean} props.isLoading - Whether conversations are loading
 * @param {string} props.searchQuery - Current search filter
 * @param {Function} props.onSearchChange - Search input change handler
 * @param {Function} props.onSelectConversation - Conversation click handler
 * @param {Function} props.onRefresh - Refresh button handler
 */
function ChatSidebar({
  conversations = [],
  currentUserId,
  activeConversation = null,
  isLoading = false,
  searchQuery = "",
  onSearchChange,
  onSelectConversation,
  onRefresh,
}) {
  // Client-side filter by participant name or listing title
  const filtered = conversations.filter((convo) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    // Search in participant names
    const nameMatch = convo.participants?.some((p) => {
      const profile = p.userId?.profile || p.userId;
      const fullName =
        `${profile?.firstName || ""} ${profile?.lastName || ""}`.toLowerCase();
      return fullName.includes(query);
    });

    // Search in listing title
    const listingMatch = convo.listing?.title
      ?.toLowerCase()
      .includes(query);

    // Search in last message content
    const messageMatch = convo.lastMessage?.content
      ?.toLowerCase()
      .includes(query);

    return nameMatch || listingMatch || messageMatch;
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Messages
        </Typography>
        {onRefresh && (
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh conversations"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          aria-label="Search conversations"
        />
      </Box>

      <Divider />

      {/* Conversation list */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              px: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              {searchQuery
                ? "No conversations match your search"
                : "No conversations yet"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filtered.map((convo) => (
              <React.Fragment key={convo._id}>
                <ConversationItem
                  conversation={convo}
                  currentUserId={currentUserId}
                  isSelected={activeConversation?._id === convo._id}
                  onClick={() => onSelectConversation(convo)}
                />
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}

export default ChatSidebar;

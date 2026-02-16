import React from "react";
import {
  Box,
  List,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ChatBubbleOutline as EmptyIcon,
} from "@mui/icons-material";
import ConversationItem from "./ConversationItem";

/**
 * Chat sidebar — inbox conversation list with search.
 *
 * Uses semantic list/role="listbox" for assistive technology, proper
 * ARIA labelling, and responsive spacing from the app theme.
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
  // Client-side filter by participant username / listing name / message content
  const filtered = conversations.filter((convo) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    const nameMatch = convo.participants?.some((p) => {
      const profile = p.userId?.profile || {};
      const merchant = p.userId?.merchantDetails || {};
      const combined = [
        profile.username,
        merchant.shopName,
        p.userId?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return combined.includes(q);
    });

    const listingMatch = (convo.listing?.name || convo.listing?.title || "")
      .toLowerCase()
      .includes(q);

    const messageMatch = (convo.lastMessage?.content || "")
      .toLowerCase()
      .includes(q);

    return nameMatch || listingMatch || messageMatch;
  });

  return (
    <Box
      component="aside"
      aria-label="Conversations"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          fontWeight={700}
          sx={{ fontSize: { xs: "1.05rem", md: "1.15rem" } }}
        >
          Messages
        </Typography>
        {onRefresh && (
          <Tooltip title="Refresh conversations">
            <span>
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={isLoading}
                aria-label="Refresh conversations"
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                <RefreshIcon
                  fontSize="small"
                  sx={{
                    animation: isLoading ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
          inputProps={{
            "aria-label": "Search conversations",
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.03)",
              borderRadius: 2,
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "divider" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
          }}
        />
      </Box>

      {/* Conversation list */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 2,
          },
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
            role="status"
            aria-label="Loading conversations"
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
              py: 8,
              px: 3,
              gap: 1.5,
            }}
          >
            <EmptyIcon sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ maxWidth: 200 }}
            >
              {searchQuery
                ? "No conversations match your search"
                : "No conversations yet. Start one from a listing page!"}
            </Typography>
          </Box>
        ) : (
          <List
            role="listbox"
            aria-label="Conversation list"
            disablePadding
            sx={{ py: 0.5 }}
          >
            {filtered.map((convo) => (
              <ConversationItem
                key={convo._id}
                conversation={convo}
                currentUserId={currentUserId}
                isSelected={activeConversation?._id === convo._id}
                onClick={() => onSelectConversation(convo)}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}

export default ChatSidebar;

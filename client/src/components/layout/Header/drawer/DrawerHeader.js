import React from "react";
import { Box, Avatar, Typography } from "@mui/material";

function DrawerHeader({ theme, isAuthenticated, user }) {
  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        🎓 UiTM Marketplace
      </Typography>
      {isAuthenticated && user && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.contrastText,
              color: theme.palette.primary.main,
              width: 32,
              height: 32,
            }}
          >
            {user?.profile?.username
              ? user.profile.username.charAt(0).toUpperCase()
              : user?.email
                ? user.email.charAt(0).toUpperCase()
                : "U"}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.profile?.username || "User"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default DrawerHeader;

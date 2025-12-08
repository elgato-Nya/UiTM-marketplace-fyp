import { Box, Avatar, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

function DrawerHeader({ theme, isAuthenticated, user, onClose }) {
  return (
    <Box
      sx={{
        mt: "55px",
        p: 2,
        py: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: theme.palette.primary.contrastText,
        position: "relative",
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.primary.contrastText,
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
        size="small"
      >
        <CloseIcon />
      </IconButton>

      {isAuthenticated && user && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={user?.profile?.avatar}
            alt={user?.profile?.username || user?.email}
            sx={{
              bgcolor: theme.palette.primary.contrastText,
              color: theme.palette.primary.main,
              width: 40,
              height: 40,
              fontWeight: "bold",
            }}
          >
            {user?.profile?.username
              ? user.profile.username.charAt(0).toUpperCase()
              : user?.email
                ? user.email.charAt(0).toUpperCase()
                : "U"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.profile?.username || "User"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.9,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>
      )}

      {!isAuthenticated && (
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Welcome!
        </Typography>
      )}
    </Box>
  );
}

export default DrawerHeader;

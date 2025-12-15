import { Box, Container, Paper, Typography, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Link, Outlet } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import { Logo } from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";

function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
        position: "relative",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 4 },
      }}
    >
      {/* Header with theme toggle */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: { xs: 1.5, sm: 2 },
          zIndex: 10,
        }}
      >
        <IconButton
          component={Link}
          to="/"
          sx={{
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
          size="small"
        >
          <ArrowBack />
        </IconButton>
        <Box
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Logo
            variant="horizontal"
            type="platform"
            height={{ xs: 24, sm: 28 }}
          />
        </Box>

        <ThemeToggle />
      </Box>

      {/* Main Auth Content */}
      <Container
        maxWidth="sm"
        sx={{
          width: "100%",
          my: 6,
          px: { xs: 0, sm: 2 },
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: { xs: 2.5, sm: 3, md: 4 },
            borderRadius: { xs: 2, sm: 3 },
            backgroundColor: theme.palette.background.bold,
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
            maxWidth: "100%",
          }}
        >
          <Outlet />
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 8, sm: 16 },
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          © {new Date().getFullYear()} MarKet. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default AuthLayout;

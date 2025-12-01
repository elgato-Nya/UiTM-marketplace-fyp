import React from "react";
import { Box, Container, Paper, Typography, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";
import ThemeToggle from "../common/ThemeToggle";

function AuthLayout() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
        position: "relative",
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
          p: 2,
        }}
      >
        <IconButton
          component={Link}
          to="/"
          sx={{ color: theme.palette.text.primary }}
        >
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: theme.palette.primary.main,
            fontWeight: "bold",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          UiTM Marketplace
        </Typography>

        <ThemeToggle />
      </Box>

      {/* Main Auth Content */}
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Outlet />
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} UiTM Marketplace. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default AuthLayout;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import {
  Warning,
  ArrowForward,
  Close,
  Store,
  Person,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { ROUTES } from "../../../constants/routes";

/**
 * PendingVerifications Component
 *
 * PURPOSE: Alert banner for pending merchant verifications
 * FEATURES:
 * - Alert banner with count
 * - Quick action button to verification page
 * - Dismissible alert
 * - Auto-show on mount if pending items exist
 *
 * ACCESSIBILITY:
 * - role="alert" for urgent notifications
 * - ARIA labels for actions
 * - Semantic HTML structure
 * - Keyboard navigation
 *
 * RESPONSIVE:
 * - Stacks on mobile
 * - Full width on small screens
 * - Compact spacing
 */
const PendingVerifications = ({
  pendingCount,
  merchantsPending,
  usersPending,
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  // Don't show if no pending items
  if (!pendingCount || pendingCount === 0) {
    return null;
  }

  const handleNavigate = () => {
    navigate(ROUTES.ADMIN.MERCHANT);
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  return (
    <Collapse in={isOpen}>
      <Alert
        severity="warning"
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        icon={<Warning />}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              color="inherit"
              size="small"
              endIcon={<ArrowForward />}
              onClick={handleNavigate}
              aria-label={`Review ${pendingCount} pending verification${
                pendingCount > 1 ? "s" : ""
              }`}
              sx={{
                fontWeight: 600,
                display: { xs: "none", sm: "flex" },
                textTransform: "none",
              }}
            >
              Review Now
            </Button>
            <IconButton
              aria-label="Dismiss verification alert"
              color="inherit"
              size="small"
              onClick={handleDismiss}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{
          mb: 3,
          border: `1px solid ${theme.palette.warning.main}`,
          backgroundColor: theme.palette.warning.light + "10",
          "& .MuiAlert-icon": {
            fontSize: 28,
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          Pending Verifications Require Attention
        </AlertTitle>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mt: 1 }}
        >
          {/* Summary Text */}
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.warning.dark,
              fontWeight: 500,
            }}
          >
            You have{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              {pendingCount}
            </Box>{" "}
            pending verification{pendingCount > 1 ? "s" : ""} waiting for review
          </Typography>

          {/* Breakdown Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {merchantsPending > 0 && (
              <Chip
                icon={<Store sx={{ fontSize: 16 }} />}
                label={`${merchantsPending} Merchant${merchantsPending > 1 ? "s" : ""}`}
                size="small"
                sx={{
                  fontWeight: 600,
                  backgroundColor: theme.palette.warning.main + "20",
                  color: theme.palette.warning.dark,
                  height: 28,
                }}
                aria-label={`${merchantsPending} merchant verification${
                  merchantsPending > 1 ? "s" : ""
                } pending`}
              />
            )}

            {usersPending > 0 && (
              <Chip
                icon={<Person sx={{ fontSize: 16 }} />}
                label={`${usersPending} User${usersPending > 1 ? "s" : ""}`}
                size="small"
                sx={{
                  fontWeight: 600,
                  backgroundColor: theme.palette.warning.main + "20",
                  color: theme.palette.warning.dark,
                  height: 28,
                }}
                aria-label={`${usersPending} user verification${usersPending > 1 ? "s" : ""} pending`}
              />
            )}
          </Stack>

          {/* Mobile Action Button */}
          <Button
            color="inherit"
            size="small"
            endIcon={<ArrowForward />}
            onClick={handleNavigate}
            aria-label={`Review ${pendingCount} pending verification${pendingCount > 1 ? "s" : ""}`}
            sx={{
              fontWeight: 600,
              display: { xs: "flex", sm: "none" },
              textTransform: "none",
              mt: { xs: 1, sm: 0 },
            }}
          >
            Review Now
          </Button>
        </Stack>
      </Alert>
    </Collapse>
  );
};

export default PendingVerifications;

import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  alpha,
} from "@mui/material";
import { CheckCircle, Close as CloseIcon } from "@mui/icons-material";
import { useTheme as useAppTheme } from "../../../hooks/useTheme";

/**
 * RegistrationSuccessModal Component
 *
 * Clean, minimalist modal for registration success feedback.
 * Shows account creation success and email verification instructions.
 *
 * @param {boolean} open - Whether modal is open
 * @param {function} onClose - Callback when modal closes
 * @param {string} email - Email address where verification was sent
 * @param {boolean} isLoading - Whether registration is in progress
 */
const RegistrationSuccessModal = ({
  open,
  onClose,
  email = "",
  isLoading = false,
}) => {
  const { theme } = useAppTheme();

  // Loading state
  if (isLoading) {
    return (
      <Dialog
        open={open}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
            },
          },
        }}
      >
        <DialogContent sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress
            size={40}
            thickness={4}
            sx={{ color: theme.palette.primary.main, mb: 2 }}
          />
          <Typography variant="body1" color="text.primary" fontWeight={500}>
            Creating your account...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
          },
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "text.secondary",
          "&:hover": {
            bgcolor: alpha(theme.palette.text.primary, 0.05),
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ p: 4, pt: 5 }}>
        {/* Success Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.success.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2.5,
          }}
        >
          <CheckCircle
            sx={{
              fontSize: 24,
              color: theme.palette.success.main,
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          fontWeight={600}
          color="text.primary"
          align="center"
          sx={{ mb: 1 }}
        >
          Account Created
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          We've sent a verification link to your email. Please check your inbox
          and click the link to activate your account.
        </Typography>

        {/* Email Display */}
        {email && (
          <Box
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              mb: 2,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={500}
              color="text.primary"
              align="center"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email}
            </Typography>
          </Box>
        )}

        {/* Helper Text */}
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
          sx={{ lineHeight: 1.5 }}
        >
          Didn't receive it? Check your spam folder or request a new link from
          the login page.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationSuccessModal;

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Email,
  Phone,
  School,
  LocationOn,
  CalendarToday,
  AccessTime,
  Close,
  Store,
  VerifiedUser,
  Block,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useTheme } from "../../../hooks/useTheme";
import UserStatusBadge from "./UserStatusBadge";
import { getCampusLabel, getFacultyLabel } from "../../../utils/formatUtils";

/**
 * UserDetailModal Component
 *
 * PURPOSE: Display comprehensive user information in a modal dialog
 * FEATURES:
 * - User profile (avatar, username, bio)
 * - Contact information (email, phone)
 * - Academic info (campus, faculty)
 * - Roles and status
 * - Suspension details (if suspended)
 * - Merchant information (if applicable)
 * - Account timestamps
 * - Email verification status
 *
 * PROPS:
 * - open: Boolean dialog open state
 * - onClose: Close handler
 * - user: User object with full details
 *
 * ACCESSIBILITY:
 * - Proper dialog semantics
 * - Descriptive ARIA labels
 * - Clear visual hierarchy
 * - Icon + text for all information
 * - Keyboard navigation
 */
const UserDetailModal = ({ open, onClose, user }) => {
  const { theme } = useTheme();

  if (!user) return null;

  const isEmailVerified = user.emailVerification?.isVerified;
  const isMerchant = user.roles?.includes("merchant");
  const isSuspended = user.isSuspended;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="user-detail-dialog-title"
      aria-describedby="user-detail-dialog-description"
      PaperProps={{
        sx: {
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle id="user-detail-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, pr: 6 }}>
          <Avatar
            src={user.profile?.avatar}
            sx={{ width: 64, height: 64 }}
            alt={`${user.profile?.username}'s avatar`}
          >
            {user.profile?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {user.profile?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              User ID: {user._id}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers id="user-detail-dialog-description">
        <Stack spacing={3}>
          {/* Status & Roles Section */}
          <section aria-labelledby="status-heading">
            <Typography
              id="status-heading"
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Status & Roles
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              <UserStatusBadge
                isActive={user.isActive}
                isSuspended={user.isSuspended}
              />
              {user.roles?.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  color={
                    role === "admin"
                      ? "secondary"
                      : role === "merchant"
                        ? "primary"
                        : "default"
                  }
                  size="small"
                  sx={{ textTransform: "capitalize", fontWeight: 600 }}
                />
              ))}
              {isEmailVerified ? (
                <Chip
                  icon={<VerifiedUser sx={{ fontSize: 16 }} />}
                  label="Email Verified"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<Email sx={{ fontSize: 16 }} />}
                  label="Email Not Verified"
                  color="warning"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </section>

          <Divider />

          {/* Suspension Details - Only show if suspended */}
          {isSuspended && (
            <>
              <Card
                sx={{
                  backgroundColor: theme.palette.error.light + "15",
                  border: `1px solid ${theme.palette.error.main}`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Block
                      sx={{ color: theme.palette.error.main, fontSize: 20 }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: theme.palette.error.main }}
                    >
                      Suspension Details
                    </Typography>
                  </Box>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Reason
                      </Typography>
                      <Typography variant="body2">
                        {user.suspensionReason || "No reason provided"}
                      </Typography>
                    </Box>
                    {user.suspendedAt && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Suspended On
                        </Typography>
                        <Typography variant="body2">
                          {user.suspendedAt
                            ? format(new Date(user.suspendedAt), "PPpp")
                            : "N/A"}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
              <Divider />
            </>
          )}

          {/* Personal Information */}
          <section aria-labelledby="personal-info-heading">
            <Typography
              id="personal-info-heading"
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Personal Information
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Email sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Phone sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body2">
                      {user.profile?.phoneNumber || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {user.profile?.bio && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Bio
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {user.profile.bio}
                </Typography>
              </Box>
            )}
          </section>

          <Divider />

          {/* Academic Information */}
          <section aria-labelledby="academic-info-heading">
            <Typography
              id="academic-info-heading"
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Academic Information
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <LocationOn sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Campus
                    </Typography>
                    <Typography variant="body2">
                      {getCampusLabel(user.profile?.campus)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <School sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Faculty
                    </Typography>
                    <Typography variant="body2">
                      {getFacultyLabel(user.profile?.faculty)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </section>

          <Divider />

          {/* Merchant Information - Only show if user is a merchant */}
          {isMerchant && user.merchantDetails && (
            <>
              <section aria-labelledby="merchant-info-heading">
                <Typography
                  id="merchant-info-heading"
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  Merchant Information
                </Typography>
                <Box sx={{ mt: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Store sx={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Shop Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.merchantDetails.shopName || "Not set"}
                      </Typography>
                    </Box>
                  </Box>
                  {user.merchantDetails.shopDescription && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Shop Description
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {user.merchantDetails.shopDescription}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </section>
              <Divider />
            </>
          )}

          {/* Account Activity */}
          <section aria-labelledby="activity-heading">
            <Typography
              id="activity-heading"
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Account Activity
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CalendarToday sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Joined
                    </Typography>
                    <Typography variant="body2">
                      {user.createdAt
                        ? format(new Date(user.createdAt), "PPP")
                        : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <AccessTime sx={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Active
                    </Typography>
                    <Typography variant="body2">
                      {user.lastActive
                        ? format(new Date(user.lastActive), "PPP")
                        : "Never"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </section>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailModal;

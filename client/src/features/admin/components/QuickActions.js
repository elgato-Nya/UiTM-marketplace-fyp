import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  People,
  Store,
  VerifiedUser,
  ContactMail,
  Assessment,
  LocalOffer,
  AttachMoney,
  Chat,
  ArrowForward,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { ROUTES } from "../../../constants/routes";

/**
 * QuickActions Component
 *
 * PURPOSE: Quick navigation to main admin features
 * FEATURES:
 * - Navigate to User Management
 * - Navigate to Merchant Verification
 * - Navigate to Contact Management
 * - Navigate to Reports
 * - Icon buttons with tooltips
 *
 * ACCESSIBILITY:
 * - Semantic HTML structure
 * - ARIA labels for navigation buttons
 * - Keyboard navigation support
 * - Tooltips for additional context
 *
 * RESPONSIVE:
 * - Grid layout (2 columns on mobile, 4 on desktop)
 * - Stacked on small screens
 * - Touch-friendly button size
 */
const QuickActions = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const actions = [
    {
      label: "User Management",
      description: "View and manage all users",
      icon: People,
      path: ROUTES.ADMIN.USERS,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + "20",
    },
    {
      label: "Merchant Verification",
      description: "Review pending merchant applications",
      icon: VerifiedUser,
      path: ROUTES.ADMIN.MERCHANT,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light + "20",
      badge: null, // Will be populated from pending count
    },
    {
      label: "Contact Messages",
      description: "Respond to customer inquiries",
      icon: ContactMail,
      path: ROUTES.ADMIN.CONTACTS,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light + "20",
    },
    {
      label: "Analytics & Reports",
      description: "View platform analytics",
      icon: Assessment,
      path: ROUTES.ADMIN.REPORTS,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + "20",
    },
    {
      label: "Manage Listings",
      description: "Review and moderate listings",
      icon: LocalOffer,
      path: ROUTES.ADMIN.LISTINGS,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light + "20",
    },
    {
      label: "Transactions",
      description: "View all platform transactions",
      icon: AttachMoney,
      path: ROUTES.ADMIN.TRANSACTIONS,
      color: theme.palette.error.main,
      bgColor: theme.palette.error.light + "20",
    },
    {
      label: "Order Management",
      description: "Manage orders and disputes",
      icon: Store,
      path: ROUTES.ADMIN.ORDERS,
      color: "#9c27b0", // Purple
      bgColor: "#9c27b020",
    },
    {
      label: "Support Tickets",
      description: "Handle support requests",
      icon: Chat,
      path: ROUTES.ADMIN.SUPPORT,
      color: "#00bcd4", // Cyan
      bgColor: "#00bcd420",
    },
  ];

  const handleActionClick = (path) => {
    navigate(path);
  };

  return (
    <Card
      component="section"
      elevation={0}
      aria-labelledby="quick-actions-heading"
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography
          id="quick-actions-heading"
          variant="h6"
          sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 3 }}
        >
          Quick Actions
        </Typography>

        <Grid
          container
          spacing={2}
          component="nav"
          role="navigation"
          aria-label="Quick navigation to admin features"
        >
          {actions.map((action, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <Tooltip
                title={action.description}
                placement="top"
                arrow
                enterDelay={300}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleActionClick(action.path)}
                  aria-label={`${action.label} - ${action.description}`}
                  sx={{
                    height: { xs: 100, sm: 120 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1.5,
                    border: `2px solid ${theme.palette.divider}`,
                    backgroundColor: action.bgColor,
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      border: `2px solid ${action.color}`,
                      backgroundColor: action.bgColor,
                      transform: "translateY(-4px)",
                      boxShadow: `0 4px 12px ${action.color}40`,
                    },
                    "&:focus-visible": {
                      outline: `3px solid ${action.color}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  {/* Icon Container */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      borderRadius: 2,
                      backgroundColor: action.color + "30",
                      transition: "transform 0.3s ease",
                      "button:hover &": {
                        transform: "scale(1.1)",
                      },
                    }}
                    role="img"
                    aria-label={`${action.label} icon`}
                  >
                    <action.icon
                      sx={{
                        fontSize: { xs: 24, sm: 28 },
                        color: action.color,
                      }}
                    />
                  </Box>

                  {/* Label */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      textAlign: "center",
                      lineHeight: 1.2,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    {action.label}
                  </Typography>

                  {/* Arrow indicator */}
                  <ArrowForward
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      fontSize: 16,
                      color: action.color,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                      "button:hover &": {
                        opacity: 1,
                      },
                    }}
                    aria-hidden="true"
                  />
                </Button>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;

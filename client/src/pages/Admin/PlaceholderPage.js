import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { Construction, ArrowBack } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

/**
 * PlaceholderPage Component
 *
 * PURPOSE: Generic "Coming Soon" page for admin features under development
 * USAGE: Displayed when navigating to unimplemented admin routes
 */
const PlaceholderPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract feature name from path
  const getFeatureName = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    // Convert kebab-case or camelCase to Title Case
    return lastSegment
      .replace(/-/g, " ")
      .replace(/([A-Z])/g, " $1")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const featureName = getFeatureName();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          textAlign: "center",
        }}
      >
        <CardContent sx={{ py: 8, px: 4 }}>
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: theme.palette.primary.main + "15",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Construction
                sx={{
                  fontSize: 64,
                  color: theme.palette.primary.main,
                }}
              />
            </Box>
          </Box>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            {featureName}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
              mb: 2,
            }}
          >
            Coming Soon
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
              maxWidth: 500,
              mx: "auto",
            }}
          >
            This feature is currently under development and will be available in
            the next update. We're working hard to bring you the best admin
            experience possible.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Go Back
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/dashboard")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Back to Dashboard
            </Button>
          </Box>

          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              Expected in Phase 1.2 - Phase 1.4 (User Management, Merchant
              Verification, Contact Management)
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PlaceholderPage;

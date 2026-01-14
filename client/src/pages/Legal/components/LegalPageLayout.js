/**
 * Legal Page Layout Component
 *
 * Shared layout and reusable components for all legal/policy pages.
 * Implements proper semantic HTML and ARIA attributes for accessibility.
 */
import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
  List,
  ListItem,
  ListItemText,
  alpha,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { NavigateNext, Gavel } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { ROUTES } from "../../../constants/routes";

/**
 * Reusable Section component for legal page sections
 */
export const Section = ({ title, id, children }) => (
  <Box
    component="section"
    id={id}
    aria-labelledby={`${id}-heading`}
    sx={{ mb: 3 }}
  >
    <Typography
      id={`${id}-heading`}
      variant="h6"
      component="h2"
      gutterBottom
      fontWeight="bold"
      color="primary"
      sx={{ fontSize: "1rem" }}
    >
      {title}
    </Typography>
    <Box
      sx={{
        "& > .MuiTypography-root:not(h2):not(h3)": {
          mb: 1.5,
          fontSize: "0.9rem",
          lineHeight: 1.6,
        },
        "& > .MuiList-root": { mb: 1.5 },
      }}
    >
      {children}
    </Box>
  </Box>
);

/**
 * Reusable SubSection component for nested headings (h3)
 */
export const SubSection = ({ title, id }) => (
  <Typography
    id={id}
    variant="subtitle2"
    component="h3"
    gutterBottom
    fontWeight="bold"
    sx={{ fontSize: "0.9rem", mt: 1.5 }}
  >
    {title}
  </Typography>
);

/**
 * Reusable LegalList component with proper ARIA
 */
export const LegalList = ({ ariaLabel, children }) => (
  <List dense component="ul" aria-label={ariaLabel}>
    {children}
  </List>
);

/**
 * Reusable LegalListItem component to reduce repetition
 */
export const LegalListItem = ({ primary, secondary }) => (
  <ListItem sx={{ py: 0.25 }}>
    <ListItemText
      primary={primary}
      secondary={secondary}
      slotProps={{
        primary: { sx: { fontSize: "0.9rem" } },
        secondary: secondary ? { sx: { fontSize: "0.85rem" } } : undefined,
      }}
    />
  </ListItem>
);

const LegalPageLayout = ({
  title,
  lastUpdated,
  effectiveDate,
  children,
  icon: Icon = Gavel,
}) => {
  const { theme } = useTheme();

  return (
    <Box
      component="main"
      role="main"
      aria-labelledby="legal-page-title"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 0 },
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb navigation">
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" aria-hidden="true" />}
            sx={{ mb: 3 }}
          >
            <MuiLink
              component={RouterLink}
              to={ROUTES.HOME}
              color="inherit"
              underline="hover"
            >
              Home
            </MuiLink>
            <Typography color="text.primary" aria-current="page">
              {title}
            </Typography>
          </Breadcrumbs>
        </nav>

        {/* Header */}
        <Paper
          component="header"
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 2,
            textAlign: "center",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 1,
            }}
          >
            <Icon
              sx={{ fontSize: 32, color: "primary.main" }}
              aria-hidden="true"
            />
            <Typography
              id="legal-page-title"
              variant="h4"
              component="h1"
              fontWeight="bold"
            >
              {title}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 2,
              color: "text.secondary",
            }}
          >
            {lastUpdated && (
              <Typography variant="body2" component="p">
                <strong>Last Updated:</strong>{" "}
                <time dateTime={lastUpdated}>{lastUpdated}</time>
              </Typography>
            )}
            {effectiveDate && (
              <Typography variant="body2" component="p">
                <strong>Effective Date:</strong>{" "}
                <time dateTime={effectiveDate}>{effectiveDate}</time>
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Content */}
        <Paper
          component="article"
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {children}
        </Paper>

        {/* Footer Notice */}
        <Box
          component="footer"
          sx={{ mt: 3, textAlign: "center" }}
          role="contentinfo"
        >
          <Divider sx={{ mb: 2 }} aria-hidden="true" />
          <Typography variant="body2" color="text.secondary" component="p">
            If you have any questions about this policy, please{" "}
            <MuiLink component={RouterLink} to={ROUTES.CONTACT}>
              contact us
            </MuiLink>
            .
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ mt: 1, opacity: 0.7 }}
          >
            MarKet is an independent student project and is not affiliated with
            Universiti Teknologi MARA (UiTM).
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LegalPageLayout;

import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Fab,
  Chip,
} from "@mui/material";
import {
  Info as InfoIcon,
  Image as ImageIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  CloudDone as CloudDoneIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import ListingFormSection from "./ListingFormSection";

/**
 * Format relative time (e.g., "2 minutes ago")
 */
const formatRelativeTime = (date) => {
  if (!date) return null;

  const now = new Date();
  const savedDate = new Date(date);
  const diffInSeconds = Math.floor((now - savedDate) / 1000);

  if (diffInSeconds < 5) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;

  return savedDate.toLocaleDateString();
};

/**
 * ListingFormLayout - Container component that orchestrates form sections
 * Replaces tabs/stepper with accordion-style layout for better UX
 */
const ListingFormLayout = ({
  title,
  subtitle,
  children,
  sections,
  errors = {},
  onSaveDraft,
  onPublish,
  isLoading = false,
  showDraftButton = true,
  publishLabel = "Create Listing",
  lastSaved = null,
}) => {
  const { isDark } = useTheme();
  const [expandedSections, setExpandedSections] = useState(
    sections.reduce((acc, section) => {
      acc[section.id] = section.defaultExpanded ?? true;
      return acc;
    }, {})
  );

  // State for relative time display (updates every minute)
  const [relativeTime, setRelativeTime] = useState(
    formatRelativeTime(lastSaved)
  );

  // Update relative time display
  useEffect(() => {
    setRelativeTime(formatRelativeTime(lastSaved));

    if (!lastSaved) return;

    // Update every 30 seconds
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(lastSaved));
    }, 30000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const expandAll = () => {
    setExpandedSections(
      sections.reduce((acc, section) => {
        acc[section.id] = true;
        return acc;
      }, {})
    );
  };

  const collapseAll = () => {
    setExpandedSections(
      sections.reduce((acc, section) => {
        acc[section.id] = false;
        return acc;
      }, {})
    );
  };

  // Count completed sections
  const completedCount = useMemo(
    () => sections.filter((section) => section.isComplete).length,
    [sections]
  );

  const totalSections = sections.length;
  const allExpanded = Object.values(expandedSections).every(Boolean);

  return (
    <Box sx={{ position: "relative", pb: { xs: 12, md: 4 } }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          {children}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                component="h1"
                fontWeight={600}
                color="text.primary"
                sx={{ mb: 0.5 }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>

            {/* Progress Indicator */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              {relativeTime && (
                <Chip
                  size="small"
                  icon={<CloudDoneIcon sx={{ fontSize: 16 }} />}
                  label={`Saved ${relativeTime}`}
                  sx={{
                    bgcolor: isDark ? "success.900" : "success.50",
                    color: isDark ? "success.light" : "success.dark",
                    "& .MuiChip-icon": {
                      color: "inherit",
                    },
                  }}
                />
              )}
              <Typography variant="body2" color="text.secondary">
                {completedCount}/{totalSections} sections complete
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={allExpanded ? collapseAll : expandAll}
                startIcon={allExpanded ? <CollapseIcon /> : <ExpandIcon />}
                sx={{ textTransform: "none" }}
              >
                {allExpanded ? "Collapse All" : "Expand All"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Sections */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sections.map((section) => (
            <ListingFormSection
              key={section.id}
              title={section.title}
              description={section.description}
              icon={section.icon}
              badge={section.badge}
              expanded={expandedSections[section.id]}
              onToggle={() => toggleSection(section.id)}
              isComplete={section.isComplete}
              errorCount={errors[section.id]}
              optional={section.optional}
            >
              {section.content}
            </ListingFormSection>
          ))}
        </Box>

        {/* Desktop Action Buttons */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            display: { xs: "none", md: "block" },
            bgcolor: isDark ? "grey.900" : "grey.50",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {completedCount === totalSections
                ? "✓ All sections complete. Ready to publish!"
                : `Complete ${totalSections - completedCount} more section(s) to publish.`}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {showDraftButton && onSaveDraft && (
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={onSaveDraft}
                  disabled={isLoading}
                  sx={{ textTransform: "none" }}
                >
                  Save Draft
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<PublishIcon />}
                onClick={onPublish}
                disabled={isLoading}
                sx={{ textTransform: "none" }}
              >
                {publishLabel}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Mobile Floating Action Buttons */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          bottom: 16,
          right: 16,
          left: 16,
          gap: 1,
          zIndex: 1100,
        }}
      >
        {showDraftButton && onSaveDraft && (
          <Fab
            variant="extended"
            size="medium"
            onClick={onSaveDraft}
            disabled={isLoading}
            sx={{
              flex: 1,
              bgcolor: isDark ? "grey.800" : "white",
              color: "text.primary",
              "&:hover": {
                bgcolor: isDark ? "grey.700" : "grey.100",
              },
            }}
          >
            <SaveIcon sx={{ mr: 1 }} />
            Draft
          </Fab>
        )}
        <Fab
          variant="extended"
          color="primary"
          size="medium"
          onClick={onPublish}
          disabled={isLoading}
          sx={{ flex: 2 }}
        >
          <PublishIcon sx={{ mr: 1 }} />
          {publishLabel}
        </Fab>
      </Box>
    </Box>
  );
};

ListingFormLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.node,
      badge: PropTypes.string,
      content: PropTypes.node.isRequired,
      isComplete: PropTypes.bool,
      optional: PropTypes.bool,
      defaultExpanded: PropTypes.bool,
    })
  ).isRequired,
  errors: PropTypes.object,
  onSaveDraft: PropTypes.func,
  onPublish: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  showDraftButton: PropTypes.bool,
  publishLabel: PropTypes.string,
  lastSaved: PropTypes.instanceOf(Date),
};

// Export common section icons for consistency
export const SectionIcons = {
  Details: InfoIcon,
  Images: ImageIcon,
  Variants: InventoryIcon,
  Quotes: SettingsIcon,
};

export default ListingFormLayout;

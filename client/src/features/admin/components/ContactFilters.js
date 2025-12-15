import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Search,
  FilterList,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * ContactFilters Component
 *
 * PURPOSE: Comprehensive filter controls for contact/report management
 * FEATURES:
 * - Type filter (all/bug/enquiry/feedback/collaboration/content_report/other)
 * - Status filter (all/pending/in-progress/resolved/closed/spam)
 * - Priority filter (all/low/normal/high/urgent)
 * - Category filter (for content_report - spam/fraud/harassment/etc)
 * - Entity type filter (for content_report - listing/user/shop)
 * - Search input (name, email, subject)
 * - Active filter badges showing applied filters
 *
 * PROPS:
 * - filters: Current filter values object
 * - onFilterChange: Callback for filter updates
 * - onSearch: Callback for search input changes
 *
 * RESPONSIVE:
 * - Mobile: Stacked inputs
 * - Tablet: 2 columns
 * - Desktop: 4-5 columns with search spanning multiple
 */
const ContactFilters = ({ filters, onFilterChange, onSearch }) => {
  const { theme } = useTheme();

  // Custom media query hook
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 960px)");
    setIsMobile(mediaQuery.matches);

    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const [expanded, setExpanded] = useState(!isMobile);

  const {
    type = "",
    status = "",
    priority = "",
    category = "",
    entityType = "",
    search = "",
  } = filters || {};

  // Count active filters (excluding empty strings and search)
  const activeFilterCount = [
    type !== "",
    status !== "",
    priority !== "",
    category !== "",
    entityType !== "",
  ].filter(Boolean).length;

  // Show category and entityType filters only when type is content_report
  const showReportFilters = type === "content_report";

  return (
    <Card
      component="section"
      aria-label="Contact filters"
      sx={{
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardContent>
        {/* Header with Filter Count and Expand/Collapse (Mobile) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterList sx={{ color: theme.palette.text.secondary }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              Filters
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={`${activeFilterCount} active`}
                size="small"
                color="primary"
                sx={{ fontWeight: 600 }}
                aria-label={`${activeFilterCount} filters applied`}
              />
            )}
          </Box>

          {/* Mobile Expand/Collapse Button */}
          {isMobile && (
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
              aria-label={expanded ? "Collapse filters" : "Expand filters"}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Box>

        <Collapse in={expanded} timeout="auto">
          <Grid container spacing={2}>
            {/* Search Input - Full Width on Top */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, email, or subject..."
                value={search}
                onChange={onSearch}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  },
                }}
                aria-label="Search contacts"
              />
            </Grid>

            {/* Filter Options - Single Row Below Search */}
            {/* Type Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={type}
                  label="Type"
                  onChange={(e) => onFilterChange("type", e.target.value)}
                  aria-label="Filter by submission type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="bug_report">Bug Report</MenuItem>
                  <MenuItem value="enquiry">Enquiry</MenuItem>
                  <MenuItem value="feedback">Feedback</MenuItem>
                  <MenuItem value="collaboration">Collaboration</MenuItem>
                  <MenuItem value="content_report">Content Report</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={status}
                  label="Status"
                  onChange={(e) => onFilterChange("status", e.target.value)}
                  aria-label="Filter by status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                  <MenuItem value="spam">Spam</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Priority Filter - Desktop only */}
            {!isMobile && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="priority-filter-label">Priority</InputLabel>
                  <Select
                    labelId="priority-filter-label"
                    value={priority}
                    label="Priority"
                    onChange={(e) => onFilterChange("priority", e.target.value)}
                    aria-label="Filter by priority"
                  >
                    <MenuItem value="">All Priorities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Report Category Filter - Desktop only & Only show for content_report type */}
            {!isMobile && showReportFilters && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="category-filter-label">Category</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    value={category}
                    label="Category"
                    onChange={(e) => onFilterChange("category", e.target.value)}
                    aria-label="Filter by report category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="spam">Spam</MenuItem>
                    <MenuItem value="fraud">Fraud</MenuItem>
                    <MenuItem value="scam">Scam</MenuItem>
                    <MenuItem value="counterfeit">Counterfeit</MenuItem>
                    <MenuItem value="harassment">Harassment</MenuItem>
                    <MenuItem value="inappropriate_content">
                      Inappropriate Content
                    </MenuItem>
                    <MenuItem value="illegal_content">Illegal Content</MenuItem>
                    <MenuItem value="violence">Violence</MenuItem>
                    <MenuItem value="hate_speech">Hate Speech</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Entity Type Filter - Desktop only & Only show for content_report type */}
            {!isMobile && showReportFilters && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="entityType-filter-label">
                    Entity Type
                  </InputLabel>
                  <Select
                    labelId="entityType-filter-label"
                    value={entityType}
                    label="Entity Type"
                    onChange={(e) =>
                      onFilterChange("entityType", e.target.value)
                    }
                    aria-label="Filter by reported entity type"
                  >
                    <MenuItem value="">All Entity Types</MenuItem>
                    <MenuItem value="listing">Listing</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="shop">Shop</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Collapse>

        {/* Info text when content_report is selected */}
        {showReportFilters && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              ℹ️ Content report filters are now visible. Use category and entity
              type to narrow down specific report types.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactFilters;

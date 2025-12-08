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
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import {
  Search,
  FilterList,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { CAMPUS_OPTIONS } from "../../../constants/authConstant";

/**
 * UserFilters Component
 *
 * PURPOSE: Comprehensive filter controls for user management
 * FEATURES:
 * - Multi-select role filter (consumer/merchant/admin)
 * - Multi-select status filter (active/inactive/suspended)
 * - Multi-select campus filter (all campuses from enum)
 * - Email verified toggle
 * - Search input (username, email, studentId)
 * - Active filter badges showing applied filters
 *
 * PROPS:
 * - filters: Current filter values object (now with arrays for multi-select)
 * - onFilterChange: Callback for filter updates
 * - onSearch: Callback for search input changes
 */
const UserFilters = ({ filters, onFilterChange, onSearch }) => {
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

  // Support both old (string) and new (array) format for backward compatibility
  const roles = Array.isArray(filters?.role)
    ? filters.role
    : filters?.role && filters.role !== "all"
      ? [filters.role]
      : [];
  const statuses = Array.isArray(filters?.status)
    ? filters.status
    : filters?.status && filters.status !== "all"
      ? [filters.status]
      : [];
  const campuses = Array.isArray(filters?.campus)
    ? filters.campus
    : filters?.campus
      ? [filters.campus]
      : [];
  const verified = filters?.verified;
  const search = filters?.search || "";

  // Count active filters
  const activeFilterCount = [
    roles.length > 0,
    statuses.length > 0,
    campuses.length > 0,
    verified !== undefined,
  ].filter(Boolean).length;

  // Render value for multi-select
  const renderMultiSelectValue = (selected, options, labelKey = "label") => {
    if (selected.length === 0) return <em>All</em>;
    if (selected.length === 1) {
      const option = options.find((opt) => opt.value === selected[0]);
      return option ? option[labelKey] : selected[0];
    }
    return `${selected.length} selected`;
  };

  return (
    <Card
      component="section"
      aria-label="User filters"
      sx={{
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        {/* Header with Filter Count and Expand/Collapse (Mobile) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: expanded ? 2 : 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterList sx={{ color: theme.palette.text.secondary }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                placeholder="Search by username, email, or student ID..."
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
                aria-label="Search users"
              />
            </Grid>

            {/* Filter Options - Single Row Below Search */}
            {/* Role Filter - Multi-select */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="role-filter-label">Role</InputLabel>
                <Select
                  labelId="role-filter-label"
                  id="role-filter"
                  multiple
                  value={roles}
                  onChange={(e) => onFilterChange("role", e.target.value)}
                  input={<OutlinedInput label="Role" />}
                  renderValue={(selected) =>
                    renderMultiSelectValue(selected, [
                      { value: "consumer", label: "Consumer" },
                      { value: "merchant", label: "Merchant" },
                      { value: "admin", label: "Admin" },
                    ])
                  }
                  aria-label="Filter by role (multi-select)"
                >
                  <MenuItem value="consumer">
                    <Checkbox checked={roles.includes("consumer")} />
                    <ListItemText primary="Consumer" />
                  </MenuItem>
                  <MenuItem value="merchant">
                    <Checkbox checked={roles.includes("merchant")} />
                    <ListItemText primary="Merchant" />
                  </MenuItem>
                  <MenuItem value="admin">
                    <Checkbox checked={roles.includes("admin")} />
                    <ListItemText primary="Admin" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter - Multi-select */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  multiple
                  value={statuses}
                  onChange={(e) => onFilterChange("status", e.target.value)}
                  input={<OutlinedInput label="Status" />}
                  renderValue={(selected) =>
                    renderMultiSelectValue(selected, [
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                      { value: "suspended", label: "Suspended" },
                    ])
                  }
                  aria-label="Filter by status (multi-select)"
                >
                  <MenuItem value="active">
                    <Checkbox checked={statuses.includes("active")} />
                    <ListItemText primary="Active" />
                  </MenuItem>
                  <MenuItem value="inactive">
                    <Checkbox checked={statuses.includes("inactive")} />
                    <ListItemText primary="Inactive" />
                  </MenuItem>
                  <MenuItem value="suspended">
                    <Checkbox checked={statuses.includes("suspended")} />
                    <ListItemText primary="Suspended" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Campus Filter - Multi-select */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="campus-filter-label">Campus</InputLabel>
                <Select
                  labelId="campus-filter-label"
                  id="campus-filter"
                  multiple
                  value={campuses}
                  onChange={(e) => onFilterChange("campus", e.target.value)}
                  input={<OutlinedInput label="Campus" />}
                  renderValue={(selected) =>
                    renderMultiSelectValue(selected, CAMPUS_OPTIONS)
                  }
                  aria-label="Filter by campus (multi-select)"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5 + 8,
                      },
                    },
                  }}
                >
                  {CAMPUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Checkbox checked={campuses.includes(option.value)} />
                      <ListItemText primary={option.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Email Verified Toggle */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="verified-filter-label">
                  Email Verified
                </InputLabel>
                <Select
                  labelId="verified-filter-label"
                  id="verified-filter"
                  value={
                    verified === undefined ? "all" : verified ? "yes" : "no"
                  }
                  label="Email Verified"
                  onChange={(e) => {
                    const value = e.target.value;
                    onFilterChange(
                      "verified",
                      value === "all"
                        ? undefined
                        : value === "yes"
                          ? true
                          : false
                    );
                  }}
                  aria-label="Filter by email verification status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="yes">Verified</MenuItem>
                  <MenuItem value="no">Unverified</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mr: 1, alignSelf: "center" }}
            >
              Active Filters:
            </Typography>

            {roles.length > 0 &&
              roles.map((role) => (
                <Chip
                  key={role}
                  label={`Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                  size="small"
                  onDelete={() =>
                    onFilterChange(
                      "role",
                      roles.filter((r) => r !== role)
                    )
                  }
                  color="primary"
                  variant="outlined"
                />
              ))}

            {statuses.length > 0 &&
              statuses.map((status) => (
                <Chip
                  key={status}
                  label={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                  size="small"
                  onDelete={() =>
                    onFilterChange(
                      "status",
                      statuses.filter((s) => s !== status)
                    )
                  }
                  color="primary"
                  variant="outlined"
                />
              ))}

            {campuses.length > 0 &&
              campuses.map((campus) => (
                <Chip
                  key={campus}
                  label={`Campus: ${
                    CAMPUS_OPTIONS.find((opt) => opt.value === campus)?.label ||
                    campus
                  }`}
                  size="small"
                  onDelete={() =>
                    onFilterChange(
                      "campus",
                      campuses.filter((c) => c !== campus)
                    )
                  }
                  color="primary"
                  variant="outlined"
                />
              ))}

            {verified !== undefined && (
              <Chip
                label={`Verified: ${verified ? "Yes" : "No"}`}
                size="small"
                onDelete={() => onFilterChange("verified", undefined)}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserFilters;

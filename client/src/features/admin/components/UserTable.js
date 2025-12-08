import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Avatar,
  Box,
  Typography,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import { MoreVert, VerifiedUser, Email } from "@mui/icons-material";
import { format } from "date-fns";
import { useTheme } from "../../../hooks/useTheme";
import UserStatusBadge from "./UserStatusBadge";
import { getCampusLabel } from "../../../utils/formatUtils";

/**
 * UserTable Component
 *
 * PURPOSE: Sortable table with row selection for user management
 * FEATURES:
 * - Multi-row selection with checkboxes
 * - Sortable columns (username, email, created date, last active)
 * - Status badges and role chips
 * - Email verification indicator
 * - Avatar display
 * - Action menu trigger
 * - Pagination
 *
 * PROPS:
 * - users: Array of user objects
 * - loading: Boolean loading state
 * - totalItems: Total number of users
 * - page: Current page (0-indexed)
 * - rowsPerPage: Items per page
 * - sortBy: Current sort field
 * - sortOrder: 'asc' or 'desc'
 * - selectedIds: Array of selected user IDs
 * - onPageChange: Page change handler
 * - onRowsPerPageChange: Rows per page change handler
 * - onSort: Sort change handler
 * - onSelectUser: Single user selection handler
 * - onSelectAll: All users selection handler
 * - onActionMenuOpen: Action menu open handler
 *
 * ACCESSIBILITY:
 * - Proper ARIA labels for checkboxes
 * - Row hover states
 * - Semantic table structure
 * - Keyboard navigation support
 */
const UserTable = ({
  users = [],
  loading = false,
  totalItems = 0,
  page = 0,
  rowsPerPage = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
  selectedIds = [],
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onSelectUser,
  onSelectAll,
  onActionMenuOpen,
}) => {
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

  // Check if all current page users are selected
  const isAllSelected =
    users.length > 0 && users.every((user) => selectedIds.includes(user._id));

  // Check if some (but not all) are selected
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  /**
   * Create sort handler for a column
   */
  const createSortHandler = (property) => () => {
    onSort(property);
  };

  /**
   * Format roles as chips
   */
  const formatRoles = (roles = []) => {
    const roleColors = {
      consumer: "default",
      merchant: "primary",
      admin: "secondary",
    };

    return roles.map((role) => (
      <Chip
        key={role}
        label={role}
        size="small"
        color={roleColors[role] || "default"}
        sx={{ mr: 0.5, fontWeight: 600, textTransform: "capitalize" }}
      />
    ));
  };

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
      {/* Mobile List View */}
      {isMobile ? (
        <>
          {/* Select All Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: theme.palette.background.default,
            }}
          >
            <Checkbox
              indeterminate={isSomeSelected}
              checked={isAllSelected}
              onChange={onSelectAll}
              size="small"
              inputProps={{
                "aria-label": "Select all users on this page",
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.875rem" }}
            >
              {selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : "Select all"}
            </Typography>
          </Box>

          <List disablePadding>
            {users.map((user, index) => (
              <React.Fragment key={user._id}>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: 2,
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedIds.includes(user._id)}
                    onChange={() => onSelectUser(user._id)}
                    size="small"
                    sx={{ p: 0, mt: 0.5 }}
                    inputProps={{
                      "aria-label": `Select ${user.profile?.username}`,
                    }}
                  />

                  {/* Avatar */}
                  <Avatar
                    src={user.profile?.profileImage}
                    alt={user.profile?.username}
                    sx={{ width: 36, height: 36, mt: 0.25 }}
                  >
                    {user.profile?.username?.[0]?.toUpperCase()}
                  </Avatar>

                  {/* Main Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Name + Email */}
                    <Box sx={{ mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontSize: "0.875rem",
                        }}
                      >
                        {user.profile?.username}
                        {user.isEmailVerified && (
                          <VerifiedUser
                            sx={{ fontSize: "1rem" }}
                            color="primary"
                            titleAccess="Email verified"
                          />
                        )}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: "0.75rem",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.email}
                      </Typography>
                    </Box>

                    {/* Roles + Status (Single Row) */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.75rem",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {user.roles
                          ?.map(
                            (role) =>
                              role.charAt(0).toUpperCase() + role.slice(1)
                          )
                          .join(", ")}
                      </Typography>
                      <UserStatusBadge isSuspended={user.isSuspended} />
                    </Box>

                    {/* Join Date */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.7rem" }}
                    >
                      Joined {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <IconButton
                    size="small"
                    onClick={(e) => onActionMenuOpen(e, user)}
                    sx={{ mt: 0.25 }}
                    aria-label={`Actions for ${user.profile?.username}`}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </ListItem>
                {index < users.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </>
      ) : (
        /* Desktop Table View */
        <TableContainer>
          <Table aria-label="User management table">
            <TableHead>
              <TableRow>
                {/* Select All Checkbox */}
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isSomeSelected}
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    inputProps={{
                      "aria-label": "Select all users on this page",
                    }}
                  />
                </TableCell>

                {/* User (Avatar + Username) */}
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "username"}
                    direction={sortBy === "username" ? sortOrder : "asc"}
                    onClick={createSortHandler("username")}
                  >
                    User
                  </TableSortLabel>
                </TableCell>

                {/* Email */}
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "email"}
                    direction={sortBy === "email" ? sortOrder : "asc"}
                    onClick={createSortHandler("email")}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>

                {/* Roles */}
                <TableCell>Roles</TableCell>

                {/* Campus */}
                <TableCell>Campus</TableCell>

                {/* Status */}
                <TableCell>Status</TableCell>

                {/* Joined Date */}
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "createdAt"}
                    direction={sortBy === "createdAt" ? sortOrder : "asc"}
                    onClick={createSortHandler("createdAt")}
                  >
                    Joined
                  </TableSortLabel>
                </TableCell>

                {/* Last Active */}
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "lastActive"}
                    direction={sortBy === "lastActive" ? sortOrder : "asc"}
                    onClick={createSortHandler("lastActive")}
                  >
                    Last Active
                  </TableSortLabel>
                </TableCell>

                {/* Actions */}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                // Loading State
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      Loading users...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                // User Rows
                users.map((user) => {
                  const isSelected = selectedIds.includes(user._id);
                  const isEmailVerified = user.emailVerification?.isVerified;

                  return (
                    <TableRow
                      key={user._id}
                      hover
                      selected={isSelected}
                      aria-label={`User: ${user.profile?.username}`}
                      sx={{
                        cursor: "pointer",
                        "&.Mui-selected": {
                          backgroundColor: `${theme.palette.primary.light}15`,
                        },
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => onSelectUser(user._id)}
                          inputProps={{
                            "aria-label": `Select ${user.profile?.username}`,
                          }}
                        />
                      </TableCell>

                      {/* User Avatar & Username */}
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            src={user.profile?.avatar}
                            alt={`${user.profile?.username}'s avatar`}
                            sx={{ width: 40, height: 40 }}
                          >
                            {user.profile?.username?.[0]?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.profile?.username}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Email with Verification Badge */}
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ maxWidth: 200 }}
                            noWrap
                          >
                            {user.email}
                          </Typography>
                          {isEmailVerified ? (
                            <Tooltip title="Email verified">
                              <VerifiedUser
                                sx={{
                                  fontSize: 16,
                                  color: theme.palette.success.main,
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Email not verified">
                              <Email
                                sx={{
                                  fontSize: 16,
                                  color: theme.palette.warning.main,
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      {/* Roles */}
                      <TableCell>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {formatRoles(user.roles)}
                        </Box>
                      </TableCell>

                      {/* Campus */}
                      <TableCell>
                        <Typography variant="body2">
                          {getCampusLabel(user.profile?.campus)}
                        </Typography>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <UserStatusBadge
                          isActive={user.isActive}
                          isSuspended={user.isSuspended}
                        />
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(user.createdAt), "MMM dd, yyyy")}
                        </Typography>
                      </TableCell>

                      {/* Last Active */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.lastActive
                            ? format(new Date(user.lastActive), "MMM dd, yyyy")
                            : "Never"}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Tooltip title="More actions">
                          <IconButton
                            size="small"
                            onClick={(e) => onActionMenuOpen(e, user)}
                            aria-label={`Actions for ${user.profile?.username}`}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination - Mobile Responsive */}
      {!loading && users.length > 0 && (
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
          aria-label="User table pagination"
          sx={{
            ".MuiTablePagination-toolbar": {
              flexWrap: isMobile ? "wrap" : "nowrap",
              justifyContent: isMobile ? "center" : "flex-end",
            },
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              {
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              },
          }}
        />
      )}
    </Paper>
  );
};

export default UserTable;

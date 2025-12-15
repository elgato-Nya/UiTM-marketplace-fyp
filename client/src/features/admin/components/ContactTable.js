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
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  MoreVert,
  BugReport,
  ContactSupport,
  Feedback,
  Handshake,
  Flag,
  Help,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";

/**
 * ContactTable Component
 *
 * PURPOSE: Sortable table for contact submissions and content reports
 * FEATURES:
 * - Type-specific icons and badges
 * - Priority and status indicators
 * - Report category badges for content_report type
 * - Reported entity links for content_report
 * - Sortable columns
 * - Action menu trigger
 * - Pagination
 *
 * PROPS:
 * - contacts: Array of contact objects
 * - loading: Boolean loading state
 * - totalItems: Total number of contacts
 * - page: Current page (0-indexed)
 * - rowsPerPage: Items per page
 * - sortBy: Current sort field
 * - sortOrder: 'asc' or 'desc'
 * - onPageChange: Page change handler
 * - onRowsPerPageChange: Rows per page change handler
 * - onSort: Sort change handler
 * - onRowClick: Contact row click handler
 * - onActionMenuOpen: Action menu open handler
 */
const ContactTable = ({
  contacts = [],
  loading = false,
  totalItems = 0,
  page = 0,
  rowsPerPage = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onRowClick,
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

  /**
   * Create sort handler for a column
   */
  const createSortHandler = (property) => () => {
    onSort(property);
  };

  /**
   * Get type icon and color
   */
  const getTypeDisplay = (type) => {
    const typeConfig = {
      bug_report: { icon: <BugReport />, color: "error", label: "Bug Report" },
      enquiry: { icon: <ContactSupport />, color: "info", label: "Enquiry" },
      feedback: { icon: <Feedback />, color: "success", label: "Feedback" },
      collaboration: {
        icon: <Handshake />,
        color: "primary",
        label: "Collaboration",
      },
      content_report: {
        icon: <Flag />,
        color: "warning",
        label: "Content Report",
      },
      other: { icon: <Help />, color: "default", label: "Other" },
    };

    const config = typeConfig[type] || typeConfig.other;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  /**
   * Get contact icon for mobile view
   */
  const getContactIcon = (type) => {
    const typeConfig = {
      bug_report: <BugReport />,
      enquiry: <ContactSupport />,
      feedback: <Feedback />,
      collaboration: <Handshake />,
      content_report: <Flag />,
      other: <Help />,
    };

    return typeConfig[type] || typeConfig.other;
  };

  /**
   * Get contact color for mobile view
   */
  const getContactColor = (type) => {
    const colorMap = {
      bug_report: theme.palette.error.main,
      enquiry: theme.palette.info.main,
      feedback: theme.palette.success.main,
      collaboration: theme.palette.primary.main,
      content_report: theme.palette.warning.main,
      other: theme.palette.text.secondary,
    };

    return colorMap[type] || colorMap.other;
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status) => {
    const statusColors = {
      pending: "warning",
      "in-progress": "info",
      resolved: "success",
      closed: "default",
      spam: "error",
    };
    return statusColors[status] || "default";
  };

  /**
   * Get priority badge color
   */
  const getPriorityColor = (priority) => {
    const priorityColors = {
      low: "default",
      normal: "info",
      high: "warning",
      urgent: "error",
    };
    return priorityColors[priority] || "default";
  };

  /**
   * Get report category badge
   */
  const getCategoryBadge = (category) => {
    const categoryLabels = {
      spam: "Spam",
      fraud: "Fraud",
      scam: "Scam",
      counterfeit: "Counterfeit",
      harassment: "Harassment",
      inappropriate_content: "Inappropriate",
      illegal_content: "Illegal",
      violence: "Violence",
      hate_speech: "Hate Speech",
    };

    const categoryColors = {
      spam: "default",
      fraud: "error",
      scam: "error",
      counterfeit: "warning",
      harassment: "warning",
      inappropriate_content: "warning",
      illegal_content: "error",
      violence: "error",
      hate_speech: "error",
    };

    return (
      <Chip
        label={categoryLabels[category] || category}
        color={categoryColors[category] || "default"}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
      />
    );
  };

  /**
   * Render reported entity link
   */
  const renderEntityLink = (contact) => {
    if (contact.type !== "content_report" || !contact.contentReport) {
      return null;
    }

    const { reportedEntityType, reportedEntity } = contact.contentReport;

    let linkTo = "";
    let linkText = "";

    switch (reportedEntityType) {
      case "listing":
        linkTo = `/listing/${reportedEntity}`;
        linkText = "View Listing";
        break;
      case "user":
        linkTo = `/user/${reportedEntity}`;
        linkText = "View User";
        break;
      case "shop":
        linkTo = `/shop/${reportedEntity}`;
        linkText = "View Shop";
        break;
      default:
        return null;
    }

    return (
      <Link
        to={linkTo}
        style={{
          fontSize: "0.75rem",
          textDecoration: "none",
          color: theme.palette.primary.main,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
      >
        {linkText}
      </Link>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (contacts.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ border: `1px solid ${theme.palette.divider}`, p: 4 }}
      >
        <Typography variant="body1" align="center" color="text.secondary">
          No contact submissions found
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
      {isMobile ? (
        <>
          {/* Mobile List View - Compact Horizontal Layout */}
          <List sx={{ pt: 0 }}>
            {contacts.map((contact, index) => (
              <React.Fragment key={contact._id}>
                {index > 0 && <Divider />}
                <ListItem
                  component="button"
                  onClick={() => onRowClick(contact)}
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: "transparent",
                    textAlign: "left",
                    width: "100%",
                    display: "block",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {/* Main horizontal container */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      width: "100%",
                      gap: 1.5,
                    }}
                  >
                    {/* Type Icon */}
                    <Box
                      sx={{
                        color: getContactColor(contact.type),
                        mt: 0.5,
                      }}
                    >
                      {getContactIcon(contact.type)}
                    </Box>

                    {/* Content Section */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Subject */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mb: 0.75,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {contact.subject || "No subject"}
                      </Typography>

                      {/* Submitter - Single Line */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.8125rem",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mb: 1,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {contact.submittedBy?.name || contact.name || "Unknown"}{" "}
                        •{" "}
                        {contact.submittedBy?.email ||
                          contact.email ||
                          "No email"}
                      </Typography>

                      {/* Chips Row - Compact */}
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.75,
                          mb: 1,
                        }}
                      >
                        {/* Status */}
                        <Chip
                          label={contact.status}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontSize: "0.6875rem",
                            height: "22px",
                            fontWeight: 500,
                            bgcolor:
                              contact.status === "resolved"
                                ? theme.palette.success.light
                                : contact.status === "in-progress" ||
                                    contact.status === "in_progress"
                                  ? theme.palette.info.light
                                  : contact.status === "pending"
                                    ? theme.palette.warning.light
                                    : theme.palette.grey[300],
                            color:
                              contact.status === "resolved"
                                ? theme.palette.success.dark
                                : contact.status === "in-progress" ||
                                    contact.status === "in_progress"
                                  ? theme.palette.info.dark
                                  : contact.status === "pending"
                                    ? theme.palette.warning.dark
                                    : theme.palette.text.primary,
                          }}
                        />

                        {/* Priority */}
                        <Chip
                          label={contact.priority}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontSize: "0.6875rem",
                            height: "22px",
                            fontWeight: 500,
                            bgcolor:
                              contact.priority === "urgent"
                                ? theme.palette.error.light
                                : contact.priority === "high"
                                  ? theme.palette.warning.light
                                  : contact.priority === "normal"
                                    ? theme.palette.info.light
                                    : theme.palette.grey[300],
                            color:
                              contact.priority === "urgent"
                                ? theme.palette.error.dark
                                : contact.priority === "high"
                                  ? theme.palette.warning.dark
                                  : contact.priority === "normal"
                                    ? theme.palette.info.dark
                                    : theme.palette.text.primary,
                          }}
                        />

                        {/* Category for content_report */}
                        {contact.type === "content_report" &&
                          contact.contentReport?.category && (
                            <Chip
                              label={contact.contentReport.category
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                              size="small"
                              sx={{
                                fontSize: "0.6875rem",
                                height: "22px",
                                fontWeight: 500,
                                bgcolor: theme.palette.warning.light,
                                color: theme.palette.warning.dark,
                              }}
                            />
                          )}

                        {/* Bug Severity */}
                        {contact.type === "bug_report" &&
                          contact.bugDetails?.severity && (
                            <Chip
                              label={contact.bugDetails.severity}
                              size="small"
                              sx={{
                                textTransform: "capitalize",
                                fontSize: "0.6875rem",
                                height: "22px",
                                fontWeight: 500,
                                bgcolor:
                                  contact.bugDetails.severity === "critical"
                                    ? theme.palette.error.light
                                    : contact.bugDetails.severity === "high"
                                      ? theme.palette.warning.light
                                      : theme.palette.info.light,
                                color:
                                  contact.bugDetails.severity === "critical"
                                    ? theme.palette.error.dark
                                    : contact.bugDetails.severity === "high"
                                      ? theme.palette.warning.dark
                                      : theme.palette.info.dark,
                              }}
                            />
                          )}
                      </Box>

                      {/* Bottom Row: Date + Entity Link */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.75rem",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {format(
                            new Date(contact.createdAt),
                            "MMM d, yyyy h:mm a"
                          )}
                        </Typography>
                        {renderEntityLink(contact)}
                      </Box>
                    </Box>

                    {/* Actions Button */}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onActionMenuOpen(e, contact);
                      }}
                      sx={{ mt: 0.5, p: 0 }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>

          {/* Mobile Pagination */}
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              ".MuiTablePagination-toolbar": {
                fontSize: "0.875rem",
                flexWrap: "wrap",
              },
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                {
                  fontSize: "0.75rem",
                },
            }}
          />
        </>
      ) : (
        <>
          {/* Desktop Table View */}
          <TableContainer>
            <Table aria-label="Contact submissions table">
              <TableHead>
                <TableRow>
                  {/* Type */}
                  <TableCell>Type</TableCell>

                  {/* Submitter */}
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "name"}
                      direction={sortBy === "name" ? sortOrder : "asc"}
                      onClick={createSortHandler("name")}
                    >
                      Submitter
                    </TableSortLabel>
                  </TableCell>

                  {/* Subject */}
                  <TableCell>Subject</TableCell>

                  {/* Category (for reports) */}
                  <TableCell>Category / Details</TableCell>

                  {/* Priority */}
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "priority"}
                      direction={sortBy === "priority" ? sortOrder : "asc"}
                      onClick={createSortHandler("priority")}
                    >
                      Priority
                    </TableSortLabel>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "status"}
                      direction={sortBy === "status" ? sortOrder : "asc"}
                      onClick={createSortHandler("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>

                  {/* Created At */}
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "createdAt"}
                      direction={sortBy === "createdAt" ? sortOrder : "asc"}
                      onClick={createSortHandler("createdAt")}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {contacts.map((contact) => (
                  <TableRow
                    key={contact._id}
                    hover
                    onClick={() => onRowClick(contact)}
                    sx={{ cursor: "pointer" }}
                  >
                    {/* Type */}
                    <TableCell>{getTypeDisplay(contact.type)}</TableCell>

                    {/* Submitter */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {contact.submittedBy?.name ||
                            contact.name ||
                            "Unknown"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contact.submittedBy?.email ||
                            contact.email ||
                            "No email"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Subject */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 250,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {contact.subject}
                      </Typography>
                    </TableCell>

                    {/* Category / Details */}
                    <TableCell>
                      {contact.type === "content_report" &&
                      contact.contentReport ? (
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          {getCategoryBadge(contact.contentReport.category)}
                          {renderEntityLink(contact)}
                        </Box>
                      ) : contact.type === "bug_report" &&
                        contact.bugDetails ? (
                        <Chip
                          label={contact.bugDetails.severity}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 500,
                            bgcolor:
                              contact.bugDetails.severity === "critical"
                                ? theme.palette.error.light
                                : contact.bugDetails.severity === "high"
                                  ? theme.palette.warning.light
                                  : theme.palette.info.light,
                            color:
                              contact.bugDetails.severity === "critical"
                                ? theme.palette.error.dark
                                : contact.bugDetails.severity === "high"
                                  ? theme.palette.warning.dark
                                  : theme.palette.info.dark,
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      <Chip
                        label={contact.priority}
                        color={getPriorityColor(contact.priority)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={contact.status}
                        color={getStatusColor(contact.status)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>

                    {/* Created At */}
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(contact.createdAt), "MMM dd, yyyy")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(contact.createdAt), "HH:mm")}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onActionMenuOpen(e, contact);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Desktop Pagination */}
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </>
      )}
    </Paper>
  );
};

export default ContactTable;

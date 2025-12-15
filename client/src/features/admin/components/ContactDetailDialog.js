import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Link as MuiLink,
  ImageList,
  ImageListItem,
} from "@mui/material";
import {
  Close,
  Person,
  Email,
  Phone,
  CalendarToday,
  Flag,
  Link as LinkIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";

/**
 * ContactDetailDialog Component
 *
 * PURPOSE: Display comprehensive contact submission or content report details
 * FEATURES:
 * - Type-specific information display
 * - Bug details (severity, browser, steps to reproduce)
 * - Collaboration details (organization, website, proposal type)
 * - Content report details (category, reported entity, evidence, action taken)
 * - Response and note history
 * - Evidence images/screenshots
 * - Action buttons (update status, add response, add note, take action)
 *
 * PROPS:
 * - open: Boolean dialog open state
 * - onClose: Close handler
 * - contact: Contact object with full details
 * - onActionClick: Handler for action buttons (status, response, note, report_action)
 */
const ContactDetailDialog = ({ open, onClose, contact, onActionClick }) => {
  const { theme } = useTheme();

  if (!contact) return null;

  const isReport = contact.type === "content_report";
  const isBug = contact.type === "bug_report";
  const isCollaboration = contact.type === "collaboration";

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      "in-progress": "info",
      resolved: "success",
      closed: "default",
      spam: "error",
    };
    return colors[status] || "default";
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority) => {
    const colors = {
      low: "default",
      normal: "info",
      high: "warning",
      urgent: "error",
    };
    return colors[priority] || "default";
  };

  /**
   * Render reported entity link
   */
  const renderEntityLink = () => {
    if (!isReport || !contact.contentReport) return null;

    const { reportedEntityType, reportedEntity } = contact.contentReport;
    let linkTo = "";

    switch (reportedEntityType) {
      case "listing":
        linkTo = `/listing/${reportedEntity}`;
        break;
      case "user":
        linkTo = `/user/${reportedEntity}`;
        break;
      case "shop":
        linkTo = `/shop/${reportedEntity}`;
        break;
      default:
        return null;
    }

    return (
      <MuiLink
        component={Link}
        to={linkTo}
        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        target="_blank"
      >
        <LinkIcon fontSize="small" />
        View{" "}
        {reportedEntityType.charAt(0).toUpperCase() +
          reportedEntityType.slice(1)}
      </MuiLink>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="contact-detail-dialog-title"
      slotProps={{
        paper: {
          sx: { maxHeight: "90vh" },
        },
      }}
    >
      <DialogTitle id="contact-detail-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, pr: 6 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {contact.subject}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {contact._id}
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

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* Status & Priority Section */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={contact.type.replace("_", " ")}
              color="primary"
              size="small"
              sx={{ textTransform: "capitalize", fontWeight: 500 }}
            />
            <Chip
              label={contact.status}
              color={getStatusColor(contact.status)}
              size="small"
              sx={{ textTransform: "capitalize", fontWeight: 500 }}
            />
            <Chip
              label={contact.priority}
              color={getPriorityColor(contact.priority)}
              size="small"
              sx={{ textTransform: "capitalize", fontWeight: 500 }}
            />
          </Box>

          <Divider />

          {/* Submitter Information */}
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Submitter
            </Typography>
            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="body2">
                    {contact.submittedBy?.name || contact.name || (
                      <span
                        style={{ fontStyle: "italic", color: "text.secondary" }}
                      >
                        Not provided
                      </span>
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Email fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="body2">
                    {contact.submittedBy?.email || contact.email || (
                      <span
                        style={{ fontStyle: "italic", color: "text.secondary" }}
                      >
                        Not provided
                      </span>
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="body2">
                    {contact.submittedBy?.phoneNumber ||
                      contact.phoneNumber || (
                        <span
                          style={{
                            fontStyle: "italic",
                            color: "text.secondary",
                          }}
                        >
                          Not provided
                        </span>
                      )}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography variant="body2">
                    {format(new Date(contact.createdAt), "MMM dd, yyyy HH:mm")}
                  </Typography>
                </Box>
              </Grid>
              {(contact.submittedBy?.userId || contact.userId) && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Flag fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      ID: {contact.submittedBy?.userId || contact.userId}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider />

          {/* Message */}
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Message
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {contact.message}
            </Typography>
          </Box>

          {/* Bug Report Details */}
          {isBug && contact.bugDetails && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Bug Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  {/* Severity */}
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      gutterBottom
                    >
                      Severity
                    </Typography>
                    <Chip
                      label={contact.bugDetails.severity}
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 600,
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
                  </Grid>

                  {/* Device */}
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      gutterBottom
                    >
                      Device
                    </Typography>
                    <Typography variant="body2">
                      {contact.bugDetails.deviceType?.charAt(0).toUpperCase() +
                        contact.bugDetails.deviceType?.slice(1) || "Unknown"}
                    </Typography>
                  </Grid>

                  {/* Browser */}
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      gutterBottom
                    >
                      Browser
                    </Typography>
                    <Typography variant="body2">
                      {contact.bugDetails.browser || "Not specified"}
                    </Typography>
                  </Grid>

                  {/* Expected Behavior */}
                  {contact.bugDetails.expectedBehavior && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        gutterBottom
                      >
                        Expected Behavior
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                      >
                        {contact.bugDetails.expectedBehavior}
                      </Typography>
                    </Grid>
                  )}

                  {/* Actual Behavior */}
                  {contact.bugDetails.actualBehavior && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        gutterBottom
                      >
                        Actual Behavior
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                      >
                        {contact.bugDetails.actualBehavior}
                      </Typography>
                    </Grid>
                  )}

                  {/* Steps to Reproduce */}
                  {contact.bugDetails.stepsToReproduce && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        gutterBottom
                      >
                        Steps to Reproduce
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                      >
                        {contact.bugDetails.stepsToReproduce}
                      </Typography>
                    </Grid>
                  )}

                  {/* Screenshots */}
                  {contact.bugDetails.screenshots &&
                    contact.bugDetails.screenshots.length > 0 && (
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 1 }}
                        >
                          Screenshots ({contact.bugDetails.screenshots.length})
                        </Typography>
                        <ImageList cols={3} rowHeight={160} gap={8}>
                          {contact.bugDetails.screenshots.map((img, index) => (
                            <ImageListItem
                              key={img._id || index}
                              sx={{
                                cursor: "pointer",
                                borderRadius: 1,
                                overflow: "hidden",
                                border: `1px solid ${theme.palette.divider}`,
                                transition: "all 0.2s",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                  boxShadow: 2,
                                },
                              }}
                              onClick={() => window.open(img.url, "_blank")}
                            >
                              <img
                                src={img.url}
                                alt={img.filename || `Screenshot ${index + 1}`}
                                loading="lazy"
                                style={{
                                  objectFit: "cover",
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            </ImageListItem>
                          ))}
                        </ImageList>
                      </Grid>
                    )}
                </Grid>
              </Box>
            </>
          )}

          {/* Content Report Details */}
          {isReport && contact.contentReport && (
            <>
              <Divider />
              <section>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Report Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {contact.contentReport.category
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Reported Entity
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {contact.contentReport.reportedEntityType
                        .charAt(0)
                        .toUpperCase() +
                        contact.contentReport.reportedEntityType.slice(1)}{" "}
                      - {renderEntityLink()}
                    </Typography>
                  </Grid>
                  {contact.contentReport.evidence &&
                    contact.contentReport.evidence.length > 0 && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">
                          Evidence
                        </Typography>
                        <ImageList cols={3} rowHeight={120} sx={{ mt: 1 }}>
                          {contact.contentReport.evidence.map((img, index) => (
                            <ImageListItem key={index}>
                              <img
                                src={img}
                                alt={`Evidence ${index + 1}`}
                                loading="lazy"
                                style={{ objectFit: "cover" }}
                              />
                            </ImageListItem>
                          ))}
                        </ImageList>
                      </Grid>
                    )}
                  {contact.contentReport.actionTaken && (
                    <Grid size={{ xs: 12 }}>
                      <Chip
                        label={`Action Taken: ${contact.contentReport.actionTaken
                          .split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}`}
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                  )}
                </Grid>
              </section>
            </>
          )}

          {/* Collaboration Details */}
          {isCollaboration && contact.collaborationDetails && (
            <>
              <Divider />
              <section>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Collaboration Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Proposal Type
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {contact.collaborationDetails.proposalType || (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic", textTransform: "none" }}
                        >
                          Not provided
                        </Typography>
                      )}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Organization
                    </Typography>
                    <Typography variant="body2">
                      {contact.collaborationDetails.organizationName || (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          Not provided
                        </Typography>
                      )}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Website
                    </Typography>
                    {contact.collaborationDetails.website ? (
                      <MuiLink
                        href={contact.collaborationDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {contact.collaborationDetails.website}
                      </MuiLink>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        Not provided
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </section>
            </>
          )}

          {/* Responses & Notes */}
          {(contact.responses?.length > 0 ||
            contact.internalNotes?.length > 0) && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  History
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {contact.responses?.map((response, index) => (
                    <Card
                      key={index}
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    >
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Chip
                            label="Admin Response"
                            color="primary"
                            size="small"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(
                              new Date(response.timestamp),
                              "MMM dd, HH:mm"
                            )}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                        >
                          {response.message}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                  {contact.internalNotes?.map((note, index) => (
                    <Card
                      key={index}
                      variant="outlined"
                      sx={{
                        borderRadius: 1,
                        bgcolor: theme.palette.action.hover,
                      }}
                    >
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Chip
                            label="Internal Note"
                            size="small"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(note.addedAt), "MMM dd, HH:mm")}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                        >
                          {note.note}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            flexWrap: { xs: "nowrap", sm: "wrap" },
          }}
        >
          <Button
            onClick={() => onActionClick(contact, "status")}
            variant="contained"
            size="small"
            sx={{ flex: { xs: 1, sm: "0 1 auto" }, minWidth: { sm: "120px" } }}
          >
            Update Status
          </Button>
          <Button
            onClick={() => onActionClick(contact, "response")}
            variant="outlined"
            size="small"
            sx={{ flex: { xs: 1, sm: "0 1 auto" }, minWidth: { sm: "120px" } }}
          >
            Add Response
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            onClick={() => onActionClick(contact, "note")}
            variant="outlined"
            size="small"
            sx={{ flex: { xs: 1, sm: "0 1 auto" }, minWidth: { sm: "100px" } }}
          >
            Add Note
          </Button>
          {isReport && (
            <Button
              onClick={() => onActionClick(contact, "report_action")}
              variant="contained"
              color="error"
              size="small"
              sx={{
                flex: { xs: 1, sm: "0 1 auto" },
                minWidth: { sm: "120px" },
              }}
            >
              Take Action
            </Button>
          )}
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />
        <Button
          onClick={onClose}
          size="small"
          color="inherit"
          sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: "80px" } }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactDetailDialog;

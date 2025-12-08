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
  const isBug = contact.type === "bug";
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
      PaperProps={{
        sx: { maxHeight: "90vh" },
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
        <Stack spacing={3}>
          {/* Status & Priority Section */}
          <section>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Status & Priority
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={contact.type}
                color="primary"
                size="small"
                sx={{ textTransform: "capitalize" }}
              />
              <Chip
                label={contact.status}
                color={getStatusColor(contact.status)}
                size="small"
                sx={{ textTransform: "capitalize" }}
              />
              <Chip
                label={`Priority: ${contact.priority}`}
                color={getPriorityColor(contact.priority)}
                size="small"
                sx={{ textTransform: "capitalize" }}
              />
            </Box>
          </section>

          <Divider />

          {/* Submitter Information */}
          <section>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Submitter Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2">
                    {contact.name || (
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
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">
                    {contact.email || (
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
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">
                    {contact.phoneNumber || (
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
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2">
                    {format(new Date(contact.createdAt), "MMM dd, yyyy HH:mm")}
                  </Typography>
                </Box>
              </Grid>
              {contact.userId && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Flag fontSize="small" color="action" />
                    <Typography variant="body2">
                      Authenticated User ID: {contact.userId}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </section>

          <Divider />

          {/* Message */}
          <section>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Message
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                p: 2,
                bgcolor: theme.palette.grey[50],
                borderRadius: 1,
              }}
            >
              {contact.message}
            </Typography>
          </section>

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

          {/* Bug Details */}
          {isBug && contact.bugDetails && (
            <>
              <Divider />
              <section>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Bug Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Severity
                    </Typography>
                    <Chip
                      label={contact.bugDetails.severity}
                      color={
                        contact.bugDetails.severity === "critical"
                          ? "error"
                          : "default"
                      }
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Device Type
                    </Typography>
                    <Typography variant="body2">
                      {contact.bugDetails.deviceType}
                    </Typography>
                  </Grid>
                  {contact.bugDetails.browser && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Browser
                      </Typography>
                      <Typography variant="body2">
                        {contact.bugDetails.browser}
                      </Typography>
                    </Grid>
                  )}
                  {!contact.bugDetails.browser && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Browser
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        Not provided
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Expected Behavior
                    </Typography>
                    <Typography variant="body2">
                      {contact.bugDetails.expectedBehavior || (
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
                      Actual Behavior
                    </Typography>
                    <Typography variant="body2">
                      {contact.bugDetails.actualBehavior || (
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
                  {contact.bugDetails.stepsToReproduce && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">
                        Steps to Reproduce
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {contact.bugDetails.stepsToReproduce}
                      </Typography>
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
              <section>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  History
                </Typography>
                <Stack spacing={2}>
                  {contact.responses?.map((response, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="primary">
                          Admin Response
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {response.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {format(
                            new Date(response.timestamp),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                  {contact.internalNotes?.map((note, index) => (
                    <Card
                      key={index}
                      variant="outlined"
                      sx={{ bgcolor: "grey.50" }}
                    >
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Internal Note
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {note.note}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          By: {note.addedBy} •{" "}
                          {format(
                            new Date(note.timestamp),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </section>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={() => onActionClick(contact, "status")}
          variant="contained"
          size="small"
          sx={{ minWidth: { xs: "calc(50% - 4px)", sm: "auto" } }}
        >
          Update Status
        </Button>
        <Button
          onClick={() => onActionClick(contact, "response")}
          variant="outlined"
          size="small"
          sx={{ minWidth: { xs: "calc(50% - 4px)", sm: "auto" } }}
        >
          Add Response
        </Button>
        <Button
          onClick={() => onActionClick(contact, "note")}
          variant="outlined"
          size="small"
          sx={{ minWidth: { xs: "calc(50% - 4px)", sm: "auto" } }}
        >
          Add Note
        </Button>
        {isReport && (
          <Button
            onClick={() => onActionClick(contact, "report_action")}
            variant="contained"
            color="error"
            size="small"
            sx={{ minWidth: { xs: "100%", sm: "auto" } }}
          >
            Take Action
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} size="small" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactDetailDialog;

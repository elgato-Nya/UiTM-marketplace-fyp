import { Box, Toolbar, Typography, Button, Chip, Alert } from "@mui/material";
import {
  Block,
  CheckCircle,
  VerifiedUser,
  Clear,
  Warning,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * BulkActions Component
 *
 * PURPOSE: Toolbar for performing bulk operations on selected users
 * FEATURES:
 * - Shows count of selected users
 * - Bulk suspend
 * - Bulk activate
 * - Bulk verify email
 * - Clear selection
 * - Warning for max 50 users limit
 * - Sticky toolbar that appears when users are selected
 *
 * PROPS:
 * - selectedCount: Number of selected users
 * - onSuspendSelected: Suspend selected handler
 * - onActivateSelected: Activate selected handler
 * - onVerifySelected: Verify selected handler
 * - onClearSelection: Clear selection handler
 * - maxLimit: Maximum allowed selections (default 50)
 *
 * ACCESSIBILITY:
 * - Proper ARIA labels
 * - Button group semantics
 * - Warning messages
 * - Color-coded actions
 */
const BulkActions = ({
  selectedCount = 0,
  onSuspendSelected,
  onActivateSelected,
  onVerifySelected,
  onClearSelection,
  maxLimit = 50,
}) => {
  const { theme } = useTheme();

  // Don't render if nothing selected
  if (selectedCount === 0) {
    return null;
  }

  const isOverLimit = selectedCount > maxLimit;

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        mb: 2,
        boxShadow: theme.shadows[2],
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          py: 1.5,
          px: { xs: 1, sm: 2 },
        }}
      >
        {/* Selection Count */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Chip
            label={`${selectedCount} selected`}
            color="primary"
            sx={{ fontWeight: 600 }}
            aria-label={`${selectedCount} users selected`}
          />

          {isOverLimit && (
            <Chip
              icon={<Warning sx={{ fontSize: 16 }} />}
              label={`Max ${maxLimit} allowed`}
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
              aria-label={`Warning: Maximum ${maxLimit} users allowed for bulk operations`}
            />
          )}

          <Button
            size="small"
            startIcon={<Clear />}
            onClick={onClearSelection}
            aria-label="Clear selection"
            sx={{ ml: "auto" }}
          >
            Clear
          </Button>
        </Box>

        {/* Bulk Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<Block />}
            onClick={onSuspendSelected}
            color="error"
            disabled={isOverLimit}
            aria-label="Suspend selected users"
            sx={{ flex: { xs: "1 1 calc(50% - 4px)", sm: "0 1 auto" } }}
          >
            Suspend
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckCircle />}
            onClick={onActivateSelected}
            color="success"
            disabled={isOverLimit}
            aria-label="Activate selected users"
            sx={{ flex: { xs: "1 1 calc(50% - 4px)", sm: "0 1 auto" } }}
          >
            Activate
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<VerifiedUser />}
            onClick={onVerifySelected}
            color="primary"
            disabled={isOverLimit}
            aria-label="Verify selected users"
            sx={{ flex: { xs: "1 1 100%", sm: "0 1 auto" } }}
          >
            Verify Emails
          </Button>
        </Box>
      </Toolbar>

      {/* Over Limit Warning */}
      {isOverLimit && (
        <Alert
          severity="error"
          icon={<Warning />}
          sx={{
            borderRadius: 0,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2">
            You have selected {selectedCount} users. Bulk operations are limited
            to {maxLimit} users at a time. Please reduce your selection to
            proceed.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default BulkActions;

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  VisibilityOffOutlined as VisibilityOffOutlinedIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * ConfirmDeleteDialog - reusable destructive action dialog
 */
function ConfirmDeleteDialog({
  open,
  onClose,
  onDelete,
  onToggle,
  itemName = "this item",
  itemLabel = "Item",
  title = "Delete Item",
  confirmWord = "DELETE",
  warningMessage,
  toggleLabel = "Mark Unavailable",
  deleteLabel = "Delete Permanently",
  showToggle = true,
  deletePrompt,
  confirmationInstruction,
  isLoading = false,
}) {
  const { theme } = useTheme();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmText("");
      setError("");
    }
  }, [open]);

  const handleDelete = () => {
    if (confirmText !== confirmWord) {
      setError(`Please type "${confirmWord}" exactly to continue.`);
      return;
    }

    onDelete?.();
  };

  const handleToggle = () => {
    onToggle?.();
  };

  const canDelete = confirmText === confirmWord;
  const promptText =
    deletePrompt || `Are you sure you want to permanently delete ${itemName}?`;
  const instructionText =
    confirmationInstruction ||
    `To confirm permanent deletion, please type ${confirmWord} below:`;
  const defaultWarning =
    warningMessage ||
    `All data associated with ${itemName} will be permanently deleted from the database.`;

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="delete-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.bold",
          backgroundImage: "none",
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle
        id="delete-dialog-title"
        sx={{
          px: { xs: 2, sm: 2.5 },
          pt: { xs: 2, sm: 2.5 },
          pb: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: theme.spacing(5.5),
                height: theme.spacing(5.5),
                borderRadius: theme.shape.borderRadius * 1.5,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
                color: "error.main",
                flexShrink: 0,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <WarningAmberRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: theme.typography.pxToRem(1.2) }}
              >
                Dangerous action
              </Typography>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close delete dialog"
            size="small"
            sx={{
              color: "text.secondary",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, pb: 2 }}>
        <Stack spacing={2}>
          <Typography
            variant="body1"
            sx={{
              color: "text.primary",
            }}
          >
            {promptText}
          </Typography>

          <Box
            sx={{
              p: { xs: 1.5, sm: 1.75 },
              borderRadius: theme.shape.borderRadius * 0.1,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              What happens next
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              {defaultWarning}
            </Typography>
          </Box>

          {showToggle && onToggle ? (
            <Box
              sx={{
                p: { xs: 1.5, sm: 1.75 },
                borderRadius: theme.shape.borderRadius * 0.1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <VisibilityOffOutlinedIcon
                  sx={{ color: "text.secondary", mt: 0.15 }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Safer option
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Mark this {itemLabel.toLowerCase()} unavailable instead if
                    you only want to hide it from buyers for now.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ) : null}

          <Box>
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
              {instructionText}
            </Typography>

            <TextField
              fullWidth
              value={confirmText}
              onChange={(event) => {
                setConfirmText(event.target.value);
                setError("");
              }}
              placeholder={`Type ${confirmWord} here`}
              error={!!error}
              helperText={
                error ||
                `Type ${confirmWord} exactly to enable ${deleteLabel.toLowerCase()}.`
              }
              autoComplete="off"
              disabled={isLoading}
              InputProps={{
                sx: {
                  fontFamily: "monospace",
                  letterSpacing: theme.typography.pxToRem(1.2),
                  bgcolor: "background.paper",
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 2.5 },
          pb: { xs: 2, sm: 2.5 },
          pt: 0.5,
          gap: 1,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "stretch",
        }}
      >
        {showToggle && onToggle ? (
          <Button
            onClick={handleToggle}
            variant="outlined"
            disabled={isLoading}
            startIcon={<VisibilityOffOutlinedIcon />}
            sx={{
              minWidth: theme.spacing(22),
              alignSelf: { xs: "stretch", sm: "center" },
              borderColor: "divider",
              color: "text.primary",
              bgcolor: "background.paper",
              "&:hover": {
                borderColor: "divider",
                bgcolor: "action.hover",
              },
            }}
          >
            {toggleLabel}
          </Button>
        ) : null}

        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={!canDelete || isLoading}
          startIcon={<DeleteOutlineIcon />}
          sx={{
            minWidth: theme.spacing(20),
            alignSelf: { xs: "stretch", sm: "center" },
          }}
        >
          {deleteLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Button,
  Tooltip,
  alpha,
} from "@mui/material";
import { Edit, Check, Close } from "@mui/icons-material";

import { useTheme } from "../../../hooks/useTheme";

function InlineEditField({
  label,
  value,
  onSave,
  editable = true,
  multiline = false,
  disabled = false,
  placeholder = "",
  helperText = "",
  maxLength,
  type = "text",
  ...textFieldProps
}) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isLoading, setIsLoading] = useState(false);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value || "");
  }, [value]);

  const handleBlur = () => {
    // Add a small delay to allow button clicks to register first
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 150);
  };

  const handleEdit = () => {
    setEditValue(value || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editValue !== value) {
      setIsLoading(true);
      try {
        await onSave(editValue);
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving edit:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          py: 1,
          px: editable ? 1.5 : 0,
          borderRadius: 1,
          border: editable ? `1px solid transparent` : "none",
          bgcolor: editable
            ? alpha(theme.palette.primary.main, 0.07)
            : "transparent",
          cursor: "pointer",
          "&:hover":
            editable && !disabled
              ? {
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }
              : {},
          transition: "all 0.2s ease",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            component="div"
            sx={{ fontSize: "0.85rem", mb: 0.5 }}
          >
            {label}
          </Typography>
          <Typography
            variant="body1"
            component="div"
            sx={{
              color: value ? "text.primary" : "text.disabled",
              wordBreak: "break-word",
              whiteSpace: multiline ? "pre-wrap" : "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value || placeholder || "Not set"}
          </Typography>
          {helperText && (
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
            >
              {helperText}
            </Typography>
          )}
        </Box>

        {editable && !disabled && (
          <Tooltip title={`Edit ${label.toLowerCase()}`}>
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{
                mt: 0.5,
                opacity: 0.7,
                "&:hover": { opacity: 1 },
              }}
              aria-label={`Edit ${label}`}
            >
              <Edit sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      <TextField
        fullWidth
        label={label}
        value={editValue}
        onChange={(e) => {
          setEditValue(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        multiline={multiline}
        minRows={multiline ? 3 : 1}
        type={type}
        disabled={isLoading}
        autoFocus
        helperText={
          maxLength
            ? `${helperText} (${editValue.length}/${maxLength})`
            : helperText
        }
        slotProps={{
          input: {
            maxLength,
            "aria-label": `Edit ${label}`,
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
            },
          },
        }}
        {...textFieldProps}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, gap: 1 }}>
        <Button
          size="small"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur from triggering
            handleCancel();
          }}
          disabled={isLoading}
          startIcon={<Close />}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur from triggering
            handleSave();
          }}
          disabled={isLoading || editValue === value}
          startIcon={<Check />}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}

export default InlineEditField;

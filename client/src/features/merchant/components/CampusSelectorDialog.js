import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  useMediaQuery,
  Divider,
  Stack,
} from "@mui/material";
import { Search, Close, SelectAll, Deselect } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { CAMPUS_OPTIONS } from "../../../constants/authConstant";

/**
 * CampusSelectorDialog Component
 *
 * PURPOSE: Multi-select dialog for deliverable campuses
 * PROPS:
 *  - open: Boolean - Dialog open state
 *  - onClose: Function - Close handler
 *  - selectedCampuses: Array - Currently selected campus keys
 *  - onSave: Function - Save selected campuses handler
 *
 * USAGE:
 *  <CampusSelectorDialog
 *    open={dialogOpen}
 *    onClose={() => setDialogOpen(false)}
 *    selectedCampuses={["SHAH_ALAM", "PUNCAK_ALAM"]}
 *    onSave={(campuses) => handleSave(campuses)}
 *  />
 */
function CampusSelectorDialog({
  open,
  onClose,
  selectedCampuses = [],
  onSave,
}) {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelected, setTempSelected] = useState([...selectedCampuses]);

  // Reset temp selection when dialog opens
  React.useEffect(() => {
    if (open) {
      setTempSelected([...selectedCampuses]);
      setSearchQuery("");
    }
  }, [open, selectedCampuses]);

  // Filter campuses based on search query
  const filteredCampuses = useMemo(() => {
    if (!searchQuery) return CAMPUS_OPTIONS;
    const query = searchQuery.toLowerCase();
    return CAMPUS_OPTIONS.filter(
      (campus) =>
        campus.label.toLowerCase().includes(query) ||
        campus.value.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Toggle campus selection
  const handleToggleCampus = (campusValue) => {
    setTempSelected((prev) => {
      if (prev.includes(campusValue)) {
        return prev.filter((v) => v !== campusValue);
      } else {
        return [...prev, campusValue];
      }
    });
  };

  // Select all campuses
  const handleSelectAll = () => {
    setTempSelected(filteredCampuses.map((c) => c.value));
  };

  // Deselect all campuses
  const handleDeselectAll = () => {
    setTempSelected([]);
  };

  // Remove campus chip
  const handleRemoveChip = (campusValue) => {
    setTempSelected((prev) => prev.filter((v) => v !== campusValue));
  };

  // Save and close
  const handleSave = () => {
    onSave(tempSelected);
    onClose();
  };

  // Get campus label from value
  const getCampusLabel = (value) => {
    const campus = CAMPUS_OPTIONS.find((c) => c.value === value);
    return campus ? campus.label : value;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="campus-dialog-title"
      aria-describedby="campus-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? "100%" : "80vh",
        },
      }}
    >
      <DialogTitle
        id="campus-dialog-title"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Select Deliverable Campuses
        </Typography>
        <Button
          onClick={onClose}
          size="small"
          aria-label="Close dialog"
          sx={{ minWidth: "auto" }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Stack spacing={2}>
          {/* Search Box */}
          <TextField
            fullWidth
            placeholder="Search campuses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
            inputProps={{
              "aria-label": "Search campuses",
            }}
          />

          {/* Select All / Deselect All */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
            }}
          >
            <Button
              size="small"
              startIcon={<SelectAll />}
              onClick={handleSelectAll}
              disabled={filteredCampuses.length === 0}
            >
              Select All
            </Button>
            <Button
              size="small"
              startIcon={<Deselect />}
              onClick={handleDeselectAll}
              disabled={tempSelected.length === 0}
            >
              Deselect All
            </Button>
          </Box>

          {/* Selected Campuses Chips */}
          {tempSelected.length > 0 && (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                }}
              >
                Selected ({tempSelected.length}):
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  maxHeight: "120px",
                  overflowY: "auto",
                  p: 1,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 1,
                }}
                role="list"
                aria-label="Selected campuses"
              >
                {tempSelected.map((campusValue) => (
                  <Chip
                    key={campusValue}
                    label={getCampusLabel(campusValue)}
                    onDelete={() => handleRemoveChip(campusValue)}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      maxWidth: "100%",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider />

          {/* Available Campuses List */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontWeight: 500,
                color: theme.palette.text.secondary,
              }}
            >
              Available Campuses:
            </Typography>
            <List
              sx={{
                maxHeight: "300px",
                overflowY: "auto",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 0,
              }}
              role="listbox"
              aria-label="Available campuses"
            >
              {filteredCampuses.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="No campuses found"
                    primaryTypographyProps={{
                      variant: "body2",
                      color: "text.secondary",
                      textAlign: "center",
                    }}
                  />
                </ListItem>
              ) : (
                filteredCampuses.map((campus) => {
                  const isSelected = tempSelected.includes(campus.value);
                  return (
                    <ListItemButton
                      key={campus.value}
                      onClick={() => handleToggleCampus(campus.value)}
                      dense
                      role="option"
                      aria-selected={isSelected}
                      sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        "&:last-child": {
                          borderBottom: "none",
                        },
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          inputProps={{
                            "aria-label": `Select ${campus.label}`,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={campus.label}
                        primaryTypographyProps={{
                          variant: "body2",
                        }}
                      />
                    </ListItemButton>
                  );
                })
              )}
            </List>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={tempSelected.length === 0}
        >
          Save ({tempSelected.length} selected)
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CampusSelectorDialog;

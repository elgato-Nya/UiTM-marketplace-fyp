import React from "react";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  MenuList,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Contrast,
  TextFields,
  Refresh,
  Palette,
  AccessibilityNew,
  ExpandMore,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

function ThemeToggle() {
  const {
    mode,
    fontSize,
    highContrast,
    isDark,
    isAccessible,
    toggleTheme,
    setTheme,
    setFontSize,
    resetFontSize,
    toggleHighContrast,
    THEMES,
    FONT_SIZES,
  } = useTheme();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    handleClose();
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    handleClose();
  };

  const getThemeIcon = () => {
    if (isAccessible) return <Contrast />;
    if (isDark) return <Brightness4 />;
    return <Brightness7 />;
  };

  const getThemeLabel = () => {
    if (isAccessible) return "High Contrast Mode";
    if (isDark) return "Dark Mode";
    return "Light Mode";
  };

  const getFontSizeLabel = () => {
    const labels = {
      [FONT_SIZES.SMALL]: "Small Text",
      [FONT_SIZES.MEDIUM]: "Medium Text",
      [FONT_SIZES.LARGE]: "Large Text",
      [FONT_SIZES.XL]: "Extra Large Text",
    };
    return labels[fontSize] || "Medium Text";
  };

  return (
    <>
      <Tooltip title="Theme & Accessibility Settings">
        <IconButton
          onClick={handleClick}
          aria-label="Theme and accessibility settings"
          aria-controls={open ? "theme-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          color="inherit"
          sx={{
            border: isAccessible ? 2 : 0,
            borderColor: "primary.main",
          }}
        >
          {getThemeIcon()}
        </IconButton>
      </Tooltip>

      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "theme-button",
          },
          paper: {
            sx: { minWidth: 280 },
          },
        }}
      >
        {/* Current Settings Display */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Current Settings
          </Typography>
          <Typography variant="body2">
            {getThemeLabel()} • {getFontSizeLabel()}
            {highContrast && " • High Contrast"}
          </Typography>
        </Box>

        <Divider />

        {/* Theme Options */}
        <MenuList>
          <Typography
            variant="subtitle2"
            sx={{ px: 2, py: 1, color: "text.secondary" }}
          >
            Theme
          </Typography>
          <MenuItem
            onClick={() => handleThemeChange(THEMES.LIGHT)}
            selected={mode === THEMES.LIGHT && !highContrast}
          >
            <ListItemIcon>
              <Brightness7 />
            </ListItemIcon>
            <ListItemText>Light</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleThemeChange(THEMES.DARK)}
            selected={mode === THEMES.DARK && !highContrast}
          >
            <ListItemIcon>
              <Brightness4 />
            </ListItemIcon>
            <ListItemText>Dark</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleThemeChange(THEMES.ACCESSIBLE)}
            selected={mode === THEMES.ACCESSIBLE}
          >
            <ListItemIcon>
              <AccessibilityNew />
            </ListItemIcon>
            <ListItemText>
              Accessible
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                High contrast, simplified design
              </Typography>
            </ListItemText>
          </MenuItem>
        </MenuList>

        <Divider />

        {/* Font Size Options */}
        <MenuList>
          <Typography
            variant="subtitle2"
            sx={{ px: 2, py: 1, color: "text.secondary" }}
          >
            Font Size
          </Typography>
          {/* Quick Select Row */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 2,
              mb: 1,
            }}
          >
            {[
              { label: "S", value: FONT_SIZES.SMALL },
              { label: "M", value: FONT_SIZES.MEDIUM },
              { label: "L", value: FONT_SIZES.LARGE },
              { label: "XL", value: FONT_SIZES.XL },
            ].map((option) => (
              <Button
                key={option.value}
                size="small"
                variant={fontSize === option.value ? "contained" : "outlined"}
                onClick={() => handleFontSizeChange(option.value)}
                sx={{ minWidth: 36, mx: 0.5, fontWeight: 600 }}
              >
                {option.label}
              </Button>
            ))}{" "}
          </Box>{" "}
          <MenuItem
            onClick={() => {
              resetFontSize();
              handleClose();
            }}
            disabled={fontSize === FONT_SIZES.MEDIUM}
          >
            <ListItemIcon>
              <Refresh />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">Reset to Default (M)</Typography>
            </ListItemText>
          </MenuItem>
          {/* More Options Dropdown
          <Accordion sx={{ boxShadow: "none" }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="font-size-details"
              id="font-size-details-header"
              sx={{ px: 2, py: 0, minHeight: 32 }}
            >
              <Typography variant="body2" color="primary">
                More Options
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, py: 0 }}>
              {[
                {
                  value: FONT_SIZES.SMALL,
                  iconSize: 16,
                  label: "XS - Extra Small",
                  desc: "Smallest text size",
                },
                {
                  value: FONT_SIZES.MEDIUM,
                  iconSize: 20,
                  label: "S - Small (Default)",
                  desc: "Standard text size",
                },
                {
                  value: FONT_SIZES.LARGE,
                  iconSize: 24,
                  label: "M - Medium",
                  desc: "Larger text for better readability",
                },
                {
                  value: FONT_SIZES.XL,
                  iconSize: 28,
                  label: "XL - Extra Large",
                  desc: "Largest text size",
                },
              ].map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handleFontSizeChange(option.value)}
                  selected={fontSize === option.value}
                >
                  <ListItemIcon>
                    <TextFields sx={{ fontSize: option.iconSize }} />
                  </ListItemIcon>
                  <ListItemText>
                    {option.label}
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {option.desc}
                    </Typography>
                  </ListItemText>
                </MenuItem>
              ))}

 
            </AccordionDetails>
          </Accordion> */}
        </MenuList>

        <Divider />

        {/* Accessibility Options */}
        <MenuItem
          onClick={() => {
            toggleHighContrast();
            handleClose();
          }}
        >
          <ListItemIcon>
            <Contrast />
          </ListItemIcon>
          <ListItemText>
            {highContrast ? "Disable" : "Enable"} High Contrast
          </ListItemText>
        </MenuItem>

        <Divider />

        {/* Quick Toggle */}
        <MenuItem
          onClick={() => {
            toggleTheme();
            handleClose();
          }}
        >
          <ListItemIcon>
            <Palette />
          </ListItemIcon>
          <ListItemText>
            Quick Toggle
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Cycle through all themes
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default ThemeToggle;

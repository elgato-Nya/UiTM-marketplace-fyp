import React from "react";
import {
  IconButton,
  Tooltip,
  Menu,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  Divider,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Contrast,
  AccessibilityNew,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

function ThemeToggle() {
  const {
    mode,
    fontSize,
    highContrast,
    isDark,
    isAccessible,
    setTheme,
    setFontSize,
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

  const handleThemeChange = (event, newTheme) => {
    if (newTheme !== null) {
      setTheme(newTheme);
    }
  };

  const handleFontSizeChange = (event, newSize) => {
    if (newSize !== null) {
      setFontSize(newSize);
    }
  };

  const getThemeIcon = () => {
    if (isAccessible) return <Contrast />;
    if (isDark) return <Brightness4 />;
    return <Brightness7 />;
  };

  return (
    <>
      <Tooltip title="Appearance">
        <IconButton
          onClick={handleClick}
          aria-label="Appearance settings"
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
          paper: {
            sx: {
              width: 240,
              p: 2,
              borderRadius: 2,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Theme Section */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              display: "block",
              mb: 1,
            }}
          >
            Theme
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleThemeChange}
            aria-label="theme selection"
            fullWidth
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                py: 1,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.813rem",
                borderRadius: 1,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
              },
            }}
          >
            <ToggleButton value={THEMES.LIGHT} aria-label="light theme">
              <Brightness7 sx={{ fontSize: 16, mr: 0.5 }} />
              Light
            </ToggleButton>
            <ToggleButton value={THEMES.DARK} aria-label="dark theme">
              <Brightness4 sx={{ fontSize: 16, mr: 0.5 }} />
              Dark
            </ToggleButton>
            <ToggleButton
              value={THEMES.ACCESSIBLE}
              aria-label="accessible theme"
            >
              <AccessibilityNew sx={{ fontSize: 16, mr: 0.5 }} />
              Contrast
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Font Size Section */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              display: "block",
              mb: 1,
            }}
          >
            Text Size
          </Typography>
          <ToggleButtonGroup
            value={fontSize}
            exclusive
            onChange={handleFontSizeChange}
            aria-label="font size selection"
            fullWidth
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
              },
            }}
          >
            <ToggleButton
              value={FONT_SIZES.SMALL}
              aria-label="small text"
              sx={{ fontSize: "0.75rem" }}
            >
              S
            </ToggleButton>
            <ToggleButton
              value={FONT_SIZES.MEDIUM}
              aria-label="medium text"
              sx={{ fontSize: "0.875rem" }}
            >
              M
            </ToggleButton>
            <ToggleButton
              value={FONT_SIZES.LARGE}
              aria-label="large text"
              sx={{ fontSize: "1rem" }}
            >
              L
            </ToggleButton>
            <ToggleButton
              value={FONT_SIZES.XL}
              aria-label="extra large text"
              sx={{ fontSize: "1.125rem" }}
            >
              XL
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* High Contrast Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              High Contrast
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Improve visibility
            </Typography>
          </Box>
          <Switch
            checked={highContrast}
            onChange={toggleHighContrast}
            size="small"
            inputProps={{ "aria-label": "toggle high contrast" }}
          />
        </Box>
      </Menu>
    </>
  );
}

export default ThemeToggle;

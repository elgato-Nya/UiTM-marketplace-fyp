import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createTheme } from "@mui/material/styles";
import {
  THEMES,
  FONT_SIZES,
  setTheme as setThemeAction,
  toggleTheme as toggleThemeAction,
  setFontSize as setFontSizeAction,
  increaseFontSize as increaseFontSizeAction,
  decreaseFontSize as decreaseFontSizeAction,
  resetFontSize as resetFontSizeAction,
  toggleHighContrast as toggleHighContrastAction,
  setHighContrast as setHighContrastAction,
} from "../store/slice/themeSlice";

// UiTM Brand Colors
const colors = {
  primary: {
    // Dark Purple palette
    50: "#F3E8FF", // Very light purple
    100: "#E9D5FF", // Light purple
    200: "#D8B4FE", // Lighter purple
    300: "#C084FC", // Medium light purple
    400: "#A855F7", // Medium purple
    500: "#9333EA", // Main purple
    600: "#7C3AED", // Darker purple
    700: "#6D28D9", // Much darker purple
    800: "#5B21B6", // Very dark purple
    900: "#4C1D95", // Deepest purple
  },
  secondary: {
    // Dark Navy Blue palette
    50: "#F0F9FF", // Very light navy
    100: "#E0F2FE", // Light navy
    200: "#BAE6FD", // Lighter navy
    300: "#7DD3FC", // Medium light navy
    400: "#38BDF8", // Medium navy
    500: "#0EA5E9", // Main navy
    600: "#0284C7", // Dark navy blue
    700: "#0369A1", // Darker navy
    800: "#075985", // Very dark navy
    900: "#0C4A6E", // Deepest navy
  },
  accent: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#FFD700", // UiTM Gold
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },
};

// Create MUI theme based on mode and preferences
function createAppTheme(mode, fontSize, highContrast) {
  const isDark = mode === THEMES.DARK;
  const isAccessible = mode === THEMES.ACCESSIBLE || highContrast;

  // Font size multiplier
  const fontMultiplier =
    {
      [FONT_SIZES.SMALL]: 0.875,
      [FONT_SIZES.MEDIUM]: 1,
      [FONT_SIZES.LARGE]: 1.125,
      [FONT_SIZES.XL]: 1.25,
    }[fontSize] || 1;

  // Color palette based on theme mode
  const palette = {
    mode: isAccessible ? "light" : isDark ? "dark" : "light",
    primary: {
      main: isAccessible
        ? "#000000"
        : isDark
          ? colors.primary[700]
          : colors.primary[500],
      light: isAccessible
        ? "#333333"
        : isDark
          ? colors.primary[600]
          : colors.primary[400],
      dark: isAccessible
        ? "#000000"
        : isDark
          ? colors.primary[900]
          : colors.primary[600],
      contrastText: isAccessible ? "#FFFFFF" : "#FFFFFF",
    },
    secondary: {
      main: isAccessible
        ? "#000000"
        : isDark
          ? colors.secondary[600]
          : colors.secondary[400],
      light: isAccessible
        ? "#333333"
        : isDark
          ? colors.secondary[400]
          : colors.secondary[200],
      dark: isAccessible
        ? "#000000"
        : isDark
          ? colors.secondary[800]
          : colors.secondary[600],
      contrastText: isAccessible ? "#FFFFFF" : "#FFFFFF",
    },
    background: {
      default: isAccessible ? "#FFFFFF" : isDark ? "#141313ff" : "#fafafaff",
      paper: isAccessible ? "#FFFFFF" : isDark ? "#1E1E1E" : "#FFFFFF",
      bold: isAccessible ? "#E0E0E0" : isDark ? "#0A0A0A" : "#F5F5F5",
    },
    text: {
      primary: isAccessible ? "#000000" : isDark ? "#FFFFFF" : "#212121",
      secondary: isAccessible ? "#000000" : isDark ? "#B3B3B3" : "#757575",
      disabled: isAccessible ? "#666666" : isDark ? "#666666" : "#BDBDBD",
    },
    divider: isAccessible ? "#000000" : isDark ? "#333333" : "#E0E0E0",
    success: {
      main: isAccessible ? "#000000" : isDark ? "#4CAF50" : "#2E7D32",
    },
    warning: {
      main: isAccessible ? "#000000" : isDark ? "#FF9800" : "#ED6C02",
    },
    error: {
      main: isAccessible ? "#000000" : isDark ? "#F44336" : "#D32F2F",
    },
    info: {
      main: isAccessible ? "#000000" : isDark ? "#2196F3" : "#0288d1ff",
    },
  };

  return createTheme({
    palette,
    typography: {
      fontFamily:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      fontSize: 14 * fontMultiplier,
      h1: {
        fontSize: `${2.5 * fontMultiplier}rem`,
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: `${2 * fontMultiplier}rem`,
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: `${1.75 * fontMultiplier}rem`,
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: `${1.5 * fontMultiplier}rem`,
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: `${1.25 * fontMultiplier}rem`,
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: `${1.125 * fontMultiplier}rem`,
        fontWeight: 500,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: `${1 * fontMultiplier}rem`,
        lineHeight: 1.6,
      },
      body2: {
        fontSize: `${0.875 * fontMultiplier}rem`,
        lineHeight: 1.5,
      },
      button: {
        fontSize: `${0.875 * fontMultiplier}rem`,
        fontWeight: 500,
        textTransform: "none",
      },
    },
    shape: {
      borderRadius: isAccessible ? 0 : 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: isAccessible ? 0 : 8,
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              boxShadow: isAccessible ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
            },
            "&:focus-visible": {
              outline: `2px solid ${palette.primary.main}`,
              outlineOffset: "2px",
            },
          },
          contained: {
            "&:hover": {
              boxShadow: isAccessible ? "none" : "0 4px 12px rgba(0,0,0,0.15)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: isAccessible ? 0 : 12,
            boxShadow: isAccessible
              ? `1px 1px 0 ${palette.divider}`
              : "0 2px 8px rgba(0,0,0,0.1)",
            border: isAccessible ? `1px solid ${palette.divider}` : "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: isAccessible ? 0 : 8,
              "&:focus-within": {
                outline: isAccessible
                  ? `2px solid ${palette.primary.main}`
                  : "none",
                outlineOffset: "2px",
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isAccessible
              ? `0 1px 0 ${palette.divider}`
              : "0 2px 4px rgba(0,0,0,0.1)",
          },
        },
      },
    },
  });
}

export function useTheme() {
  const dispatch = useDispatch();

  // Get theme state from Redux store
  const { mode, fontSize, highContrast } = useSelector((state) => state.theme);

  // Create theme object
  const theme = useMemo(() => {
    return createAppTheme(mode, fontSize, highContrast);
  }, [mode, fontSize, highContrast]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Set theme attribute for CSS variables
    root.setAttribute("data-theme", mode);
    root.setAttribute("data-font-size", fontSize);

    // Set class for Tailwind CSS dark mode
    root.classList.toggle("dark", mode === THEMES.DARK);

    // Set high contrast class
    root.classList.toggle("high-contrast", highContrast);
  }, [mode, fontSize, highContrast]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedMode = localStorage.getItem("theme-mode");
      if (!savedMode) {
        dispatch(setThemeAction(e.matches ? THEMES.DARK : THEMES.LIGHT));
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [dispatch]);

  // Theme control functions that dispatch Redux actions
  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  const setTheme = (newMode) => {
    dispatch(setThemeAction(newMode));
  };

  const increaseFontSize = () => {
    dispatch(increaseFontSizeAction());
  };

  const decreaseFontSize = () => {
    dispatch(decreaseFontSizeAction());
  };

  const resetFontSize = () => {
    dispatch(resetFontSizeAction());
  };

  const setFontSize = (size) => {
    dispatch(setFontSizeAction(size));
  };

  const toggleHighContrast = () => {
    dispatch(toggleHighContrastAction());
  };

  return {
    // Current theme state
    theme,
    mode,
    fontSize,
    highContrast,

    // Computed properties
    isDark: mode === THEMES.DARK,
    isLight: mode === THEMES.LIGHT,
    isAccessible: mode === THEMES.ACCESSIBLE || highContrast,

    // Theme control functions
    toggleTheme,
    setTheme,

    // Font size controls
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setFontSize,

    // Accessibility controls
    toggleHighContrast,

    // Constants for components (re-exported from slice)
    THEMES,
    FONT_SIZES,
  };
}

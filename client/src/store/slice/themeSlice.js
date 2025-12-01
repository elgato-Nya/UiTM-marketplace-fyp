import { createSlice } from "@reduxjs/toolkit";

// Theme constants
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  ACCESSIBLE: "accessible",
};

export const FONT_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  XL: "xl",
};

// Helper function to get initial theme from localStorage or system preference
function getInitialTheme() {
  try {
    const saved = localStorage.getItem("theme-mode");
    if (saved && Object.values(THEMES).includes(saved)) {
      return saved;
    }
    // Detect system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEMES.DARK
      : THEMES.LIGHT;
  } catch {
    return THEMES.LIGHT;
  }
}

function getInitialFontSize() {
  try {
    const saved = localStorage.getItem("theme-font-size");
    return saved && Object.values(FONT_SIZES).includes(saved)
      ? saved
      : FONT_SIZES.MEDIUM;
  } catch {
    return FONT_SIZES.MEDIUM;
  }
}

function getInitialHighContrast() {
  try {
    const saved = localStorage.getItem("theme-high-contrast");
    return saved === "true";
  } catch {
    return false;
  }
}

// Initial state
const initialState = {
  mode: getInitialTheme(),
  fontSize: getInitialFontSize(),
  highContrast: getInitialHighContrast(),
};

// Theme slice
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      if (Object.values(THEMES).includes(action.payload)) {
        state.mode = action.payload;
        // Save to localStorage
        try {
          localStorage.setItem("theme-mode", action.payload);
        } catch (error) {
          console.warn("Failed to save theme mode:", error);
        }
      }
    },

    toggleTheme: (state) => {
      const currentMode = state.mode;
      let newMode;

      if (currentMode === THEMES.LIGHT) {
        newMode = THEMES.DARK;
      } else if (currentMode === THEMES.DARK) {
        newMode = THEMES.ACCESSIBLE;
      } else {
        newMode = THEMES.LIGHT;
      }

      state.mode = newMode;
      try {
        localStorage.setItem("theme-mode", newMode);
      } catch (error) {
        console.warn("Failed to save theme mode:", error);
      }
    },

    setFontSize: (state, action) => {
      if (Object.values(FONT_SIZES).includes(action.payload)) {
        state.fontSize = action.payload;
        try {
          localStorage.setItem("theme-font-size", action.payload);
        } catch (error) {
          console.warn("Failed to save font size:", error);
        }
      }
    },

    increaseFontSize: (state) => {
      const sizes = Object.values(FONT_SIZES);
      const currentIndex = sizes.indexOf(state.fontSize);
      const newFontSize = sizes[Math.min(currentIndex + 1, sizes.length - 1)];

      state.fontSize = newFontSize;
      try {
        localStorage.setItem("theme-font-size", newFontSize);
      } catch (error) {
        console.warn("Failed to save font size:", error);
      }
    },

    decreaseFontSize: (state) => {
      const sizes = Object.values(FONT_SIZES);
      const currentIndex = sizes.indexOf(state.fontSize);
      const newFontSize = sizes[Math.max(currentIndex - 1, 0)];

      state.fontSize = newFontSize;
      try {
        localStorage.setItem("theme-font-size", newFontSize);
      } catch (error) {
        console.warn("Failed to save font size:", error);
      }
    },

    resetFontSize: (state) => {
      state.fontSize = FONT_SIZES.MEDIUM;
      try {
        localStorage.setItem("theme-font-size", FONT_SIZES.MEDIUM);
      } catch (error) {
        console.warn("Failed to save font size:", error);
      }
    },

    toggleHighContrast: (state) => {
      state.highContrast = !state.highContrast;
      try {
        localStorage.setItem(
          "theme-high-contrast",
          state.highContrast.toString()
        );
      } catch (error) {
        console.warn("Failed to save high contrast setting:", error);
      }
    },

    setHighContrast: (state, action) => {
      state.highContrast = Boolean(action.payload);
      try {
        localStorage.setItem(
          "theme-high-contrast",
          state.highContrast.toString()
        );
      } catch (error) {
        console.warn("Failed to save high contrast setting:", error);
      }
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setFontSize,
  increaseFontSize,
  decreaseFontSize,
  resetFontSize,
  toggleHighContrast,
  setHighContrast,
} = themeSlice.actions;

export default themeSlice.reducer;

import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
} from "@mui/material";
import { ShoppingBag, Build, ViewModule as AllIcon } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

/**
 * TypeToggle - Toggle buttons for switching between listing types
 * @param {Object} props
 * @param {string} props.value - Current active type
 * @param {Function} props.onChange - Callback when type changes
 * @param {Object} props.config - Configuration for custom types
 */
const TypeToggle = ({ value, onChange, config = {} }) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Default type configuration (can be overridden)
  const defaultTypes = [
    {
      value: "all",
      label: "All Listings",
      icon: (
        <AllIcon sx={{ mr: isMobile ? 0 : 1, fontSize: isMobile ? 20 : 22 }} />
      ),
      ariaLabel: "all listings",
    },
    {
      value: "product",
      label: "Products",
      icon: (
        <ShoppingBag
          sx={{ mr: isMobile ? 0 : 1, fontSize: isMobile ? 20 : 22 }}
        />
      ),
      ariaLabel: "products",
    },
    {
      value: "service",
      label: "Services",
      icon: (
        <Build sx={{ mr: isMobile ? 0 : 1, fontSize: isMobile ? 20 : 22 }} />
      ),
      ariaLabel: "services",
    },
  ];

  const types = config.types || defaultTypes;

  return (
    <Box
      sx={{
        display: "inline-flex",
        bgcolor: "background.paper",
        p: isMobile ? 0.5 : 0.75,
        borderRadius: isMobile ? 2 : 3,
        border: isMobile ? 1 : 2,
        borderColor: "divider",
        boxShadow: isMobile ? 1 : 2,
        width: isMobile ? "100%" : "auto",
      }}
    >
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={onChange}
        aria-label="listing type"
        sx={{
          gap: isMobile ? 0.5 : 1,
          width: isMobile ? "100%" : "auto",
          "& .MuiToggleButtonGroup-grouped": {
            border: 0,
            borderRadius: "12px !important",
            "&.Mui-selected": {
              border: 0,
            },
          },
          "& .MuiToggleButton-root": {
            px: isMobile ? 1 : 3,
            py: isMobile ? 0.75 : 1.25,
            textTransform: "none",
            fontWeight: 600,
            fontSize: isMobile ? "0.8rem" : "0.975rem",
            border: "none",
            borderRadius: 2,
            transition: "all 0.3s ease",
            color: theme.palette.text.secondary,
            flex: isMobile ? 1 : "0 1 auto",
            minWidth: isMobile ? 0 : "auto",
            "&.Mui-selected": {
              bgcolor: theme.palette.primary.main,
              color: "white",
              boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            },
            "&:hover:not(.Mui-selected)": {
              bgcolor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
            },
          },
        }}
      >
        {types.map((type) => (
          <ToggleButton
            key={type.value}
            value={type.value}
            aria-label={type.ariaLabel}
          >
            {isMobile ? (
              // Icon only on mobile
              type.icon
            ) : (
              // Icon + Label on desktop
              <>
                {type.icon}
                {type.label}
              </>
            )}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default TypeToggle;

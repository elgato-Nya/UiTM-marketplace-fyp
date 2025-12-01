import { Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";

/**
 * StandardizedBackButton Component
 *
 * A professional, reusable back button component with consistent styling
 * across the application.
 *
 * @param {Object} props
 * @param {Function} props.onClick - Custom click handler (optional)
 * @param {string} props.label - Button text (default: "Back")
 * @param {string} props.variant - MUI Button variant (default: "outlined")
 * @param {string} props.size - MUI Button size (default: "medium")
 * @param {Object} props.sx - Additional styles
 * @param {string} props.ariaLabel - Accessibility label
 * @param {string} props.to - Navigate to specific route instead of -1
 */
const BackButton = ({
  onClick,
  label = "Back",
  variant = "outlined",
  size = "medium",
  sx = {},
  ariaLabel = "Go back to previous page",
  to,
  ...otherProps
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<ArrowBack />}
      onClick={handleClick}
      aria-label={ariaLabel}
      sx={{
        fontWeight: 600,
        textTransform: "none",
        borderRadius: 2,
        px: 3,
        py: 1,
        transition: "all 0.3s ease",
        borderWidth: variant === "outlined" ? 2 : undefined,
        "&:hover": {
          borderWidth: variant === "outlined" ? 2 : undefined,
          transform: "translateX(-4px)",
          boxShadow: theme.shadows[4],
        },
        ...sx,
      }}
      {...otherProps}
    >
      {label}
    </Button>
  );
};

export default BackButton;

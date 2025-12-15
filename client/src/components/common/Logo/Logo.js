import { Box } from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";

// Import Platform SVG files (M logo)
import PlatformIconDark from "../../../styles/platformSVG/icon_mark_dark.svg";
import PlatformIconLight from "../../../styles/platformSVG/icon_mark_light.svg";
import PlatformStackedDark from "../../../styles/platformSVG/stacked_lockup_dark.svg";
import PlatformStackedLight from "../../../styles/platformSVG/stacked_lockup_light.svg";
import PlatformHorizontalDark from "../../../styles/platformSVG/horizontal_lockup_dark.svg";
import PlatformHorizontalLight from "../../../styles/platformSVG/horizontal_lockup_light.svg";

// Import Brand SVG files (Cat logo - for Nekodez brand)
import BrandIconDark from "../../../styles/brandSVG/icon_mark_dark.svg";
import BrandIconLight from "../../../styles/brandSVG/icon_mark_light.svg";
import BrandStackedDark from "../../../styles/brandSVG/stacked_lockup_dark.svg";
import BrandStackedLight from "../../../styles/brandSVG/stacked_lockup_light.svg";
import BrandHorizontalDark from "../../../styles/brandSVG/horizontal_lockup_dark.svg";
import BrandHorizontalLight from "../../../styles/brandSVG/horizontal_lockup_light.svg";

/**
 * Logo Component
 *
 * Responsive logo component that adapts to theme changes
 *
 * @param {Object} props
 * @param {string} props.variant - Logo variant: "icon", "stacked", "horizontal"
 * @param {string} props.type - Logo type: "platform" (M logo) or "brand" (Cat logo for Nekodez)
 * @param {string|number} props.height - Height of the logo
 * @param {string|number} props.width - Width of the logo
 * @param {Object} props.sx - Additional MUI sx prop for styling
 */
const Logo = ({
  variant = "icon",
  type = "platform",
  height = "auto",
  width = "auto",
  sx = {},
  ...props
}) => {
  const { theme, mode } = useTheme();

  // Select appropriate SVG based on variant, type and theme
  const getLogoSrc = () => {
    // For accessible mode, always use light version
    const isLightMode = mode === "light" || mode === "accessible";

    // Choose between platform (M logo) and brand (Cat logo)
    const logoSet =
      type === "brand"
        ? {
            icon: { light: BrandIconLight, dark: BrandIconDark },
            stacked: { light: BrandStackedLight, dark: BrandStackedDark },
            horizontal: {
              light: BrandHorizontalLight,
              dark: BrandHorizontalDark,
            },
          }
        : {
            icon: { light: PlatformIconLight, dark: PlatformIconDark },
            stacked: { light: PlatformStackedLight, dark: PlatformStackedDark },
            horizontal: {
              light: PlatformHorizontalLight,
              dark: PlatformHorizontalDark,
            },
          };

    const selectedVariant = logoSet[variant] || logoSet.icon;
    return isLightMode ? selectedVariant.light : selectedVariant.dark;
  };

  return (
    <Box
      component="img"
      src={getLogoSrc()}
      alt={type === "brand" ? "Nekodez" : "MarKet"}
      sx={{
        height,
        width,
        objectFit: "contain",
        userSelect: "none",
        ...sx,
      }}
      {...props}
    />
  );
};

export default Logo;

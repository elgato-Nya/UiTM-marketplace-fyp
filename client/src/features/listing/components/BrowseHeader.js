import { Box, Typography, Chip } from "@mui/material";
import { ShoppingBag, Build, ViewModule as AllIcon } from "@mui/icons-material";

/**
 * BrowseHeader - Displays dynamic header based on listing type
 * @param {Object} props
 * @param {string} props.activeType - Current active type ('all', 'product', 'service')
 * @param {number} props.totalCount - Total number of listings
 * @param {number} props.freeCount - Number of free listings
 * @param {Function} props.getGradient - Function to get gradient based on type
 */
const BrowseHeader = ({
  activeType,
  totalCount = 0,
  freeCount = 0,
  getGradient,
}) => {
  // Icon mapping for each type
  const getTypeIcon = () => {
    const iconMap = {
      product: <ShoppingBag sx={{ fontSize: 32 }} />,
      service: <Build sx={{ fontSize: 32 }} />,
      all: <AllIcon sx={{ fontSize: 32 }} />,
    };
    return iconMap[activeType] || iconMap.all;
  };

  // Title mapping for each type
  const getTitle = () => {
    const titleMap = {
      product: "Products",
      service: "Services",
      all: "Browse All",
    };
    return titleMap[activeType] || titleMap.all;
  };

  // Dynamic subtitle text
  const getSubtitle = () => {
    const itemType =
      activeType === "all"
        ? totalCount === 1
          ? "listing"
          : "listings"
        : activeType === "product"
          ? totalCount === 1
            ? "product"
            : "products"
          : totalCount === 1
            ? "service"
            : "services";

    return `${totalCount} ${itemType} available`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Icon Container */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: 2,
          background: getGradient(),
          boxShadow: 3,
        }}
      >
        <Box sx={{ color: "white" }}>{getTypeIcon()}</Box>
      </Box>

      {/* Title and Subtitle */}
      <Box>
        <Typography
          variant="h3"
          component="h1"
          fontWeight="bold"
          sx={{
            background: getGradient(),
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            mb: 0.5,
          }}
        >
          {getTitle()}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            {getSubtitle()}
          </Typography>

          {/* Free Items Badge */}
          {freeCount > 0 && (
            <>
              <Typography variant="body1" color="text.secondary">
                •
              </Typography>
              <Chip
                label={`${freeCount} Free ${freeCount === 1 ? "item" : "items"}`}
                size="small"
                color="success"
                sx={{ fontWeight: 600 }}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BrowseHeader;

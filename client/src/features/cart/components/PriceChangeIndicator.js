import { Box, Typography, Chip } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";

const PriceChangeIndicator = ({
  originalPrice,
  currentPrice,
  showLabel = true,
  size = "small",
}) => {
  // Validate prices
  const validOriginalPrice = Number(originalPrice) || 0;
  const validCurrentPrice = Number(currentPrice) || 0;

  if (validOriginalPrice === 0 || validCurrentPrice === 0) {
    return null;
  }

  if (validOriginalPrice === validCurrentPrice) {
    return showLabel ? (
      <Chip
        icon={<RemoveIcon />}
        label="Same price"
        size={size}
        color="default"
        variant="outlined"
      />
    ) : null;
  }

  const priceDiff = validCurrentPrice - validOriginalPrice;
  const percentChange = ((priceDiff / validOriginalPrice) * 100).toFixed(1);
  const isIncrease = priceDiff > 0;

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <Chip
        icon={isIncrease ? <TrendingUpIcon /> : <TrendingDownIcon />}
        label={
          showLabel
            ? `${isIncrease ? "+" : ""} RM${Math.abs(priceDiff).toFixed(2)} (${isIncrease ? "+" : ""}${percentChange}%)`
            : `${isIncrease ? "+" : ""}${percentChange}%`
        }
        size={size}
        color={isIncrease ? "error" : "success"}
        variant="outlined"
        sx={{
          fontWeight: 600,
          "& .MuiChip-icon": {
            fontSize: 16,
          },
        }}
      />
      {showLabel && (
        <Typography variant="caption" color="text.secondary">
          {isIncrease ? "Price increased" : "Price decreased"}
        </Typography>
      )}
    </Box>
  );
};

export default PriceChangeIndicator;

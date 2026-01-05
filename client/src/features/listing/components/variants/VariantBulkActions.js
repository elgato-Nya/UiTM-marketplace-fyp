import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "../../../../hooks/useTheme";

/**
 * VariantBulkActions - Apply same price/stock to all variants
 *
 * Features:
 * - Checkbox to enable bulk price
 * - Checkbox to enable bulk stock
 * - Apply button to set values for all variants
 */
const VariantBulkActions = ({
  onApplyPrice,
  onApplyStock,
  listingType = "product",
  disabled = false,
  variantCount = 0,
}) => {
  const { isDark: isDarkMode } = useTheme();
  const isProduct = listingType === "product";

  const [bulkPriceEnabled, setBulkPriceEnabled] = useState(false);
  const [bulkStockEnabled, setBulkStockEnabled] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const handleApplyPrice = useCallback(() => {
    const price = parseFloat(bulkPrice);
    if (!isNaN(price) && price >= 0) {
      onApplyPrice(price);
    }
  }, [bulkPrice, onApplyPrice]);

  const handleApplyStock = useCallback(() => {
    const stock = parseInt(bulkStock);
    if (!isNaN(stock) && stock >= 0) {
      onApplyStock(stock);
    }
  }, [bulkStock, onApplyStock]);

  if (variantCount === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        bgcolor: isDarkMode ? "grey.900" : "grey.50",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
        Bulk Actions
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        {/* Bulk Price */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={bulkPriceEnabled}
                onChange={(e) => setBulkPriceEnabled(e.target.checked)}
                disabled={disabled}
              />
            }
            label={<Typography variant="body2">Apply same price:</Typography>}
            sx={{ mr: 0 }}
          />
          <TextField
            size="small"
            type="number"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            disabled={disabled || !bulkPriceEnabled}
            placeholder="0.00"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">RM</InputAdornment>
              ),
            }}
            inputProps={{
              min: 0,
              step: 0.01,
            }}
            sx={{ width: 120 }}
          />
          <Button
            size="small"
            variant="outlined"
            onClick={handleApplyPrice}
            disabled={disabled || !bulkPriceEnabled || bulkPrice === ""}
            sx={{ textTransform: "none" }}
          >
            Apply
          </Button>
        </Box>

        {/* Bulk Stock (products only) */}
        {isProduct && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={bulkStockEnabled}
                  onChange={(e) => setBulkStockEnabled(e.target.checked)}
                  disabled={disabled}
                />
              }
              label={<Typography variant="body2">Apply same stock:</Typography>}
              sx={{ mr: 0 }}
            />
            <TextField
              size="small"
              type="number"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              disabled={disabled || !bulkStockEnabled}
              placeholder="0"
              inputProps={{
                min: 0,
                step: 1,
              }}
              sx={{ width: 80 }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={handleApplyStock}
              disabled={disabled || !bulkStockEnabled || bulkStock === ""}
              sx={{ textTransform: "none" }}
            >
              Apply
            </Button>
          </Box>
        )}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        Applies to all {variantCount} variant{variantCount !== 1 ? "s" : ""}
      </Typography>
    </Box>
  );
};

VariantBulkActions.propTypes = {
  onApplyPrice: PropTypes.func.isRequired,
  onApplyStock: PropTypes.func.isRequired,
  listingType: PropTypes.oneOf(["product", "service"]),
  disabled: PropTypes.bool,
  variantCount: PropTypes.number,
};

export default VariantBulkActions;

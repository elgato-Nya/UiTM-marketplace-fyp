import { useCallback } from "react";
import { Box, Typography, Chip, CircularProgress } from "@mui/material";
import { Inventory as InventoryIcon } from "@mui/icons-material";
import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/useTheme";
import { VariantBuilder } from "./variants";
import { VARIANT_LIMITS } from "../../../constants/listingConstant";

const VariantManager = ({
  variants = [],
  listingType = "product",
  onBulkChange,
  isLoading = false,
  disabled = false,
  defaultPrice = 0,
  defaultStock = 0,
}) => {
  const { isDark } = useTheme();
  const maxVariants = VARIANT_LIMITS.MAX_VARIANTS_PER_LISTING;

  const handleBuilderChange = useCallback(
    (updatedVariants) => {
      if (onBulkChange) {
        onBulkChange(updatedVariants);
      }
    },
    [onBulkChange]
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InventoryIcon color="primary" />
          <Typography variant="h6" color="primary" sx={{ fontWeight: "medium" }}>
            Product Variants
          </Typography>
          <Chip
            label={`${variants.length}/${maxVariants}`}
            size="small"
            color={variants.length > 0 ? "primary" : "default"}
            variant="outlined"
          />
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Create variants for different options. Each variant has its own price and stock.
      </Typography>

      {onBulkChange && (
        <VariantBuilder
          variants={variants}
          onChange={handleBuilderChange}
          listingType={listingType}
          disabled={disabled || isLoading}
          defaultPrice={defaultPrice}
          defaultStock={defaultStock}
        />
      )}

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

VariantManager.propTypes = {
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      name: PropTypes.string,
      sku: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      stock: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      isAvailable: PropTypes.bool,
      attributes: PropTypes.object,
    })
  ),
  listingType: PropTypes.oneOf(["product", "service"]),
  onBulkChange: PropTypes.func,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  defaultPrice: PropTypes.number,
  defaultStock: PropTypes.number,
};

export default VariantManager;
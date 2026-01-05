import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Chip, alpha } from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";

/**
 * VariantAttributeSelector - Attribute-based variant selection
 *
 * Instead of showing all variant combinations (e.g., 20 items for 4 colors × 5 sizes),
 * this component allows users to select attributes step by step:
 * 1. Select Color (shows color chips)
 * 2. Select Size (shows size chips based on available combinations)
 * 3. Component finds the matching variant automatically
 *
 * Benefits:
 * - Cleaner UI with fewer items to display
 * - Better UX with guided selection
 * - Improved performance for large variant matrices
 *
 * @param {Array} variants - Array of variant objects with attributes
 * @param {Object} selectedVariant - Currently selected variant
 * @param {Function} onVariantSelect - Callback when variant is selected
 * @param {boolean} compact - Use compact styling
 */
const VariantAttributeSelector = ({
  variants = [],
  selectedVariant = null,
  onVariantSelect,
  compact = false,
}) => {
  // Extract all unique attribute types and their values from variants
  const attributeConfig = useMemo(() => {
    if (!variants.length) return [];

    const attributeMap = {};

    variants.forEach((variant) => {
      if (!variant.attributes) return;

      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!attributeMap[key]) {
          attributeMap[key] = {
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            values: new Set(),
          };
        }
        attributeMap[key].values.add(value);
      });
    });

    // Convert to array and sort values
    return Object.values(attributeMap).map((attr) => ({
      ...attr,
      values: Array.from(attr.values).sort(),
    }));
  }, [variants]);

  // State for selected attribute values
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Initialize selected attributes from selectedVariant
  useEffect(() => {
    if (selectedVariant?.attributes) {
      setSelectedAttributes({ ...selectedVariant.attributes });
    } else if (attributeConfig.length > 0) {
      // Initialize empty selections
      const initial = {};
      attributeConfig.forEach((attr) => {
        initial[attr.key] = null;
      });
      setSelectedAttributes(initial);
    }
  }, [selectedVariant, attributeConfig]);

  // Get available values for each attribute based on current selections
  const getAvailableValues = useCallback(
    (attributeKey) => {
      // Get all other selected attributes except this one
      const otherSelections = { ...selectedAttributes };
      delete otherSelections[attributeKey];

      // Filter variants that match other selections
      const matchingVariants = variants.filter((variant) => {
        if (!variant.attributes) return false;

        return Object.entries(otherSelections).every(([key, value]) => {
          if (!value) return true; // No filter for unselected
          return variant.attributes[key] === value;
        });
      });

      // Get unique values for this attribute from matching variants
      const availableValues = new Set();
      matchingVariants.forEach((variant) => {
        if (variant.attributes?.[attributeKey]) {
          availableValues.add(variant.attributes[attributeKey]);
        }
      });

      return availableValues;
    },
    [variants, selectedAttributes]
  );

  // Check if a value is available for selection
  const isValueAvailable = useCallback(
    (attributeKey, value) => {
      const available = getAvailableValues(attributeKey);
      return available.has(value);
    },
    [getAvailableValues]
  );

  // Check if a variant matching current selections is available and in stock
  // A value is considered "in stock" if ANY variant combination with that value is available
  const isValueInStock = useCallback(
    (attributeKey, value) => {
      const testSelection = { ...selectedAttributes, [attributeKey]: value };

      // Find all variants matching this selection
      const matchingVariants = variants.filter((v) => {
        if (!v.attributes) return false;
        return Object.entries(testSelection).every(([key, val]) => {
          if (!val) return true; // Allow partial matches when other attributes not selected
          return v.attributes[key] === val;
        });
      });

      // If no variants found, assume available
      if (matchingVariants.length === 0) return true;

      // Check if ANY matching variant is available and in stock
      return matchingVariants.some((variant) => {
        // Check if variant is explicitly unavailable
        if (variant.isAvailable === false) return false;
        // Check stock (undefined stock means unlimited/available)
        return variant.stock === undefined || variant.stock > 0;
      });
    },
    [variants, selectedAttributes]
  );

  // Handle attribute value selection
  const handleAttributeSelect = useCallback(
    (attributeKey, value) => {
      const newSelection = { ...selectedAttributes, [attributeKey]: value };
      setSelectedAttributes(newSelection);

      // Check if all attributes are selected
      const allSelected = attributeConfig.every(
        (attr) => newSelection[attr.key] !== null
      );

      if (allSelected) {
        // Find the matching variant
        const matchingVariant = variants.find((variant) => {
          if (!variant.attributes) return false;
          return Object.entries(newSelection).every(
            ([key, val]) => variant.attributes[key] === val
          );
        });

        if (matchingVariant) {
          onVariantSelect(matchingVariant);
        }
      }
    },
    [selectedAttributes, attributeConfig, variants, onVariantSelect]
  );

  // Early return if no variants or no attributes
  if (!variants.length || !attributeConfig.length) {
    return null;
  }

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: compact ? 1.5 : 2 }}
    >
      {attributeConfig.map((attribute) => (
        <Box key={attribute.key}>
          <Typography
            variant={compact ? "caption" : "body2"}
            color="text.secondary"
            fontWeight={600}
            sx={{ mb: 0.75, display: "block" }}
          >
            {attribute.label}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {attribute.values.map((value) => {
              const isSelected = selectedAttributes[attribute.key] === value;
              const isAvailable = isValueAvailable(attribute.key, value);
              const inStock = isValueInStock(attribute.key, value);
              const isDisabled = !isAvailable || !inStock;

              return (
                <Chip
                  key={value}
                  label={value}
                  size={compact ? "small" : "medium"}
                  onClick={() =>
                    !isDisabled && handleAttributeSelect(attribute.key, value)
                  }
                  icon={
                    isSelected ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined
                  }
                  sx={{
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.4 : 1,
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: compact ? "0.75rem" : "0.875rem",
                    height: compact ? 28 : 32,
                    borderRadius: 1,
                    border: "1.5px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: isSelected
                      ? (theme) => alpha(theme.palette.primary.main, 0.12)
                      : "transparent",
                    color: isSelected ? "primary.main" : "text.primary",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: isDisabled ? "divider" : "primary.light",
                      bgcolor: isDisabled
                        ? undefined
                        : (theme) => alpha(theme.palette.primary.main, 0.08),
                    },
                    "& .MuiChip-icon": {
                      color: "primary.main",
                      marginLeft: "4px",
                    },
                    textDecoration:
                      !inStock && isAvailable ? "line-through" : "none",
                  }}
                />
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

VariantAttributeSelector.propTypes = {
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      price: PropTypes.number,
      stock: PropTypes.number,
      isAvailable: PropTypes.bool,
      attributes: PropTypes.object,
    })
  ),
  selectedVariant: PropTypes.object,
  onVariantSelect: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};

export default VariantAttributeSelector;

import { useState, useCallback, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Alert,
  Chip,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";
import VariationTypeSelector from "./VariationTypeSelector";
import VariationValueInput from "./VariationValueInput";
import VariantMatrixTable from "./VariantMatrixTable";
import VariantBulkActions from "./VariantBulkActions";
import {
  generateVariantMatrix,
  validateVariationTypes,
  calculateVariantCount,
  VARIANT_BUILDER_LIMITS,
} from "../../../../constants/variantAttributes";

/**
 * VariantBuilder - Enterprise-grade variant management (Shopee/Amazon style)
 *
 * Flow:
 * 1. User selects variation types (e.g., Color, Size)
 * 2. User adds values for each type (e.g., Red, Blue for Color)
 * 3. System auto-generates variant matrix
 * 4. User edits individual variant prices, stock, SKU
 * 5. Optional: Use bulk actions to apply same values to all
 *
 * Features:
 * - Up to 2 variation types
 * - Auto-generate variant combinations
 * - Inline editing in table
 * - Bulk price/stock actions
 * - Validation and limits
 */
const VariantBuilder = ({
  variants = [],
  onChange,
  listingType = "product",
  disabled = false,
  defaultPrice = 0,
  defaultStock = 0,
}) => {
  const { isDark: isDarkMode } = useTheme();

  // Normalize old variants that don't have proper attributes
  const normalizedVariants = useMemo(() => {
    return variants.map((variant, index) => {
      // If variant has no attributes but has a name, it's from old format
      if (!variant.attributes && variant.name) {
        // Try to infer attributes from name (assuming single attribute like "red", "blue")
        return {
          ...variant,
          attributes: { color: variant.name.toLowerCase() },
          // Ensure unique key
          id: variant.id || variant._id || `legacy-${index}`,
        };
      }
      // Ensure unique key
      return {
        ...variant,
        id: variant.id || variant._id || `variant-${index}`,
      };
    });
  }, [variants]);

  // State for variation types configuration
  const [variationTypes, setVariationTypes] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [attemptedGenerate, setAttemptedGenerate] = useState(false);

  // Initialize variation types from existing variants OR auto-add first empty one
  useEffect(() => {
    if (hasInitialized) return;

    if (
      normalizedVariants.length > 0 &&
      variationTypes.length === 0 &&
      !hasGenerated
    ) {
      // Try to extract variation types from existing variants
      const firstVariant = normalizedVariants[0];
      if (
        firstVariant?.attributes &&
        Object.keys(firstVariant.attributes).length > 0
      ) {
        const types = Object.entries(firstVariant.attributes).map(([type]) => {
          // Collect all unique values for this type
          const values = [
            ...new Set(
              normalizedVariants
                .map((v) => v.attributes?.[type])
                .filter(Boolean)
            ),
          ];
          // Check if it's a known type or custom
          const knownTypes = ["color", "size", "material", "style"];
          const isKnownType = knownTypes.includes(type.toLowerCase());
          return {
            type: isKnownType ? type.toLowerCase() : "custom",
            customLabel: isKnownType ? "" : type,
            values,
          };
        });
        setVariationTypes(types);
        setHasGenerated(true);
      }
      setHasInitialized(true);
    } else if (normalizedVariants.length === 0 && variationTypes.length === 0) {
      // Auto-add first empty variation type when component mounts
      // This removes the need for "Add Variation Type" button initially
      setVariationTypes([{ type: "", customLabel: "", values: [] }]);
      setHasInitialized(true);
    }
  }, [normalizedVariants, variationTypes.length, hasGenerated, hasInitialized]);

  // Calculate potential variant count
  const potentialVariantCount = useMemo(
    () => calculateVariantCount(variationTypes),
    [variationTypes]
  );

  // Validate current configuration
  const validation = useMemo(
    () => validateVariationTypes(variationTypes),
    [variationTypes]
  );

  // Get list of used variation type keys
  const usedTypes = useMemo(
    () => variationTypes.map((vt) => vt.type).filter(Boolean),
    [variationTypes]
  );

  // Can add more variation types?
  const canAddMoreTypes =
    variationTypes.length < VARIANT_BUILDER_LIMITS.MAX_VARIATION_TYPES;

  // Add a new variation type
  const handleAddVariationType = useCallback(() => {
    if (!canAddMoreTypes) return;
    setVariationTypes((prev) => [
      ...prev,
      { type: "", customLabel: "", values: [] },
    ]);
  }, [canAddMoreTypes]);

  // Update variation type selection
  const handleTypeChange = useCallback((index, newType) => {
    setVariationTypes((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        type: newType,
        customLabel: "",
        values: [],
      };
      return updated;
    });
    setAttemptedGenerate(false);
  }, []);

  // Update custom label for a variation type
  const handleCustomLabelChange = useCallback((index, customLabel) => {
    setVariationTypes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], customLabel };
      return updated;
    });
    setAttemptedGenerate(false);
  }, []);

  // Remove a variation type
  const handleRemoveType = useCallback((index) => {
    setVariationTypes((prev) => prev.filter((_, i) => i !== index));
    setAttemptedGenerate(false);
  }, []);

  // Update values for a variation type
  const handleValuesChange = useCallback((index, values) => {
    setVariationTypes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], values };
      return updated;
    });
    setAttemptedGenerate(false);
  }, []);

  // Generate variants from current configuration
  const handleGenerateVariants = useCallback(() => {
    setAttemptedGenerate(true);

    if (!validation.isValid) {
      return;
    }

    const newlyGeneratedVariants = generateVariantMatrix(variationTypes, {
      defaultPrice,
      defaultStock,
    });

    // If no variants were generated (e.g., no valid variation types), don't clear existing ones
    if (newlyGeneratedVariants.length === 0) {
      return;
    }

    // Merge with existing variants - preserve existing variants that match
    const mergedVariants = newlyGeneratedVariants.map((newVariant) => {
      // Find existing variant with matching attributes (case-insensitive)
      const existingVariant = normalizedVariants.find((existing) => {
        if (!existing.attributes || !newVariant.attributes) return false;

        const existingKeys = Object.keys(existing.attributes).sort();
        const newKeys = Object.keys(newVariant.attributes).sort();

        // Check if all existing keys are present in new variant and match (case-insensitive)
        const allExistingKeysMatch = existingKeys.every((key) => {
          if (!newVariant.attributes.hasOwnProperty(key)) return false;

          const existingValue = String(existing.attributes[key])
            .toLowerCase()
            .trim();
          const newValue = String(newVariant.attributes[key])
            .toLowerCase()
            .trim();

          return existingValue === newValue;
        });

        // For a match, either:
        // 1. All keys are identical (same structure)
        // 2. New variant has more keys but all existing keys match (adding new variation type)
        if (existingKeys.length === newKeys.length) {
          // Same structure - exact match required
          return allExistingKeysMatch;
        } else if (newKeys.length > existingKeys.length) {
          // New variant has more attributes (new variation type added)
          return allExistingKeysMatch;
        }

        return false;
      });

      // If variant exists, preserve its data (price, stock, SKU, etc.)
      if (existingVariant) {
        return {
          ...newVariant,
          _id: existingVariant._id || existingVariant.id,
          id: existingVariant.id || existingVariant._id,
          price: existingVariant.price,
          stock: existingVariant.stock,
          sku: existingVariant.sku || newVariant.sku,
          isAvailable:
            existingVariant.isAvailable !== undefined
              ? existingVariant.isAvailable
              : true,
          image: existingVariant.image,
          // Keep the new attributes structure
          attributes: newVariant.attributes,
          // Preserve the generated name for consistency
          name: newVariant.name,
        };
      }

      // New variant, use defaults
      return newVariant;
    });

    onChange(mergedVariants);
    setHasGenerated(true);
  }, [
    variationTypes,
    validation.isValid,
    defaultPrice,
    defaultStock,
    normalizedVariants,
    onChange,
  ]);

  // Regenerate - now safely merges with existing variants
  const handleRegenerateVariants = useCallback(() => {
    handleGenerateVariants();
  }, [handleGenerateVariants]);

  // Update a single variant
  const handleVariantChange = useCallback(
    (variantId, updates) => {
      const updatedVariants = variants.map((v) =>
        v._id === variantId || v.id === variantId ? { ...v, ...updates } : v
      );
      onChange(updatedVariants);
    },
    [variants, onChange]
  );

  // Delete a variant
  const handleDeleteVariant = useCallback(
    (variantId) => {
      const updatedVariants = variants.filter(
        (v) => v._id !== variantId && v.id !== variantId
      );
      onChange(updatedVariants);
    },
    [variants, onChange]
  );

  // Apply bulk price
  const handleApplyBulkPrice = useCallback(
    (price) => {
      const updatedVariants = variants.map((v) => ({ ...v, price }));
      onChange(updatedVariants);
    },
    [variants, onChange]
  );

  // Apply bulk stock
  const handleApplyBulkStock = useCallback(
    (stock) => {
      const updatedVariants = variants.map((v) => ({ ...v, stock }));
      onChange(updatedVariants);
    },
    [variants, onChange]
  );

  // Clear all
  const handleClearAll = useCallback(() => {
    setVariationTypes([]);
    setHasGenerated(false);
    onChange([]);
  }, [onChange]);

  return (
    <Box>
      {/* Usage Description */}
      <Alert
        severity="info"
        sx={{
          mb: 2,
          bgcolor: isDarkMode ? "info.dark" : "info.lighter",
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
          When to use variants:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <Box component="ul" sx={{ m: 0, pl: 2, "& li": { mb: 0.25 } }}>
            {listingType === "service" ? (
              <>
                <li>
                  <strong>Tutoring:</strong> Duration (1hr, 2hr) × Level
                  (Beginner, Advanced)
                </li>
                <li>
                  <strong>Design:</strong> Package (Basic, Premium) × Revisions
                  (1, 3, Unlimited)
                </li>
                <li>
                  <strong>Consulting:</strong> Session Type (Online, In-Person)
                  × Duration (30min, 1hr)
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong>Clothing:</strong> Size (S, M, L) × Color (Red, Blue)
                  = 6 variants
                </li>
                <li>
                  <strong>Electronics:</strong> Storage (64GB, 128GB) × Color
                  (Black, White)
                </li>
                <li>
                  <strong>Food/Drinks:</strong> Size (Small, Large) × Flavor
                  (Original, Spicy)
                </li>
              </>
            )}
          </Box>
        </Typography>
      </Alert>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Variation Types
        </Typography>
        {(variationTypes.length > 0 || variants.length > 0) && (
          <Button
            size="small"
            color="error"
            onClick={handleClearAll}
            disabled={disabled}
            sx={{ textTransform: "none" }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Variation Types Configuration */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          bgcolor: isDarkMode ? "grey.900" : "grey.50",
        }}
      >
        {variationTypes.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Add variation types to create product variants
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddVariationType}
              disabled={disabled}
              sx={{ textTransform: "none" }}
            >
              Add Variation Type
            </Button>
          </Box>
        ) : (
          <>
            {variationTypes.map((vt, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <VariationTypeSelector
                  index={index}
                  selectedType={vt.type}
                  customLabel={vt.customLabel}
                  usedTypes={usedTypes}
                  onChange={handleTypeChange}
                  onCustomLabelChange={handleCustomLabelChange}
                  onRemove={handleRemoveType}
                  disabled={disabled}
                  showRemove={variationTypes.length > 1 || vt.type === ""}
                />

                {vt.type && (vt.type !== "custom" || vt.customLabel) && (
                  <Box sx={{ ml: 12.5, mt: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 0.5, display: "block" }}
                    >
                      Add values for{" "}
                      {vt.type === "custom" ? vt.customLabel : vt.type}:
                    </Typography>
                    <VariationValueInput
                      variationType={vt.type}
                      values={vt.values}
                      onChange={(values) => handleValuesChange(index, values)}
                      disabled={disabled}
                    />
                  </Box>
                )}

                {index < variationTypes.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))}

            {canAddMoreTypes && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddVariationType}
                disabled={disabled}
                sx={{ textTransform: "none", mt: 1 }}
              >
                Add Another Variation Type
              </Button>
            )}
          </>
        )}
      </Paper>

      {/* Validation Errors - only show after user attempts to generate */}
      {attemptedGenerate &&
        !validation.isValid &&
        validation.errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validation.errors.map((error, i) => (
              <Typography key={i} variant="body2">
                • {error}
              </Typography>
            ))}
          </Alert>
        )}

      {/* Generate Button */}
      {variationTypes.length > 0 &&
        variationTypes.some((vt) => vt.values.length > 0) && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={
                  hasGenerated
                    ? handleRegenerateVariants
                    : handleGenerateVariants
                }
                disabled={disabled || !validation.isValid}
                sx={{ textTransform: "none" }}
              >
                {hasGenerated ? "Regenerate Variants" : "Generate Variants"}
              </Button>

              <Chip
                label={`${potentialVariantCount} variant${potentialVariantCount !== 1 ? "s" : ""} will be created`}
                size="small"
                color={
                  potentialVariantCount >
                  VARIANT_BUILDER_LIMITS.MAX_GENERATED_VARIANTS
                    ? "error"
                    : "default"
                }
              />

              {hasGenerated && normalizedVariants.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Note: Existing variants will be preserved and merged with new
                  ones
                </Typography>
              )}
            </Box>
          </Box>
        )}

      {/* Variant Matrix */}
      {normalizedVariants.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Variant List ({normalizedVariants.length})
          </Typography>

          {/* Bulk Actions */}
          <VariantBulkActions
            onApplyPrice={handleApplyBulkPrice}
            onApplyStock={handleApplyBulkStock}
            listingType={listingType}
            disabled={disabled}
            variantCount={normalizedVariants.length}
          />

          {/* Variant Table */}
          <VariantMatrixTable
            variants={normalizedVariants}
            onChange={handleVariantChange}
            onDelete={handleDeleteVariant}
            listingType={listingType}
            disabled={disabled}
          />
        </>
      )}
    </Box>
  );
};

VariantBuilder.propTypes = {
  variants: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  listingType: PropTypes.oneOf(["product", "service"]),
  disabled: PropTypes.bool,
  defaultPrice: PropTypes.number,
  defaultStock: PropTypes.number,
};

export default VariantBuilder;

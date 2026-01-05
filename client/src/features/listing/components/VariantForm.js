import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Collapse,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

import { useTheme } from "../../../hooks/useTheme";
import {
  VARIANT_LIMITS,
  VARIANT_VALIDATION,
} from "../../../constants/listingConstant";

/**
 * VariantForm Component
 *
 * Form for managing variants in a listing
 * Supports two modes:
 * 1. Single mode (dialog-based): Used by VariantManager for add/edit in a dialog
 *    - Props: initialData, onSubmit, onCancel, isLoading
 * 2. Multi mode (inline): Original mode for managing multiple variants inline
 *    - Props: variants, onChange, maxVariants
 *
 * @param {Object} initialData - Initial variant data for single mode
 * @param {function} onSubmit - Callback when form submitted (single mode)
 * @param {function} onCancel - Callback to cancel (single mode)
 * @param {boolean} isLoading - Loading state (single mode)
 * @param {Array} variants - Current variants array (multi mode)
 * @param {function} onChange - Callback when variants change (multi mode)
 * @param {string} listingType - "product" or "service"
 * @param {boolean} disabled - Disable form interactions
 * @param {number} maxVariants - Maximum allowed variants (multi mode)
 */
const VariantForm = ({
  // Single mode props
  initialData = null,
  onSubmit = null,
  onCancel = null,
  isLoading = false,
  // Multi mode props
  variants = [],
  onChange = null,
  maxVariants = VARIANT_LIMITS.MAX_VARIANTS_PER_LISTING,
  // Shared props
  listingType = "product",
  disabled = false,
}) => {
  const { theme } = useTheme();

  // Determine mode: single (dialog) or multi (inline)
  const isSingleMode = onSubmit !== null;

  const [expandedVariant, setExpandedVariant] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [newVariant, setNewVariant] = useState(null);
  const [singleFormData, setSingleFormData] = useState(null);
  const [attributeKey, setAttributeKey] = useState("");
  const [attributeValue, setAttributeValue] = useState("");
  const [errors, setErrors] = useState({});

  const isProduct = listingType === "product";

  // Initialize single form data when initialData changes
  useEffect(() => {
    if (isSingleMode) {
      if (initialData) {
        setSingleFormData({
          name: initialData.name || "",
          sku: initialData.sku || "",
          price: initialData.price?.toString() || "",
          stock: initialData.stock?.toString() || "",
          isAvailable: initialData.isAvailable ?? true,
          attributes: initialData.attributes || {},
        });
      } else {
        setSingleFormData({
          name: "",
          sku: "",
          price: "",
          stock: isProduct ? "" : undefined,
          isAvailable: true,
          attributes: {},
        });
      }
    }
  }, [initialData, isSingleMode, isProduct]);

  // Default variant structure
  const defaultVariant = {
    name: "",
    sku: "",
    price: "",
    stock: isProduct ? "" : undefined,
    isAvailable: true,
    attributes: {},
    images: [],
  };

  // Validate variant data
  const validateVariant = (variant) => {
    const newErrors = {};

    if (
      !variant.name ||
      variant.name.trim().length < VARIANT_VALIDATION.NAME_MIN
    ) {
      newErrors.name = `Name must be at least ${VARIANT_VALIDATION.NAME_MIN} character`;
    }
    if (variant.name && variant.name.length > VARIANT_VALIDATION.NAME_MAX) {
      newErrors.name = `Name must be at most ${VARIANT_VALIDATION.NAME_MAX} characters`;
    }

    if (variant.sku && variant.sku.length > VARIANT_VALIDATION.SKU_MAX) {
      newErrors.sku = `SKU must be at most ${VARIANT_VALIDATION.SKU_MAX} characters`;
    }

    const price = parseFloat(variant.price);
    if (isNaN(price) || price < VARIANT_VALIDATION.PRICE_MIN) {
      newErrors.price = `Price must be at least ${VARIANT_VALIDATION.PRICE_MIN}`;
    }

    if (isProduct) {
      const stock = parseInt(variant.stock);
      if (isNaN(stock) || stock < VARIANT_VALIDATION.STOCK_MIN) {
        newErrors.stock = `Stock must be at least ${VARIANT_VALIDATION.STOCK_MIN}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Start adding a new variant
  const handleAddNew = () => {
    setNewVariant({ ...defaultVariant });
    setEditingVariant(null);
    setErrors({});
  };

  // Cancel adding/editing
  const handleCancel = () => {
    setNewVariant(null);
    setEditingVariant(null);
    setErrors({});
  };

  // Save new variant
  const handleSaveNew = () => {
    if (!validateVariant(newVariant)) return;

    const variantToAdd = {
      ...newVariant,
      _id: `temp-${Date.now()}`, // Temporary ID for client-side tracking
      price: parseFloat(newVariant.price) || 0,
      stock: isProduct ? parseInt(newVariant.stock) || 0 : undefined,
    };

    onChange([...variants, variantToAdd]);
    setNewVariant(null);
    setErrors({});
  };

  // Start editing an existing variant
  const handleEdit = (variant) => {
    setEditingVariant({ ...variant });
    setNewVariant(null);
    setExpandedVariant(variant._id);
    setErrors({});
  };

  // Save edited variant
  const handleSaveEdit = () => {
    if (!validateVariant(editingVariant)) return;

    const updatedVariants = variants.map((v) =>
      v._id === editingVariant._id
        ? {
            ...editingVariant,
            price: parseFloat(editingVariant.price) || 0,
            stock: isProduct ? parseInt(editingVariant.stock) || 0 : undefined,
          }
        : v
    );

    onChange(updatedVariants);
    setEditingVariant(null);
    setErrors({});
  };

  // Handle single mode form submission
  const handleSingleModeSubmit = (e) => {
    e?.preventDefault();
    if (!singleFormData || !validateVariant(singleFormData)) return;

    const variantData = {
      name: singleFormData.name.trim(),
      sku: singleFormData.sku?.trim() || undefined,
      price: parseFloat(singleFormData.price) || 0,
      isAvailable: singleFormData.isAvailable,
      attributes: singleFormData.attributes || {},
    };

    // Always include stock for products (default to 0 if empty/invalid)
    if (isProduct) {
      variantData.stock = parseInt(singleFormData.stock) || 0;
    }

    onSubmit(variantData);
  };

  // Handle adding attribute in single mode
  const handleAddAttributeSingle = () => {
    if (!attributeKey.trim() || !attributeValue.trim()) return;

    setSingleFormData({
      ...singleFormData,
      attributes: {
        ...singleFormData.attributes,
        [attributeKey.trim()]: attributeValue.trim(),
      },
    });

    setAttributeKey("");
    setAttributeValue("");
  };

  // Handle removing attribute in single mode
  const handleRemoveAttributeSingle = (key) => {
    const { [key]: removed, ...rest } = singleFormData.attributes;
    setSingleFormData({ ...singleFormData, attributes: rest });
  };

  // Remove a variant
  const handleRemove = (variantId) => {
    onChange(variants.filter((v) => v._id !== variantId));
    if (expandedVariant === variantId) {
      setExpandedVariant(null);
    }
  };

  // Toggle variant expansion
  const handleToggleExpand = (variantId) => {
    setExpandedVariant(expandedVariant === variantId ? null : variantId);
  };

  // Add attribute to variant being edited/created
  const handleAddAttribute = (isNew = false) => {
    if (!attributeKey.trim() || !attributeValue.trim()) return;

    const target = isNew ? newVariant : editingVariant;
    const setter = isNew ? setNewVariant : setEditingVariant;

    setter({
      ...target,
      attributes: {
        ...target.attributes,
        [attributeKey.trim()]: attributeValue.trim(),
      },
    });

    setAttributeKey("");
    setAttributeValue("");
  };

  // Remove attribute from variant being edited/created
  const handleRemoveAttribute = (key, isNew = false) => {
    const target = isNew ? newVariant : editingVariant;
    const setter = isNew ? setNewVariant : setEditingVariant;

    const { [key]: removed, ...rest } = target.attributes;
    setter({ ...target, attributes: rest });
  };

  // Render variant form fields
  const renderFormFields = (variant, setVariant, isNew = false) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Variant Name"
        value={variant.name}
        onChange={(e) => setVariant({ ...variant, name: e.target.value })}
        error={!!errors.name}
        helperText={errors.name}
        required
        fullWidth
        size="small"
        disabled={disabled}
        placeholder="e.g., Small, Red, 128GB"
      />

      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="Price (RM)"
          type="number"
          value={variant.price}
          onChange={(e) => setVariant({ ...variant, price: e.target.value })}
          error={!!errors.price}
          helperText={errors.price}
          required
          fullWidth
          size="small"
          disabled={disabled}
          inputProps={{ min: 0, step: 0.01 }}
        />

        {isProduct && (
          <TextField
            label="Stock"
            type="number"
            value={variant.stock}
            onChange={(e) => setVariant({ ...variant, stock: e.target.value })}
            error={!!errors.stock}
            helperText={errors.stock}
            required
            fullWidth
            size="small"
            disabled={disabled}
            inputProps={{ min: 0 }}
          />
        )}
      </Box>

      <TextField
        label="SKU (Optional)"
        value={variant.sku || ""}
        onChange={(e) => setVariant({ ...variant, sku: e.target.value })}
        error={!!errors.sku}
        helperText={errors.sku || "Stock Keeping Unit for inventory tracking"}
        fullWidth
        size="small"
        disabled={disabled}
      />

      <FormControlLabel
        control={
          <Switch
            checked={variant.isAvailable}
            onChange={(e) =>
              setVariant({ ...variant, isAvailable: e.target.checked })
            }
            disabled={disabled}
          />
        }
        label="Available for purchase"
      />

      {/* Attributes Section */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Attributes (Optional)
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            label="Attribute Name"
            value={attributeKey}
            onChange={(e) => setAttributeKey(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            disabled={disabled}
            placeholder="e.g., Color, Size"
          />
          <TextField
            label="Value"
            value={attributeValue}
            onChange={(e) => setAttributeValue(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            disabled={disabled}
            placeholder="e.g., Blue, XL"
          />
          <Button
            onClick={() => handleAddAttribute(isNew)}
            disabled={
              disabled || !attributeKey.trim() || !attributeValue.trim()
            }
            variant="outlined"
            size="small"
          >
            Add
          </Button>
        </Box>
        {variant.attributes && Object.keys(variant.attributes).length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {Object.entries(variant.attributes).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                onDelete={
                  disabled ? undefined : () => handleRemoveAttribute(key, isNew)
                }
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button
          onClick={handleCancel}
          disabled={disabled}
          startIcon={<CancelIcon />}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={isNew ? handleSaveNew : handleSaveEdit}
          disabled={disabled}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          {isNew ? "Add Variant" : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );

  // Render single mode form (for dialog-based variant editing)
  const renderSingleModeForm = () => {
    if (!singleFormData) return null;

    return (
      <Box
        component="form"
        onSubmit={handleSingleModeSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <TextField
          label="Variant Name"
          value={singleFormData.name}
          onChange={(e) =>
            setSingleFormData({ ...singleFormData, name: e.target.value })
          }
          error={!!errors.name}
          helperText={errors.name}
          required
          fullWidth
          size="small"
          disabled={disabled || isLoading}
          placeholder="e.g., Small, Red, 128GB"
          autoFocus
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Price (RM)"
            type="number"
            value={singleFormData.price}
            onChange={(e) =>
              setSingleFormData({ ...singleFormData, price: e.target.value })
            }
            error={!!errors.price}
            helperText={errors.price}
            required
            fullWidth
            size="small"
            disabled={disabled || isLoading}
            inputProps={{ min: 0, step: 0.01 }}
          />

          {isProduct && (
            <TextField
              label="Stock"
              type="number"
              value={singleFormData.stock}
              onChange={(e) =>
                setSingleFormData({ ...singleFormData, stock: e.target.value })
              }
              error={!!errors.stock}
              helperText={errors.stock}
              required
              fullWidth
              size="small"
              disabled={disabled || isLoading}
              inputProps={{ min: 0 }}
            />
          )}
        </Box>

        <TextField
          label="SKU (Optional)"
          value={singleFormData.sku || ""}
          onChange={(e) =>
            setSingleFormData({ ...singleFormData, sku: e.target.value })
          }
          error={!!errors.sku}
          helperText={errors.sku || "Stock Keeping Unit for inventory tracking"}
          fullWidth
          size="small"
          disabled={disabled || isLoading}
        />

        <FormControlLabel
          control={
            <Switch
              checked={singleFormData.isAvailable}
              onChange={(e) =>
                setSingleFormData({
                  ...singleFormData,
                  isAvailable: e.target.checked,
                })
              }
              disabled={disabled || isLoading}
            />
          }
          label="Available for purchase"
        />

        {/* Attributes Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Attributes (Optional)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              label="Attribute Name"
              value={attributeKey}
              onChange={(e) => setAttributeKey(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              disabled={disabled || isLoading}
              placeholder="e.g., Color, Size"
            />
            <TextField
              label="Value"
              value={attributeValue}
              onChange={(e) => setAttributeValue(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              disabled={disabled || isLoading}
              placeholder="e.g., Blue, XL"
            />
            <Button
              onClick={handleAddAttributeSingle}
              disabled={
                disabled ||
                isLoading ||
                !attributeKey.trim() ||
                !attributeValue.trim()
              }
              variant="outlined"
              size="small"
            >
              Add
            </Button>
          </Box>
          {singleFormData.attributes &&
            Object.keys(singleFormData.attributes).length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {Object.entries(singleFormData.attributes).map(
                  ([key, value]) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      onDelete={
                        disabled || isLoading
                          ? undefined
                          : () => handleRemoveAttributeSingle(key)
                      }
                      size="small"
                      variant="outlined"
                    />
                  )
                )}
              </Box>
            )}
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            justifyContent: "flex-end",
            mt: 2,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={onCancel}
            disabled={isLoading}
            startIcon={<CancelIcon />}
            variant="outlined"
            color="inherit"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={disabled || isLoading}
            variant="contained"
            color="primary"
            startIcon={
              isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{ minWidth: 140 }}
          >
            {initialData ? "Save Changes" : "Add Variant"}
          </Button>
        </Box>
      </Box>
    );
  };

  // Single mode: Render just the form (for dialog usage)
  if (isSingleMode) {
    return renderSingleModeForm();
  }

  // Multi mode: Render full variant manager
  return (
    <Box>
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
          Variants ({variants.length}/{maxVariants})
        </Typography>
        <Button
          onClick={handleAddNew}
          disabled={disabled || variants.length >= maxVariants || !!newVariant}
          startIcon={<AddIcon />}
          size="small"
          variant="outlined"
        >
          Add Variant
        </Button>
      </Box>

      {/* Info Alert */}
      {variants.length === 0 && !newVariant && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No variants added yet. Add variants to offer different options (sizes,
          colors, etc.) with individual pricing and stock.
        </Alert>
      )}

      {/* New Variant Form */}
      {newVariant && (
        <Card sx={{ mb: 2, border: "2px dashed", borderColor: "primary.main" }}>
          <CardContent>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
              New Variant
            </Typography>
            {renderFormFields(newVariant, setNewVariant, true)}
          </CardContent>
        </Card>
      )}

      {/* Existing Variants List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {variants.map((variant) => {
          const isEditing = editingVariant?._id === variant._id;
          const isExpanded = expandedVariant === variant._id;

          return (
            <Card
              key={variant._id}
              sx={{
                border: "1px solid",
                borderColor: isEditing ? "primary.main" : "divider",
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                {/* Variant Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => handleToggleExpand(variant._id)}
                  >
                    <IconButton size="small">
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {variant.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        RM{parseFloat(variant.price).toFixed(2)}
                        {isProduct && variant.stock !== undefined
                          ? ` • ${variant.stock} in stock`
                          : ""}
                        {!variant.isAvailable && " • Unavailable"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => handleEdit(variant)}
                      disabled={disabled || isEditing || !!newVariant}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleRemove(variant._id)}
                      disabled={disabled}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Expanded Content */}
                <Collapse in={isExpanded}>
                  <Divider sx={{ my: 2 }} />
                  {isEditing ? (
                    renderFormFields(editingVariant, setEditingVariant, false)
                  ) : (
                    <Box>
                      {variant.sku && (
                        <Typography variant="body2" color="text.secondary">
                          SKU: {variant.sku}
                        </Typography>
                      )}
                      {variant.attributes &&
                        Object.keys(variant.attributes).length > 0 && (
                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {Object.entries(variant.attributes).map(
                              ([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )
                            )}
                          </Box>
                        )}
                    </Box>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

VariantForm.propTypes = {
  // Single mode props (dialog-based)
  initialData: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    sku: PropTypes.string,
    price: PropTypes.number,
    stock: PropTypes.number,
    isAvailable: PropTypes.bool,
    attributes: PropTypes.object,
  }),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool,
  // Multi mode props (inline)
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sku: PropTypes.string,
      isAvailable: PropTypes.bool,
      attributes: PropTypes.object,
    })
  ),
  onChange: PropTypes.func,
  maxVariants: PropTypes.number,
  // Shared props
  listingType: PropTypes.oneOf(["product", "service"]),
  disabled: PropTypes.bool,
};

export default VariantForm;

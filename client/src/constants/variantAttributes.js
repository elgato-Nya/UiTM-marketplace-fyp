/**
 * Variant Attributes Constants
 *
 * Enterprise-grade variant attribute types following Shopee/Amazon patterns.
 * Defines preset variation types, their input methods, and common values.
 */

// ========== VARIATION TYPES ==========

/**
 * Predefined variation types with their configurations
 * Users can select from these or create custom attributes
 */
export const VARIATION_TYPES = {
  COLOR: {
    key: "color",
    label: "Color",
    inputType: "color-chips", // Visual color chips
    icon: "palette",
    presets: [
      { value: "Black", colorCode: "#000000" },
      { value: "White", colorCode: "#FFFFFF" },
      { value: "Red", colorCode: "#EF4444" },
      { value: "Blue", colorCode: "#3B82F6" },
      { value: "Green", colorCode: "#22C55E" },
      { value: "Yellow", colorCode: "#EAB308" },
      { value: "Pink", colorCode: "#EC4899" },
      { value: "Purple", colorCode: "#A855F7" },
      { value: "Orange", colorCode: "#F97316" },
      { value: "Brown", colorCode: "#92400E" },
      { value: "Gray", colorCode: "#6B7280" },
      { value: "Navy", colorCode: "#1E3A5F" },
      { value: "Beige", colorCode: "#D4C4A8" },
    ],
    allowCustom: true,
    maxValues: 10,
  },
  SIZE: {
    key: "size",
    label: "Size",
    inputType: "button-group", // Clickable size buttons
    icon: "straighten",
    presets: {
      clothing: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
      shoes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
      general: ["Small", "Medium", "Large", "Extra Large"],
      numeric: ["6", "8", "10", "12", "14", "16"],
    },
    defaultPresetGroup: "clothing",
    allowCustom: true,
    maxValues: 15,
  },
  MATERIAL: {
    key: "material",
    label: "Material",
    inputType: "dropdown", // Dropdown select
    icon: "texture",
    presets: [
      "Cotton",
      "Polyester",
      "Leather",
      "Wool",
      "Silk",
      "Denim",
      "Linen",
      "Nylon",
      "Canvas",
      "Velvet",
      "Wood",
      "Metal",
      "Plastic",
      "Glass",
      "Ceramic",
    ],
    allowCustom: true,
    maxValues: 8,
  },
  STYLE: {
    key: "style",
    label: "Style",
    inputType: "chips", // Text chips
    icon: "style",
    presets: [
      "Casual",
      "Formal",
      "Sport",
      "Classic",
      "Modern",
      "Vintage",
      "Minimalist",
      "Bohemian",
    ],
    allowCustom: true,
    maxValues: 6,
  },
  CUSTOM: {
    key: "custom",
    label: "Custom",
    inputType: "text", // Free text input
    icon: "edit",
    presets: [],
    allowCustom: true,
    maxValues: 10,
  },
};

// ========== VARIATION TYPE OPTIONS ==========

/**
 * Options for the variation type dropdown selector
 */
export const VARIATION_TYPE_OPTIONS = [
  { value: "color", label: "Color", icon: "palette" },
  { value: "size", label: "Size", icon: "straighten" },
  { value: "material", label: "Material", icon: "texture" },
  { value: "style", label: "Style", icon: "style" },
  { value: "custom", label: "Custom", icon: "edit" },
];

// ========== SIZE PRESET GROUPS ==========

/**
 * Size preset group options for the size variation type
 */
export const SIZE_PRESET_GROUPS = [
  { value: "clothing", label: "Clothing (XS-3XL)" },
  { value: "shoes", label: "Shoes (35-45)" },
  { value: "general", label: "General (S/M/L)" },
  { value: "numeric", label: "Numeric (6-16)" },
];

// ========== VARIANT LIMITS ==========

/**
 * Limits for the variant builder
 */
export const VARIANT_BUILDER_LIMITS = {
  MAX_VARIATION_TYPES: 2, // Max 2 variation types (e.g., Color + Size)
  MAX_VALUES_PER_TYPE: 10, // Max values per variation type
  MAX_GENERATED_VARIANTS: 20, // Max variants from matrix (matches listing limit)
  MIN_PRICE: 0,
  MAX_PRICE: 999999.99,
  MIN_STOCK: 0,
  MAX_STOCK: 99999,
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get variation type configuration by key
 * @param {string} key - Variation type key (color, size, etc.)
 * @returns {Object|null} Variation type config or null
 */
export const getVariationType = (key) => {
  const upperKey = key?.toUpperCase();
  return VARIATION_TYPES[upperKey] || null;
};

/**
 * Get presets for a variation type
 * @param {string} typeKey - Variation type key
 * @param {string} presetGroup - For size, which preset group to use
 * @returns {Array} Array of preset values
 */
export const getVariationPresets = (typeKey, presetGroup = null) => {
  const type = getVariationType(typeKey);
  if (!type) return [];

  if (typeKey === "size" && presetGroup) {
    return (
      type.presets[presetGroup] || type.presets[type.defaultPresetGroup] || []
    );
  }

  if (Array.isArray(type.presets)) {
    return type.presets;
  }

  // For size without group, return default
  if (type.presets && typeof type.presets === "object") {
    return type.presets[type.defaultPresetGroup] || [];
  }

  return [];
};

/**
 * Generate variant matrix from variation types
 * Creates all combinations of variation values
 *
 * @param {Array} variationTypes - Array of { type, values }
 * @param {Object} defaults - Default price and stock
 * @returns {Array} Generated variants array
 *
 * @example
 * generateVariantMatrix([
 *   { type: 'color', values: ['Red', 'Blue'] },
 *   { type: 'size', values: ['S', 'M'] }
 * ])
 * // Returns: [
 * //   { name: 'Red - S', attributes: { color: 'Red', size: 'S' }, ... },
 * //   { name: 'Red - M', attributes: { color: 'Red', size: 'M' }, ... },
 * //   { name: 'Blue - S', attributes: { color: 'Blue', size: 'S' }, ... },
 * //   { name: 'Blue - M', attributes: { color: 'Blue', size: 'M' }, ... },
 * // ]
 */
export const generateVariantMatrix = (variationTypes, defaults = {}) => {
  const { defaultPrice = 0, defaultStock = 0 } = defaults;

  // Filter out empty variation types
  // For custom types, require customLabel to be set
  const validTypes = variationTypes.filter(
    (vt) =>
      vt.type &&
      vt.values &&
      vt.values.length > 0 &&
      (vt.type !== "custom" || vt.customLabel)
  );

  if (validTypes.length === 0) {
    return [];
  }

  // Cartesian product function
  const cartesian = (...arrays) =>
    arrays.reduce(
      (acc, arr) => acc.flatMap((x) => arr.map((y) => [...x, y])),
      [[]]
    );

  // Get all value arrays, using customLabel for custom types
  const valueArrays = validTypes.map((vt) => {
    const attributeKey =
      vt.type === "custom" ? vt.customLabel.toLowerCase() : vt.type;
    return vt.values.map((val) => ({
      type: attributeKey,
      displayType: vt.type === "custom" ? vt.customLabel : vt.type,
      value: val,
    }));
  });

  // Generate all combinations
  const combinations = cartesian(...valueArrays);

  // Create variant objects from combinations
  return combinations.map((combo, index) => {
    // Build name from values
    const name = combo.map((c) => c.value).join(" - ");

    // Build attributes object using the attribute key
    const attributes = combo.reduce((attrs, c) => {
      attrs[c.type] = c.value;
      return attrs;
    }, {});

    // Generate SKU from values
    const skuParts = combo.map((c) =>
      c.value.substring(0, 3).toUpperCase().replace(/\s+/g, "")
    );
    const sku = skuParts.join("-");

    return {
      _id: `temp_${Date.now()}_${index}`,
      id: `temp_${Date.now()}_${index}`,
      name,
      sku,
      price: defaultPrice,
      stock: defaultStock,
      isAvailable: true,
      attributes,
      images: [],
    };
  });
};

/**
 * Validate variation types configuration
 * @param {Array} variationTypes - Array of { type, customLabel, values }
 * @returns {Object} { isValid, errors }
 */
export const validateVariationTypes = (variationTypes) => {
  const errors = [];

  if (!Array.isArray(variationTypes)) {
    return { isValid: false, errors: ["Variation types must be an array"] };
  }

  // Check max variation types
  if (variationTypes.length > VARIANT_BUILDER_LIMITS.MAX_VARIATION_TYPES) {
    errors.push(
      `Maximum ${VARIANT_BUILDER_LIMITS.MAX_VARIATION_TYPES} variation types allowed`
    );
  }

  // Check each variation type
  variationTypes.forEach((vt, index) => {
    if (!vt.type) {
      errors.push(`Variation type ${index + 1}: Type is required`);
    }

    // For custom types, customLabel is required
    if (vt.type === "custom" && !vt.customLabel?.trim()) {
      errors.push(
        `Variation type ${index + 1}: Custom name is required for custom type`
      );
    }

    if (!vt.values || vt.values.length === 0) {
      errors.push(
        `Variation type ${index + 1}: At least one value is required`
      );
    }

    if (
      vt.values &&
      vt.values.length > VARIANT_BUILDER_LIMITS.MAX_VALUES_PER_TYPE
    ) {
      errors.push(
        `Variation type ${index + 1}: Maximum ${VARIANT_BUILDER_LIMITS.MAX_VALUES_PER_TYPE} values allowed`
      );
    }

    // Check for duplicate values
    const uniqueValues = new Set(vt.values);
    if (uniqueValues.size !== vt.values?.length) {
      errors.push(`Variation type ${index + 1}: Duplicate values not allowed`);
    }
  });

  // Check for duplicate types
  // For custom types, use customLabel to check for duplicates
  const typeKeys = variationTypes.map((vt) =>
    vt.type === "custom" ? `custom:${vt.customLabel?.toLowerCase()}` : vt.type
  );
  const uniqueTypeKeys = new Set(typeKeys);

  if (uniqueTypeKeys.size !== typeKeys.length) {
    errors.push("Duplicate variation types not allowed");
  }

  // Check total variants would be generated
  const totalVariants = variationTypes.reduce(
    (total, vt) => total * (vt.values?.length || 1),
    1
  );
  if (totalVariants > VARIANT_BUILDER_LIMITS.MAX_GENERATED_VARIANTS) {
    errors.push(
      `Too many variants would be generated (${totalVariants}). Maximum is ${VARIANT_BUILDER_LIMITS.MAX_GENERATED_VARIANTS}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate potential variant count from variation types
 * @param {Array} variationTypes - Array of { type, values }
 * @returns {number} Number of variants that would be generated
 */
export const calculateVariantCount = (variationTypes) => {
  if (!Array.isArray(variationTypes) || variationTypes.length === 0) {
    return 0;
  }

  return variationTypes.reduce(
    (total, vt) => total * (vt.values?.length || 0),
    1
  );
};

export default {
  VARIATION_TYPES,
  VARIATION_TYPE_OPTIONS,
  SIZE_PRESET_GROUPS,
  VARIANT_BUILDER_LIMITS,
  getVariationType,
  getVariationPresets,
  generateVariantMatrix,
  validateVariationTypes,
  calculateVariantCount,
};

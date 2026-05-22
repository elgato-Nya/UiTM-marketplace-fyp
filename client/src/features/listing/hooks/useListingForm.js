import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { createListingFormConfig } from "../../../config/forms/listingForm";
import {
  VARIANT_LIMITS,
  LISTING_CATEGORIES,
} from "../../../constants/listingConstant";

const normalizeVariationConfig = (config = []) => {
  if (!Array.isArray(config)) {
    return [];
  }

  return config
    .slice(0, 2)
    .map((layer, index) => {
      const normalizedOptions = Array.isArray(layer?.options)
        ? layer.options
            .map((option) => {
              const value = option?.value?.toString().trim();
              const imageUrl = option?.imageUrl?.toString().trim();

              if (!value) {
                return null;
              }

              return imageUrl ? { value, imageUrl } : { value };
            })
            .filter(Boolean)
        : [];

      const key = layer?.key?.toString().trim();
      const label = layer?.label?.toString().trim();

      if (!key || !label || normalizedOptions.length === 0) {
        return null;
      }

      return {
        key,
        label,
        position:
          Number.isFinite(layer?.position) && layer.position >= 0
            ? layer.position
            : index,
        options: normalizedOptions,
      };
    })
    .filter(Boolean);
};

const normalizeVariantAttributeKey = (value) =>
  value?.toString().trim().toLowerCase() || "";

const normalizeVariantAttributeValue = (value) =>
  value?.toString().trim().toLowerCase() || "";

const buildVariantSignature = (attributes = {}) => {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
    return "";
  }

  return Object.entries(attributes)
    .map(([key, value]) => [
      normalizeVariantAttributeKey(key),
      normalizeVariantAttributeValue(value),
    ])
    .filter(([key, value]) => key && value)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
};

const buildExpectedVariantSignatures = (config = []) => {
  const normalizedConfig = normalizeVariationConfig(config);

  if (normalizedConfig.length === 0) {
    return [];
  }

  const layers = normalizedConfig.map((layer) => ({
    key: normalizeVariantAttributeKey(layer.key),
    options: layer.options
      .map((option) => normalizeVariantAttributeValue(option.value))
      .filter(Boolean),
  }));

  if (layers.some((layer) => !layer.key || layer.options.length === 0)) {
    return [];
  }

  if (layers.length === 1) {
    return layers[0].options.map((value) =>
      buildVariantSignature({ [layers[0].key]: value })
    );
  }

  return layers[0].options.flatMap((firstValue) =>
    layers[1].options.map((secondValue) =>
      buildVariantSignature({
        [layers[0].key]: firstValue,
        [layers[1].key]: secondValue,
      })
    )
  );
};

const FIELD_SECTION_MAP = {
  type: "details",
  name: "details",
  description: "details",
  category: "details",
  price: "details",
  stock: "details",
  images: "images",
  variants: "variants",
  quoteSettings: "quotes",
};

/**
 * useListingForm Hook
 *
 * PURPOSE: Centralized state management for listing create/edit forms
 * PATTERN: Follows existing hook patterns (useListings, useImageUpload)
 *
 * FEATURES:
 * - Form data persistence across tab navigation
 * - Image management (add, remove, reorder)
 * - Variant management with optional toggle
 * - Quote settings for services
 * - Form validation and dirty state tracking
 * - Draft save/restore with localStorage
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.initialData - Initial listing data (for edit mode)
 * @param {string} options.mode - 'create' or 'edit'
 * @param {string} options.draftKey - localStorage key for draft (optional)
 */
const useListingForm = (options = {}) => {
  const { initialData = null, mode = "create", draftKey = null } = options;

  // ========== Default Values ==========
  const getDefaultFormData = useCallback(() => {
    if (initialData) {
      return {
        type: initialData.type || "product",
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        price: initialData.price?.toString() || "",
        stock: initialData.stock?.toString() || "",
        isFree: initialData.isFree || false,
        isQuoteOnly: initialData.quoteSettings?.quoteOnly || false,
        isAvailable: initialData.isAvailable ?? true,
      };
    }
    return {
      type: createListingFormConfig.defaultValues.type,
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      isFree: false,
      isQuoteOnly: false,
      isAvailable: true,
    };
  }, [initialData]);

  // ========== Form State ==========
  const [formData, setFormData] = useState(getDefaultFormData);
  const [images, setImages] = useState(() =>
    initialData?.images ? [...initialData.images] : []
  );
  const [variants, setVariants] = useState(() =>
    initialData?.variants ? [...initialData.variants] : []
  );
  const [variationConfig, setVariationConfig] = useState(() =>
    normalizeVariationConfig(initialData?.variationConfig)
  );
  const [variantsEnabled, setVariantsEnabled] = useState(
    () => initialData?.variants?.length > 0 || false
  );
  const [quoteSettings, setQuoteSettings] = useState(
    () => initialData?.quoteSettings || null
  );

  // ========== Tracking State ==========
  const [errors, setErrors] = useState({});
  const initialDataRef = useRef(getDefaultFormData());
  const [lastSaved, setLastSaved] = useState(null);

  const clearErrorFields = useCallback((fieldNames = []) => {
    if (!Array.isArray(fieldNames) || fieldNames.length === 0) {
      return;
    }

    setErrors((prev) => {
      let changed = false;
      const next = { ...prev };

      fieldNames.forEach((fieldName) => {
        if (fieldName in next) {
          delete next[fieldName];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, []);

  // ========== Derived State ==========
  const isDirty = useMemo(() => {
    const currentData = JSON.stringify({
      formData,
      images,
      variants,
      variationConfig,
      quoteSettings,
    });
    const initial = JSON.stringify({
      formData: initialDataRef.current,
      images: initialData?.images || [],
      variants: initialData?.variants || [],
      variationConfig: normalizeVariationConfig(initialData?.variationConfig),
      quoteSettings: initialData?.quoteSettings || null,
    });
    return currentData !== initial;
  }, [formData, images, variants, variationConfig, quoteSettings, initialData]);

  const isProduct = useMemo(() => formData.type === "product", [formData.type]);
  const isService = useMemo(() => formData.type === "service", [formData.type]);

  const hasVariants = useMemo(
    () => variantsEnabled && variants.length > 0,
    [variantsEnabled, variants]
  );

  const canAddMoreVariants = useMemo(
    () => variants.length < VARIANT_LIMITS.MAX_VARIANTS_PER_LISTING,
    [variants]
  );

  const variantsRequireRegeneration = useMemo(() => {
    if (!variantsEnabled || variants.length === 0) {
      return false;
    }

    const normalizedConfig = normalizeVariationConfig(variationConfig);
    if (normalizedConfig.length === 0) {
      return false;
    }

    const variantsHaveComparableAttributes = variants.every((variant) => {
      const signature = buildVariantSignature(variant?.attributes);
      return Boolean(signature);
    });

    if (!variantsHaveComparableAttributes) {
      return false;
    }

    const expectedSignatures = buildExpectedVariantSignatures(normalizedConfig);
    if (expectedSignatures.length === 0) {
      return false;
    }

    const actualSignatures = variants.map((variant) =>
      buildVariantSignature(variant.attributes)
    );

    if (actualSignatures.length !== expectedSignatures.length) {
      return true;
    }

    const expectedSet = new Set(expectedSignatures);
    const actualSet = new Set(actualSignatures);

    if (actualSet.size !== expectedSet.size) {
      return true;
    }

    return (
      expectedSignatures.some((signature) => !actualSet.has(signature)) ||
      actualSignatures.some((signature) => !expectedSet.has(signature))
    );
  }, [variationConfig, variants, variantsEnabled]);

  const variantSyncError = useMemo(() => {
    if (!variantsRequireRegeneration) {
      return "";
    }

    return "Variant options changed. Regenerate variants before saving so the variant list matches your current variation types and values.";
  }, [variantsRequireRegeneration]);

  const buildValidationSummary = useCallback(
    (validationErrors = {}) => {
      const summary = Object.entries(validationErrors).map(([field, message]) => ({
        field,
        message,
        section: FIELD_SECTION_MAP[field] || "details",
      }));

      if (variantsRequireRegeneration) {
        summary.push({
          field: "variants",
          message: variantSyncError,
          section: "variants",
        });
      }

      return summary;
    },
    [variantSyncError, variantsRequireRegeneration]
  );

  const validationSummary = useMemo(
    () => buildValidationSummary(errors),
    [buildValidationSummary, errors]
  );

  const sectionValidation = useMemo(() => {
    return validationSummary.reduce(
      (sections, entry) => {
        const sectionKey = entry.section || "details";
        sections[sectionKey].push(entry);
        return sections;
      },
      {
        details: [],
        images: [],
        variants: [],
        quotes: [],
      }
    );
  }, [validationSummary]);

  const sectionErrorCounts = useMemo(
    () => ({
      details: sectionValidation.details.length,
      images: sectionValidation.images.length,
      variants: sectionValidation.variants.length,
      quotes: sectionValidation.quotes.length,
    }),
    [sectionValidation]
  );

  // ========== Form Data Methods ==========
  const updateField = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    clearErrorFields([fieldName]);
  }, [clearErrorFields]);

  const updateFormData = useCallback((data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  const handleFormChange = useCallback((data) => {
    const changedFields = Object.keys(data).filter(
      (key) => data[key] !== formData[key]
    );

    if (changedFields.length > 0) {
      const fieldsToClear = new Set(changedFields);

      if (changedFields.includes("type")) {
        fieldsToClear.add("category");
        fieldsToClear.add("price");
        fieldsToClear.add("stock");
      }

      if (
        changedFields.includes("isFree") ||
        changedFields.includes("isQuoteOnly") ||
        changedFields.includes("price")
      ) {
        fieldsToClear.add("price");
      }

      if (changedFields.includes("stock")) {
        fieldsToClear.add("stock");
      }

      clearErrorFields([...fieldsToClear]);
    }

    // This is called by DynamicForm on every field change
    setFormData((prev) => {
      // Reset category when type changes to prevent mismatched categories
      if (data.type && data.type !== prev.type) {
        return {
          ...data,
          category: "", // Reset category when type changes
          isQuoteOnly: false, // Reset quote-only when type changes
        };
      }
      return data;
    });
    
    // Auto-enable quote settings when isQuoteOnly is checked
    if (data.isQuoteOnly && !quoteSettings?.enabled) {
      setQuoteSettings((prev) => ({
        ...prev,
        enabled: true,
        quoteOnly: true,
      }));
    }
    // Update quoteOnly in settings when it changes
    if (data.isQuoteOnly !== undefined && quoteSettings) {
      setQuoteSettings((prev) => ({
        ...prev,
        quoteOnly: data.isQuoteOnly,
      }));
    }
  }, [clearErrorFields, formData, quoteSettings]);

  // ========== Image Methods ==========
  const addImages = useCallback((newImages) => {
    setImages((prev) => {
      const combined = [...prev, ...newImages];
      // Max 10 images
      return combined.slice(0, 10);
    });
    clearErrorFields(["images"]);
  }, [clearErrorFields]);

  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    clearErrorFields(["images"]);
  }, [clearErrorFields]);

  const removeImageByUrl = useCallback((url) => {
    setImages((prev) => prev.filter((img) => img !== url));
    clearErrorFields(["images"]);
  }, [clearErrorFields]);

  const reorderImages = useCallback((fromIndex, toIndex) => {
    setImages((prev) => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
    clearErrorFields(["images"]);
  }, [clearErrorFields]);

  const clearImages = useCallback(() => {
    setImages([]);
    clearErrorFields(["images"]);
  }, [clearErrorFields]);

  // ========== Variant Methods ==========
  const enableVariants = useCallback(() => {
    setVariantsEnabled(true);
    clearErrorFields(["variants", "price", "stock"]);
  }, [clearErrorFields]);

  const disableVariants = useCallback((clearAll = false) => {
    setVariantsEnabled(false);
    if (clearAll) {
      setVariants([]);
      setVariationConfig([]);
    }
    clearErrorFields(["variants", "price", "stock"]);
  }, [clearErrorFields]);

  const addVariant = useCallback((variantData) => {
    const newVariant = {
      ...variantData,
      _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setVariants((prev) => [...prev, newVariant]);
    clearErrorFields(["variants", "price", "stock"]);
    return newVariant;
  }, [clearErrorFields]);

  const updateVariant = useCallback((variantId, variantData) => {
    setVariants((prev) =>
      prev.map((v) =>
        v._id === variantId || v.id === variantId ? { ...v, ...variantData } : v
      )
    );
    clearErrorFields(["variants"]);
  }, [clearErrorFields]);

  const removeVariant = useCallback((variantId) => {
    setVariants((prev) =>
      prev.filter((v) => v._id !== variantId && v.id !== variantId)
    );
    clearErrorFields(["variants", "price", "stock"]);
  }, [clearErrorFields]);

  const clearVariants = useCallback(() => {
    setVariants([]);
    clearErrorFields(["variants", "price", "stock"]);
  }, [clearErrorFields]);

  const clearVariationConfig = useCallback(() => {
    setVariationConfig([]);
    clearErrorFields(["variants"]);
  }, [clearErrorFields]);

  // ========== Quote Settings Methods ==========
  const updateQuoteSettings = useCallback((settings) => {
    setQuoteSettings(settings);
    clearErrorFields(["quoteSettings", "price"]);
  }, [clearErrorFields]);

  const clearQuoteSettings = useCallback(() => {
    setQuoteSettings(null);
    clearErrorFields(["quoteSettings", "price"]);
  }, [clearErrorFields]);

  // ========== Validation ==========
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Type validation
    if (
      !formData.type ||
      (formData.type !== "product" && formData.type !== "service")
    ) {
      newErrors.type = "Listing type must be 'product' or 'service'";
    }

    // Basic validation
    if (!formData.name?.trim()) {
      newErrors.name = "Listing name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Listing name must be 100 characters or less";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or less";
    }

    // Category validation - must match listing type
    if (!formData.category) {
      newErrors.category = "Category is required";
    } else {
      const productCategoryValues = LISTING_CATEGORIES.PRODUCT.map(
        (c) => c.value
      );
      const serviceCategoryValues = LISTING_CATEGORIES.SERVICE.map(
        (c) => c.value
      );

      if (isProduct && !productCategoryValues.includes(formData.category)) {
        newErrors.category = `Invalid category for product. Please select from: ${LISTING_CATEGORIES.PRODUCT.map((c) => c.label).join(", ")}`;
      } else if (
        isService &&
        !serviceCategoryValues.includes(formData.category)
      ) {
        newErrors.category = `Invalid category for service. Please select from: ${LISTING_CATEGORIES.SERVICE.map((c) => c.label).join(", ")}`;
      }
    }

    if (variantsEnabled && variants.length === 0) {
      newErrors.variants =
        "Add at least one variant before saving a variant listing.";
    }

    // Price validation - only for non-variant listings that are not free/quote-only
    const price = parseFloat(formData.price);
    const isFreeByPrice = !isNaN(price) && price === 0;
    if (
      !variantsEnabled &&
      !formData.isFree &&
      !formData.isQuoteOnly &&
      !isFreeByPrice
    ) {
      if (isNaN(price) || price < 0) {
        newErrors.price = "Valid price is required (or mark as free)";
      }
    }

    // Stock validation for products without variants
    if (isProduct && !variantsEnabled) {
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Valid stock quantity is required for products";
      }
    }

    // Image validation
    if (images.length === 0) {
      newErrors.images = "At least one listing image is required";
    }

    // Variant validation - check each variant has required fields
    if (variantsEnabled && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const variantNum = i + 1;

        if (!variant.name || !variant.name.trim()) {
          newErrors.variants = `Variant ${variantNum}: Name is required`;
          break;
        }

        const variantPrice = parseFloat(variant.price);
        if (isNaN(variantPrice) || variantPrice < 0) {
          newErrors.variants = `Variant ${variantNum} ("${variant.name}"): Price must be 0 or greater`;
          break;
        }

        if (isProduct) {
          const variantStock = parseInt(variant.stock);
          if (isNaN(variantStock) || variantStock < 0) {
            newErrors.variants = `Variant ${variantNum} ("${variant.name}"): Stock is required for products (must be 0 or greater)`;
            break;
          }
        }
      }
    }

    setErrors(newErrors);
    return newErrors;
  }, [
    formData,
    images,
    variants,
    variantsEnabled,
    isProduct,
    isService,
    hasVariants,
  ]);

  const getValidationSummary = useCallback(() => {
    const validationErrors = validateForm();
    return buildValidationSummary(validationErrors);
  }, [buildValidationSummary, validateForm]);

  // Get validation errors as array of messages
  const getValidationErrors = useCallback(() => {
    return getValidationSummary().map((entry) => entry.message);
  }, [getValidationSummary]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // ========== Draft Management ==========
  const saveDraft = useCallback(() => {
    if (!draftKey) return false;

    try {
      const draft = {
        formData,
        images,
        variants,
        variationConfig,
        variantsEnabled,
        quoteSettings,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error("Failed to save draft:", error);
      return false;
    }
  }, [
    draftKey,
    formData,
    images,
    variants,
    variationConfig,
    variantsEnabled,
    quoteSettings,
  ]);

  const loadDraft = useCallback(() => {
    if (!draftKey) return null;

    try {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return null;

      const draft = JSON.parse(saved);
      setFormData(draft.formData);
      setImages(draft.images || []);
      setVariants(draft.variants || []);
      setVariationConfig(normalizeVariationConfig(draft.variationConfig));
      setVariantsEnabled(draft.variantsEnabled || false);
      setQuoteSettings(draft.quoteSettings || null);
      return draft;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return null;
    }
  }, [draftKey]);

  const clearDraft = useCallback(() => {
    if (!draftKey) return;
    localStorage.removeItem(draftKey);
    setLastSaved(null);
  }, [draftKey]);

  const hasDraft = useCallback(() => {
    if (!draftKey) return false;
    return localStorage.getItem(draftKey) !== null;
  }, [draftKey]);

  // ========== Reset ==========
  const reset = useCallback(() => {
    setFormData(getDefaultFormData());
    setImages(initialData?.images ? [...initialData.images] : []);
    setVariants(initialData?.variants ? [...initialData.variants] : []);
    setVariationConfig(normalizeVariationConfig(initialData?.variationConfig));
    setVariantsEnabled(initialData?.variants?.length > 0 || false);
    setQuoteSettings(initialData?.quoteSettings || null);
    setErrors({});
  }, [getDefaultFormData, initialData]);

  // ========== Submit Preparation ==========
  const getSubmitData = useCallback(() => {
    const price = parseFloat(formData.price) || 0;
    const hasVariantRows = variantsEnabled && variants.length > 0;
    const isFree = !hasVariantRows && (formData.isFree || price === 0);

    const submitData = {
      type: formData.type,
      name: formData.name?.trim(),
      description: formData.description?.trim(),
      category: formData.category,
      isFree: isFree,
      isAvailable: formData.isAvailable !== false,
    };

    if (!hasVariantRows && (!isService || !formData.isQuoteOnly)) {
      submitData.price = isFree ? 0 : price;
    }

    // Add images
    submitData.images = images;

    // Handle stock for products
    if (isProduct && !hasVariantRows) {
      submitData.stock = parseInt(formData.stock) || 0;
    }

    // Add variants if enabled and has variants
    if (hasVariantRows) {
      submitData.hasVariants = true;
      // Clean up variants - remove temp IDs and ensure proper structure
      submitData.variants = variants.map((variant) => {
        const cleanVariant = {
          name: variant.name,
          price: parseFloat(variant.price) || 0,
          isAvailable: variant.isAvailable !== false,
        };

        // Add stock only for products
        if (isProduct) {
          cleanVariant.stock = parseInt(variant.stock) || 0;
        }

        // Add optional fields if present
        if (variant.sku) cleanVariant.sku = variant.sku;
        if (variant.attributes && Object.keys(variant.attributes).length > 0) {
          cleanVariant.attributes = variant.attributes;
        }
        if (variant.images && variant.images.length > 0) {
          cleanVariant.images = variant.images;
        }

        return cleanVariant;
      });

      const normalizedVariationConfig =
        normalizeVariationConfig(variationConfig);

      if (normalizedVariationConfig.length > 0) {
        submitData.variationConfig = normalizedVariationConfig;
      }
    } else {
      submitData.hasVariants = false;
      submitData.variants = [];
      submitData.variationConfig = [];
    }

    // Add quote settings for services - always include if it's a service
    if (isService) {
      // If isQuoteOnly is enabled, automatically enable quote settings
      const isQuoteOnly = formData.isQuoteOnly || false;
      
      if (quoteSettings?.enabled || isQuoteOnly) {
        submitData.quoteSettings = {
          enabled: true,
          quoteOnly: isQuoteOnly,
          autoAccept: quoteSettings?.autoAccept || false,
          minPrice: parseFloat(quoteSettings?.minPrice) || 0,
          maxPrice: parseFloat(quoteSettings?.maxPrice) || 100000000,
          responseTime: quoteSettings?.responseTime || "24hr",
          requiresDeposit: quoteSettings?.requiresDeposit || false,
          depositPercentage: parseInt(quoteSettings?.depositPercentage) || 0,
          customFields: quoteSettings?.customFields || [],
        };
        submitData.isQuoteBased = true;
      } else {
        submitData.quoteSettings = { enabled: false, quoteOnly: false };
        submitData.isQuoteBased = false;
      }
    }

    return submitData;
  }, [
    formData,
    images,
    isProduct,
    isService,
    variants,
    variationConfig,
    variantsEnabled,
    quoteSettings,
  ]);

  // ========== Effects ==========
  // Update form data when initialData changes (edit mode)
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData(getDefaultFormData());
      setImages(initialData.images ? [...initialData.images] : []);
      setVariants(initialData.variants ? [...initialData.variants] : []);
      setVariationConfig(normalizeVariationConfig(initialData.variationConfig));
      setVariantsEnabled(initialData.variants?.length > 0 || false);
      setQuoteSettings(initialData.quoteSettings || null);
      initialDataRef.current = getDefaultFormData();
    }
  }, [initialData, mode, getDefaultFormData]);

  return {
    // Form data
    formData,
    setFormData,
    updateField,
    updateFormData,
    handleFormChange,

    // Images
    images,
    setImages,
    addImages,
    removeImage,
    removeImageByUrl,
    reorderImages,
    clearImages,

    // Variants
    variants,
    setVariants,
    variationConfig,
    setVariationConfig,
    variantsEnabled,
    enableVariants,
    disableVariants,
    addVariant,
    updateVariant,
    removeVariant,
    clearVariants,
    clearVariationConfig,
    hasVariants,
    canAddMoreVariants,
    variantsRequireRegeneration,
    variantSyncError,

    // Quote settings
    quoteSettings,
    updateQuoteSettings,
    clearQuoteSettings,

    // State flags
    isDirty,
    isValid,
    isProduct,
    isService,
    errors,
    validationSummary,
    sectionValidation,
    sectionErrorCounts,
    mode,

    // Validation
    validateForm,
    getValidationErrors,
    getValidationSummary,

    // Draft
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    lastSaved,

    // Actions
    reset,
    getSubmitData,
  };
};

export default useListingForm;

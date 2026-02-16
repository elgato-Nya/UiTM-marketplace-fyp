import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { createListingFormConfig } from "../../../config/forms/listingForm";
import {
  VARIANT_LIMITS,
  LISTING_CATEGORIES,
} from "../../../constants/listingConstant";

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

  // ========== Derived State ==========
  const isDirty = useMemo(() => {
    const currentData = JSON.stringify({
      formData,
      images,
      variants,
      quoteSettings,
    });
    const initial = JSON.stringify({
      formData: initialDataRef.current,
      images: initialData?.images || [],
      variants: initialData?.variants || [],
      quoteSettings: initialData?.quoteSettings || null,
    });
    return currentData !== initial;
  }, [formData, images, variants, quoteSettings, initialData]);

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

  // ========== Form Data Methods ==========
  const updateField = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear field error on change
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const updateFormData = useCallback((data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  const handleFormChange = useCallback((data) => {
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
  }, [quoteSettings]);

  // ========== Image Methods ==========
  const addImages = useCallback((newImages) => {
    setImages((prev) => {
      const combined = [...prev, ...newImages];
      // Max 10 images
      return combined.slice(0, 10);
    });
  }, []);

  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeImageByUrl = useCallback((url) => {
    setImages((prev) => prev.filter((img) => img !== url));
  }, []);

  const reorderImages = useCallback((fromIndex, toIndex) => {
    setImages((prev) => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  // ========== Variant Methods ==========
  const enableVariants = useCallback(() => {
    setVariantsEnabled(true);
  }, []);

  const disableVariants = useCallback((clearAll = false) => {
    setVariantsEnabled(false);
    if (clearAll) {
      setVariants([]);
    }
  }, []);

  const addVariant = useCallback((variantData) => {
    const newVariant = {
      ...variantData,
      _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setVariants((prev) => [...prev, newVariant]);
    return newVariant;
  }, []);

  const updateVariant = useCallback((variantId, variantData) => {
    setVariants((prev) =>
      prev.map((v) =>
        v._id === variantId || v.id === variantId ? { ...v, ...variantData } : v
      )
    );
  }, []);

  const removeVariant = useCallback((variantId) => {
    setVariants((prev) =>
      prev.filter((v) => v._id !== variantId && v.id !== variantId)
    );
  }, []);

  const clearVariants = useCallback(() => {
    setVariants([]);
  }, []);

  // ========== Quote Settings Methods ==========
  const updateQuoteSettings = useCallback((settings) => {
    setQuoteSettings(settings);
  }, []);

  const clearQuoteSettings = useCallback(() => {
    setQuoteSettings(null);
  }, []);

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

    // Price validation - only if not free and price > 0, and no variants with prices
    const price = parseFloat(formData.price);
    const isFreeByPrice = !isNaN(price) && price === 0;
    if (!formData.isFree && !isFreeByPrice) {
      const hasVariantPrices =
        variantsEnabled && variants.some((v) => parseFloat(v.price) > 0);
      if (!hasVariantPrices) {
        if (isNaN(price) || price < 0) {
          newErrors.price = "Valid price is required (or mark as free)";
        }
      }
    }

    // Stock validation for products without variants
    if (isProduct && !hasVariants) {
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

  // Get validation errors as array of messages
  const getValidationErrors = useCallback(() => {
    const validationErrors = validateForm();
    return Object.values(validationErrors);
  }, [validateForm]);

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
  }, [draftKey, formData, images, variants, variantsEnabled, quoteSettings]);

  const loadDraft = useCallback(() => {
    if (!draftKey) return null;

    try {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return null;

      const draft = JSON.parse(saved);
      setFormData(draft.formData);
      setImages(draft.images || []);
      setVariants(draft.variants || []);
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
    setVariantsEnabled(initialData?.variants?.length > 0 || false);
    setQuoteSettings(initialData?.quoteSettings || null);
    setErrors({});
  }, [getDefaultFormData, initialData]);

  // ========== Submit Preparation ==========
  const getSubmitData = useCallback(() => {
    const price = parseFloat(formData.price) || 0;
    const isFree = formData.isFree || price === 0;

    const submitData = {
      type: formData.type,
      name: formData.name?.trim(),
      description: formData.description?.trim(),
      category: formData.category,
      price: isFree ? 0 : price,
      isFree: isFree,
      isAvailable: formData.isAvailable !== false,
    };

    // Add images
    submitData.images = images;

    // Handle stock for products
    if (isProduct) {
      submitData.stock = parseInt(formData.stock) || 0;
    }

    // Add variants if enabled and has variants
    if (variantsEnabled && variants.length > 0) {
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
    } else {
      submitData.hasVariants = false;
      submitData.variants = [];
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
    variantsEnabled,
    enableVariants,
    disableVariants,
    addVariant,
    updateVariant,
    removeVariant,
    clearVariants,
    hasVariants,
    canAddMoreVariants,

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
    mode,

    // Validation
    validateForm,
    getValidationErrors,

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

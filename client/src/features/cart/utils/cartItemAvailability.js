const findListingVariantById = (listing, variantId) => {
  if (!variantId || !Array.isArray(listing?.variants)) {
    return null;
  }

  return (
    listing.variants.find(
      (variant) => String(variant?._id) === String(variantId)
    ) || null
  );
};

export const getCartItemAvailability = (item) => {
  const listing = item?.listing;

  if (!listing) {
    return {
      hasVariant: Boolean(item?.variantId || item?.variantSnapshot),
      variant: null,
      availableStock: 0,
      isListingMissing: true,
      isListingUnavailable: false,
      isVariantMissing: false,
      isVariantUnavailable: false,
      isOutOfStock: false,
      hasInsufficientStock: false,
      isUnavailableForCheckout: true,
    };
  }

  const isService = listing.type === "service";
  const hasVariant = Boolean(item?.variantId || item?.variantSnapshot);
  const variant = hasVariant
    ? findListingVariantById(listing, item.variantId)
    : null;
  const hasLiveVariants =
    Array.isArray(listing.variants) && listing.variants.length > 0;
  const isVariantMissing = hasVariant && (!hasLiveVariants || !variant);
  const isVariantUnavailable = Boolean(
    hasVariant && variant && variant.isAvailable === false
  );
  const availableStock = isService
    ? null
    : hasVariant && variant
      ? variant.stock || 0
      : listing.stock || 0;
  const isOutOfStock = !isService && availableStock === 0;
  const hasInsufficientStock =
    !isService &&
    availableStock != null &&
    availableStock > 0 &&
    availableStock < (item?.quantity || 0);
  const isListingUnavailable = listing.isAvailable === false;
  const isUnavailableForCheckout =
    isListingUnavailable ||
    isVariantMissing ||
    isVariantUnavailable ||
    isOutOfStock ||
    hasInsufficientStock;

  return {
    hasVariant,
    variant,
    availableStock,
    isListingMissing: false,
    isListingUnavailable,
    isVariantMissing,
    isVariantUnavailable,
    isOutOfStock,
    hasInsufficientStock,
    isUnavailableForCheckout,
  };
};

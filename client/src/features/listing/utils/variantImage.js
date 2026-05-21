const getImageUrl = (image) => {
  if (typeof image === "string") return image;
  return image?.url || image?.main?.url || null;
};

const getPrimaryConfig = (listing) => {
  const primaryConfig = Array.isArray(listing?.variationConfig)
    ? listing.variationConfig[0]
    : null;

  if (!primaryConfig?.key || !Array.isArray(primaryConfig.options)) {
    return null;
  }

  return primaryConfig;
};

const toLabel = (key) => {
  if (!key) return "";

  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getPrimaryOptionImageUrl = (
  listing,
  selectedAttributes,
  selectedVariant
) => {
  const primaryConfig = getPrimaryConfig(listing);

  if (!primaryConfig) {
    return null;
  }

  const primaryKey = primaryConfig.key;
  const selectedPrimaryValue =
    selectedAttributes?.[primaryKey] || selectedVariant?.attributes?.[primaryKey];

  if (!selectedPrimaryValue) {
    return null;
  }

  const matchingOption = primaryConfig.options.find(
    (option) => option?.value === selectedPrimaryValue
  );

  return matchingOption?.imageUrl || null;
};

export const buildListingGalleryImages = (listing) => {
  const galleryImages = [];
  const seenUrls = new Set();
  const primaryConfig = getPrimaryConfig(listing);
  const primaryLabel = primaryConfig?.label || toLabel(primaryConfig?.key);

  const addImage = (image, extra = {}) => {
    const imageUrl = getImageUrl(image);

    if (!imageUrl || seenUrls.has(imageUrl)) {
      return;
    }

    seenUrls.add(imageUrl);
    galleryImages.push({
      url: imageUrl,
      ...extra,
    });
  };

  (listing?.images || []).forEach((image) => {
    addImage(image, { source: "listing" });
  });

  primaryConfig?.options?.forEach((option) => {
    if (!option?.imageUrl) {
      return;
    }

    addImage(option.imageUrl, {
      source: "primaryOption",
      optionValue: option.value,
      label: primaryLabel && option.value ? `${primaryLabel}: ${option.value}` : null,
    });
  });

  return galleryImages;
};

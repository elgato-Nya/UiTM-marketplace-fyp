import {
  LISTING_TYPES,
  LISTING_CATEGORIES,
} from "../../constants/listingConstant";

/**
 * Listing Form Configuration
 *
 * Single-step form with all fields in one section.
 * The CreateListingPage and EditListingPage use ListingFormLayout
 * which displays sections as accordions (Listing Details, Images, Variants, Quote Settings).
 *
 * This config only handles the "Listing Details" section fields.
 * Other sections (Images, Variants, Quote Settings) are managed separately in the pages.
 */
export const createListingFormConfig = {
  title: "Create New Listing",
  subtitle: "Add exciting products or services to your store",
  submitText: "Create Listing",
  maxWidth: "md",
  defaultValues: {
    type: LISTING_TYPES.PRODUCT.value,
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    isFree: false,
    isQuoteOnly: false,
    isAvailable: true,
    images: [],
  },
  // Single step form - all fields in one section
  fields: [
    {
      name: "type",
      type: "select",
      label: "Listing Type",
      placeholder: "Select listing type",
      required: true,
      options: Object.values(LISTING_TYPES),
    },
    {
      name: "name",
      type: "text",
      label: "Listing Name",
      placeholder: "Enter listing name",
      required: true,
      helperText: "Maximum 100 characters",
      maxLength: 100,
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      placeholder: "Describe your listing...",
      required: true,
      helperText:
        "Maximum 1000 characters. Include key features and details. Use Enter for new lines.",
      maxLength: 1000,
      rows: 6,
    },
    {
      name: "category",
      type: "select",
      label: "Category",
      placeholder: "Select category",
      required: true,
      helperText: "Choose the most appropriate category for your listing.",
      options: [], // Based on type
      dynamicOptions: (formValues) => {
        const type = formValues.type;
        if (type === "product") {
          return LISTING_CATEGORIES.PRODUCT;
        } else if (type === "service") {
          return LISTING_CATEGORIES.SERVICE;
        }
        return [];
      },
    },
    {
      name: "isFree",
      type: "checkbox",
      label: "Is this listing free?",
      helperText: "Check if you want to offer this listing for free.",
      showIf: (formValues) => formValues.type !== "service" || !formValues.isQuoteOnly,
    },
    {
      name: "isQuoteOnly",
      type: "checkbox",
      label: "Quote-based pricing only",
      helperText: "Enable this if you want customers to request quotes instead of showing a fixed price. Price will be based on your quote settings.",
      showIf: (formValues) => formValues.type === "service" && !formValues.isFree,
    },
    {
      name: "price",
      type: "number",
      label: "Price (RM)",
      placeholder: "0.00",
      required: true,
      helperText: "Set the price for your listing.",
      min: 0,
      step: 0.01,
      showIf: (formValues) => !formValues.isFree && !formValues.isQuoteOnly,
    },
    {
      name: "stock",
      type: "number",
      label: "Stock Quantity",
      placeholder: "0",
      required: true,
      helperText: "How many units are available?",
      min: 0,
      showIf: (formValues) => formValues.type === "product",
    },
    {
      name: "isAvailable",
      type: "checkbox",
      label: "Mark as Available",
      helperText:
        "Uncheck this if you don't want people to see this listing yet.",
    },
  ],
  // Keep steps for backward compatibility but mark as deprecated
  steps: [
    {
      label: "Basic Information",
      subtitle: "Tell us about your listing",
      fields: [], // Fields moved to top-level
    },
  ],
};

export const editListingFormConfig = {
  title: "Edit Listing",
  subtitle: "Update your listing details",
  submitText: "Save Changes",
  maxWidth: "md",
  defaultValues: {
    // Values will be populated dynamically from existing listing data
  },
  fields: createListingFormConfig.fields, // Same fields as create form
  steps: createListingFormConfig.steps,
};

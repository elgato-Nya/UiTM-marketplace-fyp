import {
  LISTING_TYPES,
  LISTING_CATEGORIES,
  LISTING_STATUS,
} from "../../constants/listingConstant";

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
    isAvailable: true,
    images: [],
  },
  steps: [
    {
      label: "Basic Information",
      subtitle: "Tell us about your listing",
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
      ],
    },
    {
      label: "Pricing & Stock",
      subtitle: "Set the price and availability of your listing",
      fields: [
        {
          name: "isFree",
          type: "checkbox",
          label: "Is this listing free?",
          helperText: "Check if you want to offer this listing for free.",
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
          showIf: (formValues) => !formValues.isFree,
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
            "Uncheck this if you don't want to people see this listing yet.",
        },
      ],
    },
    {
      label: "Images",
      subtitle: "Upload images to showcase your listing",
      fields: [
        {
          name: "images",
          type: "file",
          label: "Upload Listing Images",
          helperText:
            "You can upload up to 10 images. Each image should be less than 5MB and in JPG, PNG, or WEBP format.",
          accept: "image/jpeg,image/png,image/webp",
          multiple: true,
          maxFiles: 10,
          maxFileSize: 5 * 1024 * 1024, // 5MB
          required: false,
        },
      ],
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
  steps: createListingFormConfig.steps, // Same steps as create form
};

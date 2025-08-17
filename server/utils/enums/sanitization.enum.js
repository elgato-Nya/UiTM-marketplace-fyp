const SANITIZATION_FIELD_MAP = {
  // User profile fields
  email: "email",
  username: "text",
  bio: "richText",
  phoneNumber: "phone",
  avatar: "passthrough",
  campus: "passthrough",
  faculty: "passthrough",

  // Address fields
  recipientName: "text",
  type: "passthrough",
  building: "alphanumeric",
  floor: "alphanumeric",
  room: "alphanumeric",
  addressLine1: "address",
  addressLine2: "address",
  city: "text",
  state: "text",
  postcode: "numeric",
  specialInstructions: "richText",

  // System fields
  _id: "passthrough",
  userId: "passthrough",
  createdAt: "passthrough",
  updatedAt: "passthrough",
  isDefault: "passthrough",
};

// Or as enum-like object (more structured)
const SanitizationFieldType = {
  EMAIL: "email",
  TEXT: "text",
  RICH_TEXT: "richText",
  PHONE: "phone",
  ADDRESS: "address",
  NUMERIC: "numeric",
  ALPHANUMERIC: "alphanumeric",
  PASSTHROUGH: "passthrough",
};

const FIELD_SANITIZATION_MAP = {
  // User fields
  email: SanitizationFieldType.EMAIL,
  username: SanitizationFieldType.TEXT,
  bio: SanitizationFieldType.RICH_TEXT,
  phoneNumber: SanitizationFieldType.PHONE,
  avatar: SanitizationFieldType.PASSTHROUGH,

  // Address fields
  recipientName: SanitizationFieldType.TEXT,
  addressLine1: SanitizationFieldType.ADDRESS,
  city: SanitizationFieldType.TEXT,
  postcode: SanitizationFieldType.NUMERIC,
  // ... rest of mappings
};

module.exports = {
  SANITIZATION_FIELD_MAP,
  SanitizationFieldType,
  FIELD_SANITIZATION_MAP,
};

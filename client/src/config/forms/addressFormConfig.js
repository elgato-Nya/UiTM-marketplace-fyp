import * as yup from "yup";
import {
  Home,
  School,
  Person,
  Phone,
  LocationOn,
  Info,
  Place,
} from "@mui/icons-material";

import { CAMPUS_OPTIONS } from "../../constants/authConstant";
import { STATE_OPTIONS } from "../../constants/addressConstant";
import {
  campusAddressValidation,
  personalAddressValidation,
  pickupAddressValidation,
} from "../../validation/addressValidator";

// Form configurations
export const getAddressFormConfig = (
  addressType = "campus",
  initialData = null
) => {
  const isCampus = addressType === "campus";
  const isPickup = addressType === "pickup";

  const addressTypeLabel = isCampus
    ? "Campus"
    : isPickup
      ? "Pickup/Meetup"
      : "Personal";

  return {
    title: `${initialData ? "Edit" : "Add"} ${addressTypeLabel} Address`,
    validationSchema: isCampus
      ? campusAddressValidation
      : isPickup
        ? pickupAddressValidation
        : personalAddressValidation,

    defaultValues: isCampus
      ? {
          type: addressType,
          label: initialData?.label || "",
          recipientName: initialData?.recipientName || "",
          recipientPhone: initialData?.recipientPhone || "",
          campusAddress: {
            campus: initialData?.campusAddress?.campus || "",
            building: initialData?.campusAddress?.building || "",
            floor: initialData?.campusAddress?.floor || "",
            room: initialData?.campusAddress?.room || "",
          },
          specialInstructions: initialData?.specialInstructions || "",
          isDefault: initialData?.isDefault || false,
        }
      : isPickup
        ? {
            type: addressType,
            label: initialData?.label || "",
            recipientName: initialData?.recipientName || "",
            recipientPhone: initialData?.recipientPhone || "",
            pickupDetails: {
              location: initialData?.pickupDetails?.location || "",
              pickupTime: initialData?.pickupDetails?.pickupTime || "",
            },
            specialInstructions: initialData?.specialInstructions || "",
            isDefault: initialData?.isDefault || false,
          }
        : {
            type: addressType,
            label: initialData?.label || "",
            recipientName: initialData?.recipientName || "",
            recipientPhone: initialData?.recipientPhone || "",
            personalAddress: {
              addressLine1: initialData?.personalAddress?.addressLine1 || "",
              addressLine2: initialData?.personalAddress?.addressLine2 || "",
              city: initialData?.personalAddress?.city || "",
              state: initialData?.personalAddress?.state || "",
              postcode: initialData?.personalAddress?.postcode || "",
            },
            specialInstructions: initialData?.specialInstructions || "",
            isDefault: initialData?.isDefault || false,
          },

    steps: [
      {
        title: "Basic Information",
        icon: <Person />,
        fields: [
          {
            name: "label",
            type: "text",
            label: "Address Label (Optional)",
            placeholder: `My ${isCampus ? "Campus" : "Home"} Address`,
          },
          {
            name: "recipientName",
            type: "text",
            label: "Recipient Name",
            placeholder: "Full name of the recipient",
            required: true,
          },
          {
            name: "recipientPhone",
            type: "tel",
            label: "Phone Number",
            placeholder: "0123456789",
            required: true,
          },
        ],
      },

      {
        title: isCampus
          ? "Campus Address Details"
          : isPickup
            ? "Pickup/Meetup Location Details"
            : "Personal Address Details",
        icon: isCampus ? <School /> : isPickup ? <Place /> : <Home />,
        fields: isCampus
          ? [
              {
                name: "campusAddress.campus",
                type: "select",
                label: "Campus",
                required: true,
                options: CAMPUS_OPTIONS.map((campus) => ({
                  value: campus.value,
                  label: campus.label,
                })),
              },
              {
                name: "campusAddress.building",
                type: "text",
                label: "Building Name",
                placeholder: "e.g. Cengal 2",
                required: true,
              },
              {
                name: "campusAddress.floor",
                type: "text",
                label: "Floor",
                placeholder: "e.g. 2nd",
              },
              {
                name: "campusAddress.room",
                type: "text",
                label: "Room",
                placeholder: "e.g. 201A",
              },
            ]
          : isPickup
            ? [
                {
                  name: "pickupDetails.location",
                  type: "textarea",
                  label: "Pickup/Meetup Location",
                  placeholder:
                    "e.g. Main Entrance, Cafeteria, Student Center, etc.",
                  required: true,
                  rows: 2,
                },
                {
                  name: "pickupDetails.pickupTime",
                  type: "datetime-local",
                  label: "Preferred Pickup Time",
                  placeholder: "Select date and time",
                  required: true,
                },
              ]
            : [
                {
                  name: "personalAddress.addressLine1",
                  type: "textarea",
                  label: "Address Line 1",
                  placeholder: "House number, street name",
                  required: true,
                  rows: 2,
                },
                {
                  name: "personalAddress.addressLine2",
                  type: "textarea",
                  label: "Address Line 2 (Optional)",
                  placeholder: "Apartment, suite, unit, building, floor, etc.",
                  rows: 2,
                },
                {
                  name: "personalAddress.city",
                  type: "text",
                  label: "City",
                  placeholder: "e.g. Shah Alam",
                  required: true,
                },
                {
                  name: "personalAddress.state",
                  type: "select",
                  label: "State",
                  required: true,
                  options: STATE_OPTIONS.map((state) => ({
                    value: state.value,
                    label: state.label,
                  })),
                },
                {
                  name: "personalAddress.postcode",
                  type: "text",
                  label: "Postal Code",
                  placeholder: "e.g. 40450",
                  required: true,
                },
              ],
      },

      {
        title: "Additional Options",
        icon: <Info />,
        fields: [
          ...(!isPickup
            ? [
                {
                  name: "specialInstructions",
                  type: "textarea",
                  label: "Special Instructions (Optional)",
                  placeholder: "Any special instructions for the delivery",
                  rows: 3,
                },
              ]
            : []),
          {
            name: "isDefault",
            type: "switch",
            label: "Set as default address",
          },
        ],
      },
    ],

    submitText: initialData ? "Update Address" : "Add Address",

    submitButton: {
      text: initialData ? "Update Address" : "Add Address",
      loadingText: "Saving...",
    },

    cancelButton: {
      text: "Cancel",
    },
  };
};

// Tab configuration for AddressesPage
export const getAddressTabsConfig = (counts = {}) => [
  {
    value: "campus",
    label: "Campus Addresses",
    shortLabel: "Campus", // Short label for mobile
    description: "Delivery within university campus",
    icon: <School />,
    badgeCount: counts.campus || 0,
  },
  {
    value: "personal",
    label: "Personal Addresses",
    shortLabel: "Personal", // Short label for mobile
    description: "Home, office, and other locations",
    icon: <Home />,
    badgeCount: counts.personal || 0,
  },
  {
    value: "pickup",
    label: "Pickup/Meetup Points",
    shortLabel: "Pickup", // Short label for mobile
    description: "Self-pickup or meetup locations",
    icon: <Place />,
    badgeCount: counts.pickup || 0,
  },
];

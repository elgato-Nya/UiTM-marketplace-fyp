import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

import { useTheme } from "../../../hooks/useTheme";
import { CAMPUS_OPTIONS } from "../../../constants/authConstant";
import { STATE_OPTIONS } from "../../../constants/addressConstant";

const AddressCard = ({
  address,
  isDefault = false,
  onEdit,
  onDelete,
  onSetDefault,
  type = "campus",
}) => {
  const { theme } = useTheme();

  const formatAddress = (address) => {
    if (address.type === "campus" && address.campusAddress) {
      const { campus, building, floor, room } = address.campusAddress;

      // Get campus display name
      const campusOption = CAMPUS_OPTIONS.find(
        (option) => option.value === campus
      );
      const campusName = campusOption ? campusOption.label : campus;

      let formatted = `${campusName}`;
      if (building) formatted += `, ${building}`;
      if (floor) formatted += `, Floor ${floor}`;
      if (room) formatted += `, Room ${room}`;
      return formatted;
    } else if (address.type === "personal" && address.personalAddress) {
      const { addressLine1, addressLine2, city, state, postcode } =
        address.personalAddress;

      // Get state display name
      const stateOption = STATE_OPTIONS.find(
        (option) => option.value === state
      );
      const stateName = stateOption ? stateOption.label : state;

      let formatted = addressLine1;
      if (addressLine2) formatted += `, ${addressLine2}`;
      formatted += `, ${city}, ${stateName} ${postcode}`;
      return formatted;
    }
    return "Address information not available";
  };

  return (
    <Card
      elevation={isDefault ? 4 : 1}
      sx={{
        width: "100%",
        border: isDefault
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
        position: "relative",
        borderRadius: 2,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: "200px",
        "&:hover": {
          elevation: isDefault ? 6 : 3,
          borderColor: theme.palette.primary.main,
          transform: "translateY(-2px)",
          boxShadow: isDefault
            ? `0 8px 32px rgba(0, 0, 0, 0.12)`
            : `0 4px 16px rgba(0, 0, 0, 0.08)`,
        },
        "&:focus-within": {
          outline: `3px solid ${theme.palette.primary.main}25`,
          outlineOffset: "2px",
        },
      }}
      role="article"
      aria-label={`${address.label || `${type === "campus" ? "Campus" : "Personal"} address`} for ${address.recipientName}`}
    >
      {/* Default Badge */}
      {isDefault && (
        <Chip
          label="Default"
          size="small"
          color="primary"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
          }}
          aria-label="This is your default address"
        />
      )}

      <CardContent sx={{ p: 3, pb: 2, height: "100%" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: 2.5,
            minHeight: "60px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: isDefault
                  ? theme.palette.primary.main + "15"
                  : theme.palette.grey[50],
                mr: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "48px",
                height: "48px",
              }}
            >
              {type === "campus" ? (
                <SchoolIcon
                  sx={{
                    color: isDefault
                      ? theme.palette.primary.main
                      : "text.secondary",
                    fontSize: 24,
                  }}
                  aria-hidden="true"
                />
              ) : (
                <HomeIcon
                  sx={{
                    color: isDefault
                      ? theme.palette.primary.main
                      : "text.secondary",
                    fontSize: 24,
                  }}
                  aria-hidden="true"
                />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: "1.1rem",
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                }}
              >
                {address.label ||
                  `${type === "campus" ? "Campus" : "Personal"} Address`}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: "0.875rem",
                  opacity: 0.8,
                }}
              >
                {type === "campus" ? "University Campus" : "External Location"}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons - Compact Single Row */}
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              flexShrink: 0,
            }}
            role="group"
            aria-label="Address actions"
          >
            <Tooltip
              title={
                isDefault
                  ? "This is your default address"
                  : "Set as default address"
              }
              arrow
              placement="left"
            >
              <span>
                <IconButton
                  size="medium"
                  onClick={() => onSetDefault(address._id)}
                  disabled={isDefault}
                  sx={{
                    color: isDefault
                      ? theme.palette.primary.main
                      : "text.secondary",
                    backgroundColor: isDefault
                      ? theme.palette.primary.main + "10"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isDefault
                        ? theme.palette.primary.main + "20"
                        : theme.palette.primary.main + "10",
                    },
                    transition: "all 0.2s ease",
                  }}
                  aria-label={
                    isDefault
                      ? "This is your default address"
                      : "Set as default address"
                  }
                >
                  {isDefault ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Edit address" arrow>
              <IconButton
                size="small"
                onClick={onEdit}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    color: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.main + "10",
                  },
                  transition: "all 0.2s ease",
                }}
                aria-label="Edit address"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete address" arrow>
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    color: theme.palette.error.main,
                    backgroundColor: theme.palette.error.main + "10",
                  },
                  transition: "all 0.2s ease",
                }}
                aria-label="Delete address"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Address Details */}
        <Stack spacing={2} component="dl" sx={{ flex: 1 }}>
          {/* Recipient */}
          <Box
            sx={{ display: "flex", alignItems: "center", minHeight: "24px" }}
          >
            <PersonIcon
              sx={{
                fontSize: 20,
                mr: 2,
                color: "text.secondary",
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "text.secondary", mb: 0.25 }}
              >
                Recipient
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  wordBreak: "break-word",
                }}
              >
                {address.recipientName}
              </Typography>
            </Box>
          </Box>

          {/* Phone */}
          <Box
            sx={{ display: "flex", alignItems: "center", minHeight: "24px" }}
          >
            <PhoneIcon
              sx={{
                fontSize: 20,
                mr: 2,
                color: "text.secondary",
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "text.secondary", mb: 0.25 }}
              >
                Phone
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  fontSize: "0.95rem",
                }}
              >
                <a
                  href={`tel:${address.recipientPhone}`}
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 600,
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                >
                  {address.recipientPhone}
                </a>
              </Typography>
            </Box>
          </Box>

          {/* Address */}
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <LocationIcon
              sx={{
                fontSize: 20,
                mr: 2,
                mt: 0.2,
                color: "text.secondary",
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "text.secondary", mb: 0.25 }}
              >
                Address
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {formatAddress(address)}
              </Typography>
            </Box>
          </Box>

          {/* Special Instructions */}
          {address.specialInstructions && (
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <InfoIcon
                sx={{
                  fontSize: 20,
                  mr: 2,
                  mt: 0.2,
                  color: "text.secondary",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "text.secondary", mb: 0.25 }}
                >
                  Special Instructions
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "0.95rem",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                    color: "text.secondary",
                  }}
                >
                  {address.specialInstructions}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AddressCard;

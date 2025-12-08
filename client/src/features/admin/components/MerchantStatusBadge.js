import { Chip } from "@mui/material";
import {
  Store,
  CheckCircle,
  Cancel,
  HourglassEmpty,
} from "@mui/icons-material";

/**
 * MerchantStatusBadge Component
 *
 * PURPOSE: Display merchant verification status with color-coded badges
 * STATUSES:
 * - unverified: Merchant registered but hasn't been reviewed yet
 * - pending: Merchant hasn't set up their shop yet (needs to complete shop profile)
 * - verified: Merchant approved by admin
 * - rejected: Merchant rejected by admin
 *
 * ACCESSIBILITY:
 * - Uses semantic color codes
 * - Includes descriptive icons
 * - Proper ARIA labels via Chip component
 */
const MerchantStatusBadge = ({ status }) => {
  const statusConfig = {
    unverified: {
      label: "Awaiting Review",
      color: "warning",
      icon: <Store sx={{ fontSize: 16 }} />,
      ariaLabel: "Status: Awaiting admin review",
    },
    pending: {
      label: "Pending Setup",
      color: "info",
      icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
      ariaLabel: "Status: Merchant needs to complete shop setup",
    },
    verified: {
      label: "Verified",
      color: "success",
      icon: <CheckCircle sx={{ fontSize: 16 }} />,
      ariaLabel: "Status: Verified and approved",
    },
    rejected: {
      label: "Rejected",
      color: "error",
      icon: <Cancel sx={{ fontSize: 16 }} />,
      ariaLabel: "Status: Rejected by admin",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 600 }}
      aria-label={config.ariaLabel}
    />
  );
};

export default MerchantStatusBadge;

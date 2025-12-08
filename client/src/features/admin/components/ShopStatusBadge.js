import { Chip } from "@mui/material";
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  RemoveCircle,
} from "@mui/icons-material";

/**
 * ShopStatusBadge Component
 *
 * PURPOSE: Display shop operational status
 * STATUSES:
 * - active: Shop is operational and can sell
 * - suspended: Shop temporarily suspended by admin
 * - pending_verification: Shop awaiting verification
 * - closed: Shop permanently closed
 *
 * ACCESSIBILITY:
 * - Color-coded for quick recognition
 * - Descriptive icons
 * - Proper ARIA labels
 */
const ShopStatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      label: "Active",
      color: "success",
      icon: <CheckCircle sx={{ fontSize: 14 }} />,
      ariaLabel: "Shop status: Active and operational",
    },
    suspended: {
      label: "Suspended",
      color: "error",
      icon: <Cancel sx={{ fontSize: 14 }} />,
      ariaLabel: "Shop status: Suspended by admin",
    },
    pending_verification: {
      label: "Pending",
      color: "warning",
      icon: <HourglassEmpty sx={{ fontSize: 14 }} />,
      ariaLabel: "Shop status: Pending verification",
    },
    closed: {
      label: "Closed",
      color: "default",
      icon: <RemoveCircle sx={{ fontSize: 14 }} />,
      ariaLabel: "Shop status: Permanently closed",
    },
  };

  const config = statusConfig[status] || statusConfig.pending_verification;

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
      aria-label={config.ariaLabel}
    />
  );
};

export default ShopStatusBadge;

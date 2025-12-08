import { Chip } from "@mui/material";
import {
  CheckCircle,
  Block,
  Cancel,
  HourglassEmpty,
} from "@mui/icons-material";

/**
 * UserStatusBadge Component
 *
 * PURPOSE: Display user status with color-coded badges
 * STATUSES:
 * - active: User is active and in good standing
 * - inactive: User hasn't been active recently
 * - suspended: User has been suspended by admin
 *
 * ACCESSIBILITY:
 * - Uses semantic color codes
 * - Includes descriptive icons
 * - Proper ARIA labels via Chip component
 */
const UserStatusBadge = ({ isActive, isSuspended }) => {
  // Determine status based on flags
  let status = "active";
  if (isSuspended) {
    status = "suspended";
  } else if (!isActive) {
    status = "inactive";
  }

  const statusConfig = {
    active: {
      label: "Active",
      color: "success",
      icon: <CheckCircle sx={{ fontSize: 16 }} />,
      ariaLabel: "Status: Active user",
    },
    inactive: {
      label: "Inactive",
      color: "default",
      icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
      ariaLabel: "Status: Inactive user",
    },
    suspended: {
      label: "Suspended",
      color: "error",
      icon: <Block sx={{ fontSize: 16 }} />,
      ariaLabel: "Status: Suspended by admin",
    },
  };

  const config = statusConfig[status];

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

export default UserStatusBadge;

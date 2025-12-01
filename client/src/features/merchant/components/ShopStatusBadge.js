import React from "react";
import { Chip } from "@mui/material";
import { Verified, HourglassEmpty, Block, Close } from "@mui/icons-material";

/**
 * ShopStatusBadge Component
 *
 * PURPOSE: Display shop verification and status badges
 * USAGE: <ShopStatusBadge verificationStatus="verified" shopStatus="active" />
 */

function ShopStatusBadge({ verificationStatus, shopStatus, size = "small" }) {
  // Verification badge
  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case "verified":
        return (
          <Chip
            icon={<Verified fontSize="small" />}
            label="Verified"
            color="primary"
            size={size}
            sx={{ fontWeight: 500 }}
          />
        );
      case "unverified":
        return (
          <Chip
            icon={<HourglassEmpty fontSize="small" />}
            label="New Seller"
            color="warning"
            size={size}
            variant="outlined"
          />
        );
      case "pending":
        return (
          <Chip
            icon={<HourglassEmpty fontSize="small" />}
            label="Under Review"
            color="info"
            size={size}
            variant="outlined"
          />
        );
      case "rejected":
        return (
          <Chip
            icon={<Close fontSize="small" />}
            label="Rejected"
            color="error"
            size={size}
            variant="outlined"
          />
        );
      default:
        return null;
    }
  };

  // Shop status badge (only show if not active)
  const getStatusBadge = () => {
    switch (shopStatus) {
      case "suspended":
        return (
          <Chip
            icon={<Block fontSize="small" />}
            label="Suspended"
            color="error"
            size={size}
          />
        );
      case "closed":
        return (
          <Chip
            icon={<Close fontSize="small" />}
            label="Closed"
            color="default"
            size={size}
          />
        );
      case "pending_verification":
        return (
          <Chip
            icon={<HourglassEmpty fontSize="small" />}
            label="Pending Approval"
            color="warning"
            size={size}
          />
        );
      case "active":
      default:
        return null;
    }
  };

  const verificationBadge = getVerificationBadge();
  const statusBadge = getStatusBadge();

  // Return null if no badges to show
  if (!verificationBadge && !statusBadge) {
    return null;
  }

  return (
    <>
      {verificationBadge}
      {statusBadge && <span style={{ marginLeft: 8 }}>{statusBadge}</span>}
    </>
  );
}

export default ShopStatusBadge;

import React from "react";
import { Paper } from "@mui/material";
import TabsComponent from "../../../components/common/Tabs/TabsComponent";
import { getAddressTabsConfig } from "../../../config/forms/addressFormConfig";
import { useTheme } from "../../../hooks/useTheme";

const AddressTypeSelector = ({ addressType, onTypeChange, addresses = [] }) => {
  const { theme } = useTheme();

  const addressCounts = {
    campus: Array.isArray(addresses)
      ? addresses.filter((a) => a.type === "campus").length
      : 0,
    personal: Array.isArray(addresses)
      ? addresses.filter((a) => a.type === "personal").length
      : 0,
  };

  return (
    <Paper
      sx={{
        mb: { xs: 3, sm: 4 },
        borderRadius: { xs: 2, sm: 3 },
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        border: `1px solid ${theme.palette.divider}`,
      }}
      component="section"
      aria-label="Address type selection"
    >
      <TabsComponent
        tabs={getAddressTabsConfig(addressCounts)}
        value={addressType}
        onChange={onTypeChange}
        variant="fullWidth"
        aria-label="Choose address type to view and manage"
      />
    </Paper>
  );
};

export default AddressTypeSelector;

import React from "react";
import { Box, Typography, Button, Paper, Grid, Fab } from "@mui/material";
import { Add, Home, School } from "@mui/icons-material";
import AddressCard from "./AddressCard";
import { useTheme } from "../../../hooks/useTheme";

const AddressListSection = ({
  addressType,
  currentAddresses = [],
  defaultAddress,
  showForm = false,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefault,
}) => {
  const { theme } = useTheme();

  const EmptyState = () => (
    <Paper
      sx={{
        p: 6,
        textAlign: "center",
        borderRadius: 3,
        border: `2px dashed ${theme.palette.divider}`,
        backgroundColor: theme.palette.grey[50] + "80",
      }}
      component="section"
      aria-label="No addresses available"
    >
      <Box
        sx={{
          p: 2,
          borderRadius: "50%",
          backgroundColor: theme.palette.primary.main + "15",
          display: "inline-flex",
          mb: 3,
        }}
      >
        {addressType === "campus" ? (
          <School
            sx={{ fontSize: 48, color: theme.palette.primary.main }}
            aria-hidden="true"
          />
        ) : (
          <Home
            sx={{ fontSize: 48, color: theme.palette.primary.main }}
            aria-hidden="true"
          />
        )}
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        No {addressType} addresses yet
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: "400px", mx: "auto" }}
      >
        Get started by adding your first {addressType} address. This will be
        used for deliveries and order fulfillment.
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<Add />}
        onClick={onAddAddress}
        aria-label={`Add your first ${addressType} address`}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: "1rem",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease",
        }}
      >
        Add Your First{" "}
        {addressType === "campus"
          ? "Campus"
          : addressType === "pickup"
            ? "Pickup"
            : "Personal"}{" "}
        Address
      </Button>
    </Paper>
  );

  const AddressList = () => (
    <>
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: { xs: 2, sm: 0 },
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h2"
            id="addresses-title"
            sx={{ fontWeight: 700, mb: 0.5 }}
          >
            {addressType === "campus" ? "Campus" : "Personal"} Addresses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentAddresses.length} address
            {currentAddresses.length !== 1 ? "es" : ""} saved
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={onAddAddress}
          aria-describedby="addresses-title"
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Add New Address
        </Button>
      </Box>

      {/* Address Grid */}
      <Grid
        container
        spacing={3}
        component="section"
        aria-label={`List of ${addressType} addresses`}
        role="list"
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {currentAddresses.map((address) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={address._id}
            role="listitem"
            sx={{
              display: "flex",
              width: "475px",
            }}
          >
            <AddressCard
              address={address}
              isDefault={address._id === defaultAddress?._id}
              onEdit={() => onEditAddress(address)}
              onDelete={() => onDeleteAddress(address)}
              onSetDefault={() => onSetDefault(address._id)}
              type={addressType}
            />
          </Grid>
        ))}
      </Grid>

      {/* Mobile FAB - Only show when form is not open */}
      {!showForm && (
        <Fab
          color="primary"
          aria-label="add address"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "flex", sm: "none" },
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            "&:hover": {
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s ease",
          }}
          onClick={onAddAddress}
        >
          <Add />
        </Fab>
      )}
    </>
  );

  return (
    <Box component="section" aria-labelledby="addresses-title">
      {currentAddresses.length === 0 ? <EmptyState /> : <AddressList />}
    </Box>
  );
};

export default AddressListSection;

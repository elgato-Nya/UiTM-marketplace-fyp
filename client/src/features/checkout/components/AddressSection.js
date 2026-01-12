import { useState, useEffect, Fragment } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Radio,
  Divider,
  Alert,
  Chip,
  useMediaQuery,
  Paper,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";

import { useTheme } from "../../../hooks/useTheme";
import {
  fetchAddresses,
  selectAddresses,
  selectAddressesByType,
  selectDefaultAddress,
} from "../../profile/store/addressSlice";
import AddressFormModal from "../../profile/components/AddressFormModal";
import { createAddress } from "../../profile/store/addressSlice";
import DynamicSkeleton from "../../../components/ui/Skeleton/DynamicSkeleton";
import TabsComponent from "../../../components/common/Tabs/TabsComponent";
import { getAddressTabsConfig } from "../../../config/forms/addressFormConfig";
import { getCampusLabel, getStateLabel } from "../../../utils/formatUtils";

const AddressSection = ({
  selectedAddressId,
  onAddressSelect,
  onAddressTypeChange,
  error,
}) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();

  const addressesState = useSelector(selectAddresses);
  const { addresses: allAddresses, isLoading: addressesLoading } =
    addressesState;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [localSelectedId, setLocalSelectedId] = useState(selectedAddressId);
  const [addressType, setAddressType] = useState("campus");

  // Get addresses by type using selector
  const campusAddresses = useSelector(selectAddressesByType("campus"));
  const personalAddresses = useSelector(selectAddressesByType("personal"));
  const pickupAddresses = useSelector(selectAddressesByType("pickup"));

  const currentAddresses =
    addressType === "campus"
      ? campusAddresses
      : addressType === "personal"
        ? personalAddresses
        : pickupAddresses;

  // Get default address for current type
  const defaultAddress = useSelector((state) =>
    selectDefaultAddress(addressType)(state)
  );

  // Fetch addresses on mount for all types
  useEffect(() => {
    // Fetch all types on mount
    dispatch(fetchAddresses("campus"));
    dispatch(fetchAddresses("personal"));
    dispatch(fetchAddresses("pickup"));
  }, [dispatch]);

  // Set default address as selected if no selection
  useEffect(() => {
    if (!localSelectedId && defaultAddress) {
      setLocalSelectedId(defaultAddress._id);
      onAddressSelect?.(defaultAddress._id);
    }
  }, [defaultAddress, localSelectedId, onAddressSelect]);

  // Notify parent of initial address type
  useEffect(() => {
    onAddressTypeChange?.(addressType);
  }, [addressType, onAddressTypeChange]);

  const selectedAddress =
    allAddresses.find((addr) => addr._id === localSelectedId) || defaultAddress;

  const handleAddressTypeChange = (newType) => {
    setAddressType(newType);
    // Don't clear selection, but if current selection is not in the new type, clear it
    if (localSelectedId) {
      const isInNewType = allAddresses.find(
        (addr) => addr._id === localSelectedId && addr.type === newType
      );
      if (!isInNewType) {
        // Find default in new type
        const newDefault = allAddresses.find(
          (addr) => addr.type === newType && addr.isDefault
        );
        if (newDefault) {
          setLocalSelectedId(newDefault._id);
          onAddressSelect?.(newDefault._id);
        } else {
          setLocalSelectedId(null);
          onAddressSelect?.(null);
        }
      }
    }
  };

  const handleAddressSelect = (addressId) => {
    setLocalSelectedId(addressId);
    onAddressSelect?.(addressId);
    setDrawerOpen(false);
  };

  const handleAddressCreated = () => {
    setShowAddressForm(false);
    setDrawerOpen(true);
    // Refresh addresses for the current type
    dispatch(fetchAddresses(addressType));
  };

  const handleAddressSubmit = async (addressData) => {
    try {
      await dispatch(createAddress(addressData)).unwrap();
      handleAddressCreated();
    } catch (error) {
      console.error("Failed to create address:", error);
    }
  };

  const addressCounts = {
    campus: campusAddresses.length,
    personal: personalAddresses.length,
    pickup: pickupAddresses.length,
  };

  /**
   * Format address into readable string
   * Backend provides 'formattedAddress' virtual field, but falls back to client-side formatting
   * if not available (for older data or when virtuals aren't populated)
   */
  const formatAddress = (address) => {
    if (!address) return "";

    // Use backend virtual field if available
    if (address.formattedAddress) {
      return address.formattedAddress;
    }

    // Fallback: Handle different address types
    if (address.type === "campus" && address.campusAddress) {
      const { building, floor, room, campus } = address.campusAddress;
      // Convert campus key to display label
      return `${floor}${room}, ${building}, ${getCampusLabel(campus)}`;
    }

    if (address.type === "personal" && address.personalAddress) {
      const { addressLine1, addressLine2, city, state, postcode } =
        address.personalAddress;
      // Convert state key to display label
      return `${addressLine1}${addressLine2 ? `, ${addressLine2}` : ""}, ${postcode}, ${city}, ${getStateLabel(state)}`;
    }

    // Legacy fallback (if old data structure exists)
    if (address.street) {
      return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
    }

    return "Address format not recognized";
  };

  return (
    <Box component="section" aria-labelledby="address-section-heading">
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              id="address-section-heading"
              variant="h6"
              component="h2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <LocationIcon color="primary" aria-hidden="true" />
              Delivery Address
            </Typography>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setDrawerOpen(true)}
              aria-label="Change delivery address"
            >
              Change
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {addressesLoading && !selectedAddress ? (
            <DynamicSkeleton
              type="component"
              config={{
                variant: "card-content",
                lines: 4,
                showAvatar: false,
                animated: true,
              }}
            />
          ) : selectedAddress ? (
            <Box>
              {selectedAddress.label && (
                <Chip
                  label={selectedAddress.label}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {selectedAddress.recipientName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {selectedAddress.recipientPhone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatAddress(selectedAddress)}
              </Typography>
              {selectedAddress.isDefault && (
                <Chip
                  label="Default"
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No address selected. Please add a delivery address.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/** Address Selection Drawer */}
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: isMobile ? "100%" : 400,
              maxWidth: "100%",
              height: isMobile ? "80vh" : "100%",
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" component="h2">
            Select Delivery Address
          </Typography>
          <Button
            size="small"
            onClick={() => setDrawerOpen(false)}
            startIcon={<CloseIcon />}
            aria-label="Close address selection"
          >
            Close
          </Button>
        </Box>

        <Divider />

        {/* Address Type Toggle */}
        <Paper
          sx={{
            mx: 2,
            mt: 2,
            mb: 2,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <TabsComponent
            tabs={getAddressTabsConfig(addressCounts)}
            value={addressType}
            onChange={handleAddressTypeChange}
            variant="fullWidth"
            aria-label="Choose address type"
          />
        </Paper>

        {addressesLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <DynamicSkeleton
              type="component"
              config={{
                variant: "list",
                items: 3,
                showAvatar: false,
                animated: true,
              }}
            />
          </Box>
        ) : (
          <>
            <List sx={{ flexGrow: 1, overflow: "auto" }}>
              {currentAddresses.length > 0 ? (
                currentAddresses.map((address) => (
                  <Fragment key={address._id}>
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Radio
                          checked={localSelectedId === address._id}
                          onChange={() => handleAddressSelect(address._id)}
                          value={address._id}
                          name="address-selection"
                          slotProps={{
                            input: {
                              "aria-label": `Select ${address.recipientName}'s address`,
                            },
                          }}
                        />
                      }
                    >
                      <ListItemButton
                        onClick={() => handleAddressSelect(address._id)}
                        selected={localSelectedId === address._id}
                        sx={{ pr: 6 }}
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              <Typography variant="subtitle2">
                                {address.recipientName}
                              </Typography>
                              {address.label && (
                                <Chip
                                  label={address.label}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {address.isDefault && (
                                <Chip
                                  label="Default"
                                  size="small"
                                  color="primary"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box component="span" sx={{ display: "block" }}>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                {address.recipientPhone}
                              </Typography>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                {formatAddress(address)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider component="li" />
                  </Fragment>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No {addressType} addresses found. Add one to continue.
                  </Typography>
                </Box>
              )}
            </List>

            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setDrawerOpen(false);
                  setShowAddressForm(true);
                }}
              >
                Add New{" "}
                {addressType === "campus"
                  ? "Campus"
                  : addressType === "pickup"
                    ? "Pickup"
                    : "Personal"}{" "}
                Address
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      {/** Address Form Modal */}
      <AddressFormModal
        showForm={showAddressForm}
        addressType={addressType}
        editingAddress={null}
        isLoading={addressesLoading}
        onSubmit={handleAddressSubmit}
        onCancel={() => setShowAddressForm(false)}
      />
    </Box>
  );
};

export default AddressSection;

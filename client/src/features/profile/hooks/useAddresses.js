import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";

import {
  fetchAddresses,
  createAddress as createAddressAction,
  updateAddress as updateAddressAction,
  deleteAddress as deleteAddressAction,
  setDefaultAddress as setDefaultAddressAction,
  clearMessages,
} from "../store/addressSlice";

export function useAddresses() {
  const dispatch = useDispatch();

  // Selectors
  const addresses = useSelector((state) => state.addresses?.addresses || []);
  const isLoading = useSelector((state) => state.addresses?.isLoading || false);
  const error = useSelector((state) => state.addresses?.error || null);
  const success = useSelector((state) => state.addresses?.success || null);

  // Actions
  const loadAddresses = useCallback(
    (type) => {
      dispatch(fetchAddresses(type));
    },
    [dispatch]
  );

  const createAddress = useCallback(
    (addressData) => {
      return dispatch(createAddressAction(addressData));
    },
    [dispatch]
  );

  const updateAddress = useCallback(
    (addressId, addressData) => {
      return dispatch(updateAddressAction({ addressId, addressData }));
    },
    [dispatch]
  );

  const deleteAddress = useCallback(
    (addressId) => {
      return dispatch(deleteAddressAction(addressId));
    },
    [dispatch]
  );

  const setDefaultAddress = useCallback(
    (addressId, type) => {
      return dispatch(setDefaultAddressAction({ addressId, type }));
    },
    [dispatch]
  );

  const clearAddressMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    addresses,
    isLoading,
    error,
    success,
    loadAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    clearMessages: clearAddressMessages,
  };
}

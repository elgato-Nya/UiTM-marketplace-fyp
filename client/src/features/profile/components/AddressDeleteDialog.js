import React from "react";
import ConfirmDialog from "../../../components/common/Dialog/ConfirmDialog";

const AddressDeleteDialog = ({
  deleteConfirm,
  addressType,
  onClose,
  onConfirm,
}) => {
  return (
    <ConfirmDialog
      open={Boolean(deleteConfirm)}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Address"
      content={`Are you sure you want to delete this ${addressType} address? This action cannot be undone.`}
      confirmText="Delete"
      confirmColor="error"
    />
  );
};

export default AddressDeleteDialog;

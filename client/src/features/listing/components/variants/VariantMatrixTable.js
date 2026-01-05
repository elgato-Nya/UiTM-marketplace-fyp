import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Switch,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  TablePagination,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";
import { VARIANT_BUILDER_LIMITS } from "../../../../constants/variantAttributes";

/**
 * VariantMatrixTable - Editable table for generated variants
 *
 * Features:
 * - Display all generated variants in a table
 * - Inline editing of price, stock, SKU
 * - Toggle availability per variant
 * - Delete individual variants
 * - Responsive design with mobile card view
 * - Pagination with 5, 10, 20 options
 */
const VariantMatrixTable = ({
  variants = [],
  onChange,
  onDelete,
  listingType = "product",
  disabled = false,
}) => {
  const { isDark: isDarkMode, theme } = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isProduct = listingType === "product";

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mobile edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

  // Handle field change for a variant
  const handleFieldChange = useCallback(
    (variantId, field, value) => {
      onChange(variantId, { [field]: value });
    },
    [onChange]
  );

  // Handle numeric field change with validation
  const handleNumericChange = useCallback(
    (variantId, field, value, min = 0, max = Infinity) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        handleFieldChange(variantId, field, "");
        return;
      }
      const clampedValue = Math.min(Math.max(numValue, min), max);
      handleFieldChange(variantId, field, clampedValue);
    },
    [handleFieldChange]
  );

  // Handle availability toggle
  const handleAvailabilityToggle = useCallback(
    (variantId, currentValue) => {
      handleFieldChange(variantId, "isAvailable", !currentValue);
    },
    [handleFieldChange]
  );

  // Render attribute chips
  const renderAttributes = (attributes) => {
    if (!attributes || Object.keys(attributes).length === 0) {
      return <Typography color="text.secondary">-</Typography>;
    }

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {Object.entries(attributes).map(([key, value]) => (
          <Chip
            key={key}
            label={value}
            size="small"
            sx={{
              fontSize: "0.7rem",
              height: 20,
              bgcolor: isDarkMode ? "grey.800" : "grey.100",
            }}
          />
        ))}
      </Box>
    );
  };

  if (variants.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: isDarkMode ? "grey.900" : "grey.50",
          borderRadius: 1,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography color="text.secondary">
          Add variation values above to generate variants
        </Typography>
      </Box>
    );
  }

  // Handle mobile card click
  const handleMobileCardClick = (variant) => {
    setEditingVariant({ ...variant });
    setEditDialogOpen(true);
  };

  // Save mobile edits
  const handleMobileSave = () => {
    if (!editingVariant) return;
    const variantId = editingVariant._id || editingVariant.id;
    onChange(variantId, {
      price: editingVariant.price,
      stock: editingVariant.stock,
      sku: editingVariant.sku,
      isAvailable: editingVariant.isAvailable,
    });
    setEditDialogOpen(false);
    setEditingVariant(null);
  };

  // Paginated variants
  const paginatedVariants = variants.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Mobile Card View */}
      {isMobile ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {paginatedVariants.map((variant, index) => {
            const variantId =
              variant._id ||
              variant.id ||
              `variant-${index}-${variant.name || "unnamed"}`;
            return (
              <Box
                key={variantId}
                onClick={() => handleMobileCardClick(variant)}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  opacity: variant.isAvailable === false ? 0.6 : 1,
                  bgcolor: isDarkMode ? "grey.900" : "grey.50",
                  "&:hover": {
                    bgcolor: isDarkMode ? "grey.800" : "grey.100",
                    borderColor: "primary.main",
                  },
                  transition: "all 0.2s",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {variant.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SKU: {variant.sku || "Auto"}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="primary.main"
                    >
                      RM {Number(variant.price || 0).toFixed(2)}
                    </Typography>
                    {isProduct && (
                      <Typography variant="caption" color="text.secondary">
                        Stock: {variant.stock ?? 0}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      flexWrap: "wrap",
                      flex: 1,
                    }}
                  >
                    {renderAttributes(variant.attributes)}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Chip
                      label={variant.isAvailable !== false ? "On" : "Off"}
                      size="small"
                      color={
                        variant.isAvailable !== false ? "success" : "default"
                      }
                      sx={{ height: 20, fontSize: "0.65rem" }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(variantId);
                      }}
                      disabled={disabled}
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: 400,
            overflow: "auto",
            "& .MuiTableCell-root": {
              py: 1,
              px: 1.5,
            },
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                  Variant
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>
                  Price (RM)
                </TableCell>
                {isProduct && (
                  <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>
                    Stock
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>
                  SKU
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 80 }} align="center">
                  Available
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 50 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVariants.map((variant, index) => {
                const variantId =
                  variant._id ||
                  variant.id ||
                  `variant-${index}-${variant.name || "unnamed"}`;
                return (
                  <TableRow
                    key={variantId}
                    sx={{
                      "&:hover": {
                        bgcolor: isDarkMode ? "grey.900" : "grey.50",
                      },
                      opacity: variant.isAvailable === false ? 0.6 : 1,
                    }}
                  >
                    {/* Variant Name/Attributes */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {variant.name}
                      </Typography>
                      {renderAttributes(variant.attributes)}
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={variant.price ?? ""}
                        onChange={(e) =>
                          handleNumericChange(
                            variantId,
                            "price",
                            e.target.value,
                            VARIANT_BUILDER_LIMITS.MIN_PRICE,
                            VARIANT_BUILDER_LIMITS.MAX_PRICE
                          )
                        }
                        disabled={disabled}
                        inputProps={{
                          min: 0,
                          step: 0.01,
                          style: { textAlign: "right" },
                        }}
                        sx={{ width: 90 }}
                      />
                    </TableCell>

                    {/* Stock (products only) */}
                    {isProduct && (
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={variant.stock ?? ""}
                          onChange={(e) =>
                            handleNumericChange(
                              variantId,
                              "stock",
                              e.target.value,
                              VARIANT_BUILDER_LIMITS.MIN_STOCK,
                              VARIANT_BUILDER_LIMITS.MAX_STOCK
                            )
                          }
                          disabled={disabled}
                          inputProps={{
                            min: 0,
                            step: 1,
                            style: { textAlign: "right" },
                          }}
                          sx={{ width: 70 }}
                        />
                      </TableCell>
                    )}

                    {/* SKU */}
                    <TableCell>
                      <TextField
                        size="small"
                        value={variant.sku || ""}
                        onChange={(e) =>
                          handleFieldChange(variantId, "sku", e.target.value)
                        }
                        disabled={disabled}
                        placeholder="Auto"
                        sx={{ width: 100 }}
                        inputProps={{
                          maxLength: 50,
                        }}
                      />
                    </TableCell>

                    {/* Availability Toggle */}
                    <TableCell align="center">
                      <Tooltip
                        title={
                          variant.isAvailable ? "Available" : "Unavailable"
                        }
                      >
                        <Switch
                          size="small"
                          checked={variant.isAvailable !== false}
                          onChange={() =>
                            handleAvailabilityToggle(
                              variantId,
                              variant.isAvailable
                            )
                          }
                          disabled={disabled}
                        />
                      </Tooltip>
                    </TableCell>

                    {/* Delete */}
                    <TableCell align="center">
                      <Tooltip title="Remove variant">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(variantId)}
                          disabled={disabled}
                          sx={{
                            color: "text.secondary",
                            "&:hover": { color: "error.main" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={variants.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20]}
        labelRowsPerPage={isMobile ? "" : "Per page:"}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          ".MuiTablePagination-selectLabel": {
            display: isMobile ? "none" : "block",
          },
          ".MuiTablePagination-displayedRows": { fontSize: "0.75rem" },
        }}
      />

      {/* Mobile Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: "2px solid",
            borderColor: "primary.main",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: isDarkMode ? "primary.dark" : "primary.main",
            color: "primary.contrastText",
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <EditIcon fontSize="small" />
          Edit Variant
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {editingVariant && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {editingVariant.name}
              </Typography>
              <TextField
                label="Price (RM)"
                type="number"
                value={editingVariant.price ?? ""}
                onChange={(e) =>
                  setEditingVariant({
                    ...editingVariant,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
              {isProduct && (
                <TextField
                  label="Stock"
                  type="number"
                  value={editingVariant.stock ?? ""}
                  onChange={(e) =>
                    setEditingVariant({
                      ...editingVariant,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, step: 1 }}
                />
              )}
              <TextField
                label="SKU"
                value={editingVariant.sku || ""}
                onChange={(e) =>
                  setEditingVariant({ ...editingVariant, sku: e.target.value })
                }
                size="small"
                fullWidth
                placeholder="Auto-generated"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editingVariant.isAvailable !== false}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        isAvailable: e.target.checked,
                      })
                    }
                  />
                }
                label="Available for purchase"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            startIcon={<CloseIcon />}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMobileSave}
            startIcon={<SaveIcon />}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

VariantMatrixTable.propTypes = {
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      name: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      stock: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      sku: PropTypes.string,
      isAvailable: PropTypes.bool,
      attributes: PropTypes.object,
    })
  ),
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  listingType: PropTypes.oneOf(["product", "service"]),
  disabled: PropTypes.bool,
};

export default VariantMatrixTable;

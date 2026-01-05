import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Chip,
  TextField,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Palette as PaletteIcon,
  Straighten as StraightenIcon,
  Texture as TextureIcon,
  Style as StyleIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";
import {
  VARIATION_TYPE_OPTIONS,
  VARIANT_BUILDER_LIMITS,
} from "../../../../constants/variantAttributes";

/**
 * VariationTypeSelector - Dropdown to select variation type (Color, Size, etc.)
 *
 * Features:
 * - Select from predefined variation types
 * - Shows icon for each type
 * - Disables already selected types
 * - Delete button to remove variation type
 * - Custom naming for custom types (e.g., Duration, Package)
 */
const VariationTypeSelector = ({
  index,
  selectedType,
  customLabel = "",
  usedTypes = [],
  onChange,
  onCustomLabelChange,
  onRemove,
  disabled = false,
  showRemove = true,
}) => {
  const { isDark: isDarkMode } = useTheme();
  const [localCustomLabel, setLocalCustomLabel] = useState(customLabel || "");

  // Sync local state with prop
  useEffect(() => {
    setLocalCustomLabel(customLabel || "");
  }, [customLabel]);

  // Check if custom type is selected
  const isCustomType = selectedType === "custom";

  // Get icon component for variation type
  const getTypeIcon = (iconName) => {
    const iconProps = { fontSize: "small", sx: { mr: 1 } };
    switch (iconName) {
      case "palette":
        return <PaletteIcon {...iconProps} />;
      case "straighten":
        return <StraightenIcon {...iconProps} />;
      case "texture":
        return <TextureIcon {...iconProps} />;
      case "style":
        return <StyleIcon {...iconProps} />;
      case "edit":
        return <EditIcon {...iconProps} />;
      default:
        return null;
    }
  };

  // Filter out already used types (except current selection and "custom" which can be reused)
  const availableOptions = useMemo(() => {
    return VARIATION_TYPE_OPTIONS.filter(
      (opt) =>
        opt.value === selectedType ||
        opt.value === "custom" ||
        !usedTypes.includes(opt.value)
    );
  }, [selectedType, usedTypes]);

  const handleChange = (event) => {
    onChange(index, event.target.value);
    // Clear custom label when switching away from custom
    if (event.target.value !== "custom" && onCustomLabelChange) {
      onCustomLabelChange(index, "");
    }
  };

  const handleCustomLabelChange = (event) => {
    const newLabel = event.target.value;
    setLocalCustomLabel(newLabel);
    if (onCustomLabelChange) {
      onCustomLabelChange(index, newLabel);
    }
  };

  const handleRemove = () => {
    onRemove(index);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 1,
        flexWrap: "wrap",
      }}
    >
      <Chip
        label={`Variation ${index + 1}`}
        size="small"
        sx={{
          bgcolor: isDarkMode ? "grey.800" : "grey.100",
          fontWeight: 500,
          minWidth: 90,
        }}
      />

      <FormControl
        size="small"
        sx={{ minWidth: 160, flex: isCustomType ? "0 1 auto" : 1 }}
      >
        <InputLabel id={`variation-type-label-${index}`}>
          Select Type
        </InputLabel>
        <Select
          labelId={`variation-type-label-${index}`}
          id={`variation-type-${index}`}
          value={selectedType || ""}
          onChange={handleChange}
          label="Select Type"
          disabled={disabled}
          sx={{
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          {availableOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{ display: "flex", alignItems: "center" }}
            >
              {getTypeIcon(option.icon)}
              <Typography variant="body2">{option.label}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Custom type name input */}
      {isCustomType && (
        <TextField
          size="small"
          label="Custom Name"
          placeholder="e.g., Duration, Package"
          value={localCustomLabel}
          onChange={handleCustomLabelChange}
          disabled={disabled}
          sx={{ flex: 1, minWidth: 140 }}
          inputProps={{ maxLength: 20 }}
        />
      )}

      {showRemove && (
        <IconButton
          size="small"
          onClick={handleRemove}
          disabled={disabled}
          sx={{
            color: "error.main",
            "&:hover": {
              bgcolor: isDarkMode ? "error.dark" : "error.light",
              color: "error.contrastText",
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

VariationTypeSelector.propTypes = {
  index: PropTypes.number.isRequired,
  selectedType: PropTypes.string,
  customLabel: PropTypes.string,
  usedTypes: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  onCustomLabelChange: PropTypes.func,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showRemove: PropTypes.bool,
};

export default VariationTypeSelector;

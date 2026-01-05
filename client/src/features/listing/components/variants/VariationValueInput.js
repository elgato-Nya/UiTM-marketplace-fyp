import { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Chip,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../../hooks/useTheme";
import {
  getVariationType,
  getVariationPresets,
  SIZE_PRESET_GROUPS,
  VARIANT_BUILDER_LIMITS,
} from "../../../../constants/variantAttributes";

/**
 * VariationValueInput - Input for adding values to a variation type
 *
 * Features:
 * - Add custom values via text input
 * - Quick-add from presets (color swatches, size buttons)
 * - Chip display of selected values
 * - Remove individual values
 * - Max values enforcement
 */
const VariationValueInput = ({
  variationType,
  values = [],
  onChange,
  disabled = false,
  maxValues = VARIANT_BUILDER_LIMITS.MAX_VALUES_PER_TYPE,
}) => {
  const { isDark: isDarkMode } = useTheme();
  const [inputValue, setInputValue] = useState("");
  const [sizePresetGroup, setSizePresetGroup] = useState("clothing");
  const [presetAnchor, setPresetAnchor] = useState(null);

  // Get variation type config
  const typeConfig = useMemo(
    () => getVariationType(variationType),
    [variationType]
  );

  // Get presets based on type
  const presets = useMemo(() => {
    if (variationType === "size") {
      return getVariationPresets("size", sizePresetGroup);
    }
    return getVariationPresets(variationType);
  }, [variationType, sizePresetGroup]);

  // Check if can add more values
  const canAddMore = values.length < maxValues;

  // Handle adding a value
  const handleAddValue = useCallback(
    (value) => {
      const trimmed = value.trim();
      if (!trimmed || values.includes(trimmed) || !canAddMore) return;

      onChange([...values, trimmed]);
      setInputValue("");
    },
    [values, canAddMore, onChange]
  );

  // Handle input key press (Enter to add)
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddValue(inputValue);
    }
  };

  // Handle removing a value
  const handleRemoveValue = useCallback(
    (valueToRemove) => {
      onChange(values.filter((v) => v !== valueToRemove));
    },
    [values, onChange]
  );

  // Handle preset selection
  const handlePresetClick = (preset) => {
    const value = typeof preset === "object" ? preset.value : preset;
    if (!values.includes(value) && canAddMore) {
      onChange([...values, value]);
    }
  };

  // Handle size preset group change
  const handleSizeGroupChange = (group) => {
    setSizePresetGroup(group);
    setPresetAnchor(null);
  };

  // Get color code for color chips
  const getColorCode = (value) => {
    if (variationType !== "color" || !typeConfig?.presets) return null;
    const preset = typeConfig.presets.find((p) => p.value === value);
    return preset?.colorCode || null;
  };

  // Render color presets as swatches
  const renderColorPresets = () => {
    if (!Array.isArray(typeConfig?.presets)) return null;

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
        {typeConfig.presets.map((preset) => {
          const isSelected = values.includes(preset.value);
          return (
            <Tooltip key={preset.value} title={preset.value}>
              <Box
                onClick={() =>
                  !disabled && !isSelected && handlePresetClick(preset)
                }
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: preset.colorCode,
                  border: "2px solid",
                  borderColor: isSelected
                    ? "primary.main"
                    : isDarkMode
                      ? "grey.700"
                      : "grey.300",
                  cursor: disabled || isSelected ? "default" : "pointer",
                  opacity: isSelected ? 0.5 : 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: disabled || isSelected ? "none" : "scale(1.1)",
                    borderColor:
                      disabled || isSelected ? undefined : "primary.main",
                  },
                  // White needs outline for visibility
                  ...(preset.colorCode === "#FFFFFF" && {
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
                  }),
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    );
  };

  // Render size/text presets as buttons
  const renderButtonPresets = () => {
    if (!Array.isArray(presets) || presets.length === 0) return null;

    return (
      <Box sx={{ mt: 1 }}>
        {variationType === "size" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Preset:
            </Typography>
            <Button
              size="small"
              variant="text"
              endIcon={<ExpandMoreIcon />}
              onClick={(e) => setPresetAnchor(e.currentTarget)}
              sx={{ textTransform: "none", fontSize: "0.75rem" }}
            >
              {SIZE_PRESET_GROUPS.find((g) => g.value === sizePresetGroup)
                ?.label || "Select"}
            </Button>
            <Menu
              anchorEl={presetAnchor}
              open={Boolean(presetAnchor)}
              onClose={() => setPresetAnchor(null)}
            >
              {SIZE_PRESET_GROUPS.map((group) => (
                <MenuItem
                  key={group.value}
                  onClick={() => handleSizeGroupChange(group.value)}
                  selected={group.value === sizePresetGroup}
                >
                  {group.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {presets.map((preset) => {
            const value = typeof preset === "object" ? preset.value : preset;
            const isSelected = values.includes(value);
            return (
              <Chip
                key={value}
                label={value}
                size="small"
                variant={isSelected ? "filled" : "outlined"}
                color={isSelected ? "primary" : "default"}
                onClick={() =>
                  !disabled && !isSelected && handlePresetClick(preset)
                }
                disabled={disabled || isSelected || !canAddMore}
                sx={{
                  cursor: disabled || isSelected ? "default" : "pointer",
                  opacity: isSelected ? 0.6 : 1,
                }}
              />
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Selected values as chips */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
        {values.map((value) => {
          const colorCode = getColorCode(value);
          return (
            <Chip
              key={value}
              label={value}
              size="small"
              onDelete={disabled ? undefined : () => handleRemoveValue(value)}
              deleteIcon={<CloseIcon fontSize="small" />}
              sx={{
                bgcolor: isDarkMode ? "grey.800" : "grey.100",
                "& .MuiChip-deleteIcon": {
                  color: "text.secondary",
                  "&:hover": { color: "error.main" },
                },
              }}
              avatar={
                colorCode ? (
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: colorCode,
                      border: "1px solid",
                      borderColor: isDarkMode ? "grey.600" : "grey.400",
                      ml: 0.5,
                    }}
                  />
                ) : undefined
              }
            />
          );
        })}
        {values.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            No values added yet
          </Typography>
        )}
      </Box>

      {/* Custom value input */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        <TextField
          size="small"
          placeholder={`Add ${typeConfig?.label || "value"}...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || !canAddMore}
          sx={{ flex: 1, maxWidth: 200 }}
          InputProps={{
            endAdornment: inputValue && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => handleAddValue(inputValue)}
                  disabled={disabled || !canAddMore}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Typography
          variant="caption"
          color={canAddMore ? "text.secondary" : "error"}
          sx={{ pt: 1 }}
        >
          {values.length}/{maxValues}
        </Typography>
      </Box>

      {/* Preset values */}
      {typeConfig?.presets && variationType === "color"
        ? renderColorPresets()
        : renderButtonPresets()}

      {/* Limit warning */}
      {!canAddMore && (
        <Typography
          variant="caption"
          color="error"
          sx={{ display: "block", mt: 1 }}
        >
          Maximum {maxValues} values reached
        </Typography>
      )}
    </Box>
  );
};

VariationValueInput.propTypes = {
  variationType: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  maxValues: PropTypes.number,
};

export default VariationValueInput;

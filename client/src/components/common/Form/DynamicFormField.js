import React from "react";
import {
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
  Autocomplete,
  TextField,
  MenuItem,
  FormHelperText,
  FormLabel,
  FormControlLabel,
  InputLabel,
  Select,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  Switch,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Controller } from "react-hook-form";

import { useTheme } from "../../../hooks/useTheme";

function DynamicFormField({
  name,
  control,
  type = "text",
  label,
  placeholder,
  options = [],
  multiSelect = false,
  required = false,
  disabled = false,
  helperText,
  errors,
  showPassword,
  onTogglePassword,
  startAdornment,
  endAdornment,
  rows = 1,
  description,
  ...otherProps
}) {
  const { theme } = useTheme();
  const hasError = !!errors?.[name];
  const errorMessage = errors?.[name]?.message;

  const baseStyles = {
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.primary.main,
    },
  };

  const renderField = () => {
    switch (type) {
      case "password":
        return (
          <Controller
            name={name}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                type={showPassword ? "text" : "password"}
                label={label}
                placeholder={placeholder}
                fullWidth
                required={required}
                disabled={disabled}
                error={hasError}
                helperText={hasError ? errorMessage : helperText}
                slotProps={{
                  input: {
                    startAdornment,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={onTogglePassword}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        {endAdornment}
                      </InputAdornment>
                    ),
                  },
                }}
                {...otherProps}
              />
            )}
          />
        );

      case "select":
        return (
          <Controller
            name={name}
            control={control}
            defaultValue={multiSelect ? [] : ""}
            render={({ field }) => (
              <FormControl fullWidth error={hasError} sx={baseStyles}>
                <InputLabel required={required}>{label}</InputLabel>
                <Select
                  {...field}
                  label={label}
                  disabled={disabled}
                  multiple={multiSelect}
                  renderValue={
                    multiSelect
                      ? (selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((value) => {
                              const option = options.find(
                                (opt) => opt.value === value
                              );
                              return (
                                <Chip
                                  key={value}
                                  label={option?.label || value}
                                  size="small"
                                  sx={{
                                    bgcolor: theme.palette.primary.main + "20",
                                    color: theme.palette.primary.main,
                                  }}
                                />
                              );
                            })}
                          </Box>
                        )
                      : undefined
                  }
                  {...otherProps}
                >
                  {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                      {option.description && (
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
                {(errorMessage || helperText) && (
                  <FormHelperText>{errorMessage || helperText}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case "autocomplete":
        return (
          <Controller
            name={name}
            control={control}
            defaultValue=""
            render={({ field: { onChange, value, ...field } }) => (
              <Autocomplete
                {...field}
                options={options}
                getOptionLabel={(option) => option.label || ""}
                value={options.find((option) => option.value === value) || ""}
                onChange={(_, selectedOption) =>
                  onChange(selectedOption?.value || "")
                }
                disabled={disabled}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    required={required}
                    error={hasError}
                    helperText={errorMessage || helperText}
                    sx={baseStyles}
                    {...otherProps}
                  />
                )}
              />
            )}
          />
        );

      case "radio":
        return (
          <Controller
            name={name}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormControl
                component="fieldset"
                error={hasError}
                disabled={disabled}
              >
                <FormLabel component="legend" required={required}>
                  {label}
                </FormLabel>
                <RadioGroup {...field} row={otherProps.row}>
                  {options.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body2">
                            {option.label}
                          </Typography>
                          {option.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {option.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
                {(errorMessage || helperText) && (
                  <FormHelperText>{errorMessage || helperText}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case "checkbox":
        return (
          <Controller
            name={name}
            control={control}
            defaultValue={false}
            render={({ field: { value, onChange, ...field } }) => (
              <FormControlLabel
                {...field}
                control={
                  <Checkbox
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">{label}</Typography>
                    {description && (
                      <Typography variant="caption" color="text.secondary">
                        {description}
                      </Typography>
                    )}
                  </Box>
                }
              />
            )}
          />
        );

      case "switch":
        return (
          <Controller
            name={name}
            control={control}
            defaultValue={false}
            render={({ field: { value, onChange, ...field } }) => (
              <FormControlLabel
                {...field}
                control={
                  <Switch
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">{label}</Typography>
                    {description && (
                      <Typography variant="caption" color="text.secondary">
                        {description}
                      </Typography>
                    )}
                  </Box>
                }
              />
            )}
          />
        );

      case "textarea":
        return (
          <Controller
            name={name}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label={label}
                placeholder={placeholder}
                fullWidth
                required={required}
                disabled={disabled}
                error={hasError}
                helperText={hasError ? errorMessage : helperText}
                multiline
                rows={rows || 3}
                sx={baseStyles}
                slotProps={{
                  input: { startAdornment, endAdornment },
                }}
                {...otherProps}
              />
            )}
          />
        );

      default:
        return (
          <Controller
            name={name}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                type={type}
                label={label}
                placeholder={placeholder}
                fullWidth
                required={required}
                disabled={disabled}
                error={hasError}
                helperText={hasError ? errorMessage : helperText}
                sx={baseStyles}
                slotProps={{
                  input: { startAdornment, endAdornment },
                }}
                {...otherProps}
              />
            )}
          />
        );
    }
  };

  return <Box mb={2}>{renderField()}</Box>;
}

export default DynamicFormField;

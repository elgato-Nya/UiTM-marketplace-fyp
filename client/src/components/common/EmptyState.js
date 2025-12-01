import { Box, Typography, Button } from "@mui/material";

import { useTheme } from "../../hooks/useTheme";

const EmptyState = ({
  icon = null,
  title = "Nothing is here yet",
  description = "",
  actionLabel = null,
  onAction = null,
  actionVariant = "contained",
  illustration = null,
  sx = {},
}) => {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 8,
        px: 3,
        ...sx,
      }}
    >
      {/** Illustration or Icon */}
      {illustration ? (
        <Box sx={{ mb: 3 }}>{illustration}</Box>
      ) : icon ? (
        <Box
          sx={{
            fontSize: 80,
            color: theme.palette.text.disabled,
            mb: 3,
            opacity: 0.5,
          }}
        >
          {icon}
        </Box>
      ) : null}

      {/** Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: theme.palette.text.primary,
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {/** Description */}
      {description && (
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            maxWidth: 500,
            mb: 3,
          }}
        >
          {description}
        </Typography>
      )}

      {/** Action Button */}
      {actionLabel && onAction && (
        <Button
          variant={actionVariant}
          size="large"
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;

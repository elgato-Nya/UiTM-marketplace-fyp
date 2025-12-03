import React from "react";
import { Grid, Box } from "@mui/material";

/**
 * ActionGrid - Reusable grid component for action cards/items
 *
 * FEATURES:
 * - Responsive grid layout
 * - Configurable spacing and breakpoints
 * - Support for any content (cards, buttons, etc.)
 * - Accessibility support
 *
 * USAGE:
 * <ActionGrid
 *   items={quickActionsData}
 *   spacing={2}
 *   breakpoints={{ xs: 12, sm: 6, md: 3 }}
 *   renderItem={(item) => (
 *     <ActionCard key={item.id} {...item} />
 *   )}
 * />
 */
function ActionGrid({
  items = [],
  spacing = 2,
  breakpoints = { xs: 12, sm: 6, md: 4 },
  renderItem,
  sx = {},
  ...props
}) {
  if (!items.length || !renderItem) {
    return null;
  }

  return (
    <Grid container spacing={spacing} sx={sx} {...props}>
      {items.map((item, index) => (
        <Grid key={item.id || item.key || index} size={breakpoints}>
          {renderItem(item, index)}
        </Grid>
      ))}
    </Grid>
  );
}

export default ActionGrid;

import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Category, ShoppingBag, Store } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { BROWSE_NAV, ICON_NAMES } from "../../../../config/navigation.config";

// Icon map
const ICON_MAP = {
  [ICON_NAMES.CATEGORY]: Category,
  [ICON_NAMES.SHOPPING_BAG]: ShoppingBag,
  [ICON_NAMES.STORE]: Store,
};

function BrowseMenu({ anchorEl, open, onClose }) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 180,
          },
        },
      }}
    >
      {BROWSE_NAV.map((item) => {
        const IconComponent = ICON_MAP[item.icon];
        return (
          <MenuItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={onClose}
          >
            <ListItemIcon>
              <IconComponent fontSize="small" />
            </ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        );
      })}
    </Menu>
  );
}

export default BrowseMenu;

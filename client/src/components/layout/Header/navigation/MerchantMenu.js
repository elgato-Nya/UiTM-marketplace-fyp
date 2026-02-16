import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Dashboard,
  Inventory,
  LocalShipping,
  Store,
  RequestQuote,
  AccountBalance,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { MERCHANT_NAV, ICON_NAMES } from "../../../../config/navigation.config";

// Icon map
const ICON_MAP = {
  [ICON_NAMES.DASHBOARD]: Dashboard,
  [ICON_NAMES.LOCAL_SHIPPING]: LocalShipping,
  [ICON_NAMES.REQUEST_QUOTE]: RequestQuote,
  [ICON_NAMES.STORE]: Store,
  [ICON_NAMES.INVENTORY]: Inventory,
  [ICON_NAMES.ACCOUNT_BALANCE]: AccountBalance,
};

function MerchantMenu({ anchorEl, open, onClose }) {
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
            minWidth: 200,
          },
        },
      }}
    >
      {MERCHANT_NAV.map((item) => {
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

export default MerchantMenu;

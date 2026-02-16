import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Dashboard,
  People,
  VerifiedUser,
  ContactMail,
  AccountBalance,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { ADMIN_NAV, ICON_NAMES } from "../../../../config/navigation.config";

// Icon map
const ICON_MAP = {
  [ICON_NAMES.DASHBOARD]: Dashboard,
  [ICON_NAMES.PEOPLE]: People,
  [ICON_NAMES.VERIFIED_USER]: VerifiedUser,
  [ICON_NAMES.CONTACT_MAIL]: ContactMail,
  [ICON_NAMES.ACCOUNT_BALANCE]: AccountBalance,
};

function AdminMenu({ anchorEl, open, onClose }) {
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
      {ADMIN_NAV.map((item) => {
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

export default AdminMenu;

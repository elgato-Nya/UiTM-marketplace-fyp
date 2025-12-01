import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Dashboard,
  Inventory,
  LocalShipping,
  Assessment,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes";

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
      <MenuItem
        component={Link}
        to={ROUTES.MERCHANT.DASHBOARD}
        onClick={onClose}
      >
        <ListItemIcon>
          <Dashboard fontSize="small" />
        </ListItemIcon>
        <ListItemText>Dashboard</ListItemText>
      </MenuItem>
      <MenuItem
        component={Link}
        to={ROUTES.MERCHANT.LISTINGS.MY_LISTINGS}
        onClick={onClose}
      >
        <ListItemIcon>
          <Inventory fontSize="small" />
        </ListItemIcon>
        <ListItemText>My Listings</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to={ROUTES.MERCHANT.ORDERS} onClick={onClose}>
        <ListItemIcon>
          <LocalShipping fontSize="small" />
        </ListItemIcon>
        <ListItemText>Sales Orders</ListItemText>
      </MenuItem>
      <MenuItem
        component={Link}
        to={ROUTES.MERCHANT.ANALYTICS}
        onClick={onClose}
      >
        <ListItemIcon>
          <Assessment fontSize="small" />
        </ListItemIcon>
        <ListItemText>Analytics</ListItemText>
      </MenuItem>
    </Menu>
  );
}

export default MerchantMenu;

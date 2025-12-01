import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Category, ShoppingBag, Store } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes";

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
      <MenuItem component={Link} to={ROUTES.LISTINGS.ALL} onClick={onClose}>
        <ListItemIcon>
          <Category fontSize="small" />
        </ListItemIcon>
        <ListItemText>All Listings</ListItemText>
      </MenuItem>
      <MenuItem
        component={Link}
        to={ROUTES.LISTINGS.PRODUCTS}
        onClick={onClose}
      >
        <ListItemIcon>
          <ShoppingBag fontSize="small" />
        </ListItemIcon>
        <ListItemText>Products</ListItemText>
      </MenuItem>
      <MenuItem
        component={Link}
        to={ROUTES.LISTINGS.SERVICES}
        onClick={onClose}
      >
        <ListItemIcon>
          <Store fontSize="small" />
        </ListItemIcon>
        <ListItemText>Services</ListItemText>
      </MenuItem>
    </Menu>
  );
}

export default BrowseMenu;

import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Dashboard,
  People,
  Assessment,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes";

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
      <MenuItem component={Link} to={ROUTES.ADMIN.DASHBOARD} onClick={onClose}>
        <ListItemIcon>
          <Dashboard fontSize="small" />
        </ListItemIcon>
        <ListItemText>Dashboard</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to={ROUTES.ADMIN.USERS} onClick={onClose}>
        <ListItemIcon>
          <People fontSize="small" />
        </ListItemIcon>
        <ListItemText>Users</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to={ROUTES.ADMIN.CONTACTS} onClick={onClose}>
        <ListItemIcon>
          <Assessment fontSize="small" />
        </ListItemIcon>
        <ListItemText>Contacts</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to={ROUTES.ADMIN.MERCHANT} onClick={onClose}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Merchant Verification</ListItemText>
      </MenuItem>
    </Menu>
  );
}

export default AdminMenu;

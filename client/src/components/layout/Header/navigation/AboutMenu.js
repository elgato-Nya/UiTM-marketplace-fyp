import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Info, History, ContactMail } from "@mui/icons-material";
import { Link } from "react-router-dom";

function AboutMenu({ anchorEl, open, onClose }) {
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
      <MenuItem component={Link} to="/about" onClick={onClose}>
        <ListItemIcon>
          <Info fontSize="small" />
        </ListItemIcon>
        <ListItemText>About Us</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to="/about/history" onClick={onClose}>
        <ListItemIcon>
          <History fontSize="small" />
        </ListItemIcon>
        <ListItemText>Our History</ListItemText>
      </MenuItem>
      <MenuItem component={Link} to="/contact" onClick={onClose}>
        <ListItemIcon>
          <ContactMail fontSize="small" />
        </ListItemIcon>
        <ListItemText>Contact Us</ListItemText>
      </MenuItem>
    </Menu>
  );
}

export default AboutMenu;

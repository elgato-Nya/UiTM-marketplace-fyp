import React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Collapse,
  alpha,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Link } from "react-router-dom";

function DrawerSection({
  title,
  items,
  onItemClick,
  theme,
  color,
  collapsible = false,
  defaultExpanded = true,
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const handleToggle = () => {
    if (collapsible) {
      setExpanded(!expanded);
    }
  };

  const filteredItems = items.filter((item) => item.show !== false);

  if (filteredItems.length === 0) return null;

  return (
    <>
      <Divider sx={{ my: 1 }} />
      <Box
        sx={{
          px: 2,
          pt: 1,
          pb: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: collapsible ? "pointer" : "default",
        }}
        onClick={handleToggle}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: color || theme.palette.text.secondary,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Typography>
        {collapsible &&
          (expanded ? (
            <ExpandLess fontSize="small" />
          ) : (
            <ExpandMore fontSize="small" />
          ))}
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {filteredItems.map((item, index) => (
          <ListItem key={`${title}-${index}`} disablePadding>
            <ListItemButton
              component={Link}
              to={item.link}
              onClick={onItemClick}
              sx={{
                "&:hover": {
                  backgroundColor: alpha(
                    color || theme.palette.primary.main,
                    0.1
                  ),
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.secondary }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </Collapse>
    </>
  );
}

export default DrawerSection;

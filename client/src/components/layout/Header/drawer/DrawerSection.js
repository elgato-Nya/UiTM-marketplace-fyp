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
  const [expanded, setExpanded] = React.useState(
    collapsible ? defaultExpanded : true
  );

  const handleToggle = () => {
    if (collapsible) {
      setExpanded(!expanded);
    }
  };

  const filteredItems = items.filter((item) => item.show !== false);

  if (filteredItems.length === 0) return null;

  return (
    <>
      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: collapsible ? "pointer" : "default",
          "&:hover": collapsible
            ? {
                backgroundColor: alpha(theme.palette.action.hover, 0.5),
              }
            : {},
          borderRadius: collapsible ? 1 : 0,
          mx: collapsible ? 1 : 0,
        }}
        onClick={handleToggle}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: color || theme.palette.text.secondary,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontSize: "0.75rem",
          }}
        >
          {title}
        </Typography>
        {collapsible &&
          (expanded ? (
            <ExpandLess
              fontSize="small"
              sx={{ color: color || theme.palette.text.secondary }}
            />
          ) : (
            <ExpandMore
              fontSize="small"
              sx={{ color: color || theme.palette.text.secondary }}
            />
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
                py: 1.5,
                "&:hover": {
                  backgroundColor: alpha(
                    color || theme.palette.primary.main,
                    0.08
                  ),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: color || theme.palette.primary.main,
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                slotProps={{
                  primary: {
                    fontWeight: 500,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </Collapse>
    </>
  );
}

export default DrawerSection;

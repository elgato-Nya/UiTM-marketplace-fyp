import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
} from "@mui/material";
import { History } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";

function RecentlyViewed() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    // Get recently viewed items from localStorage
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setRecentItems(viewed.slice(0, 4)); // Show last 4 items
  }, []);

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 6, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <History sx={{ color: theme.palette.info.main, fontSize: 32 }} />
        <Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", mb: 0.5 }}
          >
            Recently Viewed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Continue where you left off
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {recentItems.map((item) => (
          <Grid item size={{ xs: 6, sm: 3 }} key={item.id}>
            <Card
              onClick={() => navigate(`/listings/${item.id}`)}
              sx={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[6],
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={item.image || "https://via.placeholder.com/300"}
                alt={item.name}
              />
              <CardContent sx={{ p: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "medium",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.success.main,
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                  }}
                >
                  RM {item.price?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default RecentlyViewed;

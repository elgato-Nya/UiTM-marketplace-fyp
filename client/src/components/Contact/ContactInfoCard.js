import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Paper,
} from "@mui/material";
import { Email, Phone, LocationOn, Info } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

/**
 * Contact Information Card Component
 * Displays platform contact details and response time information
 */
function ContactInfoCard() {
  const { theme } = useTheme();

  return (
    <Stack spacing={3}>
      {/* Contact Information Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Get In Touch
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Email sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body2">
                  support@uitm-marketplace.edu.my
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Phone sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body2">+60 3-1234 5678</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOn
                sx={{ color: theme.palette.primary.main, fontSize: 20 }}
              />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body2">
                  UiTM Shah Alam, Selangor
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Response Times */}
      <Paper sx={{ p: 2, bgcolor: "info.lighter" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Info sx={{ color: "info.main", fontSize: 20 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Response Time
            </Typography>
            <Typography variant="caption" color="text.secondary">
              We typically respond within 24-48 hours. Critical bugs are
              prioritized and addressed immediately.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Stack>
  );
}

export default ContactInfoCard;

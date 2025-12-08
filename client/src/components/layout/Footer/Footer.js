// todo: evaluate this file
import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Divider,
  IconButton,
  Stack,
  alpha,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";

function Footer() {
  const { theme } = useTheme();

  const footerLinks = {
    marketplace: [
      { text: "Browse Products", href: "/browse?type=product" },
      { text: "Browse Services", href: "/browse?type=service" },
      { text: "Become a Merchant", href: "/merchant/become" },
      { text: "How It Works", href: "/how-it-works" },
    ],
    support: [
      { text: "Help Center", href: "/help" },
      { text: "Contact Us", href: "/contact" },
      { text: "FAQs", href: "/faq" },
      { text: "Shipping Info", href: "/shipping" },
    ],
    legal: [
      { text: "Terms of Service", href: "/terms" },
      { text: "Privacy Policy", href: "/privacy" },
      { text: "Cookie Policy", href: "/cookies" },
      { text: "Community Guidelines", href: "/guidelines" },
    ],
  };

  const socialLinks = [
    {
      icon: <Facebook />,
      href: "https://facebook.com/uitm",
      label: "Facebook",
    },
    { icon: <Twitter />, href: "https://twitter.com/uitm", label: "Twitter" },
    {
      icon: <Instagram />,
      href: "https://instagram.com/uitm",
      label: "Instagram",
    },
    {
      icon: <LinkedIn />,
      href: "https://linkedin.com/school/uitm",
      label: "LinkedIn",
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: "auto",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h5"
              color="primary"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              🎓 UiTM Marketplace
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your trusted platform connecting UiTM students and merchants.
              Discover amazing products and services from your campus community.
            </Typography>

            {/* Contact Info */}
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  support@uitm-marketplace.edu.my
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  +60 3-5544 2000
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Shah Alam, Selangor, Malaysia
                </Typography>
              </Box>
            </Stack>

            {/* Social Links */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                Follow Us
              </Typography>
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    size="small"
                    sx={{
                      color: theme.palette.text.secondary,
                      "&:hover": {
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Marketplace Links */}
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Marketplace
            </Typography>
            <Stack spacing={1}>
              {footerLinks.marketplace.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  color="text.secondary"
                  underline="hover"
                  sx={{
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Support Links */}
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Stack spacing={1}>
              {footerLinks.support.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  color="text.secondary"
                  underline="hover"
                  sx={{
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Legal Links */}
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Stack spacing={1}>
              {footerLinks.legal.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  color="text.secondary"
                  underline="hover"
                  sx={{
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Newsletter Signup */}
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Stay Updated
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Get the latest updates on new products and services.
            </Typography>
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <input
                type="email"
                placeholder="Your email"
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "4px",
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  fontSize: "14px",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "8px 12px",
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Subscribe
              </button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} UiTM Marketplace. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;

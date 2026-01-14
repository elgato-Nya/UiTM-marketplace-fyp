/**
 * Footer Component
 *
 * Main footer for the MarKet platform.
 * Note: This is an independent student project, not affiliated with UiTM.
 */
import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link as MuiLink,
  Divider,
  IconButton,
  Stack,
  alpha,
  Chip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { LinkedIn, GitHub, Code } from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { Logo } from "../../common/Logo";
import { ROUTES } from "../../../constants/routes";

function Footer() {
  const { theme } = useTheme();

  const footerLinks = {
    marketplace: [
      { text: "Browse Products", href: `${ROUTES.BROWSE}?type=product` },
      { text: "Browse Services", href: `${ROUTES.BROWSE}?type=service` },
      { text: "Become a Merchant", href: ROUTES.MERCHANT.BECOME },
    ],
    support: [
      { text: "Contact Us", href: ROUTES.CONTACT },
      { text: "About MarKet", href: ROUTES.ABOUT.INDEX },
      { text: "About Developer", href: ROUTES.ABOUT.NEKODEZ },
    ],
    legal: [
      { text: "Terms of Service", href: ROUTES.TERMS },
      { text: "Privacy Policy", href: ROUTES.PRIVACY },
      { text: "Cookie Policy", href: "/cookies" },
    ],
  };

  // Developer social links
  const developerLinks = [
    {
      icon: <LinkedIn />,
      href: "https://www.linkedin.com/in/afiq-sharifuzan/",
      label: "LinkedIn",
    },
    {
      icon: <GitHub />,
      href: "https://github.com/elgato-Nya",
      label: "GitHub",
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: "auto",
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 0 },
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Logo variant="horizontal" type="platform" height={32} />
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              An independent e-commerce platform built for the UiTM community.
              This is a student-led project developed as a Final Year Project
              (FYP).
            </Typography>

            {/* Independent Project Notice */}
            <Chip
              label="Independent Student Project"
              size="small"
              variant="outlined"
              icon={<Code sx={{ fontSize: 14 }} />}
              sx={{
                mb: 2,
                fontSize: "0.7rem",
                color: "text.secondary",
                borderColor: "divider",
              }}
            />

            {/* Developer Info */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                Developer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Afiq Sharifuzan
              </Typography>
              <Stack direction="row" spacing={1}>
                {developerLinks.map((link, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    size="small"
                    sx={{
                      color: theme.palette.text.secondary,
                      "&:hover": {
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    {link.icon}
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
                <MuiLink
                  key={index}
                  component={RouterLink}
                  to={link.href}
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
                </MuiLink>
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
                <MuiLink
                  key={index}
                  component={RouterLink}
                  to={link.href}
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
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Legal Links - Opens in new tab */}
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Stack spacing={1}>
              {footerLinks.legal.map((link, index) => (
                <MuiLink
                  key={index}
                  component={RouterLink}
                  to={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="text.secondary"
                  underline="hover"
                  aria-label={`${link.text} (opens in new tab)`}
                  sx={{
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {link.text}
                </MuiLink>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} MarKet by Afiq Sharifuzan. All rights
            reserved.
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              opacity: 0.7,
            }}
          >
            This is an independent Final Year Project (FYP). MarKet is not
            officially affiliated with, endorsed by, or sponsored by Universiti
            Teknologi MARA (UiTM). All trademarks belong to their respective
            owners.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;

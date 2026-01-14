/**
 * Cookie Policy Page
 *
 * Cookie usage disclosure for MarKet platform.
 */
import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { Cookie } from "@mui/icons-material";
import LegalPageLayout, {
  Section,
  SubSection,
  LegalList,
  LegalListItem,
} from "./components/LegalPageLayout";

const cookieData = [
  {
    name: "refreshToken",
    purpose: "Authentication - keeps you logged in",
    duration: "7 days",
    type: "Essential",
  },
  {
    name: "theme",
    purpose: "Stores your light/dark mode preference",
    duration: "1 year",
    type: "Functional",
  },
  {
    name: "__stripe_mid",
    purpose: "Stripe payment fraud prevention",
    duration: "1 year",
    type: "Essential (Third-party)",
  },
  {
    name: "__stripe_sid",
    purpose: "Stripe payment session",
    duration: "30 minutes",
    type: "Essential (Third-party)",
  },
];

const CookiePolicyPage = () => {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      lastUpdated="January 14, 2026"
      effectiveDate="January 14, 2026"
      icon={Cookie}
    >
      <Section title="1. What Are Cookies?" id="section-what">
        <Typography>
          Cookies are small text files that are stored on your device (computer,
          tablet, or mobile) when you visit a website. They help the website
          remember your preferences and improve your browsing experience.
        </Typography>
        <Typography>
          We also use similar technologies like local storage to store
          preferences on your device.
        </Typography>
      </Section>

      <Section title="2. How We Use Cookies" id="section-how">
        <Typography>MarKet uses cookies to:</Typography>
        <LegalList ariaLabel="Cookie usage purposes">
          <LegalListItem primary="Keep you signed in to your account" />
          <LegalListItem primary="Remember your preferences (like dark mode)" />
          <LegalListItem primary="Process payments securely through Stripe" />
          <LegalListItem primary="Protect against fraud and unauthorized access" />
        </LegalList>
      </Section>

      <Section title="3. Types of Cookies We Use" id="section-types">
        <SubSection title="Essential Cookies" id="subsection-essential" />
        <Typography>
          These cookies are necessary for the platform to function properly. You
          cannot opt out of these cookies as they are required for basic
          features like authentication and security.
        </Typography>

        <SubSection title="Functional Cookies" id="subsection-functional" />
        <Typography>
          These cookies remember your preferences (such as theme settings) to
          provide a more personalized experience.
        </Typography>

        <SubSection title="Third-Party Cookies" id="subsection-third-party" />
        <Typography>
          We use Stripe for payment processing, which sets its own cookies for
          fraud prevention and secure transactions.
        </Typography>
      </Section>

      <Section title="4. Cookies We Use" id="section-cookies-list">
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ mt: 1.5 }}
          role="region"
          aria-label="Cookie details table"
        >
          <Table size="small" aria-describedby="section-cookies-list-heading">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell component="th" scope="col">
                  <strong>Cookie Name</strong>
                </TableCell>
                <TableCell component="th" scope="col">
                  <strong>Purpose</strong>
                </TableCell>
                <TableCell component="th" scope="col">
                  <strong>Duration</strong>
                </TableCell>
                <TableCell component="th" scope="col">
                  <strong>Type</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cookieData.map((cookie, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    <code>{cookie.name}</code>
                  </TableCell>
                  <TableCell>{cookie.purpose}</TableCell>
                  <TableCell>{cookie.duration}</TableCell>
                  <TableCell>{cookie.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      <Section title="5. Local Storage" id="section-local-storage">
        <Typography>
          In addition to cookies, we use browser local storage to store:
        </Typography>
        <LegalList ariaLabel="Local storage items">
          <LegalListItem
            primary="Authentication tokens"
            secondary="For maintaining your login session"
          />
          <LegalListItem
            primary="Theme preferences"
            secondary="Your light/dark mode selection"
          />
          <LegalListItem
            primary="Cart data"
            secondary="Temporary storage of cart items for non-logged-in users"
          />
        </LegalList>
      </Section>

      <Section title="6. Managing Cookies" id="section-managing">
        <Typography>
          You can manage or delete cookies through your browser settings. Here's
          how to do it in popular browsers:
        </Typography>
        <LegalList ariaLabel="Browser cookie management instructions">
          <LegalListItem
            primary="Chrome"
            secondary="Settings → Privacy and Security → Cookies and other site data"
          />
          <LegalListItem
            primary="Firefox"
            secondary="Settings → Privacy & Security → Cookies and Site Data"
          />
          <LegalListItem
            primary="Safari"
            secondary="Preferences → Privacy → Manage Website Data"
          />
          <LegalListItem
            primary="Edge"
            secondary="Settings → Cookies and site permissions → Manage and delete cookies"
          />
        </LegalList>
        <Typography sx={{ mt: 1.5 }}>
          <strong>Note:</strong> Disabling essential cookies may prevent you
          from using certain features of the platform, such as staying logged in
          or making purchases.
        </Typography>
      </Section>

      <Section title="7. Third-Party Cookies" id="section-third-party-detail">
        <Typography>
          <strong>Stripe:</strong> We use Stripe for secure payment processing.
          Stripe may set cookies on your device to prevent fraud and ensure
          secure transactions. For more information, please see{" "}
          <MuiLink
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Stripe's Privacy Policy (opens in new tab)"
          >
            Stripe's Privacy Policy
          </MuiLink>
          .
        </Typography>
      </Section>

      <Section title="8. Do Not Track" id="section-dnt">
        <Typography>
          Some browsers have a "Do Not Track" feature. Currently, our platform
          does not respond to Do Not Track signals, as there is no industry
          standard for handling these requests.
        </Typography>
      </Section>

      <Section title="9. Updates to This Policy" id="section-updates">
        <Typography>
          We may update this Cookie Policy from time to time to reflect changes
          in technology, legislation, or our practices. We will post any changes
          on this page with an updated "Last Updated" date.
        </Typography>
      </Section>

      <Section title="10. Contact Us" id="section-contact">
        <Typography>
          If you have any questions about our use of cookies, please contact us
          through the Contact Us page on our platform.
        </Typography>
      </Section>
    </LegalPageLayout>
  );
};

export default CookiePolicyPage;

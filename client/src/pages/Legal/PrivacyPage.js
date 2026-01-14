/**
 * Privacy Policy Page
 *
 * PDPA-compliant privacy policy for MarKet platform.
 * References Malaysia's Personal Data Protection Act 2010 (PDPA).
 */
import React from "react";
import { Typography } from "@mui/material";
import { Security } from "@mui/icons-material";
import LegalPageLayout, {
  Section,
  SubSection,
  LegalList,
  LegalListItem,
} from "./components/LegalPageLayout";

const PrivacyPage = () => {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="January 14, 2026"
      effectiveDate="January 14, 2026"
      icon={Security}
    >
      <Section title="1. Introduction" id="section-intro">
        <Typography>
          MarKet (the "platform," "we," "us," or "our") is committed to
          protecting your personal data and respecting your privacy. This
          Privacy Policy explains how we collect, use, disclose, and safeguard
          your information when you use our platform.
        </Typography>
        <Typography>
          This policy is designed in accordance with Malaysia's Personal Data
          Protection Act 2010 (PDPA) and other applicable data protection
          regulations.
        </Typography>
        <Typography>
          MarKet is an independent student project (Final Year Project) and is
          not affiliated with Universiti Teknologi MARA (UiTM).
        </Typography>
      </Section>

      <Section title="2. Information We Collect" id="section-collection">
        <SubSection
          title="2.1 Information You Provide"
          id="subsection-provided"
        />
        <LegalList ariaLabel="Information you provide to us">
          <LegalListItem
            primary="Account Information"
            secondary="Name, email address, phone number, and password when you register"
          />
          <LegalListItem
            primary="Profile Information"
            secondary="Profile picture, username, and bio that you choose to add"
          />
          <LegalListItem
            primary="Address Information"
            secondary="Shipping and billing addresses for order fulfillment"
          />
          <LegalListItem
            primary="Merchant Information"
            secondary="Business details, store name, and verification documents for merchants"
          />
          <LegalListItem
            primary="Communication Data"
            secondary="Messages, inquiries, and feedback you send us"
          />
        </LegalList>

        <SubSection
          title="2.2 Information Collected Automatically"
          id="subsection-automatic"
        />
        <LegalList ariaLabel="Automatically collected information">
          <LegalListItem
            primary="Device Information"
            secondary="Browser type, operating system, and device identifiers"
          />
          <LegalListItem
            primary="Usage Data"
            secondary="Pages visited, time spent, and actions taken on the platform"
          />
          <LegalListItem
            primary="Log Data"
            secondary="IP address, access times, and referring URLs"
          />
        </LegalList>

        <SubSection title="2.3 Payment Information" id="subsection-payment" />
        <Typography>
          Payment processing is handled by Stripe. We do not store your complete
          credit card numbers or bank account details. Stripe's privacy policy
          governs the collection and use of payment information.
        </Typography>
      </Section>

      <Section title="3. How We Use Your Information" id="section-usage">
        <Typography>
          We use your personal data for the following purposes:
        </Typography>
        <LegalList ariaLabel="Data usage purposes">
          <LegalListItem primary="To create and manage your account" />
          <LegalListItem primary="To process transactions and fulfill orders" />
          <LegalListItem primary="To communicate with you about orders, updates, and support" />
          <LegalListItem primary="To verify merchant accounts and prevent fraud" />
          <LegalListItem primary="To improve our platform and user experience" />
          <LegalListItem primary="To comply with legal obligations" />
          <LegalListItem primary="To protect the security of the platform and users" />
        </LegalList>
      </Section>

      <Section
        title="4. Legal Basis for Processing (PDPA Compliance)"
        id="section-legal-basis"
      >
        <Typography>
          Under Malaysia's PDPA, we process your personal data based on:
        </Typography>
        <LegalList ariaLabel="Legal bases for data processing">
          <LegalListItem
            primary="Consent"
            secondary="You have given consent for specific purposes"
          />
          <LegalListItem
            primary="Contractual Necessity"
            secondary="Processing is necessary to fulfill our services to you"
          />
          <LegalListItem
            primary="Legal Compliance"
            secondary="Processing is required by law"
          />
          <LegalListItem
            primary="Legitimate Interests"
            secondary="Processing is necessary for our legitimate business interests"
          />
        </LegalList>
      </Section>

      <Section
        title="5. Information Sharing and Disclosure"
        id="section-sharing"
      >
        <Typography>We may share your information with:</Typography>
        <LegalList ariaLabel="Information sharing recipients">
          <LegalListItem
            primary="Other Users"
            secondary="Buyers can see merchant store information; merchants can see buyer shipping details for orders"
          />
          <LegalListItem
            primary="Service Providers"
            secondary="Third parties that help us operate the platform (e.g., Stripe for payments, cloud hosting)"
          />
          <LegalListItem
            primary="Legal Requirements"
            secondary="When required by law, court order, or government request"
          />
        </LegalList>
        <Typography>
          We do NOT sell your personal data to third parties for marketing
          purposes.
        </Typography>
      </Section>

      <Section title="6. Data Security" id="section-security">
        <Typography>
          We implement appropriate technical and organizational measures to
          protect your personal data, including:
        </Typography>
        <LegalList ariaLabel="Security measures">
          <LegalListItem primary="Encryption of data in transit (HTTPS/TLS)" />
          <LegalListItem primary="Secure password hashing" />
          <LegalListItem primary="Access controls and authentication" />
          <LegalListItem primary="Regular security assessments" />
        </LegalList>
        <Typography>
          However, no method of transmission over the Internet is 100% secure.
          While we strive to protect your data, we cannot guarantee absolute
          security.
        </Typography>
      </Section>

      <Section title="7. Data Retention" id="section-retention">
        <Typography>
          We retain your personal data for as long as necessary to:
        </Typography>
        <LegalList ariaLabel="Data retention reasons">
          <LegalListItem primary="Provide our services to you" />
          <LegalListItem primary="Comply with legal obligations" />
          <LegalListItem primary="Resolve disputes and enforce agreements" />
        </LegalList>
        <Typography>
          When you delete your account, we will delete or anonymize your
          personal data within a reasonable timeframe, except where retention is
          required by law.
        </Typography>
      </Section>

      <Section title="8. Your Rights Under PDPA" id="section-rights">
        <Typography>Under Malaysia's PDPA, you have the right to:</Typography>
        <LegalList ariaLabel="Your data protection rights">
          <LegalListItem
            primary="Access"
            secondary="Request access to your personal data we hold"
          />
          <LegalListItem
            primary="Correction"
            secondary="Request correction of inaccurate or incomplete data"
          />
          <LegalListItem
            primary="Withdrawal of Consent"
            secondary="Withdraw consent for data processing (where consent is the basis)"
          />
          <LegalListItem
            primary="Data Portability"
            secondary="Request your data in a portable format"
          />
        </LegalList>
        <Typography>
          To exercise these rights, please contact us through the Contact Us
          page. We will respond to your request within a reasonable timeframe.
        </Typography>
      </Section>

      <Section title="9. Cookies and Tracking" id="section-cookies">
        <Typography>We use cookies and similar technologies to:</Typography>
        <LegalList ariaLabel="Cookie usage purposes">
          <LegalListItem primary="Keep you logged in to your account" />
          <LegalListItem primary="Remember your preferences" />
          <LegalListItem primary="Analyze platform usage and performance" />
        </LegalList>
        <Typography>For more details, please see our Cookie Policy.</Typography>
      </Section>

      <Section title="10. Third-Party Services" id="section-third-party">
        <Typography>
          Our platform integrates with third-party services:
        </Typography>
        <LegalList ariaLabel="Third-party service integrations">
          <LegalListItem
            primary="Stripe"
            secondary="Payment processing - subject to Stripe's Privacy Policy"
          />
          <LegalListItem
            primary="Google Fonts"
            secondary="Font delivery service"
          />
        </LegalList>
        <Typography>
          These services have their own privacy policies, and we encourage you
          to review them.
        </Typography>
      </Section>

      <Section title="11. Children's Privacy" id="section-children">
        <Typography>
          Our platform is not intended for users under 18 years of age. We do
          not knowingly collect personal data from children. If you believe a
          child has provided us with personal data, please contact us
          immediately.
        </Typography>
      </Section>

      <Section title="12. Changes to This Policy" id="section-changes">
        <Typography>
          We may update this Privacy Policy from time to time. We will notify
          you of significant changes by posting a notice on the platform or
          sending you an email. Your continued use of the platform after changes
          constitutes acceptance of the updated policy.
        </Typography>
      </Section>

      <Section title="13. Contact Us" id="section-contact">
        <Typography>
          If you have questions about this Privacy Policy or wish to exercise
          your data protection rights, please contact us through the Contact Us
          page on our platform.
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          component="p"
          sx={{ mt: 1.5, fontStyle: "italic", fontSize: "0.85rem" }}
        >
          Developer: Afiq Sharifuzan
          <br />
          LinkedIn: linkedin.com/in/afiq-sharifuzan
        </Typography>
      </Section>
    </LegalPageLayout>
  );
};

export default PrivacyPage;

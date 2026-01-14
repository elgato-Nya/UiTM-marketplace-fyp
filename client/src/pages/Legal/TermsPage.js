/**
 * Terms of Service Page
 *
 * Professional terms of service for MarKet e-commerce platform.
 * This is for an independent student project serving the UiTM community.
 * Implements semantic HTML and ARIA for accessibility.
 */
import React from "react";
import { Typography } from "@mui/material";
import { Gavel } from "@mui/icons-material";
import LegalPageLayout, {
  Section,
  SubSection,
  LegalList,
  LegalListItem,
} from "./components/LegalPageLayout";

const TermsPage = () => {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="January 14, 2026"
      effectiveDate="January 14, 2026"
      icon={Gavel}
    >
      <Section title="1. Agreement to Terms" id="section-agreement">
        <Typography>
          Welcome to MarKet (the "Platform"). By accessing or using our platform
          at nekodez.com, you agree to be bound by these Terms of Service. If
          you do not agree to these Terms, please do not use our Platform.
        </Typography>
        <Typography>
          MarKet is an independent e-commerce platform created as a Final Year
          Project. We are not affiliated with, endorsed by, or sponsored by
          Universiti Teknologi MARA (UiTM) or any other institution.
        </Typography>
      </Section>

      <Section title="2. Platform Description" id="section-platform">
        <Typography>
          MarKet provides an online marketplace where users can buy and sell
          products and services within a community setting. Our services
          include:
        </Typography>
        <LegalList ariaLabel="Platform services">
          <LegalListItem primary="User account registration and management" />
          <LegalListItem primary="Product and service listing capabilities for merchants" />
          <LegalListItem primary="Shopping cart and wishlist functionality" />
          <LegalListItem primary="Secure payment processing through Stripe" />
          <LegalListItem primary="Order management and tracking" />
        </LegalList>
      </Section>

      <Section title="3. User Accounts" id="section-accounts">
        <SubSection
          title="3.1 Account Registration"
          id="subsection-registration"
        />
        <Typography>
          To access certain features, you must create an account. You agree to
          provide accurate, current, and complete information during
          registration and to keep your account information updated.
        </Typography>

        <SubSection title="3.2 Account Security" id="subsection-security" />
        <Typography>
          You are responsible for maintaining the confidentiality of your
          account credentials. You agree to notify us immediately of any
          unauthorized access or security breach. We are not liable for any loss
          arising from unauthorized use of your account.
        </Typography>

        <SubSection
          title="3.3 Account Termination"
          id="subsection-termination"
        />
        <Typography>
          We reserve the right to suspend or terminate accounts that violate
          these Terms, engage in fraudulent activity, or for any other reason at
          our sole discretion.
        </Typography>
      </Section>

      <Section title="4. Merchant Terms" id="section-merchant">
        <SubSection
          title="4.1 Merchant Registration"
          id="subsection-merchant-reg"
        />
        <Typography>
          Users may apply to become merchants to sell products or services.
          Merchant status is granted at our discretion and may require
          verification.
        </Typography>

        <SubSection
          title="4.2 Merchant Responsibilities"
          id="subsection-merchant-resp"
        />
        <Typography>Merchants agree to:</Typography>
        <LegalList ariaLabel="Merchant responsibilities">
          <LegalListItem primary="Provide accurate descriptions of products and services" />
          <LegalListItem primary="Honor prices and terms listed in their listings" />
          <LegalListItem primary="Fulfill orders in a timely manner" />
          <LegalListItem primary="Comply with all applicable laws and regulations" />
          <LegalListItem primary="Not sell prohibited, illegal, or counterfeit items" />
        </LegalList>

        <SubSection title="4.3 Commission and Fees" id="subsection-fees" />
        <Typography>
          Merchants may be subject to platform fees or commission on sales. Any
          applicable fees will be clearly communicated before merchant
          activation.
        </Typography>
      </Section>

      <Section title="5. Buyer Terms" id="section-buyer">
        <Typography>As a buyer, you agree to:</Typography>
        <LegalList ariaLabel="Buyer responsibilities">
          <LegalListItem primary="Provide accurate shipping and payment information" />
          <LegalListItem primary="Pay for items purchased in full" />
          <LegalListItem primary="Communicate respectfully with merchants" />
          <LegalListItem primary="Report issues through proper channels" />
        </LegalList>
      </Section>

      <Section title="6. Payments" id="section-payments">
        <Typography>
          All payments are processed securely through Stripe, a third-party
          payment processor. By making a purchase, you agree to Stripe's terms
          of service. We do not store your complete payment card information on
          our servers.
        </Typography>
        <Typography>
          All prices are displayed in Malaysian Ringgit (MYR) unless otherwise
          stated. You are responsible for any applicable taxes or fees.
        </Typography>
      </Section>

      <Section title="7. Prohibited Activities" id="section-prohibited">
        <Typography>You agree not to:</Typography>
        <LegalList ariaLabel="Prohibited activities">
          <LegalListItem primary="Use the platform for any illegal purpose" />
          <LegalListItem primary="Post false, misleading, or fraudulent content" />
          <LegalListItem primary="Infringe on intellectual property rights" />
          <LegalListItem primary="Harass, abuse, or threaten other users" />
          <LegalListItem primary="Attempt to gain unauthorized access to our systems" />
          <LegalListItem primary="Use automated systems to access the platform without permission" />
          <LegalListItem primary="Circumvent security measures or rate limits" />
        </LegalList>
      </Section>

      <Section title="8. Intellectual Property" id="section-ip">
        <Typography>
          The platform and its original content (excluding user-generated
          content) are owned by the developer and are protected by copyright,
          trademark, and other intellectual property laws.
        </Typography>
        <Typography>
          By posting content on the platform, you grant us a non-exclusive,
          worldwide, royalty-free license to use, display, and distribute your
          content in connection with operating the platform.
        </Typography>
      </Section>

      <Section title="9. Disclaimers" id="section-disclaimers">
        <Typography>
          The platform is provided "as is" without warranties of any kind,
          express or implied. We do not guarantee that the platform will be
          uninterrupted, secure, or error-free.
        </Typography>
        <Typography>
          We are not responsible for the quality, safety, or legality of items
          listed, the truth or accuracy of listings, or the ability of sellers
          to sell items or buyers to pay for items.
        </Typography>
        <Typography>
          As an independent student project, this platform is provided for
          educational and demonstration purposes. Users should exercise their
          own judgment when making transactions.
        </Typography>
      </Section>

      <Section title="10. Limitation of Liability" id="section-liability">
        <Typography>
          To the maximum extent permitted by law, we shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or
          any loss of profits or revenues, whether incurred directly or
          indirectly.
        </Typography>
        <Typography>
          Our total liability for any claim arising from your use of the
          platform shall not exceed the amount you paid to us in the twelve (12)
          months preceding the claim.
        </Typography>
      </Section>

      <Section title="11. Dispute Resolution" id="section-disputes">
        <Typography>
          Any disputes arising from these Terms or your use of the platform
          shall be resolved through good-faith negotiation. If negotiation
          fails, disputes shall be subject to the laws of Malaysia.
        </Typography>
      </Section>

      <Section title="12. Changes to Terms" id="section-changes">
        <Typography>
          We reserve the right to modify these Terms at any time. We will notify
          users of significant changes by posting a notice on the platform or
          sending an email. Your continued use of the platform after changes
          constitutes acceptance of the modified Terms.
        </Typography>
      </Section>

      <Section title="13. Contact Information" id="section-contact">
        <Typography>
          For questions about these Terms of Service, please contact us through
          the Contact Us page on our platform.
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

export default TermsPage;

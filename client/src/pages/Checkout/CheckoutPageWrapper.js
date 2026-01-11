import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPage from "./CheckoutPage";

// Validate and initialize Stripe
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Debug: Log the key (first/last 10 chars only for security)
if (stripePublishableKey) {
  console.log(
    "🔑 Stripe Key Loaded:",
    stripePublishableKey.substring(0, 15) +
      "..." +
      stripePublishableKey.substring(stripePublishableKey.length - 10)
  );
} else {
  console.error("❌ REACT_APP_STRIPE_PUBLISHABLE_KEY is not set!");
}

if (!stripePublishableKey || !stripePublishableKey.startsWith("pk_")) {
  console.error(
    "⚠️ Invalid or missing REACT_APP_STRIPE_PUBLISHABLE_KEY in .env file"
  );
}

// Initialize Stripe outside of component to avoid recreating on re-renders
// Export for use in other components that need Stripe context
export const stripePromise =
  stripePublishableKey && stripePublishableKey.startsWith("pk_")
    ? loadStripe(stripePublishableKey)
    : null;

/**
 * CheckoutPageWrapper Component
 *
 * PURPOSE: Wrap CheckoutPage with Stripe Elements provider
 * This is required for Stripe's useStripe() and useElements() hooks to work
 */
const CheckoutPageWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutPage />
    </Elements>
  );
};

export default CheckoutPageWrapper;

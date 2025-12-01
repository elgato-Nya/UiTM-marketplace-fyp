import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPage from "./CheckoutPage";

// Initialize Stripe outside of component to avoid recreating on re-renders
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "your_stripe_publishable_key"
);

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

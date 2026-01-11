import { Elements } from "@stripe/react-stripe-js";
import CheckoutSuccessPage from "./CheckoutSuccessPage";
import { stripePromise } from "./CheckoutPageWrapper";

/**
 * CheckoutSuccessPageWrapper Component
 *
 * PURPOSE: Wrap CheckoutSuccessPage with Stripe Elements provider
 * Required for handling GrabPay redirects that need useStripe() hook
 */
const CheckoutSuccessPageWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutSuccessPage />
    </Elements>
  );
};

export default CheckoutSuccessPageWrapper;

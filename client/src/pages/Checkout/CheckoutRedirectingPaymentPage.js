import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, CircularProgress, Container, Typography } from "@mui/material";
import { ROUTES } from "../../constants/routes";

const CheckoutRedirectingPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const billUrl = location.state?.billUrl;
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!billUrl) return;
    const timeout = setTimeout(() => {
      window.location.assign(billUrl);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [billUrl]);

  if (!billUrl) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h5" gutterBottom>
              Payment Link Not Found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              We could not find an active payment link. You can continue payment from Purchases.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Button variant="contained" onClick={() => navigate(ROUTES.ORDERS.PURCHASES)}>
                Go to Purchases
              </Button>
              {orderId ? (
                <Button variant="outlined" onClick={() => navigate(ROUTES.ORDERS.DETAIL(orderId))}>
                  View Order
                </Button>
              ) : null}
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card>
        <CardContent sx={{ textAlign: "center", py: 5 }}>
          <CircularProgress size={56} sx={{ mb: 2.5 }} />
          <Typography variant="h5" gutterBottom>
            Redirecting to Secure Payment
          </Typography>
          <Typography color="text.secondary">
            Please wait while we connect you to ToyyibPay.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CheckoutRedirectingPaymentPage;

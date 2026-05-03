# Payment MVP Manual Test Cases

## Preconditions
- ToyyibPay callback URL is public and reachable.
- At least one product listing has stock > 1.
- Buyer account and seller account exist.

## Cases
1. Double-click confirm order
- Expected: one checkout confirm result (idempotent replay), no duplicate orders.

2. Refresh after confirm
- Expected: existing pending order remains; no new duplicate order.

3. Browser back after bill creation
- Expected: checkout does not silently create another order; existing order remains pending_payment.

4. Close ToyyibPay page before paying
- Expected: order remains pending_payment; payment return page shows verifying/pending or recovery state.

5. Callback arrives twice
- Expected: second callback treated as duplicate; no duplicate fulfillment/credit.

6. Old obsolete bill succeeds late
- Expected: marked late_success/ignored; order not fulfilled again.

7. Pending payment expires and stock restores
- Wait past `PAYMENT_EXPIRY_MINUTES`.
- Expected: order paymentStatus becomes `expired`, order status `cancelled`, stock restored once.

8. Paid order does not restore stock
- Complete payment successfully, then wait beyond expiry window.
- Expected: no stock restoration, payment remains paid.

9. Retry payment after failed/cancelled payment
- Expected: new bill can be created for allowed states; paid orders blocked.

10. Retry payment after expired+stock-restored payment
- Expected: blocked with message to start checkout again.

11. User cannot access another user payment status
- Call `GET /api/payments/orders/:orderId/status` using another account.
- Expected: not found/forbidden style response, no payment data leak.

12. Return page polling
- Expected: shows "Verifying your payment…" then transitions to paid, pending_payment, failed, cancelled, or expired.

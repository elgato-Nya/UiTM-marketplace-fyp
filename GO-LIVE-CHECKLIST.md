# GO-LIVE-CHECKLIST

## 1. Deployment Checklist
- [ ] Backend deployed successfully (health check passes, app boot logs clean).
- [ ] Frontend deployed successfully (new build served in production).
- [ ] Frontend bundle hash changed from previous release.
- [ ] CDN cache invalidated/cleared for app shell and JS bundles.
- [ ] Browser hard refresh validation done (`Ctrl+F5` / cache-bypass load).
- [ ] Confirm stale routes no longer break flow.
- [ ] Confirm stale frontend bundles no longer call `GET /api/orders/sales`.
- [ ] Confirm route behavior now goes to seller orders correctly (`/orders/sales` -> `/merchant/orders` page; API calls should target seller orders endpoints, not `/api/orders/sales`).

## 2. Frontend Routing Verification
- [ ] `/merchant/orders` loads seller orders page.
- [ ] `/orders/sales` automatically redirects to `/merchant/orders`.
- [ ] `/checkout/success` loads success receipt page correctly.
- [ ] `/checkout/payment-return` loads return page correctly.
- [ ] Old bookmarks/history entries do not break navigation or show invalid order route errors.

## 3. Payment Success Scenario (ToyyibPay)
Steps:
1. Create checkout session.
2. Confirm order.
3. Redirect to ToyyibPay bill page.
4. Complete payment.
5. Return to app.

Expected:
- [ ] Callback received by backend.
- [ ] Payment marked paid.
- [ ] Cart cleared.
- [ ] Order status updated to paid/confirmed path.
- [ ] Redirect to success page.
- [ ] Success receipt shows full order data (items, delivery, subtotal, shipping, total, reference).

Verification:
- [ ] Logs contain `payment.callback.received`.
- [ ] Logs contain `payment.marked_paid`.
- [ ] Callback HTTP response is `200 OK`.

## 4. Payment Cancel / Failure Scenario
Steps:
1. Create checkout.
2. Redirect to ToyyibPay.
3. Cancel/fail payment.

Expected:
- [ ] Return page shows failure/pending-failure UI.
- [ ] Retry payment button is visible.
- [ ] Order remains `pending_payment` or `payment_failed` (as applicable).
- [ ] No stock corruption observed.

## 5. Retry Payment Scenario
Steps:
1. Initiate payment.
2. Cancel/fail payment.
3. Click retry.
4. New bill created.
5. Complete payment.

Expected:
- [ ] Old attempt marked obsolete (or no longer active for finalization).
- [ ] New `billCode` generated.
- [ ] Payment eventually succeeds.
- [ ] Order marked paid once (no double-credit/double-confirm).

Verification:
- [ ] Logs contain `payment.retry.created`.
- [ ] Logs contain `payment.callback.received`.
- [ ] Logs contain `payment.marked_paid`.

## 6. Payment Expiry Scenario
Steps:
1. Create order.
2. Do not pay.
3. Wait for expiry job run.

Expected:
- [ ] `paymentStatus` becomes `expired`.
- [ ] Order status becomes cancelled (according to current business rules).
- [ ] Stock restored.

Verification:
- [ ] Logs contain `payment.expired`.
- [ ] Logs contain `stock.restored`.

## 7. Status Polling / Return Page Verification
- [ ] Return page initially displays: `Verifying your payment...`
- [ ] Return page polls: `GET /api/payments/orders/:orderId/status`

Expected transitions:
- [ ] `pending_payment` -> waiting message shown.
- [ ] `paid` -> redirect to success receipt.
- [ ] `payment_failed` -> retry UI shown.
- [ ] `cancelled` -> retry UI shown.
- [ ] `expired` -> retry UI shown.

## 8. Log Verification
Confirm presence of lifecycle events:
- [ ] `checkout.confirm.started`
- [ ] `checkout.confirm.completed`
- [ ] `checkout.confirm.idempotent_replay`
- [ ] `payment.bill.created`
- [ ] `payment.retry.created`
- [ ] `payment.callback.received`
- [ ] `payment.callback.duplicate`
- [ ] `payment.callback.late_success`
- [ ] `payment.marked_paid`
- [ ] `payment.expired`
- [ ] `stock.restored`

Confirm absence of known bad signals:
- [ ] No `Callback body must be an object`.
- [ ] No new route errors related to `/api/orders/sales`.

## 9. Basic Security Checks
- [ ] User cannot view another user’s order payment status.
- [ ] User cannot retry payment for another user’s order.
- [ ] User cannot cancel already paid orders.
- [ ] Frontend cannot override payment amount.
- [ ] Frontend cannot override `billCode` or order totals.

## 10. Operational Monitoring (Launch Window)
Track closely:
- [ ] Payment success rate.
- [ ] Callback success rate.
- [ ] Retry payment frequency.
- [ ] Payment expiry frequency.
- [ ] Unexpected errors in application/error/security logs.

## 11. Rollback Plan
If payment flow breaks post-deploy:
1. Temporarily disable checkout confirm endpoint.
2. Prevent new payment initiations.
3. Investigate callback logs first.
4. Revert frontend build if routing issues are detected.
5. Redeploy last stable backend version if needed.

## 12. Final Go / No-Go Decision
Before opening to real users:
- [ ] Frontend routes verified.
- [ ] Payment success tested.
- [ ] Payment failure tested.
- [ ] Retry payment tested.
- [ ] Expiry job tested.
- [ ] Logs clean.
- [ ] Callback returning `200`.

If all checks pass: **Go for controlled production launch**.
If any critical check fails: **No-Go, fix and re-verify**.

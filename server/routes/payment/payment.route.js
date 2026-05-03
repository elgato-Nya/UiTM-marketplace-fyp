const express = require("express");
const router = express.Router();
const multer = require("multer");
const callbackFormParser = multer();

const { protect, isOrderParticipant, authorize } = require("../../middleware/auth/auth.middleware");
const {
  standardLimiter,
  paymentCreateBillLimiter,
  paymentRetryLimiter,
  paymentStatusPollLimiter,
  paymentCallbackLimiter,
} = require("../../middleware/limiters.middleware");
const paymentController = require("../../controllers/payment");
const {
  validateOrderIdParam,
  validateRetryOrderPaymentParam,
  validateOrderPaymentStatusParam,
  validateCreateOrderBill,
  validateCreatePlanUpgradeBill,
  validateToyyibPayCallback,
} = require("../../middleware/validations/payment/payment.validation");

router.post(
  "/orders/:id/bill",
  protect,
  paymentCreateBillLimiter,
  validateOrderIdParam,
  isOrderParticipant,
  validateCreateOrderBill,
  paymentController.handleCreateOrderBill,
);

router.post(
  "/orders/:orderId/retry",
  protect,
  paymentRetryLimiter,
  validateRetryOrderPaymentParam,
  (req, _res, next) => {
    req.params.id = req.params.orderId;
    next();
  },
  isOrderParticipant,
  paymentController.handleRetryOrderPayment,
);

router.get(
  "/orders/:orderId/status",
  protect,
  paymentStatusPollLimiter,
  validateOrderPaymentStatusParam,
  paymentController.handleGetOrderPaymentStatus,
);

router.post(
  "/plans/upgrade/bill",
  protect,
  standardLimiter,
  authorize("merchant"),
  validateCreatePlanUpgradeBill,
  paymentController.handleCreatePlanUpgradeBill,
);

router.post(
  "/callback",
  callbackFormParser.none(),
  paymentCallbackLimiter,
  validateToyyibPayCallback,
  paymentController.handleCallback,
);

router.get("/return", paymentController.handleReturn);

module.exports = router;

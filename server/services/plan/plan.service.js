const { SellerPlan } = require("../../models");
const logger = require("../../utils/logger");

const PLAN_RULES = {
  basic: {
    feeRate: parseFloat(process.env.PLATFORM_FEE_BASIC) || 0.1,
    listingLimit: 5,
    freeFeaturedSlotsPerMonth: 0,
  },
  pro: {
    feeRate: parseFloat(process.env.PLATFORM_FEE_PRO) || 0.08,
    listingLimit: 30,
    freeFeaturedSlotsPerMonth: 1,
  },
  store: {
    feeRate: parseFloat(process.env.PLATFORM_FEE_STORE) || 0.06,
    listingLimit: parseInt(process.env.STORE_PLAN_MAX_LISTINGS, 10) || 100,
    freeFeaturedSlotsPerMonth:
      parseInt(process.env.STORE_PLAN_FREE_FEATURED_SLOTS, 10) || 2,
  },
};

const getMonthKey = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getPlanRules = (planType = "basic") =>
  PLAN_RULES[planType] || PLAN_RULES.basic;

const getActiveSellerPlan = async (sellerId) => {
  const now = new Date();
  const activePlan = await SellerPlan.findOne({
    sellerId,
    isActive: true,
    expiresAt: { $gt: now },
  }).sort({ createdAt: -1 });

  if (!activePlan) {
    return {
      planType: "basic",
      isActive: true,
      startedAt: null,
      expiresAt: null,
      rules: getPlanRules("basic"),
      freeFeaturedSlotsUsed: 0,
      freeFeaturedSlotsMonthKey: getMonthKey(now),
      virtual: true,
    };
  }

  return {
    planType: activePlan.planType,
    isActive: activePlan.isActive,
    startedAt: activePlan.startedAt,
    expiresAt: activePlan.expiresAt,
    freeFeaturedSlotsUsed: activePlan.freeFeaturedSlotsUsed || 0,
    freeFeaturedSlotsMonthKey:
      activePlan.freeFeaturedSlotsMonthKey || getMonthKey(now),
    rules: getPlanRules(activePlan.planType),
    planId: activePlan._id,
    virtual: false,
  };
};

const deactivateExpiredPlans = async () => {
  const result = await SellerPlan.updateMany(
    { isActive: true, expiresAt: { $lte: new Date() } },
    { $set: { isActive: false } },
  );
  if (result.modifiedCount > 0) {
    logger.info("Expired seller plans deactivated", {
      count: result.modifiedCount,
    });
  }
  return result.modifiedCount;
};

const activateSellerPlan = async ({
  sellerId,
  planType = "pro",
  durationDays = 30,
}) => {
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + durationDays * 24 * 60 * 60 * 1000,
  );

  const activePlan = await SellerPlan.findOne({
    sellerId,
    isActive: true,
    expiresAt: { $gt: now },
  }).sort({ createdAt: -1 });

  if (activePlan) {
    activePlan.planType = planType;
    activePlan.startedAt = now;
    activePlan.expiresAt = expiresAt;
    activePlan.isActive = true;
    activePlan.freeFeaturedSlotsUsed = 0;
    activePlan.freeFeaturedSlotsMonthKey = getMonthKey(now);
    await activePlan.save();
    return activePlan;
  }

  const createdPlan = await SellerPlan.create({
    sellerId,
    planType,
    startedAt: now,
    expiresAt,
    isActive: true,
    freeFeaturedSlotsUsed: 0,
    freeFeaturedSlotsMonthKey: getMonthKey(now),
  });

  return createdPlan;
};

module.exports = {
  PLAN_RULES,
  getMonthKey,
  getPlanRules,
  getActiveSellerPlan,
  deactivateExpiredPlans,
  activateSellerPlan,
};

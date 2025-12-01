/**
 * Analytics Aggregation Exports
 * Central export point for all analytics aggregation pipelines
 */

const merchantAggregations = require("./merchant.aggregations");
const platformAggregations = require("./platform.aggregations");
const helpers = require("./helpers");

module.exports = {
  // Shared helpers
  ...helpers,

  // Merchant aggregations
  ...merchantAggregations,

  // Platform aggregations
  ...platformAggregations,
};

/**
 * backfill-variation-config.js
 *
 * PURPOSE: Backfill listing.variationConfig for legacy variant listings that
 * still only store variation structure in variants[].attributes.
 *
 * DEFAULT MODE: Dry-run. Use --apply to persist changes.
 *
 * USAGE:
 *   node scripts/backfill-variation-config.js
 *   node scripts/backfill-variation-config.js --apply
 */

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");
const database = require("../config/database.config");
const Listing = require("../models/listing/listing.model");
const { ListingValidator } = require("../validators");
const { VariantLimits } = require("../utils/enums/listing.enum");

const MAX_LAYERS = VariantLimits.MAX_VARIATION_CONFIGS;

const SKIP_REASONS = Object.freeze({
  MISSING_ATTRIBUTES: "skipped_missing_attributes",
  INCONSISTENT_KEYS: "skipped_inconsistent_keys",
  TOO_MANY_KEYS: "skipped_too_many_keys",
  PARTIAL_VARIATION_CONFIG: "skipped_partial_variation_config",
  EMPTY_VARIANTS: "skipped_empty_variants",
  MALFORMED_OPTION_VALUES: "skipped_malformed_option_values",
});

const createSummary = () => ({
  totalCandidates: 0,
  wouldUpdate: 0,
  updated: 0,
  alreadyHasVariationConfig: 0,
  skipped_missing_attributes: 0,
  skipped_inconsistent_keys: 0,
  skipped_too_many_keys: 0,
  skipped_partial_variation_config: 0,
  skipped_empty_variants: 0,
  skipped_malformed_option_values: 0,
  failed_write: 0,
});

const toTitleCase = (value = "") =>
  value
    .toString()
    .trim()
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const normalizeAttributes = (attributes) => {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
    return null;
  }

  const entries = Object.entries(attributes)
    .map(([key, value]) => {
      if (typeof key !== "string") {
        return null;
      }

      const trimmedKey = key.trim();
      const trimmedValue = value?.toString().trim();

      if (!trimmedKey) {
        return null;
      }

      return [trimmedKey, trimmedValue];
    })
    .filter(Boolean);

  if (entries.length === 0) {
    return {};
  }

  return Object.fromEntries(entries);
};

const hasMeaningfulVariationConfig = (variationConfig) =>
  Array.isArray(variationConfig) && variationConfig.length > 0;

function inferVariationConfigFromVariants(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return {
      ok: false,
      reason: SKIP_REASONS.EMPTY_VARIANTS,
    };
  }

  const normalizedVariants = variants.map((variant) => ({
    attributes: normalizeAttributes(variant?.attributes),
  }));

  const firstValidVariant = normalizedVariants.find((variant) => {
    return (
      variant.attributes &&
      Object.keys(variant.attributes).length > 0
    );
  });

  if (!firstValidVariant) {
    return {
      ok: false,
      reason: SKIP_REASONS.MISSING_ATTRIBUTES,
    };
  }

  const attributeKeys = Object.keys(firstValidVariant.attributes);

  if (attributeKeys.length > MAX_LAYERS) {
    return {
      ok: false,
      reason: SKIP_REASONS.TOO_MANY_KEYS,
    };
  }

  const uniqueOptionsByKey = new Map(
    attributeKeys.map((key) => [key, []])
  );
  const seenOptionsByKey = new Map(
    attributeKeys.map((key) => [key, new Set()])
  );

  for (const variant of normalizedVariants) {
    const attributes = variant.attributes;

    if (!attributes || Object.keys(attributes).length === 0) {
      return {
        ok: false,
        reason: SKIP_REASONS.INCONSISTENT_KEYS,
      };
    }

    const variantKeys = Object.keys(attributes);
    const isSameKeyOrder =
      variantKeys.length === attributeKeys.length &&
      variantKeys.every((key, index) => key === attributeKeys[index]);

    if (!isSameKeyOrder) {
      if (variantKeys.length > MAX_LAYERS) {
        return {
          ok: false,
          reason: SKIP_REASONS.TOO_MANY_KEYS,
        };
      }

      return {
        ok: false,
        reason: SKIP_REASONS.INCONSISTENT_KEYS,
      };
    }

    for (const key of attributeKeys) {
      const rawValue = attributes[key];
      const normalizedValue = rawValue?.toString().trim();

      if (!normalizedValue) {
        return {
          ok: false,
          reason: SKIP_REASONS.MALFORMED_OPTION_VALUES,
        };
      }

      const seen = seenOptionsByKey.get(key);
      const values = uniqueOptionsByKey.get(key);

      if (!seen.has(normalizedValue)) {
        seen.add(normalizedValue);
        values.push({ value: normalizedValue });
      }
    }
  }

  const variationConfig = attributeKeys.map((key, index) => ({
    key,
    label: toTitleCase(key),
    position: index,
    options: uniqueOptionsByKey.get(key),
  }));

  if (!ListingValidator.isValidVariationConfig(variationConfig)) {
    return {
      ok: false,
      reason: SKIP_REASONS.PARTIAL_VARIATION_CONFIG,
    };
  }

  return {
    ok: true,
    variationConfig,
  };
}

const isInvalidExistingVariationConfig = (variationConfig) =>
  hasMeaningfulVariationConfig(variationConfig) &&
  !ListingValidator.isValidVariationConfig(variationConfig);

const formatListingLabel = (listing) =>
  `${listing._id}${listing.name ? ` (${listing.name})` : ""}`;

async function backfillVariationConfig({ apply = false } = {}) {
  const summary = createSummary();
  const skippedListings = [];

  const variantListings = await Listing.find({ "variants.0": { $exists: true } })
    .select("_id name variants variationConfig")
    .lean();

  for (const listing of variantListings) {
    if (!Array.isArray(listing.variants) || listing.variants.length === 0) {
      summary.skipped_empty_variants += 1;
      skippedListings.push({
        _id: listing._id.toString(),
        reason: SKIP_REASONS.EMPTY_VARIANTS,
      });
      continue;
    }

    if (isInvalidExistingVariationConfig(listing.variationConfig)) {
      summary.skipped_partial_variation_config += 1;
      skippedListings.push({
        _id: listing._id.toString(),
        reason: SKIP_REASONS.PARTIAL_VARIATION_CONFIG,
      });
      continue;
    }

    if (hasMeaningfulVariationConfig(listing.variationConfig)) {
      summary.alreadyHasVariationConfig += 1;
      continue;
    }

    summary.totalCandidates += 1;

    const inferred = inferVariationConfigFromVariants(listing.variants);

    if (!inferred.ok) {
      summary[inferred.reason] += 1;
      skippedListings.push({
        _id: listing._id.toString(),
        reason: inferred.reason,
      });
      continue;
    }

    if (!apply) {
      summary.wouldUpdate += 1;
      continue;
    }

    try {
      const result = await Listing.updateOne(
        { _id: listing._id },
        { $set: { variationConfig: inferred.variationConfig } }
      );

      if (result.modifiedCount > 0) {
        summary.updated += 1;
      } else {
        summary.failed_write += 1;
        skippedListings.push({
          _id: listing._id.toString(),
          reason: "failed_write",
        });
      }
    } catch (error) {
      summary.failed_write += 1;
      skippedListings.push({
        _id: listing._id.toString(),
        reason: "failed_write",
        error: error.message,
      });
    }
  }

  return {
    apply,
    summary,
    skippedListings,
  };
}

const printSummary = ({ apply, summary, skippedListings }) => {
  console.log(
    `\nVariationConfig backfill ${apply ? "apply" : "dry-run"} summary`
  );
  console.log("=".repeat(48));
  console.log(`total candidates: ${summary.totalCandidates}`);
  console.log(`would update: ${summary.wouldUpdate}`);
  console.log(`updated: ${summary.updated}`);
  console.log(`already has variationConfig: ${summary.alreadyHasVariationConfig}`);
  console.log(
    `skipped_missing_attributes: ${summary.skipped_missing_attributes}`
  );
  console.log(
    `skipped_inconsistent_keys: ${summary.skipped_inconsistent_keys}`
  );
  console.log(`skipped_too_many_keys: ${summary.skipped_too_many_keys}`);
  console.log(
    `skipped_partial_variation_config: ${summary.skipped_partial_variation_config}`
  );
  console.log(`skipped_empty_variants: ${summary.skipped_empty_variants}`);
  console.log(
    `skipped_malformed_option_values: ${summary.skipped_malformed_option_values}`
  );
  console.log(`failed_write: ${summary.failed_write}`);

  if (skippedListings.length > 0) {
    console.log("\nSkipped listing IDs:");
    skippedListings.forEach((item) => {
      console.log(
        `- ${item._id}: ${item.reason}${item.error ? ` (${item.error})` : ""}`
      );
    });
  }
};

async function main() {
  const apply = process.argv.includes("--apply");

  try {
    await database.connect();
    console.log(
      `Connected to MongoDB. Running in ${apply ? "apply" : "dry-run"} mode.`
    );

    const result = await backfillVariationConfig({ apply });
    printSummary(result);
  } catch (error) {
    console.error("VariationConfig backfill failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  SKIP_REASONS,
  backfillVariationConfig,
  inferVariationConfigFromVariants,
  isInvalidExistingVariationConfig,
  toTitleCase,
  formatListingLabel,
};

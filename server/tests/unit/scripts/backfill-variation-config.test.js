const {
  SKIP_REASONS,
  inferVariationConfigFromVariants,
  toTitleCase,
} = require("../../../scripts/backfill-variation-config");

describe("backfill-variation-config inference helper", () => {
  it("builds one-layer variationConfig in first-seen order", () => {
    const result = inferVariationConfigFromVariants([
      {
        attributes: { color: "Red" },
      },
      {
        attributes: { color: "Blue" },
      },
      {
        attributes: { color: "Red" },
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.variationConfig).toEqual([
      {
        key: "color",
        label: "Color",
        position: 0,
        options: [{ value: "Red" }, { value: "Blue" }],
      },
    ]);
  });

  it("builds two-layer variationConfig using first valid attribute key order", () => {
    const result = inferVariationConfigFromVariants([
      {
        attributes: { color: "Red", size: "M" },
      },
      {
        attributes: { color: "Red", size: "S" },
      },
      {
        attributes: { color: "Blue", size: "M" },
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.variationConfig).toEqual([
      {
        key: "color",
        label: "Color",
        position: 0,
        options: [{ value: "Red" }, { value: "Blue" }],
      },
      {
        key: "size",
        label: "Size",
        position: 1,
        options: [{ value: "M" }, { value: "S" }],
      },
    ]);
  });

  it("skips variants when every variant is missing attributes", () => {
    const result = inferVariationConfigFromVariants([
      { attributes: {} },
      { attributes: null },
    ]);

    expect(result).toEqual({
      ok: false,
      reason: SKIP_REASONS.MISSING_ATTRIBUTES,
    });
  });

  it("skips variants with inconsistent attribute key sets", () => {
    const result = inferVariationConfigFromVariants([
      {
        attributes: { color: "Red", size: "M" },
      },
      {
        attributes: { color: "Blue" },
      },
    ]);

    expect(result).toEqual({
      ok: false,
      reason: SKIP_REASONS.INCONSISTENT_KEYS,
    });
  });

  it("skips variants with more than two attribute keys", () => {
    const result = inferVariationConfigFromVariants([
      {
        attributes: { color: "Red", size: "M", material: "Cotton" },
      },
    ]);

    expect(result).toEqual({
      ok: false,
      reason: SKIP_REASONS.TOO_MANY_KEYS,
    });
  });

  it("skips malformed option values", () => {
    const result = inferVariationConfigFromVariants([
      {
        attributes: { color: "Red" },
      },
      {
        attributes: { color: "   " },
      },
    ]);

    expect(result).toEqual({
      ok: false,
      reason: SKIP_REASONS.MALFORMED_OPTION_VALUES,
    });
  });

  it("formats labels with simple title case", () => {
    expect(toTitleCase("color")).toBe("Color");
    expect(toTitleCase("shirt_size")).toBe("Shirt Size");
    expect(toTitleCase("finish-type")).toBe("Finish Type");
  });
});

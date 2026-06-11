const {
  calculateWishlistSummary,
  buildEnhancedWishlistItems,
} = require("../../../services/wishlist/wishlist.helpers");

describe("wishlist.helpers deleted listing guards", () => {
  it("counts missing and deleted listings as unavailable without crashing", () => {
    const summary = calculateWishlistSummary({
      totalItems: 3,
      items: [
        {
          _id: "item-1",
          listing: null,
          priceWhenAdded: 10,
        },
        {
          _id: "item-2",
          listing: {
            price: 12,
            isAvailable: false,
            isDeleted: true,
          },
          priceWhenAdded: 10,
        },
        {
          _id: "item-3",
          listing: {
            price: 10,
            isAvailable: true,
            isDeleted: false,
          },
          priceWhenAdded: 10,
        },
      ],
    });

    expect(summary.unavailableCount).toBe(2);
    expect(summary.priceDropCount).toBe(0);
    expect(summary.priceIncreaseCount).toBe(1);
    expect(summary.priceSameCount).toBe(1);
  });

  it("builds safe fallback wishlist items for missing listings", () => {
    const [item] = buildEnhancedWishlistItems([
      {
        _id: "item-1",
        listing: null,
        priceWhenAdded: 25,
        addedAt: new Date("2026-06-11T00:00:00.000Z"),
      },
    ]);

    expect(item).toMatchObject({
      _id: "item-1",
      listingId: null,
      name: "Listing removed",
      currentPrice: 0,
      priceWhenAdded: 25,
      isAvailable: false,
      isDeleted: true,
      stock: 0,
      images: [],
      category: null,
    });
  });
});

/**
 * Chat participant display utilities
 *
 * Resolves display name, avatar, and initials from populated
 * participant data returned by the server.
 *
 * Server populates: profile.username, profile.avatarUrl, email,
 *                   roles, merchantDetails.shopName, merchantDetails.shopLogo
 */

/**
 * Extract the other participant's display info from a conversation
 *
 * @param {Array} participants - conversation.participants array
 * @param {string} currentUserId - authenticated user's _id
 * @returns {{ name: string, avatar: string|null, initials: string, userId: string|null, isMerchant: boolean, shopName: string|null }}
 */
export const resolveOtherParticipant = (participants, currentUserId) => {
  const fallback = {
    name: "Unknown User",
    avatar: null,
    initials: "?",
    userId: null,
    isMerchant: false,
    shopName: null,
  };

  if (!participants?.length) return fallback;

  const other = participants.find((p) => {
    const pId =
      typeof p.userId === "object" ? p.userId?._id || p.userId?.id : p.userId;
    return String(pId) !== String(currentUserId);
  });

  if (!other) return fallback;

  const userData = other.userId;
  if (!userData || typeof userData !== "object") return fallback;

  const profile = userData.profile || {};
  const merchant = userData.merchantDetails || {};
  const roles = userData.roles || [];
  const isMerchant = roles.includes("merchant");

  // Display name priority: shopName (for merchants) → username → email prefix → "User"
  const shopName = merchant.shopName || null;
  const username = profile.username || null;
  const emailPrefix = userData.email
    ? userData.email.split("@")[0]
    : null;

  const name = (isMerchant && shopName) ? shopName : username || emailPrefix || "User";

  // Avatar priority: shopLogo (for merchants) → profile avatarUrl → null
  const avatar =
    (isMerchant && merchant.shopLogo) ? merchant.shopLogo : profile.avatarUrl || null;

  // Generate initials from name (max 2 characters)
  const initials = generateInitials(name);

  return {
    name,
    avatar,
    initials,
    userId: String(userData._id || userData.id),
    isMerchant,
    shopName,
  };
};

/**
 * Generate up to 2-character initials from a display name
 * @param {string} name
 * @returns {string}
 */
export const generateInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Resolve listing display name from populated listing data.
 * Server populates: { name, images, price }
 *
 * @param {Object|null} listing
 * @returns {{ title: string, image: string|null, price: number|null }}
 */
export const resolveListingInfo = (listing) => {
  if (!listing) return null;
  return {
    title: listing.name || listing.title || "Listing",
    image: listing.images?.[0] || null,
    price: listing.price ?? null,
  };
};

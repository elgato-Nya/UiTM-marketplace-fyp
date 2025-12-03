// heh, never thought i would be proved how useful a barrel file is
const {
  UserValidator,
  userErrorMessages,
  AddressValidator,
  addressErrorMessages,
  MerchantValidator,
  merchantErrorMessages,
} = require("./user");
const {
  ListingValidator,
  listingErrorMessages,
} = require("./listing/listing.validator");
const {
  OrderValidator,
  orderErrorMessages,
} = require("./order/order.validator");
const {
  UploadValidator,
  uploadErrorMessages,
} = require("./upload/upload.validator");
const { CartValidator, cartErrorMessages } = require("./cart/cart.validator");
const {
  WishlistValidator,
  wishlistErrorMessages,
} = require("./wishlist/wishlist.validator");
const {
  CheckoutValidator,
  checkoutErrorMessages,
} = require("./checkout/checkout.validator");
const {
  ContactValidator,
  contactValidatorMessages,
} = require("./contact/contact.validator");

module.exports = {
  // User-related validators
  UserValidator,
  userErrorMessages,
  AddressValidator,
  addressErrorMessages,
  MerchantValidator,
  merchantErrorMessages,

  // Listing validators
  ListingValidator,
  listingErrorMessages,

  // Order validators
  OrderValidator,
  orderErrorMessages,

  // Upload validators
  UploadValidator,
  uploadErrorMessages,

  // Cart validators
  CartValidator,
  cartErrorMessages,

  // Wishlist validators
  WishlistValidator,
  wishlistErrorMessages,

  // Checkout validators
  CheckoutValidator,
  checkoutErrorMessages,

  // Contact validators
  ContactValidator,
  contactValidatorMessages,
};

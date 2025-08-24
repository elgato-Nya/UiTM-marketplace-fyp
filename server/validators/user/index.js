const { UserValidator, userErrorMessages } = require("./user.validator");
const {
  AddressValidator,
  addressErrorMessages,
} = require("./address.validator");
const {
  MerchantValidator,
  merchantErrorMessages,
} = require("./merchant.validator");

module.exports = {
  UserValidator,
  userErrorMessages,
  AddressValidator,
  addressErrorMessages,
  MerchantValidator,
  merchantErrorMessages,
};

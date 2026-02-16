import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slice/themeSlice";
import authReducer from "../features/auth/store/authSlice";
import profileReducer from "../features/profile/store/profileSlice";
import addressReducer from "../features/profile/store/addressSlice";
import orderReducer from "../features/orders/store/orderSlice";
import listingReducer from "../features/listing/store/listingSlice";
import cartReducer from "../features/cart/store/cartSlice";
import wishlistReducer from "../features/wishlist/store/wishlistSlice";
import checkoutReducer from "../features/checkout/store/checkoutSlice";
import analyticsReducer from "../features/analytic/store/analyticsSlice";
import merchantReducer from "../features/merchant/store/merchantSlice";
import uploadReducer from "./slice/uploadSlice";
import quoteReducer from "../features/quote/store/quoteSlice";
import payoutReducer from "../features/payout/store/payoutSlice";
import { listingApi } from "../features/listing/api/listingApi";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    profile: profileReducer,
    addresses: addressReducer,
    orders: orderReducer,
    listing: listingReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    checkout: checkoutReducer,
    analytics: analyticsReducer,
    merchant: merchantReducer,
    upload: uploadReducer,
    quotes: quoteReducer,
    payout: payoutReducer,
    // Add RTK Query API reducer
    [listingApi.reducerPath]: listingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for non-serializable values
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates"],
      },
    }).concat(listingApi.middleware), // Add RTK Query middleware
  devTools: process.env.NODE_ENV !== "production",
});

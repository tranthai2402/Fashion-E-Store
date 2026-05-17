import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminOrderSlice from "./admin/order-slice";

import shopProductsSlice from "./shop/products-slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";
import commonFeatureSlice from "./common-slice";
import adminAnalyticsSlice from "./admin/analytics-slice";
import adminUserReducer from "./admin/user-slice";
import adminLookbookReducer from "./admin/lookbook-slice";
import adminVideoReducer from "./admin/video-slice";
import shopLookbookReducer from "./shop/lookbook-slice";
import commonVideoReducer from "./common/video-slice";
import adminPromoSlice from "./admin/promotion-slice";
import adminNewsletterSlice from "./admin/newsletter-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,

    adminProducts: adminProductsSlice,
    adminOrder: adminOrderSlice,
    adminAnalytics: adminAnalyticsSlice,
    adminUser: adminUserReducer,
    adminLookbook: adminLookbookReducer,
    adminVideo: adminVideoReducer,
    adminPromotions: adminPromoSlice,
    adminNewsletter: adminNewsletterSlice,

    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,
    shopReview: shopReviewSlice,
    shopLookbook: shopLookbookReducer,

    commonFeature: commonFeatureSlice,
    commonVideo: commonVideoReducer,
  },
});

export default store;

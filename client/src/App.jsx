import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AuthVerify from "./pages/auth/verify";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import AdminUsers from "./pages/admin-view/users";
import AdminLookbook from "./pages/admin-view/lookbook";
import AdminVideos from "./pages/admin-view/videos";
import AdminPromotions from "./pages/admin-view/promotions";
import AdminNewsletter from "./pages/admin-view/newsletter";
import AdminBestsellers from "./pages/admin-view/bestsellers";
import AdminSales from "./pages/admin-view/sales";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import StripeReturnPage from "./pages/shopping-view/stripe-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";
import ShoppingAbout from "./pages/shopping-view/about";
import ShoppingServices from "./pages/shopping-view/services";
import ProductDetailPage from "./pages/shopping-view/product-detail";
import ShoppingLookbook from "./pages/shopping-view/lookbook";
import ShoppingLookbookDetail from "./pages/shopping-view/lookbook-detail";
import ScrollToTop from "./components/common/scroll-to-top";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-[800] bg-black h-[600px]" />;

  console.log(isLoading, user);

  return (
    <div className="flex flex-col bg-white">
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            ></CheckAuth>
          }
        />
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="verify" element={<AuthVerify />} />
        </Route>
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="videos" element={<AdminVideos />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="lookbook" element={<AdminLookbook />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="bestsellers" element={<AdminBestsellers />} />
          <Route path="sales" element={<AdminSales />} />
        </Route>
        <Route
          path="/shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="stripe-return" element={<StripeReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
          <Route path="about" element={<ShoppingAbout />} />
          <Route path="lookbook" element={<ShoppingLookbook />} />
          <Route path="lookbook/:id" element={<ShoppingLookbookDetail />} />
          <Route path="services" element={<ShoppingServices />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
        </Route>
        <Route
          path="/unauth-page"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <UnauthPage />
            </CheckAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

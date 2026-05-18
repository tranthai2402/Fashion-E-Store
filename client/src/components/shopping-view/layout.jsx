import { Outlet, useLocation } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingFooter from "./footer";
import NewsletterSidebar from "./newsletter-sidebar";
import Chatbot from "./chatbot";

function ShoppingLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/shop/home";

  if (isHomePage) {
    return (
      <div className="bg-white">
        <ShoppingHeader />
        <Outlet />
        <NewsletterSidebar />
        <Chatbot />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <ShoppingHeader />
      <main className="flex flex-col w-full flex-1 pt-14">
        <Outlet />
      </main>
      <NewsletterSidebar />
      <ShoppingFooter />
      <Chatbot />
    </div>
  );
}

export default ShoppingLayout;

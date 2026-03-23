import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import ShoppingFooter from "./footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full flex-1">
        <div className="flex flex-col w-full">
          <Outlet />
        </div>
      </main>
      <ShoppingFooter />
    </div>
  );
}

export default ShoppingLayout;

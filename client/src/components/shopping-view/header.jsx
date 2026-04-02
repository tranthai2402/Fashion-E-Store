import { LogOut, Menu, Search, ShoppingCart, UserCog } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useRef, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";

function MenuItems({ isOverlay = false, compact = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeId, setActiveId] = useState("home");
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef([]);

  const activeIndex = shoppingViewHeaderMenuItems.findIndex(
    (item) => item.id === activeId
  );

  useEffect(() => {
    const path = location.pathname;
    const searchCategory = searchParams.get("category");

    if (searchCategory) {
      const matched = shoppingViewHeaderMenuItems.find(
        (item) => item.id === searchCategory
      );
      if (matched) {
        setActiveId(matched.id);
        return;
      }
    }

    const matched = shoppingViewHeaderMenuItems.find((item) =>
      path.includes(item.path)
    );
    if (matched) setActiveId(matched.id);
    else if (path.includes("/shop/home")) setActiveId("home");
  }, [location.pathname, searchParams]);

  useEffect(() => {
    if (hoveredIndex !== null) {
      const el = tabRefs.current[hoveredIndex];
      if (el) {
        setHoverStyle({
          left: `${el.offsetLeft}px`,
          width: `${el.offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = tabRefs.current[activeIndex];
      if (el) {
        setActiveStyle({
          left: `${el.offsetLeft}px`,
          width: `${el.offsetWidth}px`,
        });
      }
    });
  }, [activeIndex]);

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "lookbook" &&
      getCurrentMenuItem.id !== "search" &&
      getCurrentMenuItem.id !== "about" &&
      getCurrentMenuItem.id !== "services"
        ? { category: [getCurrentMenuItem.id] }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    setActiveId(getCurrentMenuItem.id);

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav
      className={`relative flex items-center ${
        compact ? "gap-[3px]" : "gap-[6px]"
      }`}
    >
      <div
        className={`absolute top-0 left-0 flex items-center rounded-[6px] transition-all duration-300 ease-out ${
          compact ? "h-[26px]" : "h-[30px]"
        } ${
          isOverlay ? "bg-white/15" : "bg-[#0e0f1114]"
        }`}
        style={{
          ...hoverStyle,
          opacity: hoveredIndex !== null ? 1 : 0,
        }}
      />
      <div
        className={`absolute h-[2px] transition-all duration-300 ease-out ${
          compact ? "bottom-[-4px]" : "bottom-[-6px]"
        } ${
          isOverlay ? "bg-white" : "bg-black"
        }`}
        style={activeStyle}
      />

      {shoppingViewHeaderMenuItems.map((menuItem, index) => (
        <button
          key={menuItem.id}
          ref={(el) => {
            tabRefs.current[index] = el;
          }}
          onClick={() => handleNavigate(menuItem)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`z-10 rounded-md bg-transparent border-none cursor-pointer font-medium uppercase transition-colors duration-300 outline-none ${
            compact
              ? "h-[26px] px-2.5 py-1 text-[9px] tracking-[0.16em]"
              : "h-[30px] px-3 py-2 text-[11px] tracking-[0.2em]"
          } ${
            activeId === menuItem.id
              ? isOverlay
                ? "text-white"
                : "text-black"
              : isOverlay
              ? "text-white/65"
              : "text-gray-400"
          }`}
        >
          {menuItem.label}
        </button>
      ))}
    </nav>
  );
}

function HeaderRightContent({ isOverlay = false }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const hasMountedRef = useRef(false);
  const previousCartCountRef = useRef(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems({ userId: user?.id }));
  }, [dispatch, user?.id]);

  useEffect(() => {
    const currentCount = cartItems?.items?.length || 0;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousCartCountRef.current = currentCount;
      return;
    }

    if (currentCount > previousCartCountRef.current) {
      setOpenCartSheet(true);
    }

    previousCartCountRef.current = currentCount;
  }, [cartItems?.items?.length]);

  const iconClass = isOverlay
    ? "text-white/90 hover:text-white"
    : "text-gray-600 hover:text-black";

  return (
    <div className="flex items-center gap-5">
      <button
        onClick={() => navigate("/shop/search")}
        className={`${iconClass} transition-colors bg-transparent border-none cursor-pointer`}
      >
        <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <button
          onClick={() => setOpenCartSheet(true)}
          className={`relative ${iconClass} transition-colors bg-transparent border-none cursor-pointer`}
        >
          <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={1.5} />
          {cartItems?.items?.length > 0 && (
            <span
              className={`absolute -top-2 -right-2 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium ${
                isOverlay ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              {cartItems.items.length}
            </span>
          )}
        </button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="bg-transparent border-none cursor-pointer">
            <Avatar
              className={`w-7 h-7 ${
                isOverlay ? "bg-white/20 border border-white/40" : "bg-black"
              }`}
            >
              <AvatarFallback
                className={`text-xs font-semibold ${
                  isOverlay ? "bg-white/20 text-white" : "bg-black text-white"
                }`}
              >
                {user?.userName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-52">
          <DropdownMenuLabel className="text-xs font-normal text-gray-500">
            {user?.userName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate("/shop/account")}
            className="text-xs cursor-pointer"
          >
            <UserCog className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
            Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-xs cursor-pointer"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const [homeActiveIndex, setHomeActiveIndex] = useState(0);

  const isHomePage = location.pathname === "/shop/home";

  useEffect(() => {
    if (!isHomePage) {
      setHomeActiveIndex(1);
      return;
    }

    const applyActiveIndex = (nextIndex) => {
      setHomeActiveIndex(typeof nextIndex === "number" ? nextIndex : 0);
    };

    const handleHomeActiveIndexChange = (event) => {
      applyActiveIndex(event?.detail);
    };

    applyActiveIndex(window.__homeActiveIndex);
    window.addEventListener(
      "home-active-index-change",
      handleHomeActiveIndexChange
    );

    return () => {
      window.removeEventListener(
        "home-active-index-change",
        handleHomeActiveIndexChange
      );
    };
  }, [isHomePage]);

  const isOverlay = isHomePage && homeActiveIndex === 0;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-colors duration-500 ${
        isOverlay
          ? "bg-transparent border-transparent"
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="flex h-14 items-center justify-between px-6 md:px-10 w-full">
        <Link
          to="/shop/home"
          className="flex-shrink-0"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <span
            className={`text-xl font-bold tracking-[0.05em] uppercase transition-colors duration-500 ${
              isOverlay ? "text-white" : "text-black"
            }`}
          >
            Saint Laurent
          </span>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden ${isOverlay ? "text-white" : "text-black"}`}
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs p-8">
            <div className="mt-8">
              <MenuItems />
            </div>
            <div className="mt-8">
              <HeaderRightContent />
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden lg:flex items-center ml-auto gap-4">
          <MenuItems isOverlay={isOverlay} compact />
          <HeaderRightContent isOverlay={isOverlay} />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;

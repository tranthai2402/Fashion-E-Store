import ShoppingProductTile from "@/components/shopping-view/product-tile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dock, DockItem, DockIcon, DockLabel } from "@/components/ui/dock";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import {
  ArrowUpDownIcon,
  X,
  User,
  UserRound,
  Watch,
  Footprints,
  Gem,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const categoryItems = [
  { id: "men", label: "Men", icon: User },
  { id: "women", label: "Women", icon: UserRound },
  { id: "accessories", label: "Accessories", icon: Watch },
  { id: "footwear", label: "Footwear", icon: Footprints },
  { id: "jewelry", label: "Jewelry", icon: Gem },
  { id: "handbag", label: "Handbag", icon: ShoppingBag },
];

function createSearchParamsHelper(filterParams) {
  const queryParams = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }
  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const categorySearchParam = searchParams.get("category");

  const activeCategory = filters.category?.[0] || null;

  function handleSort(value) {
    setSort(value);
  }

  function handleCategoryClick(categoryId) {
    let newFilters;
    if (activeCategory === categoryId) {
      newFilters = {};
    } else {
      newFilters = { category: [categoryId] };
    }
    setFilters(newFilters);
    sessionStorage.setItem("filters", JSON.stringify(newFilters));
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock, size, color) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) =>
          item.productId === getCurrentProductId &&
          item.size === size &&
          item.color === color
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        size,
        color,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems({ userId: user?.id }));
        toast({ title: "Product is added to cart" });
      } else {
        toast({
          title: data?.payload?.message || "Requested quantity is not available",
          variant: "destructive",
        });
      }
    });
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let cpyFilters = { ...filters };
      const currentKeyword = cpyFilters.keyword ? cpyFilters.keyword[0] : "";
      const newKeyword = searchTerm.trim();

      if (currentKeyword !== newKeyword) {
        if (newKeyword) {
          cpyFilters.keyword = [newKeyword];
        } else {
          delete cpyFilters.keyword;
        }
        setFilters(cpyFilters);
        sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters]);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [categorySearchParam]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    } else {
      setSearchParams(new URLSearchParams());
    }
  }, [filters]);

  useEffect(() => {
    if (filters !== null && sort !== null)
      dispatch(
        fetchAllFilteredProducts({ filterParams: filters, sortParams: sort })
      );
  }, [dispatch, sort, filters]);

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      {/* Vertical Dock Filter — left side */}
      <div className="hidden md:flex flex-col items-center justify-center fixed left-4 top-1/2 -translate-y-1/2 z-30">
        <Dock
          orientation="vertical"
          iconSize={40}
          maxScale={1.4}
          distance={100}
          className="border-gray-200/60 bg-white/90"
        >
          {categoryItems.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <DockItem
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={
                  isActive
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : ""
                }
              >
                <DockIcon>
                  <Icon
                    className={isActive ? "text-white" : "text-gray-600"}
                    strokeWidth={1.5}
                  />
                </DockIcon>
                <DockLabel>{cat.label}</DockLabel>
              </DockItem>
            );
          })}
        </Dock>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-20">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {activeCategory && (
              <button
                onClick={() => handleCategoryClick(activeCategory)}
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-900 bg-transparent border-none cursor-pointer hover:text-gray-500 transition-colors"
              >
                {categoryItems.find((c) => c.id === activeCategory)?.label}
                <X className="w-3 h-3" />
              </button>
            )}
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
              {productList?.length || 0} Products
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 border-0 border-b border-gray-300 bg-transparent py-1 text-[11px] text-gray-700 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-0 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-900"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-700 hover:text-black transition-colors bg-transparent border-none cursor-pointer">
                  Sort
                  <ArrowUpDownIcon className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                      className="text-[11px] uppercase tracking-[0.1em]"
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-14 px-8 py-10">
          {productList && productList.length > 0 ? (
            productList.map((productItem) => (
              <ShoppingProductTile
                key={productItem._id}
                product={productItem}
                handleAddtoCart={handleAddtoCart}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-[11px] uppercase tracking-[0.2em] text-gray-400 py-20">
              No products found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingListing;

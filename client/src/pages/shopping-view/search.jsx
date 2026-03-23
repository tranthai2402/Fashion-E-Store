import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const luxurySearchSuggestions = [
  "WOMEN'S LEATHER",
  "MEN'S SHOES",
  "ACCESSORIES",
  "GIFTS",
];

function SearchProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(
    () => searchParams.get("keyword") || ""
  );
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.shopSearch);

  const { user } = useSelector((state) => state.auth);

  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const trimmedKeyword = keyword.trim();

      if (trimmedKeyword.length > 3) {
        setSearchParams(new URLSearchParams(`?keyword=${trimmedKeyword}`));
        dispatch(getSearchResults(trimmedKeyword));
      } else {
        if (trimmedKeyword.length > 0) {
          setSearchParams(new URLSearchParams(`?keyword=${trimmedKeyword}`));
        } else {
          setSearchParams(new URLSearchParams());
        }
        dispatch(resetSearchResults());
      }
    }, 450);

    return () => clearTimeout(debounceTimer);
  }, [keyword, dispatch, setSearchParams]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    console.log(cartItems);
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
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
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      } else {
        toast({
          title: data?.payload?.message || "Requested quantity is not available",
          variant: "destructive",
        });
      }
    });
  }

  const hasKeyword = keyword.trim().length > 0;
  const hasResults = searchResults.length > 0;
  const shouldShowNoResults = hasKeyword && !hasResults;

  console.log(searchResults, "searchResults");

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white px-6 md:px-10 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <div
          className={`w-full ${
            shouldShowNoResults || !hasKeyword
              ? "flex min-h-[60vh] flex-col items-center justify-center"
              : "mb-10"
          }`}
        >
          <div className="w-full max-w-2xl rounded-full border border-black/10 bg-white/80 p-1.5 backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
            <div className="relative flex items-center rounded-full px-5 py-3">
              <Search
                className="absolute left-5 h-4 w-4 text-gray-500"
                strokeWidth={1.25}
              />
              <input
                value={keyword}
                name="keyword"
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full border-none bg-transparent px-8 text-center text-[10px] font-light uppercase tracking-[0.32em] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
                placeholder="Search Products..."
              />
            </div>
          </div>

          {shouldShowNoResults && (
            <div className="mt-10 flex flex-col items-center">
              <p
                className="text-[10px] font-light uppercase tracking-[0.34em] text-gray-500"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                No Results Found
              </p>
              <p
                className="mt-4 text-[10px] font-light italic tracking-[0.08em] text-gray-400"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Perhaps try searching for one of our iconic categories...
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {luxurySearchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setKeyword(suggestion)}
                    className="border-none bg-transparent text-[10px] font-light uppercase tracking-[0.28em] text-gray-600 transition-colors hover:text-black cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasResults && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {searchResults.map((item) => (
              <ShoppingProductTile
                key={item?._id}
                handleAddtoCart={handleAddtoCart}
                product={item}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchProducts;

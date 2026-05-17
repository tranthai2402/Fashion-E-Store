import { Minus, Plus, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity, toggleSelectItem, toggleCheckoutSelectItem, togglePayingItem } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function UserCartItemsContent({
  cartItem,
  enableProductNavigation = false,
  onProductNavigate,
  discount = 0,
  isCheckoutPage = false,
}) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems, selectedItems = [], payingItems = [] } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState(cartItem?.quantity);

  useEffect(() => {
    setInputValue(cartItem?.quantity);
  }, [cartItem?.quantity]);

  const pId = cartItem.productId && typeof cartItem.productId === 'object' ? cartItem.productId._id : cartItem.productId;
  const itemId = `${pId}-${cartItem.size || ''}-${cartItem.color || ''}`;

  const isSelected = isCheckoutPage
    ? (payingItems || []).includes(itemId)
    : (selectedItems || []).includes(itemId);

  const handleToggleSelect = () => {
    if (isCheckoutPage) {
      dispatch(togglePayingItem({ id: itemId }));
    } else {
      dispatch(toggleSelectItem({ id: itemId }));
    }
  };

  function handleNavigateToProduct() {
    if (!enableProductNavigation || !pId) return;
    if (typeof onProductNavigate === "function") {
      onProductNavigate(cartItem);
    }
    navigate(`/shop/product/${pId}`);
  }

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];
      const indexOfCurrentCartItem = getCartItems.findIndex(
        (item) =>
          (item.productId?._id || item.productId) === pId &&
          item.size === getCartItem?.size &&
          item.color === getCartItem?.color
      );

      const getCurrentProductIndex = productList.findIndex(
        (product) => product._id === pId
      );

      if (getCurrentProductIndex > -1) {
        const product = productList[getCurrentProductIndex];
        let maxStock = product.totalStock;

        if (product.variants && product.variants.length > 0) {
          const variant = product.variants.find(
            (v) => v.size === getCartItem?.size && v.color === getCartItem?.color
          );
          if (variant) {
            maxStock = variant.stock;
          }
        }

        if (indexOfCurrentCartItem > -1 && maxStock !== null) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > maxStock) {
            toast({
              title: `Only ${maxStock} quantity available for this item`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: pId,
        size: getCartItem?.size,
        color: getCartItem?.color,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item updated successfully",
        });
      } else {
        toast({
          title: data?.payload?.message || "Requested quantity is not available",
          variant: "destructive",
        });
      }
    });
  }

  function handleManualUpdateQuantity(getCartItem, newValue) {
    if (newValue === "" || isNaN(newValue)) return;
    let quantity = parseInt(newValue);

    if (quantity < 1) {
      toast({ title: "Quantity must be at least 1", variant: "destructive" });
      setInputValue(getCartItem?.quantity);
      return;
    }

    const getCurrentProductIndex = productList.findIndex(
      (product) => product._id === pId
    );

    if (getCurrentProductIndex > -1) {
      const product = productList[getCurrentProductIndex];
      let maxStock = product.totalStock;

      if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find(
          (v) => v.size === getCartItem?.size && v.color === getCartItem?.color
        );
        if (variant) {
          maxStock = variant.stock;
        }
      }

      if (maxStock !== null && quantity > maxStock) {
        toast({
          title: `Only ${maxStock} quantity available for this item`,
          variant: "destructive",
        });
        setInputValue(getCartItem?.quantity);
        return;
      }
    }

    if (quantity === getCartItem?.quantity) return;

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: pId,
        size: getCartItem?.size,
        color: getCartItem?.color,
        quantity: quantity,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Cart item updated successfully" });
      } else {
        toast({
          title: data?.payload?.message || "Requested quantity not available",
          variant: "destructive",
        });
        setInputValue(getCartItem?.quantity);
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    if (isCheckoutPage) {
      dispatch(toggleCheckoutSelectItem({ id: itemId }));
      return;
    }

    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: pId,
        size: getCartItem?.size,
        color: getCartItem?.color,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  return (
    <div className="flex items-start gap-4 border-b border-gray-100 pb-6 w-full">
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleToggleSelect}
        className="mt-1 flex-shrink-0"
      />
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className={`h-28 w-24 flex-shrink-0 object-cover bg-[#f5f5f0] rounded-sm ${enableProductNavigation ? "cursor-pointer" : ""
          }`}
        onClick={handleNavigateToProduct}
      />
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={handleNavigateToProduct}
          className={`w-full border-none bg-transparent p-0 text-left ${enableProductNavigation ? "cursor-pointer" : ""
            }`}
        >
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-900 leading-relaxed line-clamp-2">
            {cartItem?.title}
          </h3>
          <div className="mt-2 flex flex-col gap-1">
            {cartItem?.size ? (
              <span className="text-[10px] uppercase tracking-[0.12em] text-gray-500">
                Size {cartItem.size}
              </span>
            ) : null}
            {cartItem?.color ? (
              <span className="text-[10px] uppercase tracking-[0.12em] text-gray-500">
                Color {cartItem.color}
              </span>
            ) : null}
            {discount > 0 && (
              <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-sm w-fit mt-1">
                ĐÃ ÁP DỤNG MÃ GIẢM GIÁ
              </span>
            )}
          </div>
        </button>
        <div className="mt-4 flex items-center gap-4">
          <button
            disabled={cartItem?.quantity === 1}
            className="text-sm text-gray-600 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1"
            onClick={() => {
              handleUpdateQuantity(cartItem, "minus");
            }}
          >
            <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={(e) => handleManualUpdateQuantity(cartItem, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleManualUpdateQuantity(cartItem, e.target.value);
              }
            }}
            className="w-12 h-7 p-1 text-center text-[11px] font-medium tracking-[0.1em] text-gray-800 border-gray-200 focus:ring-0 focus:border-black rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white"
          />
          <button
            className="text-sm text-gray-600 hover:text-black transition-colors p-1"
            onClick={() => {
              handleUpdateQuantity(cartItem, "plus");
            }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch">
        <div className="text-right">
          <p className="text-[11px] font-medium tracking-[0.08em] text-gray-900">
            $
            {(
              (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) * cartItem?.quantity - discount
            ).toFixed(2)}
          </p>
          {discount > 0 && (
            <p className="text-[10px] text-green-600 font-medium">
              -${discount.toFixed(2)}
            </p>
          )}
          {discount > 0 && (
            <p className="text-[9px] text-gray-400 line-through">
              $
              {(
                (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) * cartItem?.quantity
              ).toFixed(2)}
            </p>
          )}
        </div>
        <button
          onClick={() => handleCartItemDelete(cartItem)}
          className="text-gray-400 hover:text-black transition-colors p-1"
        >
          <Trash size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;

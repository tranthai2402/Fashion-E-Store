import { Minus, Plus, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { Checkbox } from "../ui/checkbox";
import { toggleSelectItem } from "@/store/shop/cart-slice";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems, selectedItems = [] } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const itemId = `${cartItem.productId}-${cartItem.size || ''}-${cartItem.color || ''}`;
  const isSelected = (selectedItems || []).includes(itemId);

  const handleToggleSelect = () => {
    dispatch(toggleSelectItem({ id: itemId }));
  };

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) =>
            item.productId === getCartItem?.productId &&
            item.size === getCartItem?.size &&
            item.color === getCartItem?.color
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock =
          getCurrentProductIndex > -1
            ? productList[getCurrentProductIndex].totalStock
            : null;

        console.log(getCurrentProductIndex, getTotalStock, "getTotalStock");

        if (indexOfCurrentCartItem > -1 && getTotalStock !== null) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
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
        productId: getCartItem?.productId,
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
          title: "Cart item is updated successfully",
        });
      } else {
        toast({
          title: data?.payload?.message || "Requested quantity is not available",
          variant: "destructive",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: getCartItem?.productId,
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
    <div className="flex items-start gap-4 border-b border-gray-100 pb-6">
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleToggleSelect}
        className="mt-1 flex-shrink-0"
      />
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="h-28 w-24 flex-shrink-0 object-cover bg-[#f5f5f0]"
      />
      <div className="flex-1 min-w-0">
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
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button
            disabled={cartItem?.quantity === 1}
            className="text-sm text-gray-600 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => {
              handleUpdateQuantity(cartItem, "minus");
            }}
          >
            <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <span className="min-w-4 text-center text-[11px] font-medium tracking-[0.1em] text-gray-800">
            {cartItem?.quantity}
          </span>
          <button
            className="text-sm text-gray-600 hover:text-black transition-colors"
            onClick={() => {
              handleUpdateQuantity(cartItem, "plus");
            }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch">
        <p className="text-[11px] font-medium tracking-[0.08em] text-gray-900">
          $
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        <button
          onClick={() => handleCartItemDelete(cartItem)}
          className="text-gray-400 hover:text-black transition-colors"
        >
          <Trash size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;

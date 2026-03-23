import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { useDispatch, useSelector } from "react-redux";
import { selectAllItems, clearSelectedItems } from "@/store/shop/cart-slice";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { selectedItems = [] } = useSelector((state) => state.shopCart);

  const allItemIds = cartItems && cartItems.length > 0
    ? cartItems.map(item => `${item.productId}-${item.size || ''}-${item.color || ''}`)
    : [];

  const isAllSelected = cartItems && cartItems.length > 0 && selectedItems?.length === cartItems.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      dispatch(clearSelectedItems());
    } else {
      dispatch(selectAllItems(allItemIds));
    }
  };

  const selectedCartItems = cartItems && cartItems.length > 0
    ? cartItems.filter(item => (selectedItems || []).includes(`${item.productId}-${item.size || ''}-${item.color || ''}`))
    : [];

  const totalCartAmount =
    selectedCartItems && selectedCartItems.length > 0
      ? selectedCartItems.reduce(
        (sum, currentItem) =>
          sum +
          (currentItem?.salePrice > 0
            ? currentItem?.salePrice
            : currentItem?.price) *
          currentItem?.quantity,
        0
      )
      : 0;

  return (
    <SheetContent
      side="right"
      className="w-full sm:max-w-xl p-0 bg-white border-l border-gray-200"
    >
      <div className="flex h-full flex-col">
        <SheetHeader className="px-8 py-6 border-b border-gray-100">
          <SheetTitle className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-900">
            Shopping Bag
          </SheetTitle>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
            {cartItems?.length || 0} Item{cartItems?.length === 1 ? "" : "s"}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {cartItems && cartItems.length > 0 ? (
            <>
              <div className="mb-6 flex items-center gap-2">
                <Checkbox
                  id="selectAll"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label
                  htmlFor="selectAll"
                  className="cursor-pointer text-[10px] uppercase tracking-[0.16em] text-gray-600"
                >
                  Select All
                </Label>
              </div>

              <div className="space-y-6">
                {cartItems.map((item, idx) => (
                  <UserCartItemsContent key={idx} cartItem={item} />
                ))}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                Your bag is empty
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-8 py-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Total
            </span>
            <span className="text-sm font-medium tracking-[0.08em] text-gray-900">
              ${totalCartAmount.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={() => {
              if (!selectedItems || selectedItems.length === 0) {
                toast({
                  title: "Please select at least one item to checkout",
                  variant: "destructive",
                });
                return;
              }
              navigate("/shop/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full h-12 rounded-none bg-black text-white text-[10px] font-semibold uppercase tracking-[0.28em] hover:bg-gray-800"
          >
            Checkout Selected Items
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}

export default UserCartWrapper;

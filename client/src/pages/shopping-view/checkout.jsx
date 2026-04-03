import Address from "@/components/shopping-view/address";
import img from "@/assets/photo_for_homepage.avif";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { createNewOrder } from "@/store/shop/order-slice";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fetchCartItems, clearCheckoutItems, toggleCheckoutSelectItem, selectAllCheckoutItems } from "@/store/shop/cart-slice";

function ShoppingCheckout() {
  const { cartItems, checkoutItems = [] } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [isVoucherDropdownOpen, setIsVoucherDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch public active vouchers for this user
    if (user?.id) {
      axios.get(`http://localhost:5000/api/shop/promotions/vouchers/public?userId=${user.id}`, { withCredentials: true })
        .then((res) => {
          console.log("FETCHED VOUCHERS REST:", res.data);
          if (res.data.success) {
            setAvailableVouchers(res.data.data);
          }
        })
        .catch((err) => console.log("FETCH VOUCHERS ERR:", err));
    }

    // Cleanup: Clear checkout snapshot when leaving checkout page
    return () => {
      dispatch(clearCheckoutItems()); 
    };
      
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (user?.id && cartItems?.items?.length > 0) {
      const appliedCode = cartItems.calculations?.voucherDetails?.code || null;
      
      dispatch(fetchCartItems({ 
        userId: user.id, 
        voucherCode: appliedCode, 
        selectedItems: checkoutItems 
      }));
    }
  }, [checkoutItems, dispatch, user?.id]);

  const displayCheckoutItems = (cartItems?.items || []).filter(item => 
    (checkoutItems || []).includes(`${item.productId}-${item.size || ''}-${item.color || ''}`)
  );

  const totalCartAmount = displayCheckoutItems.reduce(
    (sum, currentItem) =>
      sum +
      (currentItem?.salePrice > 0
        ? currentItem?.salePrice
        : currentItem?.price) *
      currentItem?.quantity,
    0
  );

  const allFilteredItemIds = displayCheckoutItems.map(item => `${item.productId}-${item.size || ''}-${item.color || ''}`);
  const isAllSelected = checkoutItems.length > 0 && checkoutItems.length === displayCheckoutItems.length;

  const handleSelectAll = () => {
    // Note: In checkout, select all usually means all items IN the checkout snapshot
    if (isAllSelected) {
       // dispatch(clearCheckoutItems()); // Unselecting all in checkout means empty checkout
    } else {
       // dispatch(selectAllCheckoutItems(allFilteredItemIds));
    }
  };
  
  const appliedCalculations = cartItems && cartItems.calculations ? cartItems.calculations : null;
  const discountAmount = appliedCalculations?.discountTotal || 0;
  const finalAmount = Math.max(0, totalCartAmount - discountAmount);
  
  const applyVoucher = () => {
    dispatch(fetchCartItems({ userId: user?.id, voucherCode, selectedItems: checkoutItems }));
  };

  function handleInitiateStripePayment() {
    if (displayCheckoutItems.length === 0) {
      toast({
        title: "Your checkout cart is empty.",
        variant: "destructive",
      });
      return;
    }
    // ... (rest of function remains same)
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });

      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: displayCheckoutItems.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
        size: singleCartItem?.size,
        color: singleCartItem?.color,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      totalAmount: finalAmount,
      discountAmount: discountAmount,
      appliedPromotions: appliedCalculations?.appliedPromotions || [],
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      console.log(data, "sangam");
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  if (approvalURL) {
    window.location.href = approvalURL;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {/* Removed Select All header from checkout as it's a dedicated session view */}
          {displayCheckoutItems && displayCheckoutItems.length > 0
            ? displayCheckoutItems.map((item, idx) => {
                let itemDiscount = 0;
                if (appliedCalculations?.appliedPromotions?.length > 0) {
                  appliedCalculations.appliedPromotions.forEach(promo => {
                    if (promo.productBreakdown) {
                      const breakdown = promo.productBreakdown.find(b => 
                        b.productId === (item.productId._id || item.productId) && 
                        (b.size || "") === (item.size || "") && 
                        (b.color || "") === (item.color || "")
                      );
                      if (breakdown) {
                        itemDiscount += breakdown.discountAmount;
                      }
                    }
                  });
                }

                return <UserCartItemsContent key={idx} cartItem={item} discount={itemDiscount} isCheckoutPage={true} />;
              })
            : null}
          <div className="mt-6 space-y-4">
            
            <div className="bg-gray-50 border p-3 rounded-md shadow-sm">
              <p className="font-semibold mb-3 text-sm text-gray-800">Kho Voucher của bạn:</p>
              {(!availableVouchers || availableVouchers.length === 0) ? (
                <p className="text-sm text-gray-500 italic">Không có mã voucher nào được công khai lúc này.</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {availableVouchers.map(v => {
                    const minOrder = v.promotionId?.conditions?.minOrderValue || 0;
                    const isEligible = totalCartAmount >= minOrder;
                    
                    return (
                      <div key={v._id} className={`flex justify-between items-center border-b border-gray-200 pb-3 last:border-0 last:pb-0 ${!isEligible ? 'opacity-60' : ''}`}>
                        <div>
                          <p className={`font-bold leading-none ${isEligible ? 'text-sky-700' : 'text-gray-500'}`}>{v.code}</p>
                          <p className="text-[11px] text-gray-600 mt-1.5">{v.promotionId?.description || v.promotionId?.name}</p>
                          {minOrder > 0 && (
                            <p className={`text-[10px] font-medium mt-1 flex items-center ${isEligible ? 'text-orange-600' : 'text-red-500'}`}>
                              Đơn tối thiểu: ${minOrder} {!isEligible && `(Còn thiếu $${(minOrder - totalCartAmount).toFixed(2)})`}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          disabled={!isEligible}
                          className={`text-[10px] h-7 px-3 ${isEligible ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          onClick={() => {
                            setVoucherCode(v.code);
                            dispatch(fetchCartItems({ userId: user?.id, voucherCode: v.code, selectedItems }));
                          }}>
                          Dùng
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input 
                placeholder="Nhập mã giảm giá..." 
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />
              <Button onClick={applyVoucher} variant="outline" className="bg-white">Áp dụng</Button>
            </div>


            {cartItems?.voucherError && (
              <p className="text-red-500 text-sm">{cartItems.voucherError}</p>
            )}
            {appliedCalculations?.appliedPromotions?.length > 0 && (
              <div className="bg-green-50 p-3 text-sm text-green-700 rounded border border-green-200 flex justify-between items-center">
                <span>
                  <strong>Đã áp dụng:</strong> {appliedCalculations.appliedPromotions.map(p => p.name).join(', ')}
                  {appliedCalculations?.voucherDetails?.code && ` (${appliedCalculations.voucherDetails.code})`}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setVoucherCode("");
                    dispatch(fetchCartItems({ userId: user?.id, selectedItems }));
                  }} 
                  className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-red-200"
                >
                  Gỡ bỏ
                </Button>
              </div>
            )}

            <div className="flex justify-between border-t pt-4">
              <span>Tạm tính</span>
              <span className="font-medium">${totalCartAmount.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span className="font-medium">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng</span>
              <span>${finalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button onClick={handleInitiateStripePayment} className="w-full">
              {isPaymentStart
                ? "Processing Payment..."
                : "Checkout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;

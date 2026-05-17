import Address from "@/components/shopping-view/address";
import bannerImg from "@/assets/photo_for_homepage.avif";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Truck, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchCartItems,
  clearCheckoutItems,
  selectAllPayingItems
} from "@/store/shop/cart-slice";

// Cấu hình ngân hàng cho QR Code (VietQR)
const BANK_CONFIG = {
  bankId: "MB", // Mã ngân hàng (ví dụ: MB, VCB, ICB, ACB...)
  bankName: "MB Bank",
  accountNumber: "0384917577",
  accountName: "NGUYEN MANH TUAN",
};

function ShoppingCheckout() {
  const { cartItems, checkoutItems = [], payingItems = [] } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [voucherCode, setVoucherCode] = useState("");
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      axios.get(`http://localhost:5000/api/shop/promotions/vouchers/public?userId=${user.id}`, { withCredentials: true })
        .then((res) => {
          if (res.data.success) {
            setAvailableVouchers(res.data.data);
          }
        })
        .catch((err) => console.log("FETCH VOUCHERS ERR:", err));
    }

    return () => {
      dispatch(clearCheckoutItems());
    };
  }, [dispatch, user?.id]);

  const isAllPayingSelected = checkoutItems.length > 0 && payingItems.length === checkoutItems.length;

  const handleSelectAll = (value) => {
    if (value === false) {
      dispatch(selectAllPayingItems([]));
    } else {
      dispatch(selectAllPayingItems([...checkoutItems]));
    }
  };

  useEffect(() => {
    if (user?.id && cartItems?.items?.length > 0) {
      const appliedCode = cartItems.calculations?.voucherDetails?.code || null;
      dispatch(fetchCartItems({
        userId: user.id,
        voucherCode: appliedCode,
        selectedItems: payingItems
      }));
    }
  }, [payingItems, dispatch, user?.id]);

  function getItemKey(item) {
    const pId = item.productId && typeof item.productId === 'object' ? item.productId._id : item.productId;
    return `${pId}-${item.size || ''}-${item.color || ''}`;
  }

  const sessionItems = (cartItems?.items || []).filter(item =>
    (checkoutItems || []).includes(getItemKey(item))
  );

  const itemsToPay = sessionItems.filter(item =>
    (payingItems || []).includes(getItemKey(item))
  );

  const totalCartAmount = itemsToPay.reduce(
    (sum, currentItem) =>
      sum +
      (currentItem?.salePrice > 0
        ? currentItem?.salePrice
        : currentItem?.price) *
      currentItem?.quantity,
    0
  );

  const appliedCalculations = cartItems && cartItems.calculations ? cartItems.calculations : null;
  const discountAmount = appliedCalculations?.discountTotal || 0;
  const finalAmount = Math.max(0, totalCartAmount - discountAmount);

  const applyVoucher = () => {
    dispatch(fetchCartItems({ userId: user?.id, voucherCode, selectedItems: payingItems }));
  };

  function handleCheckout() {
    if (itemsToPay.length === 0) {
      toast({
        title: "Please select at least one item to pay.",
        variant: "destructive",
      });
      return;
    }
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
      cartItems: itemsToPay.map((singleCartItem) => ({
        productId: singleCartItem?.productId?._id || singleCartItem?.productId,
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
        fullName: currentSelectedAddress?.fullName,
        phone: currentSelectedAddress?.phone,
        province: currentSelectedAddress?.province,
        district: currentSelectedAddress?.district,
        ward: currentSelectedAddress?.ward,
        addressDetail: currentSelectedAddress?.addressDetail,
        addressType: currentSelectedAddress?.addressType,
        notes: currentSelectedAddress?.notes,
        address: currentSelectedAddress?.addressDetail || currentSelectedAddress?.address,
        city: currentSelectedAddress?.province || currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode || "",
      },
      orderStatus: paymentMethod === "stripe" ? "pending" : "confirmed",
      paymentMethod,
      paymentStatus: paymentMethod === "stripe" ? "pending" : "unpaid",
      totalAmount: finalAmount,
      discountAmount: discountAmount,
      appliedPromotions: appliedCalculations?.appliedPromotions || [],
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        if (paymentMethod === "stripe") {
            setIsPaymemntStart(true);
        } else {
            toast({
                title: data.payload.message || "Order placed successfully!",
            });
            if (user?.id) {
                dispatch(fetchCartItems({ userId: user?.id }));
                dispatch(clearCheckoutItems());
            }
            navigate("/shop/account");
        }
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  if (approvalURL && paymentMethod === "stripe") {
    window.location.href = approvalURL;
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={bannerImg} className="h-full w-full object-cover object-center" alt="Checkout Banner" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-5 p-5 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          <Address
            selectedId={currentSelectedAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />

          <div className="bg-white border p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Phương thức thanh toán
            </h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid grid-cols-1 gap-4"
            >
              <div className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-black bg-gray-50 ring-1 ring-black' : 'hover:border-gray-300'}`}>
                <RadioGroupItem value="stripe" id="stripe" className="sr-only" />
                <Label htmlFor="stripe" className="flex items-center gap-4 cursor-pointer w-full">
                  <div className="bg-sky-100 p-2 rounded-full text-sky-600">
                    <CreditCard size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Thẻ tín dụng / Ghi nợ (Stripe)</p>
                    <p className="text-xs text-gray-500">Thanh toán an toàn qua cổng Stripe</p>
                  </div>
                </Label>
              </div>

              <div className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-black bg-gray-50 ring-1 ring-black' : 'hover:border-gray-300'}`}>
                <RadioGroupItem value="cod" id="cod" className="sr-only" />
                <Label htmlFor="cod" className="flex items-center gap-4 cursor-pointer w-full">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <Truck size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-gray-500">Thanh toán bằng tiền mặt khi shipper giao tới</p>
                  </div>
                </Label>
              </div>

              <div className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'qr_code' ? 'border-black bg-gray-50 ring-1 ring-black' : 'hover:border-gray-300'}`}>
                <RadioGroupItem value="qr_code" id="qr_code" className="sr-only" />
                <Label htmlFor="qr_code" className="flex items-center gap-4 cursor-pointer w-full">
                  <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                    <QrCode size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Thanh toán qua mã QR (Chuyển khoản)</p>
                    <p className="text-xs text-gray-500">Chuyển khoản ngân hàng qua mã VietQR</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'qr_code' && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1 text-sm text-orange-900">
                  <p>Ngân hàng: <strong>{BANK_CONFIG.bankName}</strong></p>
                  <p>Số tài khoản: <strong>{BANK_CONFIG.accountNumber}</strong></p>
                  <p>Chủ tài khoản: <strong>{BANK_CONFIG.accountName}</strong></p>
                  <p>Nội dung: <strong>{user?.userName}_{new Date().getTime().toString().slice(-6)}</strong></p>
                </div>
                <div className="mt-4 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl border-2 border-orange-200">
                    <img
                      src={`https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${finalAmount + 2000}&addInfo=${user?.userName}_${new Date().getTime().toString().slice(-6)}&accountName=${BANK_CONFIG.accountName}`}
                      alt="VietQR"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-orange-800 mt-2 text-center uppercase">
                    Vui lòng chuyển chính xác: ${(finalAmount + 2000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-orange-600 mt-4 text-center">
                    Hệ thống sẽ tự động xác nhận sau khi nhận được tiền. <br />
                    (Sử dụng dịch vụ như PayOS/SePay để tự động hóa hoàn toàn)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {sessionItems && sessionItems.length > 0 && (
            <div className="mb-2 flex items-center gap-2 px-1">
              <Checkbox
                id="selectAllPaying"
                checked={isAllPayingSelected}
                onCheckedChange={handleSelectAll}
              />
              <Label
                htmlFor="selectAllPaying"
                className="cursor-pointer text-[10px] uppercase tracking-[0.16em] text-gray-600 font-medium"
              >
                Chọn tất cả để thanh toán ({itemsToPay.length}/{sessionItems.length})
              </Label>
            </div>
          )}
          {sessionItems && sessionItems.length > 0
            ? sessionItems.map((item, idx) => {
              let itemDiscount = 0;
              if (appliedCalculations?.appliedPromotions?.length > 0) {
                appliedCalculations.appliedPromotions.forEach(promo => {
                  if (promo.productBreakdown) {
                    const breakdown = promo.productBreakdown.find(b =>
                      b.productId === (item.productId?._id || item.productId) &&
                      (b.size || "") === (item.size || "") &&
                      (b.color || "") === (item.color || "")
                    );
                    if (breakdown) {
                      itemDiscount += breakdown.discountAmount;
                    }
                  }
                });
              }
              return (
                <UserCartItemsContent
                  key={`${getItemKey(item)}-${idx}`}
                  cartItem={item}
                  discount={itemDiscount}
                  isCheckoutPage={true}
                />
              );
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
                    const minOrderValue = (v.promotionId?.conditions?.minOrderValue || 0);
                    const isEligible = totalCartAmount >= minOrderValue;
                    return (
                      <div key={v._id} className={`flex justify-between items-center border-b border-gray-200 pb-3 last:border-0 last:pb-0 ${!isEligible ? 'opacity-60' : ''}`}>
                        <div className="flex-1">
                          <p className={`font-bold leading-none ${isEligible ? 'text-sky-700' : 'text-gray-500'}`}>{v.code}</p>
                          <p className="text-[11px] text-gray-600 mt-1.5">{v.promotionId?.description || v.promotionId?.name}</p>
                          {minOrderValue > 0 && (
                            <p className={`text-[10px] font-medium mt-1 flex items-center ${isEligible ? 'text-orange-600' : 'text-red-500'}`}>
                              Đơn tối thiểu: ${minOrderValue} {!isEligible && `(Còn thiếu $${(minOrderValue - totalCartAmount).toFixed(2)})`}
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
                            dispatch(fetchCartItems({ userId: user?.id, voucherCode: v.code, selectedItems: payingItems }));
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

            {cartItems?.voucherError ? (
              <p className="text-red-500 text-sm">{cartItems.voucherError}</p>
            ) : null}

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
                    dispatch(fetchCartItems({ userId: user?.id, selectedItems: payingItems }));
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
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Tổng cộng</span>
              <span>${finalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button
              onClick={handleCheckout}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold text-base"
              disabled={isPaymentStart}
            >
              {isPaymentStart
                ? "Đang khởi tạo thanh toán..."
                : (paymentMethod === 'stripe' ? "Thanh toán ngay (Stripe)" : "Đặt hàng ngay")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;

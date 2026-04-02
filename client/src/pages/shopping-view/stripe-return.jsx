import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { clearCart, fetchCartItems, clearSelectedItems } from "@/store/shop/cart-slice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

function StripeReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Lấy params từ Stripe success_url
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (orderId && sessionId) {
      // Gọi action capturePayment với tham số mới
      dispatch(capturePayment({ orderId, sessionId })).then((data) => {
        sessionStorage.removeItem("currentOrderId");
        if (data?.payload?.success) {
          if (user?.id) {
            dispatch(fetchCartItems({ userId: user?.id }));
          } else {
            dispatch(clearCart());
          }
          dispatch(clearSelectedItems());
          navigate(`/shop/payment-success?orderId=${orderId}`);
        }
      });
    }
  }, [orderId, sessionId, dispatch, navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Stripe Payment... Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default StripeReturnPage;
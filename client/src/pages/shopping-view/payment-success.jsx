import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getOrderDetails } from "@/store/shop/order-slice";
import { addReview } from "@/store/shop/review-slice";
import { useToast } from "@/components/ui/use-toast";
import StarRatingComponent from "@/components/common/star-rating";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");

  const { orderDetails } = useSelector((state) => state.shopOrder);
  const { user } = useSelector((state) => state.auth);

  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  function handleRatingChange(productId, rating) {
    setReviewData((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  }

  function handleReviewMessageChange(productId, message) {
    setReviewData((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], message },
    }));
  }

  function handleSubmitReview(productId) {
    const { rating, message } = reviewData[productId] || {};
    if (!rating || !message) {
      toast({
        title: "Please provide both rating and review message",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addReview({
        productId,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: message,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload?.success) {
        toast({
          title: "Review submitted successfully!",
        });
        setReviewData((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          newState[productId] = { submitted: true };
          return newState;
        });
      } else {
        toast({
          title: data.payload?.message || "Something went wrong!",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 p-5 md:p-10 max-w-4xl mx-auto">
      <Card className="p-10 text-center">
        <CardHeader className="p-0">
          <CardTitle className="text-4xl text-green-600 mb-2">
            Payment Successful!
          </CardTitle>
          <p className="text-muted-foreground">
            Thank you for your purchase. You can now review the products below.
          </p>
        </CardHeader>
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={() => navigate("/shop/home")}>Back to Home</Button>
          <Button variant="outline" onClick={() => navigate("/shop/account")}>
            View All Orders
          </Button>
        </div>
      </Card>

      {orderDetails?.cartItems?.length > 0 && (
        <div className="grid gap-6">
          <h2 className="text-2xl font-bold">Review Your Items</h2>
          {orderDetails.cartItems.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 flex items-center justify-center bg-gray-50 p-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-40 object-contain"
                  />
                </div>
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>

                  {reviewData[item.productId]?.submitted ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-center justify-center gap-2">
                      <span className="font-medium">Thanks for your feedback!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div>
                        <Label className="mb-2 block">Your Rating</Label>
                        <StarRatingComponent
                          rating={reviewData[item.productId]?.rating || 0}
                          handleRatingChange={(val) =>
                            handleRatingChange(item.productId, val)
                          }
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Your Review</Label>
                        <Input
                          placeholder="Tell us what you think..."
                          value={reviewData[item.productId]?.message || ""}
                          onChange={(e) =>
                            handleReviewMessageChange(item.productId, e.target.value)
                          }
                        />
                      </div>
                      <Button
                        className="w-fit"
                        onClick={() => handleSubmitReview(item.productId)}
                      >
                        Submit Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentSuccessPage;

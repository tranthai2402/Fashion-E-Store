import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { checkProductPurchase } from "@/store/shop/order-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { hasPurchased } = useSelector((state) => state.shopOrder);

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    console.log(getRating, "getRating");

    setRating(getRating);
  }

  const getVariantStock = (size, color) => {
    if (!productDetails?.variants) return productDetails?.totalStock || 0;
    const variant = productDetails.variants.find(v => v.size === size && v.color === color);
    return variant ? variant.stock : 0;
  };

  const isVariantOutOfStock = (size, color) => {
    return getVariantStock(size, color) <= 0;
  };

  const currentVariant = productDetails?.variants?.find(
    (v) =>
      v.size === selectedSize &&
      v.color === selectedColor
  );

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    const isSizeMissing = productDetails?.variants?.some(v => v.size) && selectedSize === "";
    const isColorMissing = productDetails?.variants?.some(v => v.color) && selectedColor === "";

    if (isSizeMissing || isColorMissing) {
      toast({
        title: `Please select ${isSizeMissing && isColorMissing ? "size and color" : isSizeMissing ? "size" : "color"}`,
        variant: "destructive",
      });
      return;
    }

    const targetStock = currentVariant ? currentVariant.stock : getTotalStock;

    if (targetStock <= 0) {
      toast({
        title: "This variant is out of stock",
        variant: "destructive",
      });
      return;
    }

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => 
          item.productId === getCurrentProductId && 
          item.size === selectedSize && item.color === selectedColor
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > targetStock) {
          toast({
            title: `Only ${targetStock} quantity can be added for this item`,
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
        size: selectedSize,
        color: selectedColor,
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

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setSelectedSize("");
    setSelectedColor("");
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) {
      dispatch(getReviews(productDetails?._id));
      dispatch(checkProductPurchase({ userId: user?.id, productId: productDetails?._id }));
    }
  }, [productDetails, dispatch, user?.id]);

  console.log(reviews, "reviews");

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
      reviews.length
      : 0;

  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    if (productDetails) {
      setMainImage(productDetails.image);
    }
  }, [productDetails]);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:p-6 md:p-8 max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] overflow-y-auto max-h-[95vh] bg-white">
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-lg bg-muted aspect-[3/4]">
            <img
              src={mainImage || productDetails?.image}
              alt={productDetails?.title}
              width={600}
              height={800}
              className="w-full h-full object-cover transition-all duration-300 ease-in-out"
            />
          </div>
          {productDetails?.images && productDetails.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20">
              {productDetails.images.map((imgUrl, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(imgUrl)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 ${mainImage === imgUrl
                      ? "border-primary scale-105 shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-muted-foreground"
                    }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${productDetails?.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="">
          <div>
            <h1 className="text-4xl font-semibold leading-tight">{productDetails?.title}</h1>
            <p className="text-muted-foreground text-base mb-8 mt-6 leading-relaxed">
              {productDetails?.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-2xl font-semibold text-primary ${
                (currentVariant ? currentVariant.salePrice > 0 : productDetails?.salePrice > 0) 
                ? "line-through text-muted-foreground text-lg" 
                : ""
              }`}
            >
              ${currentVariant ? currentVariant.price : productDetails?.price}
            </p>
            {(currentVariant ? currentVariant.salePrice > 0 : productDetails?.salePrice > 0) ? (
              <p className="text-2xl font-semibold text-primary">
                ${currentVariant ? currentVariant.salePrice : productDetails?.salePrice}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              <StarRatingComponent rating={averageReview} />
            </div>
            <span className="text-muted-foreground">
              ({averageReview.toFixed(2)})
            </span>
          </div>
          <div className="flex flex-col gap-6 mt-8">
            {productDetails?.sizes && productDetails.sizes.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {productDetails.sizes.map((size) => {
                    const isOutOfStock = isVariantOutOfStock(size, selectedColor || productDetails?.colors?.[0] || "");
                    return (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-all duration-200 rounded-none ${
                          isOutOfStock
                            ? "line-through opacity-50 cursor-not-allowed"
                            : selectedSize === size
                            ? "ring-2 ring-primary ring-offset-2 scale-105"
                            : "hover:bg-secondary/20"
                        }`}
                      >
                        {size}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {productDetails?.colors && productDetails.colors.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {productDetails.colors.map((color) => {
                    const isOutOfStock = isVariantOutOfStock(selectedSize || productDetails?.sizes?.[0] || "", color);
                    return (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        onClick={() => !isOutOfStock && setSelectedColor(color)}
                        disabled={isOutOfStock}
                        className={`w-8 h-8 p-1 transition-all duration-200 rounded-none ${
                          isOutOfStock
                            ? "line-through opacity-50 cursor-not-allowed"
                            : selectedColor === color
                            ? "ring-2 ring-primary ring-offset-2 scale-105"
                            : "hover:bg-secondary/20"
                        }`}
                      >
                        <div
                          className={`w-full h-full ${isOutOfStock ? "line-through" : ""}`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-8 mb-8 flex flex-col gap-4">
            {(selectedSize && selectedColor && currentVariant && currentVariant.stock <= 0) ||
             (!productDetails?.variants && productDetails?.totalStock <= 0) ? (
              <Button className="w-full opacity-60 cursor-not-allowed h-12 rounded-none uppercase font-semibold" disabled>
                Out of Stock
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full h-12 text-base font-semibold bg-black hover:bg-gray-800 shadow-none hover:shadow-none transition-all duration-300 rounded-none uppercase"
                  onClick={() =>
                    handleAddToCart(
                      productDetails?._id,
                      productDetails?.totalStock
                    )
                  }
                >
                  Add to Cart
                </Button>
                {currentVariant && (
                  <p className="text-sm text-center text-muted-foreground">
                    Còn lại {currentVariant.stock} sản phẩm
                  </p>
                )}
              </div>
            )}
          </div>
          <Separator />
          <div className="max-h-[300px] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="grid gap-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem, index) => (
                  <div key={index} className="flex gap-4">
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{reviewItem?.userName}</h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <h1>No Reviews</h1>
              )}
            </div>
            <div className="mt-10 flex-col flex gap-2">
              <Label>Write a Review</Label>
              {hasPurchased ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    <StarRatingComponent
                      rating={rating}
                      handleRatingChange={handleRatingChange}
                    />
                  </div>
                  <Input
                    name="reviewMsg"
                    value={reviewMsg}
                    onChange={(event) => setReviewMsg(event.target.value)}
                    placeholder="Write a review..."
                  />
                  <Button
                    onClick={handleAddReview}
                    disabled={reviewMsg.trim() === "" || rating === 0}
                  >
                    Submit
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-3 border rounded bg-muted/20">
                  You need to purchase this product to leave a review.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;

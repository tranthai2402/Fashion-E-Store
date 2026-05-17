import { StarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchProductDetails,
  setProductDetails,
} from "@/store/shop/products-slice";
import { useEffect, useMemo, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { checkProductPurchase } from "@/store/shop/order-slice";
import { useParams, useNavigate } from "react-router-dom";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { productDetails, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { hasPurchased } = useSelector((state) => state.shopOrder);
  const { toast } = useToast();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
    }
    return () => {
      dispatch(setProductDetails());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (productDetails) {
      dispatch(getReviews(productDetails._id));
      dispatch(checkProductPurchase({ userId: user?.id, productId: productDetails._id }));
      const firstImage =
        productDetails?.images?.[0] || productDetails?.image || "";
      setMainImage(firstImage);
      setCurrentImageIndex(0);
      if (productDetails?.colors?.length > 0) {
        setSelectedColor(productDetails.colors[0]);
      }
    }
  }, [productDetails, dispatch]);

  const images = productDetails?.images?.length > 0
    ? productDetails.images
    : productDetails?.image
    ? [productDetails.image]
    : [];

  const normalizeColor = (value) => String(value || "").trim().toLowerCase();

  const explicitColorToImageMap = useMemo(() => {
    const map = {};
    const colorImageMap = Array.isArray(productDetails?.colorImageMap)
      ? productDetails.colorImageMap
      : [];
    colorImageMap.forEach((item) => {
      const key = normalizeColor(item?.color);
      const imageUrl = item?.imageUrl;
      if (!key || !imageUrl) return;
      map[key] = imageUrl;
    });
    return map;
  }, [productDetails?.colorImageMap]);

  const colorToImageMap = useMemo(() => {
    const map = { ...explicitColorToImageMap };
    const colorList = productDetails?.colors || [];
    colorList.forEach((color, index) => {
      if (!map[normalizeColor(color)] && images[index]) {
        map[normalizeColor(color)] = images[index];
      }
    });
    return map;
  }, [productDetails?.colors, images, explicitColorToImageMap]);

  const imageToColorMap = useMemo(() => {
    const map = {};
    const colorList = productDetails?.colors || [];
    colorList.forEach((color, index) => {
      if (images[index]) {
        map[images[index]] = color;
      }
    });
    return map;
  }, [productDetails?.colors, images]);

  const getImageByColor = (color) => colorToImageMap[normalizeColor(color)];

  const getColorByImage = (image) => imageToColorMap[image];

  const handleImageSelection = (index) => {
    if (!images[index]) return;
    const image = images[index];
    setMainImage(image);
    setCurrentImageIndex(index);
    const matchedColor = getColorByImage(image);
    if (matchedColor) {
      setSelectedColor(matchedColor);
    }
  };

  useEffect(() => {
    if (!selectedColor) return;
    const mappedImage = getImageByColor(selectedColor);
    if (!mappedImage) return;
    setMainImage(mappedImage);
    const mappedIndex = images.findIndex((img) => img === mappedImage);
    if (mappedIndex > -1) {
      setCurrentImageIndex(mappedIndex);
    }
  }, [selectedColor, images, colorToImageMap]);

  const getVariantStock = (size, color) => {
    if (!productDetails?.variants) return productDetails?.totalStock || 0;
    const variant = productDetails.variants.find(
      (v) => v.size === size && v.color === color
    );
    return variant ? variant.stock : 0;
  };

  const isVariantOutOfStock = (size, color) => {
    return getVariantStock(size, color) <= 0;
  };

  const currentVariant = productDetails?.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.reviewValue, 0) / reviews.length
      : 0;

  function handleAddToCart() {
    const isSizeMissing =
      productDetails?.sizes?.length > 0 && !selectedSize;
    const isColorMissing =
      productDetails?.colors?.length > 0 && !selectedColor;

    if (isSizeMissing || isColorMissing) {
      toast({
        title: `Please select ${
          isSizeMissing && isColorMissing
            ? "size and color"
            : isSizeMissing
            ? "a size"
            : "a color"
        }`,
        variant: "destructive",
      });
      return;
    }

    const targetStock = currentVariant
      ? currentVariant.stock
      : productDetails?.totalStock;

    if (targetStock <= 0) {
      toast({ title: "This variant is out of stock", variant: "destructive" });
      return;
    }

    const getCartItems = cartItems?.items || [];
    const existingItem = getCartItems.find(
      (item) =>
        item.productId === productDetails._id &&
        item.size === selectedSize &&
        item.color === selectedColor
    );
    if (existingItem && existingItem.quantity + 1 > targetStock) {
      toast({
        title: `Only ${targetStock} available for this variant`,
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: productDetails._id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems({ userId: user?.id }));
        toast({ title: "Added to bag" });
      } else {
        toast({
          title: data?.payload?.message || "Not available",
          variant: "destructive",
        });
      }
    });
  }

  function handleAddReview() {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    dispatch(
      addReview({
        productId: productDetails._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload?.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails._id));
        toast({ title: "Review added" });
      }
    });
  }

  function handlePrevImage() {
    const newIndex = (currentImageIndex - 1 + images.length) % images.length;
    handleImageSelection(newIndex);
  }

  function handleNextImage() {
    const newIndex = (currentImageIndex + 1) % images.length;
    handleImageSelection(newIndex);
  }

  if (isLoading || !productDetails) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayPrice = currentVariant
    ? currentVariant.price
    : productDetails.price;
  const displaySalePrice = currentVariant
    ? currentVariant.salePrice
    : productDetails.salePrice;
  const hasSale = displaySalePrice > 0;
  const isOutOfStock =
    (currentVariant && currentVariant.stock <= 0) ||
    (!productDetails.variants && productDetails.totalStock <= 0);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left — Image Gallery */}
        <div className="relative bg-[#f5f5f0] flex flex-col">
          <div className="sticky top-14 flex flex-col h-[calc(100vh-56px)]">
            <div className="flex-1 relative flex items-center justify-center p-8 lg:p-16 overflow-hidden">
              <img
                src={mainImage || productDetails.image}
                alt={productDetails.title}
                className="max-w-full max-h-full object-contain"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {images.length > 1 && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 tracking-wider">
                  <span className="text-black font-medium">
                    {currentImageIndex + 1}
                  </span>
                  <br />
                  <span className="inline-block w-3 h-[1px] bg-gray-300 my-1" />
                  <br />
                  {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 px-8 pb-6 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageSelection(index)}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border-none cursor-pointer p-0 bg-transparent ${
                      currentImageIndex === index
                        ? "opacity-100 ring-1 ring-black"
                        : "opacity-50 hover:opacity-80"
                    } transition-all duration-200`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Product Details */}
        <div className="bg-white px-8 lg:px-16 py-12 lg:py-16 flex flex-col">
          <div className="max-w-md">
            {/* Title */}
            <h1 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-900 leading-relaxed">
              {productDetails.title}
            </h1>

            {/* Color label */}
            {selectedColor && (
              <p className="text-[11px] uppercase tracking-[0.15em] text-gray-500 mt-3">
                {selectedColor}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mt-6">
              {hasSale ? (
                <>
                  <span className="text-xs tracking-[0.1em] text-gray-400 line-through">
                    ${displayPrice}
                  </span>
                  <span className="text-xs tracking-[0.1em] text-gray-900 font-medium">
                    ${displaySalePrice}
                  </span>
                </>
              ) : (
                <span className="text-xs tracking-[0.1em] text-gray-900 font-medium">
                  ${displayPrice}
                </span>
              )}
            </div>

            {/* Rating */}
            {reviews?.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-[2px]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.round(averageReview)
                          ? "fill-gray-900 text-gray-900"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] tracking-[0.1em] text-gray-400">
                  ({reviews.length})
                </span>
              </div>
            )}

            <Separator className="my-8" />

            {/* Size Selection */}
            {productDetails.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-900">
                    Size
                  </span>
                  <button className="text-[10px] uppercase tracking-[0.15em] text-gray-500 hover:text-black transition-colors bg-transparent border-none cursor-pointer underline underline-offset-4">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {productDetails.sizes.map((size) => {
                    const outOfStock = isVariantOutOfStock(
                      size,
                      selectedColor || productDetails.colors?.[0] || ""
                    );
                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        disabled={outOfStock}
                        className={`h-10 flex items-center justify-center text-[10px] uppercase tracking-[0.15em] border cursor-pointer transition-all duration-200 bg-transparent ${
                          outOfStock
                            ? "text-gray-300 border-gray-200 cursor-not-allowed line-through"
                            : selectedSize === size
                            ? "border-black text-black font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {productDetails.colors?.length > 0 && (
              <div className="mb-8">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-900 block mb-4">
                  Color
                </span>
                <div className="flex gap-3">
                  {productDetails.colors.map((color) => {
                    const outOfStock = isVariantOutOfStock(
                      selectedSize || productDetails.sizes?.[0] || "",
                      color
                    );
                    return (
                      <button
                        key={color}
                        onClick={() => !outOfStock && setSelectedColor(color)}
                        disabled={outOfStock}
                        className={`w-7 h-7 border p-0.5 cursor-pointer transition-all duration-200 bg-transparent ${
                          outOfStock
                            ? "opacity-30 cursor-not-allowed"
                            : selectedColor === color
                            ? "border-black ring-1 ring-black ring-offset-2"
                            : "border-gray-300 hover:border-gray-500"
                        }`}
                      >
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-[10px] uppercase tracking-[0.1em] leading-[2] text-gray-600 mb-8">
              {productDetails.description}
            </p>

            {/* Stock info */}
            {currentVariant && currentVariant.stock > 0 && currentVariant.stock < 10 && (
              <p className="text-[10px] uppercase tracking-[0.15em] text-red-600 mb-4">
                Only {currentVariant.stock} left in stock
              </p>
            )}

            {/* Add to Bag */}
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-4 bg-gray-300 text-white text-[11px] font-semibold uppercase tracking-[0.3em] cursor-not-allowed border-none"
              >
                Out of Stock
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-black text-white text-[11px] font-semibold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all duration-300 border-none cursor-pointer"
              >
                Add to Bag
              </button>
            )}

            {/* Links */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[10px] uppercase tracking-[0.15em] text-gray-700 hover:text-black transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                More Details
                <ChevronRight
                  className={`w-3 h-3 transition-transform duration-200 ${
                    showDetails ? "rotate-90" : ""
                  }`}
                />
              </button>
              {showDetails && (
                <div className="pl-0 pb-4">
                  <p className="text-[10px] uppercase tracking-[0.1em] leading-[2] text-gray-500">
                    {productDetails.description}
                  </p>
                </div>
              )}
              <button
                onClick={() => navigate("/shop/about")}
                className="block text-[10px] uppercase tracking-[0.15em] text-gray-700 hover:text-black transition-colors bg-transparent border-none cursor-pointer"
              >
                Contact Us &rsaquo;
              </button>
              <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400">
                Complementary Alterations
              </p>
            </div>

            <Separator className="my-10" />

            {/* Reviews Section */}
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-900 mb-6">
                Reviews ({reviews?.length || 0})
              </h2>

              {/* Add Review */}
              {hasPurchased ? (
                <div className="mb-8">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="bg-transparent border-none cursor-pointer p-0"
                    >
                      <StarIcon
                        className={`w-4 h-4 transition-colors ${
                          star <= rating
                            ? "fill-gray-900 text-gray-900"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={reviewMsg}
                    onChange={(e) => setReviewMsg(e.target.value)}
                    placeholder="Write a review..."
                    className="flex-1 border-0 border-b border-gray-200 bg-transparent py-2 text-[11px] text-gray-700 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleAddReview}
                    className="px-6 py-2 bg-black text-white text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors border-none cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
              ) : (
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-8 p-4 bg-gray-50 border border-gray-100 italic">
                  You must purchase this item to share your thoughts.
                </p>
              )}

              {/* Review List */}
              <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((reviewItem, idx) => (
                    <div key={idx} className="flex gap-4">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-[10px] font-medium">
                          {reviewItem.userName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-900">
                          {reviewItem.userName}
                        </p>
                        <div className="flex items-center gap-[2px] mt-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`w-3 h-3 ${
                                star <= reviewItem.reviewValue
                                  ? "fill-gray-900 text-gray-900"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] tracking-[0.05em] leading-[1.8] text-gray-500">
                          {reviewItem.reviewMessage}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">
                    No reviews yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

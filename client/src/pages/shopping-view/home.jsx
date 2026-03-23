import { ArrowRight, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { getFeatureImages } from "@/store/common-slice";
import menBanner from "@/assets/login_banner_2.jpg";
import womenBanner from "@/assets/banner_4.jpg";
import HistoryImg from "@/assets/homephoto_history.avif";

const categoriesWithImage = [
  {
    id: "women",
    label: "WOMEN'S COLLECTION",
    image: womenBanner,
  },
  {
    id: "men",
    label: "MEN'S COLLECTION",
    image: menBanner,
  },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList } = useSelector((state) => state.shopProducts);
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(categoryId) {
    sessionStorage.removeItem("filters");
    const currentFilter = { category: [categoryId] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/shop/listing");
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock, size, color) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        size,
        color,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      } else {
        toast({
          title:
            data?.payload?.message || "Requested quantity is not available",
          variant: "destructive",
        });
      }
    });
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (featureImageList?.length || 1));
    }, 15000);
    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div>
      {/* ===== Section 1: Hero Banner — z-10, stays behind ===== */}
      <div className="sticky top-0 z-10 h-screen">
        <section className="relative w-full h-full overflow-hidden bg-gray-900">
          {featureImageList && featureImageList.length > 0
            ? featureImageList.map((slide, index) => (
                <img
                  src={slide?.image}
                  key={index}
                  alt=""
                  className={`${
                    index === currentSlide
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105"
                  } absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-in-out`}
                />
              ))
            : null}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {featureImageList?.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentSlide(
                    (prev) =>
                      (prev - 1 + featureImageList.length) %
                      featureImageList.length
                  )
                }
                className="absolute top-1/2 left-6 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 cursor-pointer"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentSlide(
                    (prev) => (prev + 1) % featureImageList.length
                  )
                }
                className="absolute top-1/2 right-6 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 cursor-pointer"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10">
            <h1
              className="text-6xl md:text-8xl font-light tracking-wider mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Spring 26
            </h1>
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/70 mb-10">
              By Cristiano Tran
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleNavigateToListingPage("women")}
                className="px-8 py-3 border border-white/60 text-[11px] uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all duration-300 bg-transparent cursor-pointer"
              >
                Discover Women's
              </button>
              <button
                onClick={() => handleNavigateToListingPage("men")}
                className="px-8 py-3 border border-white/60 text-[11px] uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all duration-300 bg-transparent cursor-pointer"
              >
                Discover Men's
              </button>
            </div>
          </div>

          {featureImageList?.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {featureImageList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-8 h-[2px] transition-all duration-300 border-none cursor-pointer ${
                    index === currentSlide ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ===== Section 2: Ready to Wear — z-20, slides over hero ===== */}
      <div className="sticky top-0 z-20 min-h-screen">
        <section className="min-h-screen bg-[#f5f5f0] flex flex-col justify-center px-6 md:px-10 py-20 rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between mb-10 max-w-6xl mx-auto w-full">
            <h2
              className="text-2xl font-semibold tracking-wider uppercase text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready to Wear
            </h2>
            <button
              onClick={() => navigate("/shop/listing")}
              className="text-[11px] uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors bg-transparent border-none cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-6xl mx-auto w-full">
            {categoriesWithImage.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleNavigateToListingPage(cat.id)}
                className="group relative aspect-[3/4] bg-gray-100 overflow-hidden cursor-pointer max-h-[750px]"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-white">
                    {cat.label}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== Section 3: The Pursuit of Perfection — z-30, slides over section 2 ===== */}
      <div className="sticky top-0 z-30 min-h-screen">
        <section className="min-h-screen bg-white flex items-center px-6 md:px-10 py-24 rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.1)]">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-20">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4">
                Savoir-Faire
              </p>
              <h2
                className="text-3xl md:text-4xl font-light tracking-wider uppercase text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                The Pursuit of Perfection
              </h2>
              <div className="w-12 h-[1px] bg-gray-300 mx-auto mt-6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="order-2 lg:order-1">
                <img
                  src={HistoryImg}
                  alt="Craftsmanship detail"
                  className="w-full h-auto grayscale"
                />
              </div>

              <div className="order-1 lg:order-2 flex flex-col justify-center">
                <blockquote className="mb-12">
                  <p
                    className="text-xl md:text-2xl font-light italic leading-relaxed text-gray-800"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    "True luxury does not lie in ostentatious logos, but is
                    concealed within the most exquisite details that sometimes
                    only the wearer can fully perceive."
                  </p>
                </blockquote>

                <div className="space-y-6">
                  <p className="text-[11px] uppercase tracking-[0.12em] leading-[2.2] text-gray-600">
                    At our house, we do not compromise with mediocrity. Every
                    design bearing the brand's name is a testament to the
                    pinnacle of tailoring heritage, preserved and honed over
                    years in our ateliers.
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.12em] leading-[2.2] text-gray-600">
                    From the softest drapes of silk organza and meticulously
                    hand-treated leathers to the signature sharp, structured
                    shoulders—every material must surpass the most rigorous
                    standards before being touched by our artisans.
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.12em] leading-[2.2] text-gray-600">
                    We believe that a creation from our house is not merely a
                    garment for a single season, but a timeless investment. It is
                    the flawless culmination of modern innovation and masterful
                    craftsmanship, resulting in absolute precision in cut,
                    elevating the wearer's silhouette, and enduring the test of
                    time.
                  </p>
                </div>

                <div className="mt-12">
                  <button
                    onClick={() => navigate("/shop/about")}
                    className="px-10 py-4 border border-gray-900 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 bg-transparent cursor-pointer"
                  >
                    Discover Our Heritage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===== Section 4: Closing + Footer spacer — z-40, slides over section 3 ===== */}
      <div className="relative z-40">
        <section className="py-20 px-6 md:px-10 bg-gray-50 rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.08)]">
          <div className="max-w-2xl mx-auto text-center">
            <p
              className="text-lg md:text-xl font-light italic leading-relaxed text-gray-700"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              "When you wear our design, you are wearing a history of pride and
              sartorial integrity."
            </p>
            <div className="w-12 h-[1px] bg-gray-300 mx-auto mt-8" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mt-6">
              A Heritage of Excellence
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ShoppingHome;

import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Loader2, Tag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFeatureImages, setHeaderTextColor } from "@/store/common-slice";
import { fetchBestSellingProducts, fetchSaleProducts } from "@/store/shop/products-slice";
import ShoppingFooter from "@/components/shopping-view/footer";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
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

const bestSellerCategories = [
  { id: "", label: "ALL" },
  { id: "women", label: "WOMEN" },
  { id: "men", label: "MEN" },
  { id: "accessories", label: "ACCESSORIES" },
  { id: "footwear", label: "FOOTWEAR" },
  { id: "jewelry", label: "JEWELRY" },
  { id: "handbag", label: "HANDBAG" },
];

const HERO_SLIDE_INTERVAL_MS = 5000;
const SCROLL_LOCK_MS = 950;
const SECTION_ANIMATION_CLASS =
  "transition-transform duration-700 ease-in-out will-change-transform";

import { motion } from "framer-motion";

function FlashSaleSlider({ products }) {
  const containerRef = useRef(null);

  if (!products || products.length === 0) return null;

  const scrollManual = (direction) => {
    if (containerRef.current) {
      // Calculate scroll amount for exactly 2 products
      const isMobile = window.innerWidth < 768;
      const productWidth = isMobile ? 180 : 280;
      const gap = isMobile ? 16 : 32;
      const scrollAmount = (productWidth + gap) * 2;
      
      containerRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full relative group/slider select-none">
      {/* Navigation Buttons */}
      <button 
        onClick={() => scrollManual(-1)}
        className="absolute left-0 top-[40%] -translate-y-1/2 z-30 p-2 md:p-3 bg-white/90 rounded-full shadow-lg text-black hover:bg-black hover:text-white transition-all cursor-pointer -translate-x-1/2"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 h-5" />
      </button>
      
      <button 
        onClick={() => scrollManual(1)}
        className="absolute right-0 top-[40%] -translate-y-1/2 z-30 p-2 md:p-3 bg-white/90 rounded-full shadow-lg text-black hover:bg-black hover:text-white transition-all cursor-pointer translate-x-1/2"
      >
        <ChevronRight className="w-4 h-4 md:w-5 h-5" />
      </button>

      <div 
        ref={containerRef}
        className="flex w-full gap-x-4 md:gap-x-8 overflow-x-hidden scroll-smooth py-4 mt-4"
      >
        {products.map((product) => (
          <div 
            key={product?._id} 
            className="w-[180px] md:w-[280px] flex-shrink-0"
          >
            <ShoppingProductTile product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedBestSellerCategory, setSelectedBestSellerCategory] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const activeFeatureImageList = featureImageList?.filter(
    (item) => item.enabled !== false
  );
  const { bestSellingProducts, saleProducts, isLoading: isProductsLoading } = useSelector(
    (state) => state.shopProducts
  );

  const scrollLockRef = useRef(false);
  const scrollLockTimerRef = useRef(null);

  const heroBanners = activeFeatureImageList?.length > 0 ? activeFeatureImageList : [{ _id: "default-hero", image: womenBanner }];
  
  // Define dynamic sections based on data availability
  const hasSales = saleProducts?.length > 0;
  
  const sections = useMemo(() => [
    ...heroBanners.map((banner, idx) => ({ type: "hero", data: banner, id: banner._id || `hero-${idx}` })),
    ...(hasSales ? [{ type: "sale", id: "sale-section" }] : []),
    { type: "bestseller", id: "bestseller-section" },
    { type: "history", id: "history-section" },
    { type: "footer", id: "footer-section" },
  ], [heroBanners, hasSales]);

  const maxIndex = sections.length - 1;

  const getSectionTransformClass = (sectionIndex) => {
    return sectionIndex <= activeIndex ? "translate-y-0" : "translate-y-full";
  };

  const moveSection = (direction) => {
    setActiveIndex((prev) =>
      Math.max(0, Math.min(maxIndex, prev + direction))
    );
  };

  const lockScroll = () => {
    scrollLockRef.current = true;
    clearTimeout(scrollLockTimerRef.current);
    scrollLockTimerRef.current = setTimeout(() => {
      scrollLockRef.current = false;
    }, SCROLL_LOCK_MS);
  };

  const handleSeeMore = (nextIndex) => {
    if (activeIndex !== nextIndex) {
      lockScroll();
      setActiveIndex(nextIndex);
    }
  };

  function handleNavigateToListingPage(categoryId) {
    sessionStorage.removeItem("filters");
    const currentFilter = { category: [categoryId] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/shop/listing");
  }

  useEffect(() => {
    dispatch(getFeatureImages());
    dispatch(fetchSaleProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBestSellingProducts(selectedBestSellerCategory));
  }, [dispatch, selectedBestSellerCategory]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, []);

  useEffect(() => {
    window.__homeActiveIndex = activeIndex;
    window.dispatchEvent(
      new CustomEvent("home-active-index-change", {
        detail: activeIndex,
      })
    );
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (scrollLockRef.current) return;

      let direction = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        direction = 1;
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        direction = -1;
      }

      if (!direction) return;

      e.preventDefault();
      lockScroll();
      moveSection(direction);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(scrollLockTimerRef.current);
    };
  }, []);

  const handleWheel = (e) => {
    const scrollableElement = e.target.closest(".overflow-y-auto");

    if (scrollableElement) {
      const isScrollingDown = e.deltaY > 0;
      const canScrollDown =
        scrollableElement.scrollHeight >
        Math.ceil(scrollableElement.scrollTop + scrollableElement.clientHeight);
      const canScrollUp = scrollableElement.scrollTop > 0;

      if ((isScrollingDown && canScrollDown) || (!isScrollingDown && canScrollUp)) {
        return;
      }
    }

    e.preventDefault();

    if (scrollLockRef.current) return;
    if (Math.abs(e.deltaY) < 6) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    lockScroll();
    moveSection(direction);
  };

  // Effect to update header text color based on active section
  useEffect(() => {
    const activeSection = sections[activeIndex];
    
    // Default to black text on white background sections
    let color = "black";

    if (activeSection?.type === "hero") {
      color = "white"; // Only hero banners have dark backgrounds at the top
    }

    dispatch(setHeaderTextColor(color));
  }, [activeIndex, sections.length]);

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      onWheel={handleWheel}
    >
      {sections.map((section, index) => (
        <div
          key={section.id}
          style={{ zIndex: index }}
          className={`absolute inset-0 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
            index
          )}`}
        >
          {section.type === "hero" && (
            <section className="relative h-full w-full overflow-hidden bg-black group/hero">
              <img
                src={section.data.image}
                alt="Banner"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2s] group-hover/hero:scale-110"
              />
              <div className="absolute inset-0 bg-black/35" />

              {/* Lookbook Link Button */}
              {section.data.lookbookId && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    onClick={() => navigate(`/shop/lookbook/${section.data.lookbookId}`)}
                    className="group/btn relative px-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-white text-[11px] font-black uppercase tracking-[0.4em] overflow-hidden transition-all hover:bg-white hover:text-black hover:border-white shadow-2xl scale-90 hover:scale-100"
                  >
                    <span className="relative z-10">Discover Lookbook</span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                  </motion.button>
                </div>
              )}
            </section>
          )}

          {section.type === "sale" && (
            <section className="min-h-screen w-full overflow-hidden bg-white">
              <div className="flex flex-col px-6 pt-12 pb-24 md:px-10">
                <div className="mx-auto mb-4 flex w-full max-w-7xl flex-col items-center justify-center text-center">
                  <div className="bg-red-600 p-2 rounded-lg mb-4">
                     <Tag className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl md:text-3xl font-light uppercase tracking-[0.24em] text-red-600"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Flash Deals
                    </h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 text-center">Limited time offers</p>
                  </div>
                </div>

                <div className="mx-auto w-full max-w-7xl pb-10">
                  <FlashSaleSlider products={saleProducts} />
                </div>
              </div>
            </section>
          )}

          {section.type === "bestseller" && (
            <section className="h-screen w-full overflow-hidden bg-white">
              <div className="flex h-full flex-col px-6 pt-24 pb-12 md:px-10">
                <div className="mx-auto mb-6 flex w-full max-w-7xl flex-col items-center gap-4">
                  <div className="flex w-full items-center justify-between">
                    <div className="hidden w-20 md:block" />
                    <h2
                      className="text-2xl md:text-3xl font-light uppercase tracking-[0.24em] text-gray-900"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Best Sellers
                    </h2>
                    <button
                      onClick={() =>
                        selectedBestSellerCategory
                          ? handleNavigateToListingPage(selectedBestSellerCategory)
                          : navigate("/shop/listing")
                      }
                      className="border-none bg-transparent text-[10px] uppercase tracking-widest text-gray-500 transition-colors hover:text-black cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    {bestSellerCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedBestSellerCategory(cat.id)}
                        className={`border-none bg-transparent py-1 text-[10px] uppercase tracking-[0.16em] transition-all cursor-pointer ${selectedBestSellerCategory === cat.id
                            ? "text-black font-medium border-b border-black"
                            : "text-gray-400 hover:text-black"
                          }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                  {isProductsLoading ? (
                    <div className="flex h-64 w-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : bestSellingProducts?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
                      {bestSellingProducts.map((product) => (
                        <ShoppingProductTile key={product?._id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">
                        No best-selling items found in this category.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {section.type === "history" && (
            <section className="h-screen w-full overflow-hidden bg-white">
              <div className="mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-14 px-6 py-20 md:px-10 lg:grid-cols-2">
                <div className="order-2 lg:order-1">
                  <img
                    src={HistoryImg}
                    alt="Craftsmanship detail"
                    className="h-[58vh] w-full object-cover grayscale"
                  />
                </div>

                <div className="order-1 lg:order-2 flex flex-col justify-center">
                  <p className="mb-4 text-[10px] uppercase tracking-widest text-gray-400">
                    Savoir-Faire
                  </p>
                  <h2
                    className="text-2xl md:text-3xl font-light uppercase tracking-[0.22em] text-gray-900"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    The Pursuit Of Perfection
                  </h2>
                  <p
                    className="mt-8 text-[11px] italic leading-relaxed text-gray-700"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    &quot;True luxury does not lie in ostentatious logos, but is
                    concealed within the most exquisite details that sometimes only
                    the wearer can fully perceive.&quot;
                  </p>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.16em] leading-[2.1] text-gray-500">
                    Every creation is a study in precision, purity, and modern
                    tailoring spirit. Materials are selected with uncompromising
                    standards to shape silhouettes that endure beyond seasons.
                  </p>
                  <button
                    onClick={() => navigate("/shop/about")}
                    className="mt-8 self-start border border-gray-900 bg-transparent px-8 py-3 text-[10px] uppercase tracking-widest text-gray-900 transition-all duration-300 hover:bg-gray-900 hover:text-white cursor-pointer"
                  >
                    Discover Our Heritage
                  </button>
                </div>
              </div>
            </section>
          )}

          {section.type === "footer" && (
            <div className="absolute inset-x-0 bottom-0 w-full">
              <ShoppingFooter />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ShoppingHome;

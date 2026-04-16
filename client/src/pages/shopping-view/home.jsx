import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFeatureImages } from "@/store/common-slice";
import { fetchBestSellingProducts } from "@/store/shop/products-slice";
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
  const { bestSellingProducts, isLoading: isProductsLoading } = useSelector(
    (state) => state.shopProducts
  );

  const scrollLockRef = useRef(false);
  const scrollLockTimerRef = useRef(null);

  const heroBanners = activeFeatureImageList?.length > 0 ? activeFeatureImageList : [{ _id: "default-hero", image: womenBanner }];
  const heroCount = heroBanners.length;
  const maxIndex = heroCount + 4; // heroCount + 5 sections - 1

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
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBestSellingProducts(selectedBestSellerCategory));
  }, [dispatch, selectedBestSellerCategory]);

  // Section 2 banner auto-rotate (loop every 2 seconds)
  useEffect(() => {
    if (!activeFeatureImageList?.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeFeatureImageList.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [activeFeatureImageList]);

  useEffect(() => {
    if (activeFeatureImageList?.length && currentSlide >= activeFeatureImageList.length) {
      setCurrentSlide(0);
    }
  }, [activeFeatureImageList, currentSlide]);

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

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      onWheel={handleWheel}
    >
      {/* ===== Section 1: Hero Banners as Scrollable Sections ===== */}
      {heroBanners.map((slide, index) => (
        <div
          key={slide._id || index}
          style={{ zIndex: index }}
          className={`absolute inset-0 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
            index
          )}`}
        >
          <section className="relative h-full w-full overflow-hidden bg-black">
            <img
              src={slide.image}
              alt={`Hero banner ${index + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
          </section>
        </div>
      ))}

      {/* ===== Section 2: Spring Hero ===== */}
      <div
        style={{ zIndex: heroCount }}
        className={`absolute inset-0 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          heroCount
        )}`}
      >
        <section className="relative h-full w-full overflow-hidden rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.25)] bg-gray-900">
          {activeFeatureImageList?.length > 0 ? (
            activeFeatureImageList.map((slide, index) => (
              <img
                src={slide?.image}
                key={slide?._id || index}
                alt="Hero visual"
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${index === currentSlide
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-[1.04]"
                  }`}
              />
            ))
          ) : (
            <img
              src={womenBanner}
              alt="Hero visual"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />

          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center text-white">
            <h1
              className="text-6xl md:text-8xl font-light tracking-[0.08em]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Spring 26
            </h1>
            <p className="mt-3 text-[10px] uppercase tracking-[0.38em] text-white/75">
              By Cristiano Tran
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleNavigateToListingPage("women")}
                className="border border-white/60 bg-transparent px-8 py-3 text-[10px] uppercase tracking-[0.24em] text-white transition-all duration-300 hover:bg-white hover:text-black cursor-pointer"
              >
                Discover Women&apos;s
              </button>
              <button
                onClick={() => handleNavigateToListingPage("men")}
                className="border border-white/60 bg-transparent px-8 py-3 text-[10px] uppercase tracking-[0.24em] text-white transition-all duration-300 hover:bg-white hover:text-black cursor-pointer"
              >
                Discover Men&apos;s
              </button>
            </div>
          </div>

          {activeFeatureImageList?.length > 1 && (
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {activeFeatureImageList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-[2px] w-8 border-none transition-all duration-300 cursor-pointer ${index === currentSlide ? "bg-white" : "bg-white/35"
                    }`}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ===== Section 3: Ready To Wear ===== */}
      <div
        style={{ zIndex: heroCount + 1 }}
        className={`absolute inset-0 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          heroCount + 1
        )}`}
      >
        <section className="h-screen w-full overflow-hidden rounded-t-3xl bg-[#f5f5f0] shadow-[0_-20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex h-full flex-col justify-center px-6 py-20 md:px-10">
            <div className="mx-auto mb-10 flex w-full max-w-6xl items-center justify-between">
              <h2
                className="text-2xl font-light uppercase tracking-[0.2em] text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ready To Wear
              </h2>
              <button
                onClick={() => navigate("/shop/listing")}
                className="border-none bg-transparent text-[10px] uppercase tracking-widest text-gray-500 transition-colors hover:text-black cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 md:grid-cols-2">
              {categoriesWithImage.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleNavigateToListingPage(cat.id)}
                  className="group relative aspect-[3/4] max-h-[70vh] overflow-hidden border-none bg-transparent p-0 cursor-pointer"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/20" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6">
                    <p className="text-[10px] uppercase tracking-widest text-white">
                      {cat.label}
                    </p>
                    <ArrowRight className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ===== Section 4: Best Sellers ===== */}
      <div
        style={{ zIndex: heroCount + 2 }}
        className={`absolute inset-0 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          heroCount + 2
        )}`}
      >
        <section className="h-screen w-full overflow-hidden rounded-t-3xl bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
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
      </div>

      {/* ===== Section 5: The Pursuit Of Perfection ===== */}
      <div
        style={{ zIndex: heroCount + 3 }}
        className={`absolute inset-0 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          heroCount + 3
        )}`}
      >
        <section className="h-screen w-full overflow-hidden rounded-t-3xl bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.12)]">
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
      </div>

      {/* ===== Section 6: Footer ===== */}
      <div
        style={{ zIndex: heroCount + 4 }}
        className={`absolute inset-x-0 bottom-0 w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          heroCount + 4
        )}`}
      >
        <div className="rounded-t-3xl bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.1)] overflow-hidden">
          <ShoppingFooter />
        </div>
      </div>
    </div>
  );
}

export default ShoppingHome;

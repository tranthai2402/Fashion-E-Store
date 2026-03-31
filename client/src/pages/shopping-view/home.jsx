import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFeatureImages } from "@/store/common-slice";
import { fetchPublicVideoSettings } from "@/store/common/video-slice";
import { fetchBestSellingProducts } from "@/store/shop/products-slice";
import ShoppingFooter from "@/components/shopping-view/footer";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import menBanner from "@/assets/login_banner_2.jpg";
import womenBanner from "@/assets/banner_4.jpg";
import HistoryImg from "@/assets/homephoto_history.avif";
import duskVideo from "@/assets/dusk.mp4";
import carWindowVideo from "@/assets/car_window.mp4";
import telephoneVideo from "@/assets/telephone.mp4";

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
];

const HERO_VIDEO_SOURCES = [duskVideo, carWindowVideo, telephoneVideo];
const HERO_VIDEO_PLAYBACK_RATE = 0.8;
const HERO_VIDEO_SEGMENT_MS = 5000;

const SCROLL_LOCK_MS = 950;
const SECTION_ANIMATION_CLASS =
  "transition-transform duration-700 ease-in-out will-change-transform";

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentHeroVideoIndex, setCurrentHeroVideoIndex] = useState(0);
  const [isHeroVideoReady, setIsHeroVideoReady] = useState(false);
  const [selectedBestSellerCategory, setSelectedBestSellerCategory] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const activeFeatureImageList = featureImageList?.filter(
    (item) => item.enabled !== false
  );
  const { homeVideos: configuredHomeVideos } = useSelector(
    (state) => state.commonVideo
  );
  const { bestSellingProducts, isLoading: isProductsLoading } = useSelector(
    (state) => state.shopProducts
  );

  const scrollLockRef = useRef(false);
  const scrollLockTimerRef = useRef(null);
  const heroVideoRef = useRef(null);
  const heroVideoSegmentTimerRef = useRef(null);

  const maxIndex = 5;
  const adminHomeVideoSources = (configuredHomeVideos || [])
    .map((item) => item.url)
    .filter(Boolean);
  const heroVideoSources =
    adminHomeVideoSources.length > 0 ? adminHomeVideoSources : HERO_VIDEO_SOURCES;

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

  const handleSeeMore = () => {
    if (activeIndex !== 1) {
      lockScroll();
      setActiveIndex(1);
    }
  };

  const queueNextHeroVideo = () => {
    clearTimeout(heroVideoSegmentTimerRef.current);
    heroVideoSegmentTimerRef.current = setTimeout(() => {
      setCurrentHeroVideoIndex((prev) => (prev + 1) % heroVideoSources.length);
    }, HERO_VIDEO_SEGMENT_MS);
  };

  function handleNavigateToListingPage(categoryId) {
    sessionStorage.removeItem("filters");
    const currentFilter = { category: [categoryId] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/shop/listing");
  }

  function handlePrevSlide() {
    if (!activeFeatureImageList?.length) return;
    setCurrentSlide((prev) =>
      (prev - 1 + activeFeatureImageList.length) % activeFeatureImageList.length
    );
  }

  function handleNextSlide() {
    if (!activeFeatureImageList?.length) return;
    setCurrentSlide((prev) => (prev + 1) % activeFeatureImageList.length);
  }

  useEffect(() => {
    dispatch(getFeatureImages());
    dispatch(fetchPublicVideoSettings());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBestSellingProducts(selectedBestSellerCategory));
  }, [dispatch, selectedBestSellerCategory]);

  useEffect(() => {
    if (currentHeroVideoIndex >= heroVideoSources.length) {
      setCurrentHeroVideoIndex(0);
    }
  }, [currentHeroVideoIndex, heroVideoSources.length]);

  useEffect(() => {
    if (!activeFeatureImageList?.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeFeatureImageList.length);
    }, 12000);
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
      clearTimeout(heroVideoSegmentTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setIsHeroVideoReady(false);
  }, [currentHeroVideoIndex]);

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
      {/* ===== Section 1: Video Hero ===== */}
      <div
        className={`absolute inset-0 z-0 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          0
        )}`}
      >
        <section className="relative h-full w-full overflow-hidden bg-black">
          <video
            key={currentHeroVideoIndex}
            ref={heroVideoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadedData={(event) => {
              event.currentTarget.playbackRate = HERO_VIDEO_PLAYBACK_RATE;
              event.currentTarget.currentTime = 0;
              setIsHeroVideoReady(true);
              queueNextHeroVideo();
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isHeroVideoReady ? "opacity-100" : "opacity-0"
              }`}
          >
            <source
              src={heroVideoSources[currentHeroVideoIndex]}
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center">
            <p className="text-[10px] uppercase tracking-widest text-white">
              Women&apos;s Summer 26
            </p>
            <button
              onClick={handleSeeMore}
              className="mt-4 flex items-center gap-2 border-none bg-transparent text-[10px] uppercase tracking-widest text-white/90 transition-colors hover:text-white cursor-pointer"
            >
              See More
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.25} />
            </button>
          </div>
        </section>
      </div>

      {/* ===== Section 2: Spring Hero ===== */}
      <div
        className={`absolute inset-0 z-10 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          1
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

          {activeFeatureImageList?.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-6 top-1/2 z-20 -translate-y-1/2 h-10 w-10 border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 cursor-pointer"
              >
                <ChevronLeft className="mx-auto h-5 w-5" strokeWidth={1.4} />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-6 top-1/2 z-20 -translate-y-1/2 h-10 w-10 border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 cursor-pointer"
              >
                <ChevronRight className="mx-auto h-5 w-5" strokeWidth={1.4} />
              </button>
            </>
          )}

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
        className={`absolute inset-0 z-20 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          2
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
        className={`absolute inset-0 z-30 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          3
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
        className={`absolute inset-0 z-40 h-screen w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          4
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
        className={`absolute inset-x-0 bottom-0 z-50 w-full ${SECTION_ANIMATION_CLASS} ${getSectionTransformClass(
          5
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

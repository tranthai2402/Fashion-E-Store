import leatherImg from "@/assets/leather.png";
import shoesImg from "@/assets/shoes.png";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicVideoSettings } from "@/store/common/video-slice";
import axios from "axios";

const YOUTUBE_EMBED_URL =
  "https://www.youtube.com/embed/aqz-KE-bpKQ?autoplay=1&mute=1&controls=1&loop=1&playlist=aqz-KE-bpKQ&modestbranding=1&rel=0&playsinline=1";

const buildYoutubeEmbedUrl = (videoId) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=1&loop=1&playlist=${videoId}&modestbranding=1&rel=0&playsinline=1`;

const extractYoutubeVideoId = (rawUrl) => {
  const input = String(rawUrl || "").trim();
  if (!input) return "";

  try {
    const parsed = new URL(input);
    const host = String(parsed.hostname || "").toLowerCase();
    const path = String(parsed.pathname || "");

    if (host === "youtu.be") {
      return path.replace(/^\/+/, "").split("/")[0];
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      if (path.startsWith("/embed/")) return path.split("/embed/")[1]?.split("/")[0];
      if (path.startsWith("/shorts/")) return path.split("/shorts/")[1]?.split("/")[0];
      if (path.startsWith("/live/")) return path.split("/live/")[1]?.split("/")[0];
      const watchId = parsed.searchParams.get("v");
      if (watchId) return watchId;
    }
  } catch (_error) {
    // Keep regex fallback.
  }

  const fallbackMatch = input.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,})/
  );
  return fallbackMatch?.[1] || "";
};

const normalizeYoutubeEmbedUrl = (rawUrl) => {
  const input = String(rawUrl || "").trim();
  if (!input) return YOUTUBE_EMBED_URL;

  const videoId = extractYoutubeVideoId(input);
  if (!videoId) return input;
  return buildYoutubeEmbedUrl(videoId);
};

function ShoppingAbout() {
  const dispatch = useDispatch();
  const { aboutVideo } = useSelector((state) => state.commonVideo);
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    dispatch(fetchPublicVideoSettings());
    fetchPageData();
  }, [dispatch]);

  const fetchPageData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/page-settings/get/about");
      if (response.data.success) {
        setPageData(response.data.data.data);
      }
    } catch (e) {
      console.log("Error fetching page data", e);
    }
  };

  const aboutSourceType = aboutVideo?.sourceType || "youtube";
  const aboutVideoUrl =
    aboutSourceType === "upload"
      ? aboutVideo?.url || ""
      : normalizeYoutubeEmbedUrl(aboutVideo?.url || YOUTUBE_EMBED_URL);

  // Default values if no CMS data
  const content = pageData || {
    founderTitle: "The Founder",
    founderSubtitle: "Our Story",
    brandStoryLabel: "The brand story",
    historyTitle: "The History",
    valuesTitle: "Our Values",
    quote: "Thank you for your trust and journey with us on our development journey.",
    timeline: [
      { year: "2020", text: "The brand was founded upon a distinguished vision..." },
      { year: "2021", text: "The first collection was launched..." },
      { year: "2023", text: "Expanded product categories..." },
      { year: "2025", text: "Launched the e-commerce platform..." },
    ],
    values: [
      { title: "Quality", desc: "Every product is rigorously tested..." },
      { title: "Creativity", desc: "Continuously innovating in design..." },
      { title: "Commitment", desc: "Customer satisfaction is the measure of success." },
    ]
  };

  return (
    <div className="flex flex-col bg-white">
      {/* Founder Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="text-center mb-12">
          <h1 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-900 mb-2">
            {content.founderTitle}
          </h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
            {content.founderSubtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative aspect-video bg-black overflow-hidden">
            {aboutSourceType === "upload" && aboutVideoUrl ? (
              <video
                src={aboutVideoUrl}
                className="absolute inset-0 h-full w-full object-cover"
                controls
                playsInline
              />
            ) : (
              <iframe
                src={aboutVideoUrl}
                title="The Founder Story"
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
          </div>
          <div className="text-center mt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 leading-relaxed">
              {content.brandStoryLabel}
              <br />
              (c) Ecommerce Brand
              <br />
              Fashion House Canada
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6 md:px-10 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
            {content.historyTitle}
          </h2>
        </div>

        <section className="py-10 px-6 md:px-10">
          <div className="max-w-2xl mx-auto">
            <img src={leatherImg} alt="Brand heritage" className="w-full h-auto grayscale" />
          </div>
        </section>

        <div className="max-w-3xl mx-auto space-y-16">
          {content.timeline?.map((item, index) => (
            <div key={index} className="text-center">
              <h3 className="text-sm font-bold tracking-[0.15em] text-gray-900 mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
                {item.year}
              </h3>
              <p className="text-[11px] uppercase tracking-[0.08em] leading-[1.8] text-gray-700 max-w-2xl mx-auto font-medium">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Heritage Image */}
      <section className="py-10 px-6 md:px-10">
        <div className="max-w-2xl mx-auto">
          <img src={shoesImg} alt="Brand heritage" className="w-full h-auto grayscale" />
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
            {content.valuesTitle}
          </h2>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {content.values?.map((value, index) => (
            <div key={index} className="text-center">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 mb-4">
                {value.title}
              </h3>
              <p className="text-[11px] uppercase tracking-[0.2em] leading-[2] text-gray-500">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6 md:px-10 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-light italic text-gray-700 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
            "{content.quote}"
          </p>
          <div className="w-12 h-[1px] bg-gray-300 mx-auto mt-8" />
        </div>
      </section>
    </div>
  );
}

export default ShoppingAbout;

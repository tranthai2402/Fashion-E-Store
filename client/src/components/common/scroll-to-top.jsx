import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top immediately on route or search param change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // Fallback for some browsers or if scrolling is handled differently
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;

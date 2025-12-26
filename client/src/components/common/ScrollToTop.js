import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 *
 * PURPOSE: Automatically scroll to top of page on route change
 * USAGE: Place inside Router at the root level
 * BEHAVIOR: Scrolls to top whenever the pathname changes
 *
 * This solves the issue where navigating between pages
 * preserves the scroll position from the previous page.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;

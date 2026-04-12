import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop — Top-level Route Observer
 * Ensures that navigating between major routes (Login, Register, Dashboard)
 * always resets the window scroll position.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Force scroll to top on every navigation or refresh
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, [pathname]);

  return null;
}

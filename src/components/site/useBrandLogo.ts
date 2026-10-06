"use client";

import { useEffect, useState } from "react";
import { loadCmsRecords } from "@/lib/cms-client";
import { BRAND_LOGOS } from "@/lib/cms-data";

const fallback = BRAND_LOGOS[0].url;

export default function useBrandLogo(variant?: "dark" | "light" | "ecosystem") {
  const [logo, setLogo] = useState(fallback);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      loadCmsRecords("media").then((items) => {
        const selectedVariant = variant ?? (document.documentElement.dataset.theme === "light" ? "light" : "dark");
        const logos = items.filter((item) => item.type === "logo");
        const selected = logos.find((item) => item.variant === selectedVariant)
          ?? (selectedVariant === "light" ? logos[1] : selectedVariant === "dark" ? logos[0] : undefined)
          ?? items.find((item) => item.type === "logo" && item.active)
          ?? items.find((item) => item.type === "logo");
        if (active && selected) setLogo(selected.url);
      });
    };
    refresh();
    window.addEventListener("nghieng:content-updated", refresh);
    window.addEventListener("nghieng:theme-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.removeEventListener("nghieng:content-updated", refresh);
      window.removeEventListener("nghieng:theme-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [variant]);
  return logo;
}

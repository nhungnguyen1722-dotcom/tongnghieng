"use client";

import { useEffect, useState } from "react";
import { loadCmsRecords } from "@/lib/cms-client";
import { BRAND_LOGOS } from "@/lib/cms-data";

const fallback = BRAND_LOGOS[0].url;

export default function useBrandLogo() {
  const [logo, setLogo] = useState(fallback);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      loadCmsRecords("media").then((items) => {
        const selected = items.find((item) => item.type === "logo" && item.active) ?? items.find((item) => item.type === "logo");
        if (active && selected) setLogo(selected.url);
      });
    };
    refresh();
    window.addEventListener("nghieng:content-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("nghieng:content-updated", refresh);
    };
  }, []);
  return logo;
}

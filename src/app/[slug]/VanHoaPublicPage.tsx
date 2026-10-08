"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import type { CulturePageContent } from "../admin/page-data";
import styles from "./van-hoa-page.module.css";

const allowedTags = new Set(["p", "br", "strong", "b", "em", "i", "u", "h2", "h3", "h4", "ul", "ol", "li", "a", "img", "figure", "figcaption", "blockquote", "hr", "table", "thead", "tbody", "tr", "th", "td"]);

function sanitizeHtml(html: string) {
  const safeSource = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|svg|math|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  return safeSource.replace(/<\/?([a-z][\w:-]*)\b([^>]*)>/gi, (markup, rawName: string, attributes: string) => {
    const name = rawName.toLowerCase();
    if (!allowedTags.has(name)) return "";
    if (markup.startsWith("</")) return "</" + name + ">";
    if (name === "a") {
      const href = attributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
      const safeHref = /^(https?:\/\/|\/)/i.test(href) && !href.startsWith("//") ? href : "";
      return safeHref ? '<a href="' + safeHref.replace(/"/g, "&quot;") + '" target="_blank" rel="noopener noreferrer">' : "<a>";
    }
    if (name === "img") {
      const src = attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
      const alt = attributes.match(/\balt\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
      const safeSrc = /^(https:\/\/|\/)/i.test(src) && !src.startsWith("//") ? src : "";
      return safeSrc ? '<img src="' + safeSrc.replace(/"/g, "&quot;") + '" alt="' + alt.replace(/"/g, "&quot;") + '" loading="lazy" />' : "";
    }
    return ["br", "hr"].includes(name) ? "<" + name + " />" : "<" + name + ">";
  });
}

export default function VanHoaPublicPage({ content }: { content: CulturePageContent }) {
  const [tab, setTab] = useState<"presentation" | "content">("presentation");
  const [heroIndex, setHeroIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const heroSlides = useMemo(() => (content.sliders ?? []).filter((slide) => slide.enabled), [content.sliders]);
  const presentationSlides = useMemo(() => [...(content.presentationSlides ?? [])]
    .filter((slide) => slide.enabled && slide.status !== "disabled")
    .sort((left, right) => left.order - right.order), [content.presentationSlides]);
  const visibleHeroIndex = heroSlides.length ? heroIndex % heroSlides.length : 0;
  const visibleSlideIndex = presentationSlides.length ? slideIndex % presentationSlides.length : 0;
  const heroSlide = heroSlides[visibleHeroIndex];
  const presentationSlide = presentationSlides[visibleSlideIndex];

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = window.setInterval(() => setHeroIndex((current) => (current + 1) % heroSlides.length), 6000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const changeHero = (step: number) => {
    if (!heroSlides.length) return;
    setHeroIndex((current) => (current + step + heroSlides.length) % heroSlides.length);
  };
  const changePresentationSlide = (step: number) => {
    if (!presentationSlides.length) return;
    setSlideIndex((current) => (current + step + presentationSlides.length) % presentationSlides.length);
  };

  return <main className={styles.site}>
    <SiteHeader overHero />
    {content.active ? <>
      <section className={styles.hero} aria-label="Slider đầu trang">
        {heroSlide?.image && <img className={styles.heroImage} src={heroSlide.image} alt={heroSlide.title || content.name} />}
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}><span>NGHIENG COMPLEX</span><h1>{heroSlide?.title || content.heroTitle}</h1><p>{heroSlide?.description || content.heroDescription}</p></div>
        {heroSlides.length > 1 && <div className={styles.heroControls}><button type="button" aria-label="Slide trước" onClick={() => changeHero(-1)}>‹</button><span>{visibleHeroIndex + 1} / {heroSlides.length}</span><button type="button" aria-label="Slide tiếp theo" onClick={() => changeHero(1)}>›</button></div>}
      </section>
      <section className={styles.pageContent} aria-label="Văn hóa và Quy định">
        <div className={styles.tabBar} role="tablist" aria-label="Nội dung Văn hóa và Quy định">
          <button className={tab === "presentation" ? styles.tabActive : styles.tab} role="tab" aria-selected={tab === "presentation"} type="button" onClick={() => setTab("presentation")}>THUYẾT TRÌNH</button>
          <button className={tab === "content" ? styles.tabActive : styles.tab} role="tab" aria-selected={tab === "content"} type="button" onClick={() => setTab("content")}>NỘI DUNG</button>
        </div>
        {tab === "presentation" ? <section className={styles.presentation} role="tabpanel" aria-label="Slider thuyết trình">
          {presentationSlide ? <>
            <div className={styles.presentationImage}><img src={presentationSlide.image} alt={presentationSlide.name || presentationSlide.title} /></div>
            <div className={styles.presentationControls}><button type="button" aria-label="Ảnh trước" onClick={() => changePresentationSlide(-1)}>‹</button><span>{visibleSlideIndex + 1} / {presentationSlides.length}</span><button type="button" aria-label="Ảnh tiếp theo" onClick={() => changePresentationSlide(1)}>›</button></div>
          </> : <p className={styles.empty}>Chưa có ảnh thuyết trình đang bật.</p>}
        </section> : <article className={styles.article} role="tabpanel" aria-label="Nội dung văn hóa" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.contentHtml || "") }} />}
      </section>
    </> : <section className={styles.offline}><h1>{content.name}</h1><p>Trang hiện chưa được xuất bản.</p></section>}
    <SiteFooter />
  </main>;
}

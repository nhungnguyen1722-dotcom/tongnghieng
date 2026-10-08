"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ADMIN_PAGES, createDetailPageContent, hydratePageContent, readPageContent, type AdminPageContent } from "../admin/page-data";
import styles from "./public-content.module.css";
import editorialStyles from "./editorial.module.css";
import { loadCmsRecords } from "@/lib/cms-client";
import { CMS_SEEDS, type CmsArticle } from "@/lib/cms-data";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

const logo = "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/7d454ef94_nghieng_complex_logo_dark_transparent.png";
const heroImages = [
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/4e2c9afc5_slider-1-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9970d8492_slider-3-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9ddb1ea9d_banner-trang-chu-nghieng.webp",
];

function sanitizeArticleHtml(html: string) {
  const allowed = new Set(["p", "br", "strong", "b", "em", "i", "h2", "h3", "h4", "ul", "ol", "li", "a", "img", "figure", "figcaption", "blockquote", "hr"]);
  const withoutActiveContent = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|svg|math|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");

  return withoutActiveContent.replace(/<\/?([a-z][\w:-]*)\b([^>]*)>/gi, (tagMarkup, rawName: string, attributes: string) => {
    const name = rawName.toLowerCase();
    if (!allowed.has(name)) return "";
    if (tagMarkup.startsWith("</")) return `</${name}>`;
    if (name === "a") {
      const href = attributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
      const safeHref = /^(https?:\/\/|\/)/i.test(href) && !/^\/\//.test(href) ? href : "";
      return safeHref ? `<a href="${safeHref.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">` : "<a>";
    }
    if (name === "img") {
      const src = attributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
      const safeSrc = /^(https:\/\/|\/api\/media-assets\/)/i.test(src) ? src : "";
      const alt = attributes.match(/\balt\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
      return safeSrc ? `<img src="${safeSrc.replace(/"/g, "&quot;")}" alt="${alt.replace(/"/g, "&quot;")}" loading="lazy" />` : "";
    }
    return ["br", "hr"].includes(name) ? `<${name} />` : `<${name}>`;
  });
}

const ecosystemLinks = [
  ["Nghieng Travel", "/nghieng-travel"],
  ["Khoáng sản", "/khoang-san"],
  ["Công nghệ - AI", "/cong-nghe-ai"],
  ["Phát triển cộng đồng", "/phat-trien-cong-dong"],
  ["Giải pháp đồng hành", "/giai-phap-dong-hanh"],
  ["Nghieng Media", "/nghieng-media"],
];

function getFallback(slug: string, name?: string, path?: string) {
  const page = ADMIN_PAGES.find((item) => item.slug === slug);
  return createDetailPageContent(slug, name || page?.name || slug.replaceAll("-", " "), path || page?.path || `/${slug}`);
}

export default function PublicContentPage({ slug, name, path, initialContent }: { slug: string; name?: string; path?: string; initialContent?: AdminPageContent }) {
  const [content, setContent] = useState<AdminPageContent>(() => initialContent ?? getFallback(slug, name, path));
  const editorialKind = slug.startsWith("tin-tuc-") ? "news" : slug.startsWith("du-an-") ? "projects" : null;
  const editorialSlug = editorialKind ? slug.slice(editorialKind === "news" ? "tin-tuc-".length : "du-an-".length) : "";
  const [editorialItems, setEditorialItems] = useState<CmsArticle[]>(() => editorialKind === "news" ? CMS_SEEDS.news : editorialKind === "projects" ? CMS_SEEDS.projects : []);

  useEffect(() => {
    if (!editorialKind) return;
    loadCmsRecords(editorialKind).then((items) => setEditorialItems(items.filter((item) => item.active && (editorialKind === "projects" || item.status === "published"))));
  }, [editorialKind]);

  const editorialArticle = useMemo(() => editorialItems.find((item) => item.slug === editorialSlug), [editorialItems, editorialSlug]);
  const relatedArticles = useMemo(() => editorialItems.filter((item) => item.id !== editorialArticle?.id).slice(0, 3), [editorialArticle, editorialItems]);

  useEffect(() => {
    if (initialContent) return;
    const refresh = () => setContent(readPageContent(slug) || getFallback(slug, name, path));
    void hydratePageContent(slug);
    window.addEventListener("nghieng:content-updated", refresh);
    return () => window.removeEventListener("nghieng:content-updated", refresh);
  }, [initialContent, name, path, slug]);

  const pageIndex = Math.max(0, ADMIN_PAGES.findIndex((item) => item.slug === slug));
  const activeSlide = content.sliders.find((slider) => slider.enabled);
  const image = activeSlide?.image || heroImages[pageIndex % heroImages.length];
  const visibleSections = content.sections.filter((section) => section.enabled);

  if (editorialKind) {
    if (!editorialArticle) return <main className={editorialStyles.notFound}><SiteHeader /><h1>Không tìm thấy nội dung</h1><Link href={editorialKind === "news" ? "/tin-tuc" : "/du-an"}>Quay lại danh sách</Link><SiteFooter /></main>;
    return <main className={editorialStyles.site}>
      <SiteHeader />
      <article className={editorialStyles.article}>
        <nav className={editorialStyles.breadcrumb}><Link href="/">Trang chủ</Link><span>/</span><Link href={editorialKind === "news" ? "/tin-tuc" : "/du-an"}>{editorialKind === "news" ? "Tin tức" : "Dự án"}</Link><span>/</span><span>{editorialArticle.title}</span></nav>
        <header><span>{editorialArticle.category} · {editorialArticle.date}</span><h1>{editorialArticle.title}</h1><p>{editorialArticle.summary}</p>{editorialArticle.isDemo && <small>Dữ liệu minh họa</small>}</header>
        {editorialArticle.image && <img className={editorialStyles.cover} src={editorialArticle.image} alt={editorialArticle.title} />}
        {/<(?:p|div|h[1-6]|img|ul|ol|figure|blockquote|table)\b/i.test(editorialArticle.body)
          ? <div className={editorialStyles.body} dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(editorialArticle.body) }} />
          : <div className={editorialStyles.body}>{editorialArticle.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}
      </article>
      <section className={editorialStyles.related}><div><span>NỘI DUNG LIÊN QUAN</span><h2>{editorialKind === "news" ? "Tin tức liên quan" : "Dự án liên quan"}</h2></div><div className={editorialStyles.relatedGrid}>{relatedArticles.map((item) => <Link href={(editorialKind === "news" ? "/tin-tuc/" : "/du-an/") + item.slug} key={item.id}><img src={item.image} alt="" /><span>{item.category} · {item.date}</span><h3>{item.title}</h3><p>{item.summary}</p></Link>)}</div></section>
      <SiteFooter />
    </main>;
  }

  return (
    <main className={styles.site + " " + editorialStyles.publicSite}>
      <SiteHeader />
      <nav className={styles.nav} aria-label="Điều hướng public">
        <Link href="/"><img src={logo} alt="Nghieng Complex" /></Link>
        <div className={styles.navLinks}><Link href="/">Trang chủ</Link><Link className={slug === "gioi-thieu" ? styles.current : ""} href="/gioi-thieu">Giới thiệu</Link><details><summary>Hệ sinh thái</summary><div>{ecosystemLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div></details><Link href="/du-an">Dự án</Link><Link href="/cong-dong">Cộng đồng</Link><Link href="/tin-tuc">Tin tức</Link><Link href="/doi-tac">Đối tác</Link></div>
        <Link className={styles.contact} href="/lien-he">Kết nối với chúng tôi</Link>
      </nav>
      {!content.active ? <section className={styles.offline}><h1>{content.name}</h1><p>Trang hiện chưa được xuất bản.</p></section> : <>
        <section className={styles.hero}>
          <img src={image} alt={content.name} />
          <div className={styles.heroCopy}><span>NGHIENG COMPLEX</span><h1>{activeSlide?.title || content.heroTitle}</h1><p>{activeSlide?.description || content.heroDescription}</p><Link href="/lien-he">Liên hệ hợp tác <b>→</b></Link></div>
        </section>
        <section className={styles.intro}><div><span>01 / {content.name}</span><h2>{content.description}</h2><p>Trong hệ sinh thái Nghieng Complex, mỗi lĩnh vực được phát triển với tinh thần kết nối, minh bạch và hướng đến giá trị dài hạn cho đối tác, thành viên và cộng đồng.</p></div><div className={styles.introFacts}><b>01</b><span>Định hướng độc lập</span><b>02</b><span>Cộng hưởng nguồn lực</span><b>03</b><span>Phát triển bền vững</span></div></section>
        <section className={styles.contentSection}><div className={styles.sectionHeading}><span>NỘI DUNG ĐƯỢC QUẢN LÝ TỪ ADMIN</span><h2>Cùng tạo nên những giá trị <strong>bền vững</strong></h2></div><div className={styles.sectionGrid}>{visibleSections.map((section, index) => <article key={section.id}><small>0{index + 1}</small>{section.image && <img src={section.image} alt="" /> }<h3>{section.title}</h3><p>{section.description}</p>{section.body && <p>{section.body}</p>}<Link href={section.ctaUrl || "/lien-he"}>{section.ctaLabel || "Tìm hiểu thêm"} <b>→</b></Link></article>)}</div></section>
        <section className={styles.cta}><h2>Kết nối để cùng phát triển</h2><p>Hãy bắt đầu một cơ hội hợp tác mới với Nghieng Complex.</p><Link href="/lien-he">Liên hệ với Nghieng Complex</Link></section>
      </>}
      <SiteFooter />
    </main>
  );
}

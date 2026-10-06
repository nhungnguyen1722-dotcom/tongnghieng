"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import useBrandLogo from "@/components/site/useBrandLogo";
import { loadCmsRecords } from "@/lib/cms-client";
import { CMS_SEEDS, type CmsArticle } from "@/lib/cms-data";
import { defaultPageContent, hydratePageContent, readPageContent, type AdminPageContent } from "./admin/page-data";
import s from "./page.module.css";
import homeStyles from "./home-overrides.module.css";

const slides = [
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/4e2c9afc5_slider-1-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9970d8492_slider-3-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9ddb1ea9d_banner-trang-chu-nghieng.webp",
];
const ecosystem = [
  { name: "Nghieng Travel", path: "/nghieng-travel", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/99323fe9c_generated_ce3c7248.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/99323fe9c_generated_ce3c7248.webp", description: "Du lịch & nghỉ dưỡng với nhà hàng, khách sạn, bungalow, khu sinh thái và tour trong nước, quốc tế.", tags: ["Du lịch", "Nhà hàng", "Khách sạn", "Nghỉ dưỡng"] },
  { name: "Khoáng sản", path: "/khoang-san", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/0575d5b5e_generated_cd45ba2c.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/0575d5b5e_generated_cd45ba2c.webp", description: "Kết nối các dự án khai thác, sơ chế và thương mại khoáng sản cùng đối tác trên toàn quốc.", tags: ["Quặng sắt", "Than xít", "Vật liệu xây dựng"] },
  { name: "Công nghệ - AI", path: "/cong-nghe-ai", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/490b8b229_generated_d36d21f3.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/490b8b229_generated_d36d21f3.webp", description: "Ứng dụng công nghệ số và trí tuệ nhân tạo để kết nối con người, dữ liệu và doanh nghiệp.", tags: ["Công nghệ", "AI", "Chuyển đổi số"] },
  { name: "Phát triển cộng đồng", path: "/phat-trien-cong-dong", image: slides[0], description: "Đồng hành cùng cộng đồng địa phương để phát triển sinh kế, văn hóa, giáo dục và môi trường.", tags: ["Thiện nguyện", "Giáo dục", "Địa phương"] },
  { name: "Giải pháp đồng hành", path: "/giai-phap-dong-hanh", image: slides[1], description: "Chia sẻ nguồn lực, kinh nghiệm và giải pháp thiết thực cùng các thành viên trong hệ sinh thái.", tags: ["Đối tác", "Giải pháp", "Nguồn lực"] },
  { name: "Nghieng Media", path: "/nghieng-media", image: slides[2], description: "Lan tỏa những câu chuyện, thông tin và giá trị tích cực từ hệ sinh thái Nghieng Complex.", tags: ["Truyền thông", "Nội dung", "Sự kiện"] },
];
const benefits = [
  ["Kết nối", "Con người, doanh nghiệp, công nghệ, nguồn lực và cộng đồng trên cùng nền tảng."],
  ["Cộng hưởng", "Mỗi lĩnh vực vừa độc lập vừa thúc đẩy nhau, tạo chuỗi giá trị lớn hơn tổng các phần."],
  ["Gia tăng giá trị", "Chia sẻ nguồn lực, mở rộng khách hàng, tối ưu chi phí và nâng tầm trải nghiệm."],
  ["Bền vững", "Phát triển kinh tế gắn với trách nhiệm xã hội và bảo tồn bản sắc địa phương."],
];

const homeTextSnapshots = new WeakMap<HTMLElement, Map<string, { markup: string; value: string }>>();

function SectorIcon({ name }: { name?: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "globe": return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" /></svg>;
    case "layers": return <svg {...common}><path d="m12 2 10 5-10 5L2 7l10-5Z" /><path d="m2 12 10 5 10-5M2 17l10 5 10-5" /></svg>;
    case "cpu": return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" rx="1" /><path d="M9 2v2m6-2v2m0 16v2m-6-2v2M2 9h2m-2 6h2m16-6h2m-2 6h2" /></svg>;
    case "users": return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "trending-up": return <svg {...common}><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></svg>;
    case "shield": return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /></svg>;
    default: return <svg {...common}><circle cx="12" cy="12" r="10" /></svg>;
  }
}

function syncHomeText(element: Element | null, value: string | undefined, originalValue: string | undefined, key: string) {
  if (!element || value === undefined) return;
  const target = element as HTMLElement;
  let snapshots = homeTextSnapshots.get(target);
  if (!snapshots) {
    snapshots = new Map();
    homeTextSnapshots.set(target, snapshots);
  }
  let snapshot = snapshots.get(key);
  if (!snapshot) {
    snapshot = { markup: target.innerHTML, value: originalValue ?? "" };
    snapshots.set(key, snapshot);
  }
  if (snapshot.value === value) return;
  if (value === originalValue) target.innerHTML = snapshot.markup;
  else target.textContent = value;
  snapshot.value = value;
}

function applyHomeSections(root: HTMLElement, content: AdminPageContent, defaultSections: NonNullable<ReturnType<typeof defaultPageContent>>["sections"]) {
  const pageSections = Array.from(root.querySelectorAll<HTMLElement>(":scope > section")).filter((section) => !section.classList.contains(s.bottomCta));
  const hasManagedSectionIds = pageSections.some((element) => element.dataset.adminSectionId !== undefined);
  const elementById = new Map(defaultSections.map((section, index) => [section.id, pageSections.find((element) => element.dataset.adminSectionId === section.id) ?? (hasManagedSectionIds ? undefined : pageSections[index])] as const));
  const ordered: HTMLElement[] = [];

  content.sections.forEach((section) => {
    let element = elementById.get(section.id) ?? pageSections.find((item) => item.dataset.adminSectionId === section.id);
    if (!element && !defaultSections.some((item) => item.id === section.id)) {
      element = document.createElement("section");
      element.dataset.adminSectionId = section.id;
      element.style.cssText = "padding:4rem max(1.5rem,8vw);background:#06243D;color:#FFFFFF";
      const heading = document.createElement("h2");
      heading.style.cssText = "max-width:70rem;margin:0 auto 1rem;color:#D7A84A;font-size:clamp(1.5rem,3vw,2.5rem)";
      const description = document.createElement("p");
      description.style.cssText = "max-width:70rem;margin:0 auto;color:#F5F7F8;line-height:1.7;white-space:pre-line";
      element.append(heading, description);
      root.append(element);
    }
    if (!element) return;
    element.dataset.adminSectionId = section.id;
    ordered.push(element);
    element.hidden = !section.enabled;

    const fallback = defaultSections.find((item) => item.id === section.id);
    syncHomeText(element.querySelector("h1, h2, h3, h4"), section.title, fallback?.title, `Title${section.id}`);
    syncHomeText(element.querySelector("p"), section.description, fallback?.description, `Description${section.id}`);

    let image = element.querySelector<HTMLImageElement>("img[data-admin-section-image]") ?? (section.image ? element.querySelector<HTMLImageElement>("img") : null);
    if (!image && section.image) {
      image = document.createElement("img");
      image.dataset.adminSectionImage = "true";
      image.alt = "";
      image.style.cssText = "display:block;max-width:min(100%,70rem);max-height:28rem;object-fit:cover;margin:1.5rem auto;border-radius:.75rem";
      element.append(image);
    }
    if (image) {
      image.dataset.adminOriginalSrc ??= image.src;
      if (section.image) image.src = section.image;
      else if (image.dataset.adminSectionImage) image.remove();
      else image.src = image.dataset.adminOriginalSrc || "";
    }

    let body = element.querySelector<HTMLElement>("[data-admin-section-body]");
    if (section.body && !body) {
      body = document.createElement("p");
      body.dataset.adminSectionBody = "true";
      body.style.cssText = "max-width:70rem;margin:1rem auto;line-height:1.7;white-space:pre-line";
      element.append(body);
    }
    if (body) {
      if (section.body) body.textContent = section.body;
      else body.remove();
    }

    const link = section.ctaLabel || section.ctaUrl
      ? element.querySelector<HTMLAnchorElement>("a[data-admin-section-cta]") ?? element.querySelector<HTMLAnchorElement>("a")
      : null;
    if (link) {
      link.dataset.adminOriginalText ??= link.textContent ?? "";
      link.dataset.adminOriginalHref ??= link.href;
      link.textContent = section.ctaLabel || link.dataset.adminOriginalText || "";
      link.href = section.ctaUrl || link.dataset.adminOriginalHref || "";
    }
  });

  const currentIds = new Set(content.sections.map((section) => section.id));
  defaultSections.forEach((section) => {
    if (!currentIds.has(section.id)) {
      const element = elementById.get(section.id);
      if (element) element.hidden = true;
    }
  });

  if (ordered.length > 1 && ordered.every((element) => element.parentElement === root)) {
    const marker = document.createComment("home-section-order");
    root.insertBefore(marker, ordered[0]);
    const fragment = document.createDocumentFragment();
    ordered.forEach((element) => fragment.append(element));
    root.insertBefore(fragment, marker);
    marker.remove();
  }
}

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

export default function Home() {
  const rootRef = useRef<HTMLElement>(null);
  const logo = useBrandLogo("ecosystem");
  const [slide, setSlide] = useState(1);
  const [activeEcosystem, setActiveEcosystem] = useState(0);
  const [adminContent, setAdminContent] = useState<AdminPageContent | null>(null);
  const [newsItems, setNewsItems] = useState<CmsArticle[]>(CMS_SEEDS.news);
  const [projectItems, setProjectItems] = useState<CmsArticle[]>(CMS_SEEDS.projects);
  const defaultHomeSections = useMemo(() => defaultPageContent("trang-chu")?.sections ?? [], []);

  useEffect(() => {
    const loadContent = () => {
      const content = readPageContent("trang-chu");
      setAdminContent(content);
      if (content) {
        document.title = content.title;
        document.querySelector('meta[name="description"]')?.setAttribute("content", content.description);
      }
    };
    void hydratePageContent("trang-chu");
    window.addEventListener("nghieng:content-updated", loadContent);
    return () => window.removeEventListener("nghieng:content-updated", loadContent);
  }, []);

  useEffect(() => {
    if (adminContent && rootRef.current) applyHomeSections(rootRef.current, adminContent, defaultHomeSections);
  }, [adminContent, defaultHomeSections]);

  useEffect(() => {
    loadCmsRecords("news").then((items) => setNewsItems(items.filter((item) => item.active && item.status !== "draft").sort((a, b) => a.order - b.order)));
    loadCmsRecords("projects").then((items) => setProjectItems(items.filter((item) => item.active && item.status !== "draft").sort((a, b) => a.order - b.order)));
  }, []);

  const managedSlides = useMemo(() => adminContent?.sliders.filter((item) => item.enabled && item.image) ?? [], [adminContent]);
  const enabledSlides = useMemo(() => managedSlides.length ? managedSlides.map((item) => item.image) : slides, [managedSlides]);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % enabledSlides.length), 6000);
    return () => window.clearInterval(timer);
  }, [enabledSlides.length]);

  const sectionEnabled = (title: string) => {
    const sectionId = defaultHomeSections.find((section) => section.title === title)?.id;
    const section = adminContent?.sections.find((item) => item.id === sectionId);
    return section?.enabled ?? (adminContent ? false : true);
  };
  const copy = [
    ["TỔ HỢP LIÊN KẾT", "ĐA NGÀNH", "Cùng kiến tạo những giá trị mới cho doanh nghiệp, thành viên và cộng đồng."],
    ["KẾT NỐI", "GIÁ TRỊ", "Mỗi lĩnh vực phát triển độc lập, đồng thời cộng hưởng để mở rộng giá trị."],
    ["CÙNG PHÁT TRIỂN", "BỀN VỮNG", "Nghieng Complex đồng hành cùng Đối tác, Thành viên và Cộng đồng trên toàn quốc."],
  ][slide % 3];
  const activeManagedSlide = managedSlides[slide % Math.max(managedSlides.length, 1)];
  const selectedEcosystem = ecosystem[activeEcosystem];
  const cardsSectionId = defaultHomeSections.find((section) => section.title === "Cards 06 lĩnh vực")?.id;
  const ecosystemCards = adminContent?.sections.find((section) => section.id === cardsSectionId)?.items ?? defaultHomeSections.find((section) => section.id === cardsSectionId)?.items ?? [];

  return (
    <main ref={rootRef} className={s.site + " " + homeStyles.home}>
      <SiteHeader />

      {adminContent?.active === false ? <section className={s.offline}><h1>Trang chủ tạm thời chưa được xuất bản</h1></section> : <>
        {sectionEnabled("Hero (Banner chính)") && <section className={`${s.hero} ${homeStyles.hero}`} id="top">
          <div className={s.heroImage} style={{ backgroundImage: `url(${enabledSlides[slide % enabledSlides.length]})` }} aria-hidden="true" />
          <div className={s.heroShade} />
          <div className={s.heroCopy}>
            <div className={s.eyebrow}><i /> TỔ HỢP LIÊN KẾT ĐA NGÀNH</div>
            <h1>{activeManagedSlide?.title || adminContent?.heroTitle || copy[0]}{activeManagedSlide?.title || adminContent?.heroTitle ? null : <strong>{copy[1]}</strong>}</h1>
            <p>{activeManagedSlide?.description || adminContent?.heroDescription || copy[2]}</p>
            <div className={s.heroActions}><Link className={s.button} href="/gioi-thieu">KHÁM PHÁ HỆ SINH THÁI <Arrow /></Link><Link className={s.outlineButton} href="/lien-he">HỢP TÁC CÙNG CHÚNG TÔI</Link></div>
          </div>
          <div className={s.sliderControls}>{enabledSlides.map((_, index) => <button key={index} type="button" aria-label={`Chuyển đến slide ${index + 1}`} className={index === slide % enabledSlides.length ? s.sliderCurrent : ""} onClick={() => setSlide(index)} />)}</div>
        </section>}

        {sectionEnabled("Nghieng Complex là ai?") && <section className={s.intro} id="about">
          <div className={s.introText}><div className={s.eyebrow}><i /> NGHIENG COMPLEX LÀ AI?</div><h2>KHÔNG CHỈ LÀ MỘT <strong>TẬP ĐOÀN ĐA NGÀNH</strong></h2><p>Nghieng Complex được định hướng phát triển theo mô hình Tổ hợp Liên kết Đa ngành, nơi mỗi lĩnh vực vừa có khả năng phát triển độc lập, vừa kết nối để tạo thị trường, chia sẻ nguồn lực, mở rộng khách hàng và gia tăng giá trị cho toàn hệ sinh thái.</p><Link className={s.button} href="/gioi-thieu">TÌM HIỂU VỀ NGHIENG COMPLEX <Arrow /></Link></div>
          <div className={s.benefitGrid}>{benefits.map(([title, text], index) => <article key={title}><span className={s.benefitIndex}>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>}

        {sectionEnabled("Số liệu nổi bật") && <section className={s.stats} aria-label="Số liệu nổi bật">{[["06", "Lĩnh vực cốt lõi"], ["8+", "Dự án demo"], ["2030", "Tầm nhìn chiến lược"], ["100%", "Cam kết bền vững"]].map(([value, label]) => <div key={value}><b>{value}</b><span>{label}</span></div>)}</section>}

        {sectionEnabled("Hệ sinh thái 06 lĩnh vực (Orbit)") && <section className={s.orbitSection} id="ecosystem"><div className={s.sectionHeading}><div className={s.eyebrow}><i /> ECOSYSTEM NETWORK <i /></div><h2>HỆ SINH THÁI <strong>06 LĨNH VỰC</strong></h2></div><div className={s.orbit}><div className={s.orbitRing} /><div className={s.orbitCore}><img src={logo} alt="Nghieng Complex" /></div>{ecosystem.map((item, index) => <Link className={`${s.orbitItem} ${s[`orbit${index}`]} ${activeEcosystem === index ? homeStyles.orbitItemActive : ""} ${item.path === "/cong-nghe-ai" ? homeStyles.orbitTech : ""}`} href={item.path} key={item.path} onMouseEnter={() => setActiveEcosystem(index)} onFocus={() => setActiveEcosystem(index)}><b>0{index + 1}</b><span>{item.name}</span></Link>)}</div><div className={homeStyles.ecosystemDetails} aria-live="polite"><div><span>NGHIENG COMPLEX</span><h3>{selectedEcosystem.name}</h3><p>{selectedEcosystem.description}</p><div>{selectedEcosystem.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><Link href={selectedEcosystem.path}>Khám phá <Arrow /></Link></div></section>}

        {sectionEnabled("Cards 06 lĩnh vực") && <section className={s.ecosystemCards}><div className={s.sectionHeading}><div className={s.eyebrow}><i /> KHÁM PHÁ</div><h2>CÁC LĨNH VỰC TRONG <strong>HỆ SINH THÁI</strong></h2></div><div className={s.cardGrid}>{ecosystemCards.map((item, index) => <Link href={item.href || "#"} className={homeStyles.sectorCard} key={item.id}><div className={homeStyles.sectorImage}><img src={item.image || "/image/tong-nghieng-trang-chu.png"} alt={item.title} loading="lazy" /><span className={`${homeStyles.sectorIcon} ${homeStyles[`sectorIcon${index % 3}`]}`}><SectorIcon name={item.icon} /></span><span className={homeStyles.sectorNumber}>{String(index + 1).padStart(2, "0")}</span></div><div className={homeStyles.sectorBody}><h3>{item.title}</h3>{item.subtitle && <span className={homeStyles.sectorSubtitle}>{item.subtitle}</span>}<p>{item.description}</p><b>Khám phá <Arrow /></b></div></Link>)}</div></section>}

        {sectionEnabled("Sức mạnh cộng hưởng") && <section className={s.synergy}><div className={s.sectionHeading}><div className={s.eyebrow}><i /> NGHIENG COMPLEX</div><h2>SỨC MẠNH CỦA SỰ <strong>CỘNG HƯỞNG</strong></h2></div><div className={s.synergyGrid}>{benefits.map(([title, text]) => <article key={title}><b>✦</b><h3>{title}</h3><p>{text}</p></article>)}</div></section>}

        {sectionEnabled("Dự án và cơ hội hợp tác") && <section className={s.projects} id="projects"><div className={s.sectionHeading}><div className={s.eyebrow}><i /> CƠ HỘI HỢP TÁC</div><h2>DỰ ÁN & <strong>CƠ HỘI HỢP TÁC</strong></h2></div><div className={s.projectGrid}>{projectItems.slice(0, 3).map((item, index) => <article className={homeStyles.projectCard} key={item.id}><span className={`${homeStyles.projectStatus} ${item.status === "Vận hành" ? homeStyles.projectStatusActive : ""}`}>{item.status.toLocaleUpperCase("vi-VN")}</span><b>0{index + 1}</b><h3>{item.title}</h3><p>{item.summary}</p><Link href={"/du-an/" + item.slug}>Khám phá <Arrow /></Link></article>)}</div><p className={homeStyles.listingLink}><Link href="/du-an">Xem tất cả dự án <Arrow /></Link></p></section>}

        {sectionEnabled("Triết lý phát triển") && <section className={homeStyles.slogan}><span>KẾT NỐI <i>·</i> CỘNG HƯỞNG <i>·</i><br /> PHÁT TRIỂN BỀN VỮNG</span></section>}

        {sectionEnabled("Thông điệp Chủ tịch") && <section className={homeStyles.chairmanSection}><div className={`${s.chairman} ${homeStyles.sectionContainer}`}><div className={`${s.chairmanPhoto} ${homeStyles.portrait}`} role="img" aria-label="Ảnh chân dung Chủ tịch Nghieng Complex"><div className={homeStyles.portraitContent}><span className={homeStyles.portraitIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><small>Ảnh chân dung (demo)</small></div><span className={homeStyles.portraitQuote} aria-hidden="true">“</span></div><div><div className={s.eyebrow}><i /> THÔNG ĐIỆP CHỦ TỊCH</div><blockquote>“Sức mạnh của Nghieng Complex không nằm ở quy mô từng lĩnh vực, mà ở khả năng kết nối các nguồn lực để tạo ra giá trị lớn hơn — vì cộng đồng, vì tương lai bền vững.”</blockquote><b className={s.signature}>NGUYỄN THỊ HƯƠNG THẢO</b><span className={homeStyles.chairmanTitle}>Chủ tịch HĐQT - CEO · Tập đoàn Nghieng Complex</span><Link className={s.textLink} href="/thu-ngo-chu-tich">ĐỌC THƯ CHỦ TỊCH <Arrow /></Link></div></div></section>}

        {sectionEnabled("Tầm nhìn 2026–2030") && <section className={homeStyles.visionSection}><div className={`${s.vision} ${homeStyles.sectionContainer}`}><div><div className={s.eyebrow}><i /> TẦM NHÌN</div><h2>TẦM NHÌN <strong>2026–2030</strong></h2><ul className={homeStyles.visionPoints}><li>Mở rộng hệ sinh thái và mạng lưới liên kết</li><li>Kết nối doanh nghiệp và đối tác</li><li>Đẩy mạnh chuyển đổi số và ứng dụng AI</li><li>Phát triển gắn với cộng đồng và địa phương</li></ul><Link className={s.textLink} href="/muc-tieu">XEM CHI TIẾT <Arrow /></Link></div><div className={s.timeline}>{[["2026", "Củng cố nền tảng"], ["2027", "Mở rộng mạng lưới"], ["2028", "Chuyển đổi số & AI"], ["2030", "Hệ sinh thái liên kết"]].map(([year, milestone]) => <article key={year}><b>{year}</b><p>{milestone}</p></article>)}</div></div></section>}

        {sectionEnabled("Cộng đồng và thiện nguyện") && <section className={homeStyles.communitySection}><div className={`${s.community} ${homeStyles.sectionContainer}`}><div><div className={s.eyebrow}><i /> CỘNG ĐỒNG & THIỆN NGUYỆN</div><h2>PHÁT TRIỂN CÙNG <strong>CỘNG ĐỒNG</strong></h2><p>Giá trị của một hệ sinh thái không chỉ được đo bằng tăng trưởng kinh doanh, mà còn bằng những giá trị tích cực mà hệ sinh thái tạo ra cho con người và xã hội.</p><Link className={s.button} href="/phat-trien-cong-dong">KHÁM PHÁ HOẠT ĐỘNG CỘNG ĐỒNG <Arrow /></Link></div><div className={`${s.communityList} ${homeStyles.communityList}`}>{["Thiện nguyện", "Phát triển địa phương", "Văn hóa vùng miền", "Môi trường", "Giáo dục", "Chương trình xã hội"].map((item) => <div key={item}><b aria-hidden="true" /><span>{item}</span></div>)}</div></div></section>}

        {sectionEnabled("Đối tác đồng hành") && <section className={s.partners}><div className={s.sectionHeading}><div className={s.eyebrow}><i /> ĐỐI TÁC</div><h2>ĐỐI TÁC <strong>ĐỒNG HÀNH</strong></h2></div><div className={`${s.partnerGrid} ${homeStyles.partnerGrid}`}>{["Strategic Partner", "Technology Partner", "Travel Partner", "Media Partner", "Mining Partner", "Community Partner"].map((partner) => <div key={partner}><span>◈</span>{partner}</div>)}</div><p className={homeStyles.partnerNote}>Logo placeholder — chưa sử dụng logo thật cho đến khi được phê duyệt.</p></section>}

        {sectionEnabled("Tin tức và sự kiện") && <section className={s.news}>
          <div className={s.newsContainer}>
            <div className={s.newsHeader}>
              <div>
                <div className={s.newsEyebrow}><i /> TIN TỨC</div>
                <h2 className={s.newsTitle}>TIN TỨC &amp; SỰ KIỆN</h2>
              </div>
              <Link className={s.newsListing} href="/tin-tuc">XEM TẤT CẢ TIN TỨC <Arrow /></Link>
            </div>
            <div className={s.newsGrid}>{newsItems.slice(0, 3).map((item) => <Link href={"/tin-tuc/" + item.slug} className={s.newsCard + " " + homeStyles.newsCard} key={item.id}>
              <img src={item.image} alt="" loading="lazy" />
              <div>
                <span className={s.newsMeta}><b>{item.category.toLocaleUpperCase("vi-VN")}</b><time>{item.date}</time></span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
            </Link>)}</div>
          </div>
        </section>}

        {sectionEnabled("CTA cuối trang (Tham gia hệ sinh thái)") && <section className={s.cta}><div className={s.eyebrow}><i /> CÙNG KIẾN TẠO</div><h2>THAM GIA HỆ SINH THÁI <strong>NGHIENG COMPLEX</strong></h2><p>Kết nối cùng chúng tôi để bắt đầu những cơ hội hợp tác mới.</p><Link className={s.button} href="/lien-he">KẾT NỐI VỚI CHÚNG TÔI <Arrow /></Link></section>}
      </>}

      <section className={`${s.bottomCta} ${homeStyles.footerCta}`}><div className={homeStyles.footerCtaCopy}><strong>CÙNG THAM GIA · CÙNG KẾT NỐI · CÙNG PHÁT TRIỂN</strong><span>Nghieng Complex trân trọng chào đón Quý Đối tác, Thành viên và Cộng đồng cùng đồng hành.</span></div><Link href="/lien-he">LIÊN HỆ NGAY <Arrow /></Link></section>
      <SiteFooter />
    </main>
  );
}

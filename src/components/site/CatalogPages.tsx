"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadCmsRecords } from "@/lib/cms-client";
import { CMS_SEEDS, PUBLIC_IMAGES, type CmsArticle, type CmsTour, type CmsVenue, type VenueKind } from "@/lib/cms-data";
import { hydratePageContent, readPageContent, TRAVEL_FACILITY_ITEMS, type AdminPageContent } from "@/app/admin/page-data";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import styles from "./catalog-pages.module.css";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + "đ";

function useManagedPageContent(slug: string) {
  const [content, setContent] = useState<AdminPageContent | null>(null);
  useEffect(() => {
    const refresh = () => setContent(readPageContent(slug));
    void hydratePageContent(slug);
    window.addEventListener("nghieng:content-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("nghieng:content-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [slug]);
  return content;
}

const kindLabels: Record<VenueKind, string> = {
  restaurant: "Nhà hàng",
  hotel: "Khách sạn",
  resort: "Resort",
  retreat: "Khu nghỉ dưỡng",
  bungalow: "Bungalow",
};

function ListingHero({ title, description, image, eyebrow = "NGHIENG TRAVEL" }: { title: string; description: string; image: string; eyebrow?: string }) {
  return (
    <section className={styles.hero} style={{ backgroundImage: "linear-gradient(90deg, rgba(3,23,43,.96) 0%, rgba(3,23,43,.76) 48%, rgba(3,23,43,.12) 100%), url(" + image + ")" }}>
      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.heroDescription}>{description}</p>
        <a className={styles.goldButton} href="#catalog">{title.startsWith("NHÀ HÀNG") ? "Khám phá ngay" : "Khám phá hành trình"} <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}

function TourCard({ tour }: { tour: CmsTour }) {
  return (
    <article className={styles.card}>
      <Link href={"/tour/" + tour.slug} className={styles.cardImageLink} aria-label={"Xem tour " + tour.title}>
        <img src={tour.image} alt={tour.title} loading="lazy" />
        <span className={styles.badge}>VĂN HÓA VÙNG MIỀN</span>
      </Link>
      <div className={styles.cardBody}>
        <h3><Link href={"/tour/" + tour.slug}>{tour.title}</Link></h3>
        <p className={styles.meta}><span aria-hidden="true">⌖</span>{tour.location}</p>
        <p className={styles.meta}><span aria-hidden="true">▦</span>{tour.duration}<span className={styles.separator}>·</span>{tour.guestRange}</p>
        <p className={styles.summary}>{tour.summary}</p>
        <div className={styles.cardBottom}><strong>Từ {money(tour.priceFrom)}</strong><Link href={"/tour/" + tour.slug}>Xem chi tiết <span aria-hidden="true">→</span></Link></div>
      </div>
    </article>
  );
}

function VenueCard({ venue }: { venue: CmsVenue }) {
  const href = venue.kind === "restaurant" ? "/nha-hang/" + venue.slug : "/" + (venue.kind === "retreat" ? "khu-nghi-duong" : venue.kind === "bungalow" ? "bungalow" : venue.kind === "resort" ? "resort" : "khach-san") + "/" + venue.slug;
  return (
    <article className={styles.card}>
      <Link href={href} className={styles.cardImageLink} aria-label={"Xem " + venue.title}>
        <img src={venue.image} alt={venue.title} loading="lazy" />
        <span className={styles.badge}>{kindLabels[venue.kind].toLocaleUpperCase("vi-VN")}</span>
      </Link>
      <div className={styles.cardBody}>
        <h3><Link href={href}>{venue.title}</Link></h3>
        <p className={styles.meta}><span aria-hidden="true">⌖</span>{venue.location}</p>
        <p className={styles.summary}>{venue.summary}</p>
        <div className={styles.cardBottom}><strong>{venue.kind === "restaurant" ? "★ " + venue.rating.toFixed(1) : "Từ " + money(venue.priceFrom)}</strong><Link href={href}>Xem chi tiết <span aria-hidden="true">→</span></Link></div>
      </div>
    </article>
  );
}

function Pagination({ page, count, onPage }: { page: number; count: number; onPage: (page: number) => void }) {
  if (count <= 1) return null;
  return (
    <nav className={styles.pagination} aria-label="Phân trang">
      <button type="button" aria-label="Trang trước" disabled={page === 1} onClick={() => onPage(page - 1)}>←</button>
      {Array.from({ length: count }, (_, index) => index + 1).map((number) => <button type="button" key={number} aria-label={"Trang " + number} aria-current={page === number ? "page" : undefined} className={page === number ? styles.pageCurrent : ""} onClick={() => onPage(number)}>{number}</button>)}
      <button type="button" aria-label="Trang sau" disabled={page === count} onClick={() => onPage(page + 1)}>→</button>
    </nav>
  );
}

export function TourCategoryPage({ slug }: { slug: string }) {
  const seedCategory = CMS_SEEDS.tourCategories.find((item) => item.slug === slug);
  const [category, setCategory] = useState(seedCategory ?? CMS_SEEDS.tourCategories[1]);
  const [loading, setLoading] = useState(!seedCategory);
  const [tours, setTours] = useState(CMS_SEEDS.tours.filter((item) => item.category === category.slug));
  const [page, setPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    Promise.all([loadCmsRecords("tourCategories"), loadCmsRecords("tours")]).then(([categories, items]) => {
      const selected = categories.find((item) => item.slug === slug && item.active);
      if (selected) {
        setCategory(selected);
        setTours(items.filter((item) => item.category === selected.slug && item.state === "published").sort((a, b) => a.order - b.order));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const pages = Math.max(1, Math.ceil(tours.length / pageSize));
  const shown = tours.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <main className={styles.site}><SiteHeader /><p className={styles.empty} role="status">Đang tải danh mục tour…</p><SiteFooter /></main>;

  return (
    <main className={styles.site}>
      <SiteHeader />
      <ListingHero title={category.title} description={category.description + " Hành trình khám phá những vùng đất giàu di sản, phong tục và trải nghiệm đáng nhớ."} image={category.image} />
      <section id="catalog" className={styles.section}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>HÀNH TRÌNH NGHIENG TRAVEL</p><h2>Khám phá các tour nổi bật</h2></div><span>{tours.length} hành trình</span></div>
        <div className={styles.grid}>{shown.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
        {!shown.length && <p className={styles.empty}>Chưa có hành trình được xuất bản.</p>}
        <Pagination page={page} count={pages} onPage={setPage} />
      </section>
      <section className={styles.featureBand}>
        <img src={PUBLIC_IMAGES[2]} alt="Không gian văn hóa và thiên nhiên Việt Nam" loading="lazy" />
        <div><p className={styles.eyebrow}>TRẢI NGHIỆM VĂN HÓA</p><h2>Hành trình khám phá bản sắc Việt</h2><p>Mỗi vùng đất là một câu chuyện, mỗi nền văn hóa là một giá trị quý giá. Cùng Nghieng Travel khám phá và trải nghiệm những nét đẹp văn hóa độc đáo của Việt Nam.</p><ul><li>Di sản văn hóa phong phú</li><li>Ẩm thực đặc sắc vùng miền</li><li>Hành trình thiết kế riêng</li></ul><Link className={styles.goldButton} href="/tour">Khám phá các tour khác <span aria-hidden="true">→</span></Link></div>
      </section>
      <SiteFooter />
    </main>
  );
}

export function TourOverviewPage() {
  const [categories, setCategories] = useState(CMS_SEEDS.tourCategories.filter((item) => item.active).sort((a, b) => a.order - b.order));
  useEffect(() => { loadCmsRecords("tourCategories").then((items) => setCategories(items.filter((item) => item.active).sort((a, b) => a.order - b.order))); }, []);
  return (
    <main className={styles.site}>
      <SiteHeader />
      <ListingHero title="HẠNG MỤC TỔ CHỨC TOUR" description="Những hành trình kết nối con người với thiên nhiên, văn hóa và các cơ hội phát triển." image={PUBLIC_IMAGES[1]} />
      <section id="catalog" className={styles.section}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>NGHIENG TRAVEL</p><h2>Chọn hành trình phù hợp</h2></div><span>04 hạng mục</span></div>
        <div className={styles.categoryGrid}>{categories.map((category) => <Link className={styles.categoryCard} href={"/tour/" + category.slug} key={category.id}><img src={category.image} alt="" loading="lazy" /><span>{category.title}</span><p>{category.description}</p><b>Khám phá <span aria-hidden="true">→</span></b></Link>)}</div>
        <div className={styles.centerAction}><Link className={styles.outlineButton} href="/tour/van-hoa-vung-mien">Xem thêm <span aria-hidden="true">→</span></Link></div>
      </section>
      <SiteFooter />
    </main>
  );
}

export function VenueCategoryPage({ kind, title, description }: { kind: VenueKind; title?: string; description?: string }) {
  const [venues, setVenues] = useState(CMS_SEEDS.venues.filter((item) => item.kind === kind));
  const [page, setPage] = useState(1);
  const pageSize = 3;
  useEffect(() => {
    loadCmsRecords("venues").then((items) => setVenues(items.filter((item) => item.kind === kind && item.state === "published").sort((a, b) => a.order - b.order)));
  }, [kind]);
  const pages = Math.max(1, Math.ceil(venues.length / pageSize));
  const shown = venues.slice((page - 1) * pageSize, page * pageSize);
  const heading = title ?? kindLabels[kind].toLocaleUpperCase("vi-VN");

  return (
    <main className={styles.site}>
      <SiteHeader />
      <ListingHero title={heading} description={description ?? "Khám phá hệ thống " + kindLabels[kind].toLowerCase() + " trong hệ sinh thái Nghieng Travel, kết hợp bản sắc vùng miền và dịch vụ chu đáo."} image={kind === "restaurant" ? PUBLIC_IMAGES[1] : PUBLIC_IMAGES[0]} />
      <section id="catalog" className={styles.section}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>NGHIENG TRAVEL</p><h2>{kind === "restaurant" ? "Khám phá các nhà hàng nổi bật" : "Khám phá " + kindLabels[kind].toLowerCase()}</h2></div><span>{venues.length} địa điểm</span></div>
        <div className={styles.grid}>{shown.map((venue) => <VenueCard key={venue.id} venue={venue} />)}</div>
        {!shown.length && <p className={styles.empty}>Chưa có địa điểm được xuất bản.</p>}
        <Pagination page={page} count={pages} onPage={setPage} />
      </section>
      {kind === "restaurant" && <section className={styles.featureBand}>
        <img src={PUBLIC_IMAGES[2]} alt="Không gian nhà hàng bên biển lúc hoàng hôn" loading="lazy" />
        <div><p className={styles.eyebrow}>TRẢI NGHIỆM ẨM THỰC</p><h2>Hương vị đặc sắc từ khắp vùng miền</h2><p>Tận hưởng những bữa ăn tinh tế với nguyên liệu tươi ngon, được chế biến bởi đội ngũ đầu bếp giàu kinh nghiệm, mang đến trải nghiệm ẩm thực độc đáo và khó quên.</p><ul><li>Nguyên liệu tươi ngon địa phương</li><li>Đầu bếp giàu kinh nghiệm</li><li>Không gian sang trọng, đẳng cấp</li></ul><Link className={styles.goldButton} href="/nha-hang-khach-san">Khám phá hệ thống nhà hàng <span aria-hidden="true">→</span></Link></div>
      </section>}
      <div className={styles.goldStrip}><span>CÙNG THAM GIA · CÙNG KẾT NỐI · CÙNG PHÁT TRIỂN</span><Link href="/lien-he">Liên hệ ngay <span aria-hidden="true">→</span></Link></div>
      <SiteFooter />
    </main>
  );
}

const venuePaths: Array<{ kind: VenueKind; path: string }> = [
  { kind: "restaurant", path: "/nha-hang" },
  { kind: "hotel", path: "/khach-san" },
  { kind: "resort", path: "/resort" },
  { kind: "retreat", path: "/khu-nghi-duong" },
  { kind: "bungalow", path: "/bungalow" },
];

export function VenueHubPage() {
  const [venues, setVenues] = useState<CmsVenue[]>(CMS_SEEDS.venues.filter((item) => item.kind === "restaurant"));
  const [categories, setCategories] = useState(CMS_SEEDS.venueCategories.filter((item) => item.active));
  const [active, setActive] = useState<VenueKind>("restaurant");
  useEffect(() => {
    Promise.all([loadCmsRecords("venues"), loadCmsRecords("venueCategories")]).then(([items, categoryItems]) => {
      setVenues(items.filter((item) => item.state === "published").sort((a, b) => a.order - b.order));
      setCategories(categoryItems.filter((item) => item.active).sort((a, b) => a.order - b.order));
    });
  }, []);
  const current = useMemo(() => venues.filter((item) => item.kind === active), [active, venues]);
  const venueTabs = useMemo(() => categories.map((category) => ({ kind: category.kind, path: venuePaths.find((item) => item.kind === category.kind)?.path ?? "/nha-hang" })), [categories]);

  return (
    <main className={styles.site}>
      <SiteHeader />
      <ListingHero title="NHÀ HÀNG – KHÁCH SẠN" description="Khám phá những điểm đến nghỉ dưỡng, ẩm thực và lưu trú trong hệ sinh thái Nghieng Travel." image={PUBLIC_IMAGES[1]} />
      <section id="catalog" className={styles.section}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>NGHIENG TRAVEL</p><h2>Điểm đến trong hệ sinh thái</h2></div><span>{current.length} địa điểm</span></div>
        <div className={styles.tabs} role="tablist" aria-label="Loại hình dịch vụ">
          {venueTabs.map(({ kind }) => <button type="button" role="tab" aria-selected={active === kind} className={active === kind ? styles.tabActive : ""} onClick={() => setActive(kind)} key={kind}>{kindLabels[kind]}</button>)}
        </div>
        <div className={styles.grid}>{current.slice(0, 3).map((venue) => <VenueCard key={venue.id} venue={venue} />)}</div>
        <div className={styles.centerAction}><Link className={styles.outlineButton} href={venueTabs.find((item) => item.kind === active)?.path ?? "/nha-hang"}>Xem thêm {kindLabels[active].toLowerCase()} <span aria-hidden="true">→</span></Link></div>
      </section>
      <SiteFooter />
    </main>
  );
}

export function EditorialListingPage({ kind }: { kind: "news" | "projects" }) {
  const initial = kind === "news" ? CMS_SEEDS.news : CMS_SEEDS.projects;
  const pageContent = useManagedPageContent(kind === "news" ? "tin-tuc" : "du-an");
  const [items, setItems] = useState<CmsArticle[]>(initial);
  const [page, setPage] = useState(1);
  const pageSize = 3;
  useEffect(() => {
    loadCmsRecords(kind).then((records) => setItems(records.filter((item) => item.active && item.status !== "draft").sort((a, b) => a.order - b.order)));
  }, [kind]);
  const visible = items.slice((page - 1) * pageSize, page * pageSize);
  const news = kind === "news";
  const base = news ? "/tin-tuc/" : "/du-an/";
  const activeSlide = pageContent?.sliders.find((slide) => slide.enabled);

  useEffect(() => {
    if (!pageContent) return;
    document.title = pageContent.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", pageContent.description);
  }, [pageContent]);

  if (pageContent?.active === false) return <main className={styles.site}><SiteHeader /><section className={styles.section}><h1>{pageContent.name}</h1><p>Trang hiện chưa được xuất bản.</p></section><SiteFooter /></main>;

  return (
    <main className={styles.site}>
      <SiteHeader />
      <ListingHero title={activeSlide?.title || (news ? "TIN TỨC & SỰ KIỆN" : "DỰ ÁN & CƠ HỘI HỢP TÁC")} description={activeSlide?.description || pageContent?.description || (news ? "Những cập nhật, góc nhìn và hoạt động của Nghieng Complex." : "Kết nối ý tưởng, đối tác và cơ hội phát triển có trách nhiệm.")} image={activeSlide?.image || (news ? PUBLIC_IMAGES[2] : PUBLIC_IMAGES[0])} eyebrow="NGHIENG COMPLEX" />
      {pageContent?.sections.some((section) => section.enabled) && <section className={styles.section} aria-label="Nội dung trang được quản lý từ Admin"><div className={styles.editorialGrid}>{pageContent.sections.filter((section) => section.enabled).map((section, index) => <article className={styles.editorialCard} key={section.id}>{section.image && <div className={styles.editorialImage}><img src={section.image} alt="" /></div>}<div className={styles.editorialBody}><span>0{index + 1} / NGHIENG COMPLEX</span><h3>{section.title}</h3>{section.description && <p>{section.description}</p>}{section.body && <p>{section.body}</p>}{section.ctaLabel && <Link className={styles.textLink} href={section.ctaUrl || "/lien-he"}>{section.ctaLabel}</Link>}</div></article>)}</div></section>}
      <section id="catalog" className={styles.section}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{news ? "CẬP NHẬT" : "CÙNG KIẾN TẠO"}</p><h2>{news ? "Bài viết mới nhất" : "Dự án đang kết nối"}</h2></div><span>{items.length} nội dung</span></div>
        <div className={styles.editorialGrid}>{visible.map((item) => <article className={styles.editorialCard} key={item.id}>
          <Link className={styles.editorialImage} href={base + item.slug}><img src={item.image} alt="" loading="lazy" /></Link>
          <div className={styles.editorialBody}><span>{item.category} · {item.date}</span><h3><Link href={base + item.slug}>{item.title}</Link></h3><p>{item.summary}</p><b className={styles.status}>{news ? "Bài viết" : item.status}</b><Link className={styles.textLink} href={base + item.slug}>Xem chi tiết <span aria-hidden="true">→</span></Link></div>
        </article>)}</div>
        <Pagination page={page} count={Math.max(1, Math.ceil(items.length / pageSize))} onPage={setPage} />
      </section>
      <SiteFooter />
    </main>
  );
}

export function TravelLandingPage() {
  const page = useManagedPageContent("nghieng-travel");
  const [categories, setCategories] = useState(CMS_SEEDS.tourCategories.filter((item) => item.active));
  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    loadCmsRecords("tourCategories").then((items) => setCategories(items.filter((item) => item.active).sort((a, b) => a.order - b.order)));
  }, []);
  const accommodationSection = page?.sections.find((item) => item.id === "nghieng-travel-section-1");
  const accommodationItems = accommodationSection?.items?.length ? accommodationSection.items : TRAVEL_FACILITY_ITEMS;
  const toursSection = page?.sections.find((item) => item.id === "nghieng-travel-section-2");
  const valuesSection = page?.sections.find((item) => item.id === "nghieng-travel-section-3");
  const exploreSection = page?.sections.find((item) => item.id === "nghieng-travel-section-4");
  const communitySection = page?.sections.find((item) => item.id === "nghieng-travel-section-5");
  const slides = page?.sliders.filter((slide) => slide.enabled) ?? [];
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  const normalizedSlide = slides.length ? activeSlide % slides.length : 0;
  const slide = slides[normalizedSlide];
  if (page?.active === false) return <main className={styles.site}><SiteHeader /><section className={styles.section}><h1>{page.name}</h1><p>Trang hiện chưa được xuất bản.</p></section><SiteFooter /></main>;
  return (
    <main className={styles.site}>
      <SiteHeader />
      {slide ? <section className={styles.travelHero} style={{ backgroundImage: "linear-gradient(90deg,rgba(3,23,43,.94),rgba(3,23,43,.68) 52%,rgba(3,23,43,.22)),url(" + (slide.image || PUBLIC_IMAGES[0]) + ")" }}>
        <div className={styles.travelHeroContent}><p className={styles.eyebrow}>{slide.description || "NGHIENG TRAVEL"}</p><h1>{slide.title}</h1><p className={styles.heroDescription}>{page?.heroDescription || "Tour văn hóa, sinh thái và team building — cùng cộng đồng địa phương phát triển kinh tế du lịch bền vững."}</p><div className={styles.travelHeroActions}><Link className={styles.goldButton} href="/lien-he">LIÊN HỆ ĐẶT TOUR <span aria-hidden="true">→</span></Link><Link className={styles.outlineButton} href="/lien-he">GÓP Ý HỢP TÁC</Link></div></div>
        {slides.length > 1 && <><button className={`${styles.slideArrow} ${styles.slidePrevious}`} type="button" aria-label="Slide trước" onClick={() => setActiveSlide((normalizedSlide - 1 + slides.length) % slides.length)}>‹</button><button className={`${styles.slideArrow} ${styles.slideNext}`} type="button" aria-label="Slide sau" onClick={() => setActiveSlide((normalizedSlide + 1) % slides.length)}>›</button><div className={styles.slideDots}>{slides.map((item, index) => <button type="button" key={item.id} aria-label={`Chuyển đến slide ${index + 1}`} aria-current={index === normalizedSlide} onClick={() => setActiveSlide(index)} />)}</div></>}
      </section> : <ListingHero title={page?.heroTitle || "NGHIENG TRAVEL"} description={page?.heroDescription || "Nhà hàng, khách sạn, bungalow, khu sinh thái trên nhiều tỉnh – thành phố. Tour nội địa và quốc tế."} image={PUBLIC_IMAGES[0]} />}
      <section id="catalog" className={styles.section} hidden={accommodationSection?.enabled === false}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>CƠ SỞ HẠ TẦNG</p><h2>HỆ THỐNG NGHỈ DƯỠNG</h2></div><span>03 lĩnh vực</span></div>
        <div className={styles.accommodationGrid}>{accommodationItems.map((card, index) => <Link className={styles.accommodationCard} href={card.href || "#"} key={card.id}><img src={card.image || PUBLIC_IMAGES[index % PUBLIC_IMAGES.length]} alt="" loading="lazy" /><div className={styles.accommodationTitle}><span className={styles.accommodationIcon} aria-hidden="true"><svg viewBox="0 0 24 24">{card.icon === "anchor" ? <><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></> : card.icon === "building" ? <><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/></> : <><path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17ZM12 22v-3"/></>}</svg></span><h3>{card.title}</h3></div><ul>{card.description.split("\n").filter(Boolean).map((detail, detailIndex) => <li key={`${card.id}-${detailIndex}`}>{detail}</li>)}</ul><b>Xem chi tiết <span aria-hidden="true">→</span></b></Link>)}</div>
      </section>
      <section className={styles.section} hidden={toursSection?.enabled === false}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>DU LỊCH LỮ HÀNH</p><h2>HẠNG MỤC TỔ CHỨC TOUR</h2></div><span>{categories.length} danh mục</span></div>
        <div className={styles.categoryGrid}>{categories.map((item) => <Link className={styles.categoryCard} href={"/tour/" + item.slug} key={item.id}><img src={item.image} alt="" loading="lazy" /><span>{item.title}</span><p>{item.description}</p><b>Khám phá <span aria-hidden="true">→</span></b></Link>)}</div>
        <div className={styles.centerAction}><Link className={styles.outlineButton} href="/tour">Xem thêm <span aria-hidden="true">→</span></Link></div>
      </section>
      <section className={styles.valuesSection} hidden={valuesSection?.enabled === false}>
        <div className={styles.section}>
          <div className={styles.sectionHeading}><div><h2>{valuesSection?.title || "GIÁ TRỊ MANG LẠI"}</h2></div></div>
          {valuesSection?.description && <p className={styles.valuesDescription}>{valuesSection.description}</p>}
          <div className={styles.valueGrid}>
            <article className={styles.valueCard}><span className={styles.valueIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg></span><h3>Kết Nối Toàn Diện</h3><p>Liên kết đa ngành, tối ưu chuỗi giá trị.</p></article>
            <article className={styles.valueCard}><span className={styles.valueIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m22 7-8.5 8.5-5-5L2 17M16 7h6v6" /></svg></span><h3>Gia Tăng Giá Trị</h3><p>Đa dạng dịch vụ, nâng tầm trải nghiệm.</p></article>
            <article className={styles.valueCard}><span className={styles.valueIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17ZM12 22v-3" /></svg></span><h3>Phát Triển Bền Vững</h3><p>Gắn kết cộng đồng, cân bằng kinh tế và môi trường.</p></article>
            <article className={styles.valueCard}><span className={styles.valueIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20ZM2 12h20" /></svg></span><h3>Định Hướng – Quy Mô</h3><p>Hiện diện trên nhiều Tỉnh - Thành phố, mở rộng không giới hạn.</p></article>
          </div>
        </div>
      </section>
      <section className={styles.exploreSection} hidden={exploreSection?.enabled === false}>
        <h2>{exploreSection?.title || "KHÁM PHÁ CÙNG NGHIENG TRAVEL"}</h2>
        <p>{exploreSection?.description || "Trải nghiệm du lịch đẳng cấp, kết nối văn hóa và phát triển cộng đồng cùng Nghieng Travel."}</p>
        <Link className={styles.goldButton} href="/lien-he">Liên Hệ &amp; Đặt Tour <span aria-hidden="true">→</span></Link>
      </section>
      <div className={styles.goldStrip} hidden={communitySection?.enabled === false}>
        <div><strong>{communitySection?.title || "CÙNG THAM GIA - CÙNG KẾT NỐI - CÙNG PHÁT TRIỂN"}</strong><span>{communitySection?.description || "Nghieng Complex trân trọng chào đón Quý Đối tác, Thành viên và Cộng đồng cùng đồng hành."}</span></div>
        <Link href="/lien-he">Liên hệ ngay <span aria-hidden="true">→</span></Link>
      </div>
      <SiteFooter />
    </main>
  );
}

const mediaServices = [
  "Sản xuất Film Điện Ảnh & TVC",
  "Tổ chức Sự kiện & MICE",
  "Franchise Center",
  "Sáng tạo Nội dung số – PR",
  "Lưu trữ & Quảng bá Văn hóa",
  "Công tác thiện nguyện",
];

export function MediaLandingPage() {
  const page = useManagedPageContent("nghieng-media");
  const servicesSection = page?.sections.find((item) => item.id === "nghieng-media-section-1");
  if (page?.active === false) return <main className={styles.site}><SiteHeader /><section className={styles.section}><h1>{page.name}</h1><p>Trang hiện chưa được xuất bản.</p></section><SiteFooter /></main>;
  return (
    <main className={styles.site}>
      <SiteHeader />
      <ListingHero title={page?.heroTitle || "NGHIENG MEDIA"} description={page?.heroDescription || "Kết nối câu chuyện, sáng tạo nội dung và lan tỏa những giá trị văn hóa, cộng đồng."} image={PUBLIC_IMAGES[2]} />
      <section id="catalog" className={styles.section} hidden={servicesSection?.enabled === false}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>06 DỊCH VỤ</p><h2>{servicesSection?.title || "Sáng tạo và kết nối"}</h2></div><span>NGHIENG MEDIA</span></div>
        {servicesSection?.description && <p className={styles.heroDescription}>{servicesSection.description}</p>}
        <div className={styles.serviceGrid}>{mediaServices.map((title, index) => <article className={styles.serviceCard} key={title}><img src={PUBLIC_IMAGES[index % PUBLIC_IMAGES.length]} alt={title} loading="lazy" /><div><span>0{index + 1} / NGHIENG MEDIA</span><h3>{title}</h3><Link href={index === 5 ? "/phat-trien-cong-dong" : "/lien-he"}>Khám phá <span aria-hidden="true">→</span></Link></div></article>)}</div>
      </section>
      <SiteFooter />
    </main>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import useBrandLogo from "@/components/site/useBrandLogo";
import { loadCmsRecords } from "@/lib/cms-client";
import { CMS_SEEDS, type CmsArticle } from "@/lib/cms-data";
import { hydratePageContent, readPageContent, type AdminPageContent } from "./admin/page-data";
import s from "./page.module.css";
import homeStyles from "./home-overrides.module.css";

const slides = [
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/4e2c9afc5_slider-1-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9970d8492_slider-3-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9ddb1ea9d_banner-trang-chu-nghieng.webp",
];
const ecosystem = [
  { name: "Nghieng Travel", path: "/nghieng-travel", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/99323fe9c_generated_ce3c7248.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/99323fe9c_generated_ce3c7248.webp" },
  { name: "Khoáng sản", path: "/khoang-san", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/0575d5b5e_generated_cd45ba2c.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/0575d5b5e_generated_cd45ba2c.webp" },
  { name: "Công nghệ - AI", path: "/cong-nghe-ai", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/490b8b229_generated_d36d21f3.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/490b8b229_generated_d36d21f3.webp" },
  { name: "Phát triển cộng đồng", path: "/phat-trien-cong-dong", image: slides[0] },
  { name: "Giải pháp đồng hành", path: "/giai-phap-dong-hanh", image: slides[1] },
  { name: "Nghieng Media", path: "/nghieng-media", image: slides[2] },
];
const benefits = [
  ["Kết nối", "Con người, doanh nghiệp, công nghệ, nguồn lực và cộng đồng trên cùng nền tảng."],
  ["Cộng hưởng", "Mỗi lĩnh vực vừa độc lập vừa thúc đẩy nhau, tạo chuỗi giá trị lớn hơn tổng các phần."],
  ["Gia tăng giá trị", "Chia sẻ nguồn lực, mở rộng khách hàng, tối ưu chi phí và nâng tầm trải nghiệm."],
  ["Bền vững", "Phát triển kinh tế gắn với trách nhiệm xã hội và bảo tồn bản sắc địa phương."],
];

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

export default function Home() {
  const logo = useBrandLogo();
  const [slide, setSlide] = useState(2);
  const [menu, setMenu] = useState(false);
  const [adminContent, setAdminContent] = useState<AdminPageContent | null>(null);
  const [newsItems, setNewsItems] = useState<CmsArticle[]>(CMS_SEEDS.news);
  const [projectItems, setProjectItems] = useState<CmsArticle[]>(CMS_SEEDS.projects);

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
    loadCmsRecords("news").then((items) => setNewsItems(items.filter((item) => item.active && item.status !== "draft").sort((a, b) => a.order - b.order)));
    loadCmsRecords("projects").then((items) => setProjectItems(items.filter((item) => item.active && item.status !== "draft").sort((a, b) => a.order - b.order)));
  }, []);

  const managedSlides = useMemo(() => adminContent?.sliders.filter((item) => item.enabled && item.image) ?? [], [adminContent]);
  const enabledSlides = useMemo(() => managedSlides.length ? managedSlides.map((item) => item.image) : slides, [managedSlides]);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % enabledSlides.length), 6000);
    return () => window.clearInterval(timer);
  }, [enabledSlides.length]);

  const sectionEnabled = (title: string) => adminContent?.sections.find((section) => section.title === title)?.enabled ?? true;
  const copy = [
    ["TỔ HỢP LIÊN KẾT", "ĐA NGÀNH", "Cùng kiến tạo những giá trị mới cho doanh nghiệp, thành viên và cộng đồng."],
    ["KẾT NỐI", "GIÁ TRỊ", "Mỗi lĩnh vực phát triển độc lập, đồng thời cộng hưởng để mở rộng giá trị."],
    ["CÙNG PHÁT TRIỂN", "BỀN VỮNG", "Nghieng Complex đồng hành cùng Đối tác, Thành viên và Cộng đồng trên toàn quốc."],
  ][slide % 3];
  const activeManagedSlide = managedSlides[slide % Math.max(managedSlides.length, 1)];

  return (
    <main className={s.site + " " + homeStyles.home}>
      <SiteHeader />
      <nav className={s.nav + " " + homeStyles.legacyNav} aria-label="Điều hướng chính">
        <Link href="/" className={s.logoLink}><img src={logo} alt="Nghieng Complex" /></Link>
        <div className={`${s.links} ${menu ? s.linksOpen : ""}`}>
          <Link className={s.activeLink} href="/">Trang Chủ</Link>
          <Link href="/gioi-thieu">Giới Thiệu</Link>
          <details className={s.dropdown}>
            <summary>Hệ Sinh Thái <span aria-hidden="true">⌄</span></summary>
            <div>{ecosystem.map((item) => <Link href={item.path} key={item.path}>{item.name}</Link>)}</div>
          </details>
          <Link href="/du-an">Dự Án</Link>
          <Link href="/cong-dong">Cộng Đồng</Link>
          <Link href="/tin-tuc">Tin Tức</Link>
          <Link href="/doi-tac">Đối Tác</Link>
          <Link href="/lien-he">Liên Hệ</Link>
        </div>
        <div className={s.navActions}>
          <button className={s.themeButton} type="button" aria-label="Chuyển chế độ màu">☼</button>
          <Link className={`${s.button} ${s.desktopAction}`} href="/lien-he">Hợp tác cùng chúng tôi <Arrow /></Link>
          <button className={s.mobileButton} type="button" onClick={() => setMenu((value) => !value)} aria-expanded={menu} aria-label="Mở menu">☰</button>
        </div>
      </nav>

      {adminContent?.active === false ? <section className={s.offline}><h1>Trang chủ tạm thời chưa được xuất bản</h1></section> : <>
        {sectionEnabled("Hero (Banner chính)") && <section className={s.hero} id="top">
          <div className={s.heroImage} style={{ backgroundImage: `url(${enabledSlides[slide % enabledSlides.length]})` }} aria-hidden="true" />
          <div className={s.heroShade} />
          <div className={s.heroCopy}>
            <div className={s.eyebrow}><i /> TẦM NHÌN 2026–2030</div>
            <h1>{activeManagedSlide?.title || adminContent?.heroTitle || `${copy[0]} ${copy[1]}`}<strong>{activeManagedSlide?.title || adminContent?.heroTitle ? "" : copy[1]}</strong></h1>
            <p>{activeManagedSlide?.description || adminContent?.heroDescription || copy[2]}</p>
            <div className={s.heroActions}><Link className={s.button} href="/gioi-thieu">MỤC TIÊU 2026–2030 <Arrow /></Link><Link className={s.outlineButton} href="/doi-tac">TRỞ THÀNH ĐỐI TÁC</Link></div>
          </div>
          <div className={s.sliderControls}>{enabledSlides.map((_, index) => <button key={index} type="button" aria-label={`Chuyển đến slide ${index + 1}`} className={index === slide % enabledSlides.length ? s.sliderCurrent : ""} onClick={() => setSlide(index)} />)}</div>
        </section>}

        {sectionEnabled("Nghieng Complex là ai?") && <section className={s.intro} id="about">
          <div className={s.introText}><div className={s.eyebrow}><i /> NGHIENG COMPLEX LÀ AI?</div><h2>KHÔNG CHỈ LÀ MỘT <strong>TẬP ĐOÀN ĐA NGÀNH</strong></h2><p>Nghieng Complex được định hướng phát triển theo mô hình Tổ hợp Liên kết Đa ngành, nơi mỗi lĩnh vực vừa có khả năng phát triển độc lập, vừa kết nối để tạo thị trường, chia sẻ nguồn lực, mở rộng khách hàng và gia tăng giá trị cho toàn hệ sinh thái.</p><Link className={s.button} href="/gioi-thieu">TÌM HIỂU VỀ NGHIENG COMPLEX <Arrow /></Link></div>
          <div className={s.benefitGrid}>{benefits.map(([title, text], index) => <article key={title}><span className={s.benefitIndex}>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>}

        {sectionEnabled("Số liệu nổi bật") && <section className={s.stats} aria-label="Số liệu nổi bật">{[["06", "Lĩnh vực cốt lõi"], ["8+", "Dự án demo"], ["2030", "Tầm nhìn chiến lược"], ["100%", "Cam kết bền vững"]].map(([value, label]) => <div key={value}><b>{value}</b><span>{label}</span></div>)}</section>}

        {sectionEnabled("Hệ sinh thái 06 lĩnh vực (Orbit)") && <section className={s.orbitSection} id="ecosystem"><div className={s.sectionHeading}><div className={s.eyebrow}><i /> ECOSYSTEM NETWORK <i /></div><h2>HỆ SINH THÁI <strong>06 LĨNH VỰC</strong></h2></div><div className={s.orbit}><div className={s.orbitRing} /><div className={s.orbitCore}><img src={logo} alt="Nghieng Complex" /></div>{ecosystem.map((item, index) => <Link className={`${s.orbitItem} ${s[`orbit${index}`]}`} href={item.path} key={item.path}><b>0{index + 1}</b><span>{item.name}</span></Link>)}</div></section>}

        {sectionEnabled("Cards 06 lĩnh vực") && <section className={s.ecosystemCards}><div className={s.sectionHeading}><div className={s.eyebrow}><i /> KHÁM PHÁ</div><h2>CÁC LĨNH VỰC TRONG <strong>HỆ SINH THÁI</strong></h2></div><div className={s.cardGrid}>{ecosystem.map((item, index) => <Link href={item.path} className={s.ecoCard + " " + homeStyles.ecoCard} key={item.path}><img src={item.image} alt={item.name} loading="lazy" /><div className={s.cardShade} /><div className={s.cardCopy}><span>0{index + 1} / NGHIENG COMPLEX</span><h3>{item.name}</h3><p>Kết nối nguồn lực và tạo nên những trải nghiệm, giá trị bền vững.</p><b>Khám phá <Arrow /></b></div></Link>)}</div></section>}

        {sectionEnabled("Sức mạnh cộng hưởng") && <section className={s.synergy}><div className={s.sectionHeading}><div className={s.eyebrow}><i /> NGHIENG COMPLEX</div><h2>SỨC MẠNH CỦA SỰ <strong>CỘNG HƯỞNG</strong></h2></div><div className={s.synergyGrid}>{benefits.map(([title, text]) => <article key={title}><b>✦</b><h3>{title}</h3><p>{text}</p></article>)}</div></section>}

        {sectionEnabled("Dự án và cơ hội hợp tác") && <section className={s.projects} id="projects"><div className={s.sectionHeading}><div className={s.eyebrow}><i /> CƠ HỘI HỢP TÁC</div><h2>DỰ ÁN & <strong>CƠ HỘI HỢP TÁC</strong></h2></div><div className={s.projectGrid}>{projectItems.slice(0, 3).map((item, index) => <article className={homeStyles.projectCard} key={item.id}><span>{item.status.toLocaleUpperCase("vi-VN")}</span><b>0{index + 1}</b><h3>{item.title}</h3><p>{item.summary}</p><Link href={"/du-an/" + item.slug}>Khám phá <Arrow /></Link></article>)}</div><p className={homeStyles.listingLink}><Link href="/du-an">Xem tất cả dự án <Arrow /></Link></p></section>}

        {sectionEnabled("Tầm nhìn 2026–2030") && <section className={s.vision}><div><div className={s.eyebrow}><i /> ĐỊNH HƯỚNG</div><h2>TẦM NHÌN <strong>2026–2030</strong></h2><p>Một lộ trình phát triển có mục tiêu, dữ liệu và trách nhiệm với cộng đồng.</p></div><div className={s.timeline}>{["2026", "2027", "2028", "2030"].map((year) => <article key={year}><b>{year}</b><p>Hoàn thiện năng lực kết nối và mở rộng giá trị bền vững.</p></article>)}</div></section>}

        {sectionEnabled("Triết lý phát triển") && <section className={s.philosophy}><div className={s.philosophyVisual}><img src={slides[0]} alt="Không gian kết nối của Nghieng Complex" loading="lazy" /><span>01 / CONNECTION</span></div><div><div className={s.eyebrow}><i /> TRIẾT LÝ PHÁT TRIỂN</div><h2>KẾT NỐI ĐỂ CÙNG <strong>PHÁT TRIỂN</strong></h2><p>Chúng tôi tin rằng những giá trị bền vững được tạo nên khi con người, doanh nghiệp và cộng đồng cùng chia sẻ nguồn lực, kinh nghiệm và cơ hội.</p><Link className={s.textLink} href="/gioi-thieu">Đọc câu chuyện Nghieng Complex <Arrow /></Link></div></section>}

        {sectionEnabled("Thông điệp Chủ tịch") && <section className={s.chairman}><div className={s.chairmanPhoto}><img src={slides[1]} alt="Không gian Nghieng Complex" loading="lazy" /><span>NGHIENG COMPLEX</span></div><div><div className={s.eyebrow}><i /> THÔNG ĐIỆP CHỦ TỊCH</div><blockquote>“Mỗi kết nối có ý nghĩa đều mở ra một cơ hội để cùng tạo ra giá trị lớn hơn.”</blockquote><p>Nghieng Complex phát triển với tinh thần đồng hành dài hạn, đặt sự tử tế và hiệu quả của hệ sinh thái làm trung tâm.</p><b className={s.signature}>Nghieng Complex</b></div></section>}

        {sectionEnabled("Cộng đồng và thiện nguyện") && <section className={s.community}><div><div className={s.eyebrow}><i /> CỘNG ĐỒNG VÀ THIỆN NGUYỆN</div><h2>PHÁT TRIỂN CÙNG <strong>CỘNG ĐỒNG</strong></h2><p>Những hoạt động tạo tác động tích cực được thực hiện cùng các đối tác địa phương, thành viên và cộng đồng.</p><Link className={s.button} href="/phat-trien-cong-dong">XEM HOẠT ĐỘNG <Arrow /></Link></div><div className={s.communityList}>{["Phát triển sinh kế địa phương", "Đồng hành giáo dục và kỹ năng", "Bảo tồn văn hóa bản địa", "Kết nối nguồn lực thiện nguyện"].map((item, index) => <div key={item}><b>0{index + 1}</b><span>{item}</span><Arrow /></div>)}</div></section>}

        {sectionEnabled("Đối tác đồng hành") && <section className={s.partners}><div className={s.sectionHeading}><div className={s.eyebrow}><i /> HỆ SINH THÁI NGHIENG</div><h2>ĐỐI TÁC <strong>ĐỒNG HÀNH</strong></h2></div><div className={s.partnerGrid}>{["WE LINK", "TRAVEL HUB", "LOCAL LAB", "COMMUNITY", "MEDIA HOUSE", "AI STUDIO", "GREEN FUND", "NEXUS"].map((partner) => <div key={partner}><span>◈</span>{partner}</div>)}</div></section>}

        {sectionEnabled("Tin tức và sự kiện") && <section className={s.news}><div className={s.sectionHeading}><div className={s.eyebrow}><i /> CẬP NHẬT</div><h2>TIN TỨC <strong>& SỰ KIỆN</strong></h2></div><div className={s.newsGrid}>{newsItems.slice(0, 3).map((item) => <Link href={"/tin-tuc/" + item.slug} className={s.newsCard + " " + homeStyles.newsCard} key={item.id}><img src={item.image} alt="" loading="lazy" /><div><span>{item.date} / {item.category.toLocaleUpperCase("vi-VN")}</span><h3>{item.title}</h3><b>Đọc thêm <Arrow /></b></div></Link>)}</div><p className={homeStyles.listingLink}><Link href="/tin-tuc">Xem tất cả tin tức <Arrow /></Link></p></section>}

        {sectionEnabled("CTA cuối trang (Tham gia hệ sinh thái)") && <section className={s.cta}><div className={s.eyebrow}><i /> CÙNG KIẾN TẠO</div><h2>THAM GIA HỆ SINH THÁI <strong>NGHIENG COMPLEX</strong></h2><p>Kết nối cùng chúng tôi để bắt đầu những cơ hội hợp tác mới.</p><Link className={s.button} href="/lien-he">KẾT NỐI VỚI CHÚNG TÔI <Arrow /></Link></section>}
      </>}

      <section className={s.bottomCta}><span>CÙNG THAM GIA · CÙNG KẾT NỐI · CÙNG PHÁT TRIỂN</span><Link href="/lien-he">Bắt đầu kết nối <Arrow /></Link></section>
      <footer className={s.footer + " " + homeStyles.legacyFooter}><div><img src={logo} alt="Nghieng Complex" /><p>Kết nối để cùng phát triển bền vững.</p></div><div><strong>Điều hướng</strong><Link href="/gioi-thieu">Giới thiệu</Link><Link href="/du-an">Dự án</Link><Link href="/lien-he">Liên hệ</Link></div><div><strong>Liên hệ</strong><span>hello@nghiengcomplex.vn</span><span>Hà Nội, Việt Nam</span></div><Link href="/admin/pages">Quản trị nội dung</Link></footer>
    </main>
  );
}

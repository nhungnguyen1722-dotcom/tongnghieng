import { loadCmsRecords, saveCmsRecords } from "@/lib/cms-client";

export type AdminPage = {
  number: string;
  name: string;
  slug: string;
  path: string;
};

export type AdminSlider = {
  id: string;
  title: string;
  description: string;
  image: string;
  enabled: boolean;
};

export type AdminSection = {
  id: string;
  title: string;
  description: string;
  body?: string;
  image?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  enabled: boolean;
};

export type AdminPageContent = {
  name: string;
  path: string;
  title: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  active: boolean;
  sliders: AdminSlider[];
  sections: AdminSection[];
};

export const ADMIN_PAGES: AdminPage[] = [
  { number: "01", name: "Trang chủ", slug: "trang-chu", path: "/" },
  { number: "02", name: "Giới thiệu", slug: "gioi-thieu", path: "/gioi-thieu" },
  { number: "03", name: "Nghieng Travel", slug: "nghieng-travel", path: "/nghieng-travel" },
  { number: "04", name: "Khoáng sản", slug: "khoang-san", path: "/khoang-san" },
  { number: "05", name: "Công nghệ AI", slug: "cong-nghe-ai", path: "/cong-nghe-ai" },
  { number: "06", name: "Phát triển cộng đồng", slug: "phat-trien-cong-dong", path: "/phat-trien-cong-dong" },
  { number: "07", name: "Giải pháp đồng hành", slug: "giai-phap-dong-hanh", path: "/giai-phap-dong-hanh" },
  { number: "08", name: "Nghieng Media", slug: "nghieng-media", path: "/nghieng-media" },
  { number: "09", name: "Dự án", slug: "du-an", path: "/du-an" },
  { number: "10", name: "Cộng đồng", slug: "cong-dong", path: "/cong-dong" },
  { number: "11", name: "Tin tức", slug: "tin-tuc", path: "/tin-tuc" },
  { number: "12", name: "Đối tác", slug: "doi-tac", path: "/doi-tac" },
  { number: "13", name: "Liên hệ", slug: "lien-he", path: "/lien-he" },
];

const pageContentCache = new Map<string, AdminPageContent>();

const homeSections = [
  ["Hero (Banner chính)", "TẦM NHÌN 2026–2030 · CÙNG PHÁT TRIỂN BỀN VỮNG"],
  ["Nghieng Complex là ai?", "KHÔNG CHỈ LÀ MỘT TẬP ĐOÀN ĐA NGÀNH"],
  ["Số liệu nổi bật", "6 LĨNH VỰC · 8+ DỰ ÁN · TẦM NHÌN 2030"],
  ["Hệ sinh thái 06 lĩnh vực (Orbit)", "HỆ SINH THÁI 06 LĨNH VỰC"],
  ["Cards 06 lĩnh vực", "CÁC LĨNH VỰC TRONG HỆ SINH THÁI"],
  ["Sức mạnh cộng hưởng", "KẾT NỐI · CỘNG HƯỞNG · GIA TĂNG GIÁ TRỊ · BỀN VỮNG"],
  ["Dự án và cơ hội hợp tác", "DỰ ÁN & CƠ HỘI HỢP TÁC"],
  ["Triết lý phát triển", "KẾT NỐI ĐỂ CÙNG PHÁT TRIỂN"],
  ["Thông điệp Chủ tịch", "KIẾN TẠO GIÁ TRỊ DÀI HẠN"],
  ["Tầm nhìn 2026–2030", "MỘT LỘ TRÌNH CÓ MỤC TIÊU"],
  ["Cộng đồng và thiện nguyện", "PHÁT TRIỂN CÙNG CỘNG ĐỒNG"],
  ["Đối tác đồng hành", "ĐỐI TÁC ĐỒNG HÀNH"],
  ["Tin tức và sự kiện", "TIN TỨC & SỰ KIỆN"],
  ["CTA cuối trang (Tham gia hệ sinh thái)", "THAM GIA HỆ SINH THÁI NGHIÊNG COMPLEX"],
];

const standardSections = [
  ["Banner chính", "NỘI DUNG TRANG"],
  ["Nội dung giới thiệu", "CÂU CHUYỆN VÀ ĐỊNH HƯỚNG"],
  ["Thông tin nổi bật", "NHỮNG ĐIỂM ĐÁNG CHÚ Ý"],
  ["Kêu gọi hành động", "KẾT NỐI VỚI NGHIÊNG COMPLEX"],
];

const travelSections = [
  ["Dịch vụ lưu trú và ẩm thực", "Nhà hàng, khách sạn, bungalow và điểm nghỉ dưỡng trong hệ sinh thái."],
  ["Danh mục hành trình", "Tour văn hóa, hệ sinh thái, doanh nghiệp và team building."],
];

const mediaSections = [
  ["Sáu dịch vụ Media", "Sản xuất, sự kiện, nội dung số, lưu trữ văn hóa và hoạt động cộng đồng."],
];

const pageEditorSeeds: Record<string, { slides: [string, string][]; sections: [string, string][] }> = {
  "gioi-thieu": { slides: [["GIỚI THIỆU TẬP ĐOÀN", "Về Chúng Tôi"], ["GIÁ TRỊ CỐT LÕI", "Giá Trị Cốt Lõi"], ["SỨ MỆNH KẾT NỐI NGUỒN LỰC", "Sứ Mệnh"]], sections: [["Tổng quan Tập đoàn", "Section chuẩn · overview · MÔ HÌNH TỔ HỢP | LIÊN KẾT ĐA NGÀNH"], ["Sứ mệnh & Tầm nhìn", "Section chuẩn · vision · THÔNG ĐIỆP CHIẾN LƯỢC"], ["Giá trị cốt lõi", "Section chuẩn · values · 4 GIÁ TRỊ NỀN TẢNG"], ["Thông điệp Đối tác", "Section chuẩn · partner_cta"]] },
  "nghieng-travel": { slides: [["NGHIENG TRAVEL", "Hệ Sinh Thái 01"], ["HÀNH TRÌNH ĐÍCH THỰC", "Trải Nghiệm"], ["DU LỊCH BỀN VỮNG", "Phát Triển Du Lịch"]], sections: [["Hệ thống nghỉ dưỡng", "Section chuẩn · facilities · HỆ THỐNG NGHỈ DƯỠNG"], ["Hạng mục tổ chức Tour", "Section chuẩn · tours · HẠNG MỤC TỔ CHỨC TOUR"], ["Giá trị mang lại", "Section chuẩn · benefits · GIÁ TRỊ MANG LẠI"], ["CTA Liên hệ đặt Tour", "Section chuẩn · cta · KHÁM PHÁ CÙNG NGHIENG TRAVEL"]] },
  "khoang-san": { slides: [["KHOÁNG SẢN", "Hệ Sinh Thái 02"], ["GIÁ TRỊ TÀI NGUYÊN", "Nguồn Lực"], ["LIÊN KẾT NGUỒN LỰC", "Liên Kết Doanh Nghiệp"]], sections: [["Lĩnh vực Khoáng sản", "Section chuẩn · segments · LĨNH VỰC KHOÁNG SẢN"], ["Các dự án hợp tác", "Section chuẩn · projects · CÁC DỰ ÁN HỢP TÁC"], ["CTA Hợp tác Khoáng sản", "Section chuẩn · cta · HỢP TÁC KHOÁNG SẢN"]] },
  "cong-nghe-ai": { slides: [["CÔNG NGHỆ – AI –", "Hệ Sinh Thái 03"], ["CHUYỂN ĐỔI SỐ", "Đổi Mới Sáng Tạo"], ["JUST IT & WELINK", "Nền Tảng Số"]], sections: [["Giải pháp Công nghệ", "Section chuẩn · services · GIẢI PHÁP CÔNG NGHỆ"], ["Nền tảng Just IT & Welink", "Section chuẩn · platform · NỀN TẢNG | JUST IT & WELINK"], ["CTA Chuyển đổi số", "Section chuẩn · cta · CHUYỂN ĐỔI SỐ CÙNG NGHIENG"]] },
  "phat-trien-cong-dong": { slides: [["PHÁT TRIỂN CỘNG ĐỒNG", "Hệ Sinh Thái 04"], ["CÙNG HỌC CÙNG LÀM", "Giá Trị Bền Vững"], ["KẾT NỐI THÀNH VIÊN", "Welink Community"]], sections: [["Cấu trúc 3 Trụ cột", "Section chuẩn · pillars · CẤU TRÚC CỘNG ĐỒNG"], ["Tham gia Welink Community", "Section chuẩn · members · THAM GIA WELINK COMMUNITY"], ["CTA Gia nhập cộng đồng", "Section chuẩn · cta · GIA NHẬP CỘNG ĐỒNG"]] },
  "giai-phap-dong-hanh": { slides: [["GIẢI PHÁP ĐỒNG HÀNH", "Hệ Sinh Thái 05"], ["TĂNG TRƯỞNG TÀI SẢN", "Tăng Trưởng"], ["KẾT NỐI NGUỒN LỰC", "Hợp Tác"]], sections: [["4 Giải pháp gia tăng giá trị", "Section chuẩn · solutions · GIA TĂNG GIÁ TRỊ TÀI SẢN"], ["Thông điệp đồng hành", "Section chuẩn · tagline"]] },
  "cong-dong": { slides: [["PHÁT TRIỂN CÙNG CỘNG ĐỒNG", "Hoạt Động Xã Hội"], ["SẺ CHIA NÂNG ĐỠ", "Chương Trình Xã Hội"], ["KẾT NỐI CÙNG PHÁT TRIỂN", "Cùng Phát Triển"]], sections: [["Hoạt động cộng đồng", "Section chuẩn · activities · HOẠT ĐỘNG CỘNG ĐỒNG"], ["CTA Cùng lan tỏa giá trị", "Section chuẩn · cta · CÙNG LAN TỎA GIÁ TRỊ"]] },
  "du-an": { slides: [["HỆ SINH THÁI DỰ ÁN", "Cơ Hội Hợp Tác"], ["CƠ HỘI HỢP TÁC", "Dự Án Đang Mở"], ["TỪ Ý TƯỞNG ĐẾN VẬN HÀNH", "Phát Triển Dự Án"]], sections: [["Danh sách Dự án", "Section chuẩn · projects"], ["CTA Quan tâm dự án", "Section chuẩn · cta · QUAN TÂM DỰ ÁN?"]] },
  "nghieng-media": { slides: [["NGHIENG MEDIA", "Hệ Sinh Thái 06"], ["SÁNG TẠO NỘI DUNG", "Nội Dung Số"], ["LAN TỎA GIÁ TRỊ VIỆT", "Văn Hóa & Cộng Đồng"]], sections: [["Dịch vụ truyền thông", "Section chuẩn · services · DỊCH VỤ TRUYỀN THÔNG"], ["Sứ mệnh Nghieng Media", "Section chuẩn · mission · XÂY DỰNG BẢN SẮC THƯƠNG HIỆU"], ["Thư viện Ảnh & Video", "Section chuẩn · library"], ["CTA Hợp tác truyền thông", "Section chuẩn · cta · HỢP TÁC TRUYỀN THÔNG"]] },
  "doi-tac": { slides: [], sections: [] },
  "tin-tuc": { slides: [], sections: [] },
  "lien-he": { slides: [], sections: [] },
};

const referenceSliderImage = "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png";
const homeSliderImages = [
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/4e2c9afc5_slider-1-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9970d8492_slider-3-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9ddb1ea9d_banner-trang-chu-nghieng.webp",
];

export function defaultPageContent(slug: string): AdminPageContent | null {
  const page = ADMIN_PAGES.find((item) => item.slug === slug);
  if (!page) return null;

  const isHome = page.slug === "trang-chu";
  const sections = isHome ? homeSections : pageEditorSeeds[slug]?.sections ?? (slug === "nghieng-travel" ? travelSections : slug === "nghieng-media" ? mediaSections : standardSections);

  return {
    name: page.name,
    path: page.path,
    title: isHome ? "Nghieng Complex | Tổ hợp liên kết đa ngành" : `${page.name} | Nghieng Complex`,
    description: isHome
      ? "Nghieng Complex kết nối con người, doanh nghiệp, công nghệ và cộng đồng để cùng phát triển bền vững."
      : `Thông tin và nội dung về ${page.name} của Nghieng Complex.`,
    heroTitle: isHome ? "CÙNG PHÁT TRIỂN BỀN VỮNG" : page.name.toLocaleUpperCase("vi-VN"),
    heroDescription: isHome
      ? "Nghieng Complex đồng hành cùng Đối tác, Thành viên và Cộng đồng kiến tạo tương lai phát triển bền vững trên toàn quốc."
      : `Khám phá ${page.name} trong hệ sinh thái Nghieng Complex.`,
    active: true,
    sliders: isHome
      ? [
          { id: "home-slide-1", title: "NGHIENG COMPLEX", description: "Tổ hợp Liên kết Đa ngành", image: homeSliderImages[0], enabled: true },
          { id: "home-slide-2", title: "KẾT NỐI GIÁ TRỊ", description: "Hệ Sinh Thái Đa Ngành", image: homeSliderImages[1], enabled: true },
          { id: "home-slide-3", title: "CÙNG PHÁT TRIỂN BỀN VỮNG", description: "Tầm Nhìn 2026–2030", image: homeSliderImages[2], enabled: true },
        ] : (pageEditorSeeds[slug]?.slides ?? []).map(([title, description], index) => ({ id: `${slug}-slide-${index + 1}`, title, description, image: referenceSliderImage, enabled: true })),
    sections: sections.map(([title, description], index) => ({
      id: `${page.slug}-section-${index + 1}`,
      title,
      description,
      enabled: true,
    })),
  };
}

export function createDetailPageContent(slug: string, name: string, path: string): AdminPageContent {
  return {
    name,
    path,
    title: `${name} | Nghieng Complex`,
    description: `Khám phá ${name} trong hệ sinh thái Nghieng Complex.`,
    heroTitle: name.toLocaleUpperCase("vi-VN"),
    heroDescription: `Nội dung chi tiết ${name.toLocaleLowerCase("vi-VN")} của Nghieng Complex.`,
    active: true,
    sliders: [],
    sections: standardSections.map(([title, description], index) => ({
      id: `${slug}-section-${index + 1}`,
      title,
      description,
      enabled: true,
    })),
  };
}

export function readPageContent(slug: string): AdminPageContent | null {
  const fallback = defaultPageContent(slug);
  if (!fallback || typeof window === "undefined") return fallback;
  return pageContentCache.get(slug) ?? fallback;
}

export async function hydratePageContent(slug: string) {
  const fallback = defaultPageContent(slug);
  if (!fallback || typeof window === "undefined") return;
  const records = await loadCmsRecords("pageContents");
  const record = records.find((item) => item.slug === slug);
  if (!record) {
    await savePageContent(slug, fallback);
    return;
  }
  const saved = record.content as Partial<AdminPageContent>;
  const content = { ...fallback, ...saved, sliders: saved.sliders ?? fallback.sliders, sections: saved.sections ?? fallback.sections };
  pageContentCache.set(slug, content);
  window.dispatchEvent(new Event("nghieng:content-updated"));
}

export async function savePageContent(slug: string, content: AdminPageContent) {
  const records = await loadCmsRecords("pageContents");
  const existing = records.find((item) => item.slug === slug);
  const next = records.filter((item) => item.slug !== slug);
  next.push({ id: existing?.id ?? "page-" + slug, slug, content: content as unknown as Record<string, unknown>, order: existing?.order ?? next.length + 1 });
  const result = await saveCmsRecords("pageContents", next);
  if (result.persisted) {
    pageContentCache.set(slug, content);
    window.dispatchEvent(new Event("nghieng:content-updated"));
  }
  return result;
}

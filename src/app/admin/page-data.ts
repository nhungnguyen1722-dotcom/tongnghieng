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

export function defaultPageContent(slug: string): AdminPageContent | null {
  const page = ADMIN_PAGES.find((item) => item.slug === slug);
  if (!page) return null;

  const isHome = page.slug === "trang-chu";
  const sections = isHome ? homeSections : slug === "nghieng-travel" ? travelSections : slug === "nghieng-media" ? mediaSections : standardSections;

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
          { id: "home-slide-1", title: "NGHIENG COMPLEX", description: "Tổ hợp Liên kết Đa ngành", image: "", enabled: true },
          { id: "home-slide-2", title: "KẾT NỐI GIÁ TRỊ", description: "Hệ Sinh Thái Đa Ngành", image: "", enabled: true },
          { id: "home-slide-3", title: "CÙNG PHÁT TRIỂN BỀN VỮNG", description: "Tầm nhìn 2026–2030", image: "", enabled: true },
        ]
      : [],
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
  if (!record) return;
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

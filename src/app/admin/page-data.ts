import { loadCmsRecords, saveCmsRecords } from "@/lib/cms-client";
import { PUBLIC_IMAGES } from "@/lib/cms-data";

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

export type AdminSectionItem = {
  id: string;
  title: string;
  description: string;
  icon?: "anchor" | "building" | "tree" | "globe" | "layers" | "cpu" | "users" | "trending-up" | "shield";
  subtitle?: string;
  image?: string;
  href?: string;
};

export type AdminSection = {
  id: string;
  title: string;
  description: string;
  body?: string;
  image?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  items?: AdminSectionItem[];
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
  contentRevision?: number;
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

const homeEcosystemCards: AdminSectionItem[] = [
  { id: "home-ecosystem-travel", title: "Nghieng Travel", subtitle: "Du lịch & Nghỉ dưỡng", description: "Nhà hàng, Khách sạn, Bungalow, Khu sinh thái trên nhiều Tỉnh – Thành phố. Tour Nội địa & Quốc tế.", href: "/nghieng-travel", image: "/images/ecosystem/nghieng-travel.png", icon: "globe" },
  { id: "home-ecosystem-mining", title: "Khoáng Sản", subtitle: "Thương mại & Chế biến", description: "Sơ chế quặng, Thương mại quặng sắt – Than xít – Vật liệu xây dựng. Dự án hợp tác toàn quốc.", href: "/khoang-san", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/0575d5b5e_generated_cd45ba2c.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/0575d5b5e_generated_cd45ba2c.webp", icon: "layers" },
  { id: "home-ecosystem-tech", title: "Công Nghệ – AI", subtitle: "Just It & Welink", description: "Chuyển đổi số doanh nghiệp, văn hóa vùng miền và kết nối phát triển kinh tế.", href: "/cong-nghe-ai", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/490b8b229_generated_d36d21f3.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/490b8b229_generated_d36d21f3.webp", icon: "cpu" },
  { id: "home-ecosystem-community", title: "Phát Triển Cộng Đồng", subtitle: "Welink Community", description: "Liên kết đa ngành, Phát triển Thành viên, thúc đẩy tiêu dùng Toàn Quốc.", href: "/phat-trien-cong-dong", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/66b82594f_generated_b3e2a1e9.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/66b82594f_generated_b3e2a1e9.webp", icon: "users" },
  { id: "home-ecosystem-partnership", title: "Giải Pháp Đồng Hành", subtitle: "Gia tăng tài sản", description: "Gia tăng giá trị tài sản hiện có của Thành viên và kinh doanh cùng Nghieng Complex.", href: "/giai-phap-dong-hanh", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/bf72ef9a4_generated_1480f26e.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/bf72ef9a4_generated_1480f26e.webp", icon: "trending-up" },
  { id: "home-ecosystem-media", title: "Nghieng Media", subtitle: "Film, TVC, PR, MICE", description: "Xây dựng hình ảnh, quảng bá bản sắc dân tộc. Kêu gọi cộng đồng tham gia.", href: "/nghieng-media", image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/34e6f8dae_generated_816e7c29.png/v1/fill/w_785,h_352,al_c,q_90,enc_webp,quality_auto/34e6f8dae_generated_816e7c29.webp", icon: "shield" },
];

export const TRAVEL_FACILITY_ITEMS: AdminSectionItem[] = [
  { id: "cang-ca-na", title: "Cảng Nội Địa Cà Ná", description: "Điện Năng lượng\nTrung tâm Thương mại dịch vụ\nSản phẩm & Dịch vụ Nghề Cá\nKhu nghỉ dưỡng", icon: "anchor", image: PUBLIC_IMAGES[3], href: "/cang-ca-na" },
  { id: "nha-hang-khach-san", title: "Nhà Hàng – Khách Sạn", description: "Điểm lưu trú và phát triển cộng đồng\nĐiểm bày - bán sản phẩm vùng miền\nĐiểm Hợp tác Kinh doanh - Kết nối\nNhân bản chuỗi & Chuyển đổi số", icon: "building", image: PUBLIC_IMAGES[1], href: "/nha-hang-khach-san" },
  { id: "khu-sinh-thai-resort", title: "Khu Sinh Thái – Resort", description: "Lưu trú, trải nghiệm thiên nhiên\nThăm quan Văn hóa vùng miền\nTrung tâm vui chơi, mua sắm\nĐiểm Đào tạo & Team building\nNhân bản mô hình Toàn quốc", icon: "tree", image: PUBLIC_IMAGES[4], href: "/resort" },
];

const aboutHeroDescription = "Nghieng Complex — Tổ hợp Liên kết Đa ngành, nơi Con người, Doanh nghiệp và Công nghệ cùng cộng hưởng giá trị.";
const aboutSections: AdminSection[] = [
  {
    id: "gioi-thieu-section-1",
    title: "MÔ HÌNH TỔ HỢP LIÊN KẾT ĐA NGÀNH",
    description: "Trong bối cảnh nền kinh tế đang chuyển mình mạnh mẽ dưới tác động của chuyển đổi số, hội nhập toàn cầu và xu hướng phát triển bền vững, năng lực cạnh tranh của một doanh nghiệp không còn được quyết định bởi quy mô của từng lĩnh vực kinh doanh riêng lẻ.",
    body: "Được hình thành từ tư duy đó, Nghieng Complex ra đời với sứ mệnh trở thành Tổ hợp Liên kết Đa ngành, xây dựng một hệ sinh thái kinh tế hiện đại, nơi Con người, Doanh nghiệp, Công nghệ, Nguồn lực và Cộng đồng được kết nối trên cùng một nền tảng.\n\nKhác với mô hình tập đoàn đa ngành truyền thống, Nghieng Complex không đơn thuần tập hợp nhiều lĩnh vực kinh doanh, mà xây dựng một Hệ sinh thái Liên kết, trong đó mỗi ngành nghề vừa hoạt động độc lập, vừa trở thành động lực thúc đẩy sự phát triển của nhau.",
    image: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/bf72ef9a4_generated_1480f26e.png/v1/fill/w_582,h_327,al_c,q_90,usm_0.66_1.00_0.01,enc_webp,quality_auto/bf72ef9a4_generated_1480f26e.webp",
    enabled: true,
  },
  {
    id: "gioi-thieu-section-2",
    title: "THÔNG ĐIỆP CHIẾN LƯỢC",
    description: "",
    items: [
      { id: "mission", title: "Sứ Mệnh", description: "Trở thành Tổ hợp Liên kết Đa ngành hàng đầu, kiến tạo hệ sinh thái phát triển bền vững nơi mọi thành viên đều được hưởng lợi và phát triển cùng nhau." },
      { id: "vision", title: "Tầm Nhìn", description: "Đến 2030, Nghieng Complex trở thành mạng lưới kết nối quốc gia với sự hiện diện tại nhiều Tỉnh – Thành phố, thúc đẩy kinh tế và bảo tồn bản sắc dân tộc Việt Nam." },
      { id: "philosophy", title: "Triết Lý", description: "Chúng tôi tin rằng khi các nguồn lực được kết nối, các lĩnh vực được cộng hưởng và mỗi Thành viên có cơ hội phát huy giá trị, sẽ tạo nên một hệ sinh thái đủ mạnh để cùng phát triển." },
    ],
    enabled: true,
  },
  {
    id: "gioi-thieu-section-3",
    title: "4 GIÁ TRỊ NỀN TẢNG",
    description: "",
    items: [
      { id: "transparency", title: "Minh Bạch", description: "Hoạt động dựa trên sự công khai và trách nhiệm rõ ràng với tất cả thành viên." },
      { id: "sustainability", title: "Bền Vững", description: "Mọi chiến lược đều hướng đến phát triển lâu dài, cân bằng kinh tế và xã hội." },
      { id: "connection", title: "Liên Kết", description: "Tạo chuỗi giá trị đa ngành, mỗi lĩnh vực hỗ trợ và cộng hưởng cùng nhau." },
      { id: "innovation", title: "Đổi Mới", description: "Không ngừng ứng dụng công nghệ và tư duy sáng tạo để nâng cao năng lực cạnh tranh." },
    ],
    enabled: true,
  },
  {
    id: "gioi-thieu-section-4",
    title: "Thông điệp Đối tác",
    description: "",
    body: "\"Đối với Nghieng Complex, mỗi Đối tác không chỉ là người hợp tác, mỗi Nhà đầu tư không chỉ là người đồng hành, mỗi Thành viên không chỉ là một cá nhân trong tổ chức. Tất cả đều là những mắt xích quan trọng tạo nên sức mạnh của một Cộng đồng phát triển.\"",
    ctaLabel: "Trở Thành Đối Tác",
    ctaUrl: "/lien-he",
    enabled: true,
  },
];

const pageEditorSeeds: Record<string, { slides: [string, string][]; sections: [string, string][] }> = {
  "gioi-thieu": { slides: [["GIỚI THIỆU TẬP ĐOÀN", aboutHeroDescription], ["GIỚI THIỆU TẬP ĐOÀN", aboutHeroDescription], ["GIỚI THIỆU TẬP ĐOÀN", aboutHeroDescription]], sections: [["MÔ HÌNH TỔ HỢP LIÊN KẾT ĐA NGÀNH", aboutSections[0].description], ["THÔNG ĐIỆP CHIẾN LƯỢC", "Sứ mệnh, tầm nhìn và triết lý phát triển."], ["4 GIÁ TRỊ NỀN TẢNG", "Minh bạch · Bền vững · Liên kết · Đổi mới."], ["Thông điệp Đối tác", "Trở Thành Đối Tác"]] },
  "nghieng-travel": { slides: [["NGHIENG TRAVEL", "Hệ Sinh Thái 01"], ["HÀNH TRÌNH ĐÍCH THỰC", "Trải Nghiệm"], ["DU LỊCH BỀN VỮNG", "Phát Triển Du Lịch"]], sections: [["HỆ THỐNG NGHỈ DƯỠNG", "Section chuẩn · facilities · HỆ THỐNG NGHỈ DƯỠNG"], ["HẠNG MỤC TỔ CHỨC TOUR", "Section chuẩn · tours · HẠNG MỤC TỔ CHỨC TOUR"], ["GIÁ TRỊ MANG LẠI", "Section chuẩn · benefits · GIÁ TRỊ MANG LẠI"], ["KHÁM PHÁ CÙNG NGHIENG TRAVEL", "Section chuẩn · cta · KHÁM PHÁ CÙNG NGHIENG TRAVEL"], ["CÙNG THAM GIA - CÙNG KẾT NỐI - CÙNG PHÁT TRIỂN", "Dải thông điệp cuối trang"]] },
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
      : slug === "gioi-thieu" ? aboutHeroDescription : `Thông tin và nội dung về ${page.name} của Nghieng Complex.`,
    heroTitle: isHome ? "CÙNG PHÁT TRIỂN BỀN VỮNG" : slug === "gioi-thieu" ? "GIỚI THIỆU TẬP ĐOÀN" : page.name.toLocaleUpperCase("vi-VN"),
    heroDescription: isHome
      ? "Nghieng Complex đồng hành cùng Đối tác, Thành viên và Cộng đồng kiến tạo tương lai phát triển bền vững trên toàn quốc."
      : slug === "gioi-thieu" ? aboutHeroDescription : `Khám phá ${page.name} trong hệ sinh thái Nghieng Complex.`,
    active: true,
    ...(slug === "gioi-thieu" ? { contentRevision: 3 } : slug === "trang-chu" ? { contentRevision: 5 } : {}),
    sliders: isHome
      ? [
          { id: "home-slide-1", title: "NGHIENG COMPLEX", description: "Tổ hợp Liên kết Đa ngành", image: homeSliderImages[0], enabled: true },
          { id: "home-slide-2", title: "KẾT NỐI GIÁ TRỊ", description: "Hệ Sinh Thái Đa Ngành", image: homeSliderImages[1], enabled: true },
          { id: "home-slide-3", title: "CÙNG PHÁT TRIỂN BỀN VỮNG", description: "Tầm Nhìn 2026–2030", image: homeSliderImages[2], enabled: true },
        ] : (pageEditorSeeds[slug]?.slides ?? []).map(([title, description], index) => ({ id: `${slug}-slide-${index + 1}`, title, description, image: slug === "gioi-thieu" ? aboutSections[0].image! : referenceSliderImage, enabled: true })),
    sections: slug === "gioi-thieu" ? aboutSections.map((section) => ({ ...section, items: section.items?.map((item) => ({ ...item })) })) : sections.map(([title, description], index) => ({
      id: `${page.slug}-section-${index + 1}`,
      title,
      description,
      ...(slug === "trang-chu" && title === "Cards 06 lĩnh vực" ? { items: homeEcosystemCards.map((item) => ({ ...item })) } : {}),
      ...(slug === "nghieng-travel" && index === 0 ? { items: TRAVEL_FACILITY_ITEMS.map((item) => ({ ...item })) } : {}),
      enabled: true,
    })),
  };
}

export function mergePageContentWithDefaults(slug: string, fallback: AdminPageContent, saved: Partial<AdminPageContent>): AdminPageContent {
  // Restore the about page reference content once; later CMS edits remain editable.
  const currentSaved = slug === "gioi-thieu" && saved.contentRevision !== 3
    ? { ...saved, sliders: fallback.sliders, sections: fallback.sections, contentRevision: 3 }
    : saved;
  const savedSections = currentSaved.sections ?? fallback.sections;
  const savedById = new Map(savedSections.map((section) => [section.id, section]));
  const sections = fallback.sections.map((seed) => {
    const existing = savedById.get(seed.id);
    if (!existing) return seed;
    const merged = { ...seed, ...existing };
    if (seed.items) {
      const savedItems = new Map((existing.items ?? []).map((item) => [item.id, item]));
      merged.items = seed.items.map((defaultItem) => {
        const item = savedItems.get(defaultItem.id);
        if (!item) return defaultItem;
        return {
          ...defaultItem,
          ...item,
          title: item.title || defaultItem.title,
          description: item.description || defaultItem.description,
          icon: item.icon || defaultItem.icon,
          subtitle: item.subtitle || defaultItem.subtitle,
          image: slug === "trang-chu" && defaultItem.id === "home-ecosystem-travel" && item.image?.includes("99323fe9c_generated_ce3c7248") ? defaultItem.image : item.image || defaultItem.image,
          href: item.href || defaultItem.href,
        };
      });
    }
    return merged;
  });
  const fallbackIds = new Set(fallback.sections.map((section) => section.id));
  sections.push(...savedSections.filter((section) => !fallbackIds.has(section.id)));
  return {
    ...fallback,
    ...currentSaved,
    sliders: currentSaved.sliders ?? fallback.sliders,
    sections,
    ...(slug === "gioi-thieu" ? { contentRevision: 3 } : slug === "trang-chu" ? { contentRevision: 5 } : {}),
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
  const content = mergePageContentWithDefaults(slug, fallback, saved);
  pageContentCache.set(slug, content);
  window.dispatchEvent(new Event("nghieng:content-updated"));
  if ((slug === "gioi-thieu" && saved.contentRevision !== content.contentRevision) || (slug === "trang-chu" && saved.contentRevision !== content.contentRevision)) {
    await savePageContent(slug, content);
  }
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

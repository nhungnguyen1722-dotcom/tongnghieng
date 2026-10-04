export type PublishState = "published" | "draft";

export type TourCategory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
};

export type TourDay = {
  day: number;
  title: string;
  activities: string[];
};

export type CmsTour = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  duration: string;
  guestRange: string;
  summary: string;
  description: string;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  state: PublishState;
  order: number;
  image: string;
  gallery: string[];
  highlights: string[];
  itinerary: TourDay[];
  hotelOptions: string[];
  departureDate: string;
  seoTitle: string;
  seoDescription: string;
};

export type VenueKind = "restaurant" | "hotel" | "resort" | "retreat" | "bungalow";

export type VenueRoom = {
  name: string;
  price: number;
  capacity: string;
  image: string;
  amenities: string[];
};

export type CmsVenue = {
  id: string;
  slug: string;
  title: string;
  kind: VenueKind;
  category: string;
  location: string;
  address: string;
  summary: string;
  description: string;
  quote: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  state: PublishState;
  order: number;
  image: string;
  gallery: string[];
  amenities: string[];
  rooms: VenueRoom[];
  checkIn: string;
  checkOut: string;
  seoTitle: string;
  seoDescription: string;
};

export type CmsArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  status: "Ý tưởng" | "Nghiên cứu" | "Tìm đối tác" | "Triển khai" | "Vận hành" | "Hoàn thành" | PublishState;
  active: boolean;
  date: string;
  image: string;
  relatedIds: string[];
  isDemo: boolean;
  order: number;
};

export type CmsMenuItem = {
  id: string;
  label: string;
  url: string;
  parentId: string | null;
  target: "_self" | "_blank";
  active: boolean;
  kind: "link" | "cta";
  order: number;
};

export type CmsDocument = {
  id: string;
  title: string;
  type: "PPTX" | "Slide" | "PDF" | "Link";
  category: string;
  url: string;
  status: PublishState;
  order: number;
};

export type CmsAccount = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
  status: "Active" | "Inactive";
  passwordChangeRequired: boolean;
  passwordHash?: string;
};

export type CmsPageContent = {
  id: string;
  slug: string;
  content: Record<string, unknown>;
  order: number;
};

export type CmsMedia = {
  id: string;
  title: string;
  url: string;
  type: "image" | "logo";
  source: "library" | "external";
  active?: boolean;
};

export type CmsRecordMap = {
  tours: CmsTour;
  tourCategories: TourCategory;
  venues: CmsVenue;
  venueCategories: { id: string; slug: string; title: string; kind: VenueKind; description: string; order: number; active: boolean };
  news: CmsArticle;
  projects: CmsArticle;
  menu: CmsMenuItem;
  documents: CmsDocument;
  users: CmsAccount;
  media: CmsMedia;
  pageContents: CmsPageContent;
};

export type CmsCollection = keyof CmsRecordMap;
export type CmsRecord = CmsRecordMap[CmsCollection];

export const BRAND_LOGOS = [
  {
    id: "logo-nghieng-complex",
    active: true,
    title: "Nghieng Complex, nền tối",
    url: "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/7d454ef94_nghieng_complex_logo_dark_transparent.png",
    type: "logo" as const,
    source: "external" as const,
  },
  {
    id: "logo-nghieng",
    active: false,
    title: "Logo Nghiêng",
    url: "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/6d68e3aa8_logo-nghieng.png",
    type: "logo" as const,
    source: "external" as const,
  },
];

export const PUBLIC_IMAGES = [
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/4e2c9afc5_slider-1-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9970d8492_slider-3-home.jpg",
  "https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/9ddb1ea9d_banner-trang-chu-nghieng.webp",
  "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/99323fe9c_generated_ce3c7248.png",
  "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/0575d5b5e_generated_cd45ba2c.png",
  "https://media.base44.com/images/public/6a867a0f31b1d902ab55332d/490b8b229_generated_d36d21f3.png",
];

const venuePhotos = [PUBLIC_IMAGES[0], PUBLIC_IMAGES[1], PUBLIC_IMAGES[2], PUBLIC_IMAGES[3], PUBLIC_IMAGES[4], PUBLIC_IMAGES[5]];
const tourPhotos = [PUBLIC_IMAGES[3], PUBLIC_IMAGES[4], PUBLIC_IMAGES[0], PUBLIC_IMAGES[5], PUBLIC_IMAGES[1], PUBLIC_IMAGES[2]];
const hotelPhotos = [PUBLIC_IMAGES[0], PUBLIC_IMAGES[1], PUBLIC_IMAGES[2], PUBLIC_IMAGES[3], PUBLIC_IMAGES[4]];

const tourCategories: TourCategory[] = [
  { id: "category-tour-ecosystem", slug: "he-sinh-thai", title: "Tour Hệ Sinh Thái Nghieng", description: "Tham quan và trải nghiệm trực tiếp các điểm trong hệ sinh thái Nghieng Complex.", image: tourPhotos[0], order: 1, active: true },
  { id: "category-tour-culture", slug: "van-hoa-vung-mien", title: "Tour Văn Hóa Vùng Miền", description: "Khám phá bản sắc, trải nghiệm di sản và kết nối con người.", image: tourPhotos[1], order: 2, active: true },
  { id: "category-tour-business", slug: "doanh-nghiep-hoi-nhom", title: "Tour Doanh Nghiệp & Hội Nhóm", description: "Chương trình du lịch dành cho doanh nghiệp, tổ chức và hội nhóm.", image: tourPhotos[2], order: 3, active: true },
  { id: "category-tour-team", slug: "team-building-dao-tao", title: "Tour Team Building & Đào Tạo", description: "Kết hợp trải nghiệm, phát triển kỹ năng và gắn kết đội ngũ.", image: tourPhotos[3], order: 4, active: true },
];

const culturalTours = [
  ["Hành trình di sản Hội An", "hoi-an", "Hội An, Quảng Nam", "2 ngày 1 đêm", "2–10 khách", "Khám phá phố cổ Hội An, di sản văn hóa thế giới và ẩm thực đặc sắc.", 4200000],
  ["Dấu ấn cố đô Huế", "co-do-hue", "Huế, Thừa Thiên Huế", "2 ngày 1 đêm", "2–10 khách", "Trải nghiệm kinh thành, lăng tẩm và nhã nhạc cung đình Huế.", 3900000],
  ["Sắc màu Tây Bắc", "sac-mau-tay-bac", "Sapa, Lào Cai", "3 ngày 2 đêm", "2–12 khách", "Khám phá ruộng bậc thang, bản làng và văn hóa vùng cao.", 5200000],
  ["Non nước Ninh Bình", "non-nuoc-ninh-binh", "Ninh Bình", "2 ngày 1 đêm", "2–10 khách", "Chiêm ngưỡng quần thể danh thắng và di sản văn hóa truyền thống.", 3600000],
  ["Khám phá miền Trung di sản", "kham-pha-mien-trung-di-san", "Đà Nẵng – Hội An – Huế", "3 ngày 2 đêm", "2–12 khách", "Hành trình đưa bạn đến với những giá trị văn hóa, lịch sử, kiến trúc và ẩm thực đặc sắc miền Trung.", 4990000],
  ["Bản làng Tây Nguyên", "ban-lang-tay-nguyen", "Kon Tum – Gia Lai – Đắk Lắk", "3 ngày 2 đêm", "2–12 khách", "Tìm hiểu văn hóa các dân tộc Tây Nguyên và đời sống cộng đồng bản địa.", 5500000],
  ["Khám phá đảo Ngọc", "kham-pha-dao-ngoc", "Phú Quốc, Kiên Giang", "3 ngày 2 đêm", "2–10 khách", "Kết hợp trải nghiệm văn hóa địa phương, tham quan làng nghề và thưởng thức ẩm thực biển đảo.", 5900000],
  ["Hương sắc Tây Nguyên", "huong-sac-tay-nguyen", "Buôn Ma Thuột, Đắk Lắk", "2 ngày 1 đêm", "2–12 khách", "Trải nghiệm đời sống bản địa, thưởng thức cà phê và khám phá văn hóa cộng đồng.", 3800000],
  ["Về miền biển đảo", "ve-mien-bien-dao", "Nha Trang, Khánh Hòa", "3 ngày 2 đêm", "2–12 khách", "Khám phá văn hóa làng chài, điểm di tích và thưởng thức hải sản tươi ngon.", 4800000],
] as const;

const tourItems: CmsTour[] = culturalTours.map((row, index) => {
  const [title, slug, location, duration, guestRange, summary, priceFrom] = row;
  return {
    id: "tour-" + slug,
    slug,
    title,
    category: "van-hoa-vung-mien",
    location,
    duration,
    guestRange,
    summary,
    description: summary + " Hành trình được thiết kế để du khách hiểu thêm về di sản, con người và những giá trị đặc sắc của từng vùng miền.",
    priceFrom,
    rating: slug === "kham-pha-mien-trung-di-san" ? 4.8 : 4.7,
    reviewCount: slug === "kham-pha-mien-trung-di-san" ? 320 : 86 + index * 13,
    state: "published",
    order: index + 1,
    image: tourPhotos[index % tourPhotos.length],
    gallery: [tourPhotos[index % tourPhotos.length], tourPhotos[(index + 1) % tourPhotos.length], tourPhotos[(index + 2) % tourPhotos.length], tourPhotos[(index + 3) % tourPhotos.length], tourPhotos[(index + 4) % tourPhotos.length]],
    highlights: ["Khám phá di sản văn hóa thế giới", "Trải nghiệm ẩm thực đặc sắc miền Trung", "Tham quan làng nghề truyền thống", "Hướng dẫn viên chuyên nghiệp"],
    itinerary: [
      { day: 1, title: "Đà Nẵng – Hội An", activities: ["Đón khách tại sân bay Đà Nẵng, di chuyển về Hội An", "Tham quan phố cổ Hội An, Chùa Cầu, nhà cổ Tấn Ký", "Thưởng thức ẩm thực đặc sản địa phương"] },
      { day: 2, title: "Hội An – Huế", activities: ["Khởi hành đi Huế, tham quan Đại Nội và lăng Khải Định", "Trải nghiệm áo dài, nghe nhã nhạc cung đình", "Nghỉ đêm tại Huế"] },
      { day: 3, title: "Huế – Đà Nẵng", activities: ["Tham quan chùa Thiên Mụ và sông Hương", "Tự do mua sắm đặc sản", "Kết thúc hành trình, đưa khách ra sân bay"] },
    ],
    hotelOptions: ["Nghieng Oceanview Hotel & Resort", "Nghieng Central Hotel", "Nghieng Heritage Hotel"],
    departureDate: "2026-10-15",
    seoTitle: title + " | Nghieng Travel",
    seoDescription: summary,
  };
});

const additionalTours = [
  ["Tour Khám phá Cảng Cà Ná – 1 ngày", "kham-pha-cang-ca-na", "he-sinh-thai", "Cà Ná, Ninh Thuận", "1 ngày", "2–20 khách", 1800000],
  ["Tour Sinh thái & Nghỉ dưỡng – 2N1Đ", "sinh-thai-nghi-duong", "he-sinh-thai", "Cà Ná, Ninh Thuận", "2 ngày 1 đêm", "2–12 khách", 3200000],
  ["Tour Team Building tại Khu Sinh Thái", "team-building-khu-sinh-thai", "he-sinh-thai", "Ninh Thuận", "1 ngày", "10–40 khách", 2500000],
  ["Tour Meeting & Incentive tại Resort", "meeting-incentive-resort", "doanh-nghiep-hoi-nhom", "Cam Ranh, Khánh Hòa", "2 ngày 1 đêm", "10–30 khách", 6500000],
  ["Tour Gala Dinner", "gala-dinner", "doanh-nghiep-hoi-nhom", "Đà Nẵng", "1 ngày", "10–50 khách", 2900000],
  ["Tour VIP", "tour-vip", "doanh-nghiep-hoi-nhom", "Toàn quốc", "Theo yêu cầu", "2–12 khách", 8900000],
  ["Tour Hội thảo tại Resort", "hoi-thao-resort", "doanh-nghiep-hoi-nhom", "Cam Ranh, Khánh Hòa", "2 ngày 1 đêm", "10–40 khách", 7200000],
  ["Team Building Bãi biển", "team-building-bai-bien", "team-building-dao-tao", "Nha Trang, Khánh Hòa", "1 ngày", "10–40 khách", 1900000],
  ["Team Building Sinh thái", "team-building-sinh-thai", "team-building-dao-tao", "Cà Ná, Ninh Thuận", "2 ngày 1 đêm", "10–40 khách", 3500000],
  ["Đào tạo lãnh đạo outdoor", "dao-tao-lanh-dao-outdoor", "team-building-dao-tao", "Đà Lạt, Lâm Đồng", "2 ngày 1 đêm", "8–20 khách", 5800000],
] as const;

for (const [index, row] of additionalTours.entries()) {
  const [title, slug, category, location, duration, guestRange, priceFrom] = row;
  tourItems.push({
    id: "tour-" + slug,
    slug,
    title,
    category,
    location,
    duration,
    guestRange,
    summary: "Hành trình được thiết kế linh hoạt, kết nối trải nghiệm và giá trị của từng điểm đến.",
    description: "Chương trình kết hợp trải nghiệm địa phương, dịch vụ phù hợp và sự đồng hành của đội ngũ hướng dẫn viên.",
    priceFrom,
    rating: 4.7,
    reviewCount: 58 + index,
    state: "published",
    order: culturalTours.length + index + 1,
    image: tourPhotos[index % tourPhotos.length],
    gallery: [tourPhotos[index % tourPhotos.length], tourPhotos[(index + 1) % tourPhotos.length], tourPhotos[(index + 2) % tourPhotos.length], tourPhotos[(index + 3) % tourPhotos.length], tourPhotos[(index + 4) % tourPhotos.length]],
    highlights: ["Trải nghiệm theo chủ đề", "Lịch trình linh hoạt", "Đội ngũ đồng hành chuyên nghiệp"],
    itinerary: [],
    hotelOptions: ["Nghieng Oceanview Hotel & Resort", "Nghieng Central Hotel"],
    departureDate: "2026-10-15",
    seoTitle: title + " | Nghieng Travel",
    seoDescription: "Khám phá hành trình " + title + " cùng Nghieng Travel.",
  });
}

const restaurants = [
  ["The Coral", "the-coral", "Đảo Ngọc, Phú Quốc, Kiên Giang", "Không gian ẩm thực sang trọng với hải sản tươi ngon và tầm nhìn hướng biển tuyệt đẹp."],
  ["Sen Vàng", "sen-vang", "TP. Đà Nẵng, Việt Nam", "Tinh hoa ẩm thực Việt trong không gian hiện đại, sang trọng."],
  ["An Nhiên", "an-nhien", "Hội An, Quảng Nam", "Hương vị truyền thống trong không gian đậm chất phố cổ."],
  ["Sunrise", "sunrise", "Nha Trang, Khánh Hòa", "Đa dạng món Á – Âu, kết hợp nguyên liệu địa phương."],
  ["Ocean View", "ocean-view", "Đà Nẵng, Việt Nam", "Trải nghiệm ẩm thực cao cấp với tầm nhìn hướng biển ngoạn mục."],
  ["Làng Việt", "lang-viet", "Mũi Cà Mau, Cà Mau", "Ẩm thực dân tộc đặc sắc trong không gian văn hóa truyền thống."],
  ["Hương Việt", "huong-viet", "Vĩnh Long, Bến Tre", "Hương vị quê hương đậm đà, mộc mạc, gần gũi với thiên nhiên."],
  ["Vị Biển", "vi-bien", "Phú Quốc, Kiên Giang", "Hải sản tươi ngon, chế biến tinh tế trong không gian mở hướng biển."],
  ["Miền Xanh", "mien-xanh", "Cần Thơ, Việt Nam", "Không gian xanh mát, gần gũi thiên nhiên, phục vụ đặc sản miền Tây."],
] as const;

const venueItems: CmsVenue[] = restaurants.map((row, index) => {
  const [title, slug, location, summary] = row;
  const image = venuePhotos[index % venuePhotos.length];
  return {
    id: "venue-restaurant-" + slug,
    slug,
    title: "Nhà hàng " + title,
    kind: "restaurant",
    category: "nha-hang",
    location,
    address: location,
    summary,
    description: summary + " Không gian được thiết kế để tạo nên trải nghiệm trọn vẹn, kết hợp bản sắc vùng miền với dịch vụ chu đáo.",
    quote: "Hương vị địa phương, trải nghiệm đáng nhớ.",
    rating: 4.7 + (index % 3) / 10,
    reviewCount: 82 + index * 19,
    priceFrom: 350000 + index * 50000,
    state: "published",
    order: index + 1,
    image,
    gallery: [image, venuePhotos[(index + 1) % venuePhotos.length], venuePhotos[(index + 2) % venuePhotos.length], venuePhotos[(index + 3) % venuePhotos.length], venuePhotos[(index + 4) % venuePhotos.length]],
    amenities: ["Ẩm thực địa phương", "Không gian sang trọng", "Phục vụ theo yêu cầu"],
    rooms: [],
    checkIn: "",
    checkOut: "",
    seoTitle: "Nhà hàng " + title + " | Nghieng Travel",
    seoDescription: summary,
  };
});

const hotels = [
  ["Nghieng Oceanview Hotel & Resort", "nghieng-oceanview-hotel-resort", "Bãi Dài, Cam Ranh, Khánh Hòa", "Resort 5 sao bên bờ biển, kết hợp không gian nghỉ dưỡng yên bình với tiện nghi hiện đại.", 4.8, 324],
  ["Nghieng Central Hotel", "nghieng-central-hotel", "Đà Nẵng, Việt Nam", "Khách sạn trung tâm thuận tiện kết nối điểm đến và trải nghiệm thành phố.", 4.7, 186],
  ["Nghieng Heritage Hotel", "nghieng-heritage-hotel", "Hội An, Quảng Nam", "Không gian nghỉ dưỡng lấy cảm hứng từ kiến trúc và di sản địa phương.", 4.8, 142],
] as const;

for (const [index, row] of hotels.entries()) {
  const [title, slug, location, summary, rating, reviewCount] = row;
  venueItems.push({
    id: "venue-hotel-" + slug,
    slug,
    title,
    kind: "hotel",
    category: "khach-san",
    location,
    address: location,
    summary,
    description: "Nghiêng Oceanview Hotel & Resort là điểm đến lý tưởng cho những ai yêu thích sự yên bình, sang trọng và gần gũi với thiên nhiên. Với vị trí đắc địa bên bờ biển, khách sạn sở hữu tầm nhìn hướng đại dương và hệ thống phòng nghỉ được thiết kế tinh tế, hiện đại.\n\nKhông chỉ là nơi lưu trú, nơi đây còn là không gian để bạn tận hưởng ẩm thực đặc sắc, thư giãn tại spa và tham gia các hoạt động giải trí biển.",
    quote: "Nghỉ dưỡng không chỉ là điểm đến mà còn là hành trình tìm về sự cân bằng.",
    rating,
    reviewCount,
    priceFrom: [2500000, 1900000, 2200000][index],
    state: "published",
    order: index + 1,
    image: hotelPhotos[0],
    gallery: hotelPhotos,
    amenities: ["Wifi miễn phí", "Bể bơi vô cực", "Nhà hàng sang trọng", "Spa & Wellness", "Đưa đón sân bay", "Dịch vụ phòng 24/7"],
    rooms: [
      { name: "Deluxe Ocean View", price: 2500000, capacity: "2 người · 1 giường đôi", image: hotelPhotos[1], amenities: ["32 m²", "Ban công hướng biển"] },
      { name: "Premium Beach Front", price: 3800000, capacity: "2 người · 1 giường đôi", image: hotelPhotos[2], amenities: ["45 m²", "Bãi biển riêng"] },
      { name: "Suite Ocean View", price: 5500000, capacity: "4 người · 2 giường", image: hotelPhotos[3], amenities: ["70 m²", "Phòng khách riêng"] },
    ],
    checkIn: "14:00",
    checkOut: "12:00",
    seoTitle: title + " | Nghieng Travel",
    seoDescription: summary,
  });
}

const venueExtras: Array<[VenueKind, string, string, string, string]> = [
  ["resort", "Oceanview Resort", "oceanview-resort", "Cam Ranh, Khánh Hòa", "Nghỉ dưỡng bên bờ biển với không gian mở, hồ bơi và dịch vụ chăm sóc toàn diện."],
  ["resort", "Green Resort", "green-resort", "Cà Ná, Ninh Thuận", "Khu nghỉ dưỡng xanh gắn với thiên nhiên và trải nghiệm địa phương."],
  ["resort", "Island Resort", "island-resort", "Phú Quốc, Kiên Giang", "Kết nối trải nghiệm biển đảo, ẩm thực và văn hóa bản địa."],
  ["retreat", "Nghieng Complex Retreat", "nghieng-complex-retreat", "Toàn quốc", "Không gian nghỉ dưỡng gắn kết cộng đồng và phát triển bền vững."],
  ["retreat", "Sinh thái Cà Ná", "sinh-thai-ca-na", "Cà Ná, Ninh Thuận", "Điểm đến sinh thái kết hợp trải nghiệm thiên nhiên và văn hóa địa phương."],
  ["bungalow", "Ocean View Bungalow", "ocean-view-bungalow", "Cam Ranh, Khánh Hòa", "Bungalow hướng biển cho kỳ nghỉ riêng tư, gần gũi thiên nhiên."],
  ["bungalow", "Garden Bungalow", "garden-bungalow", "Cà Ná, Ninh Thuận", "Không gian sân vườn yên tĩnh với tiện nghi thiết yếu."],
  ["bungalow", "Family Bungalow", "family-bungalow", "Phú Quốc, Kiên Giang", "Lựa chọn rộng rãi cho gia đình và nhóm bạn."],
  ["bungalow", "VIP Bungalow", "vip-bungalow", "Cam Ranh, Khánh Hòa", "Không gian nghỉ dưỡng riêng tư với dịch vụ cao cấp."],
];

for (const [index, [kind, title, slug, location, summary]] of venueExtras.entries()) {
  venueItems.push({
    id: "venue-" + kind + "-" + slug,
    slug,
    title,
    kind,
    category: kind === "retreat" ? "khu-nghi-duong" : kind === "bungalow" ? "bungalow" : "resort",
    location,
    address: location,
    summary,
    description: summary + " Liên hệ Nghieng Travel để nhận thông tin dịch vụ, tiện ích và lịch trình phù hợp.",
    quote: "Kết nối thiên nhiên, tận hưởng hành trình.",
    rating: 4.7,
    reviewCount: 96 + index * 7,
    priceFrom: 1800000 + index * 250000,
    state: "published",
    order: index + 1,
    image: venuePhotos[index % venuePhotos.length],
    gallery: [venuePhotos[index % venuePhotos.length], venuePhotos[(index + 1) % venuePhotos.length], venuePhotos[(index + 2) % venuePhotos.length], venuePhotos[(index + 3) % venuePhotos.length], venuePhotos[(index + 4) % venuePhotos.length]],
    amenities: ["Wifi miễn phí", "Không gian nghỉ dưỡng", "Ẩm thực địa phương", "Hỗ trợ khách hàng"],
    rooms: [],
    checkIn: "14:00",
    checkOut: "12:00",
    seoTitle: title + " | Nghieng Travel",
    seoDescription: summary,
  });
}

const newsItems: CmsArticle[] = [
  { id: "news-gioi-thieu-to-hop", slug: "gioi-thieu-to-hop", title: "Nghieng Complex: Tổ hợp liên kết đa ngành", summary: "Nghieng Complex kết nối con người, công nghệ và cộng đồng để cùng kiến tạo giá trị bền vững.", body: "Nghieng Complex được định vị là Tổ hợp Liên kết Đa ngành, kết nối các nguồn lực để mỗi lĩnh vực có thể phát triển độc lập và cộng hưởng cùng nhau. Với triết lý Con người – Công nghệ – Cộng đồng, chúng tôi hướng đến những giá trị thiết thực và dài hạn.\n\nThông điệp Kết nối – Cộng hưởng – Kiến tạo Thịnh vượng là nền tảng để Nghieng Complex đồng hành cùng đối tác, thành viên và cộng đồng.", category: "Giới thiệu", status: "published", active: true, date: "2026-06-01", image: PUBLIC_IMAGES[0], relatedIds: [], isDemo: true, order: 1 },
  { id: "news-thong-diep-chu-tich", slug: "thong-diep-chu-tich", title: "Thông điệp từ Chủ tịch HĐQT – CEO", summary: "Niềm tin, sẻ chia giá trị và phát triển bền vững là nền tảng cho hành trình dài hạn.", body: "Mỗi kết nối có ý nghĩa đều mở ra một cơ hội để cùng tạo ra giá trị lớn hơn. Nghieng Complex tin vào sức mạnh của sự đồng hành, tinh thần sẻ chia và trách nhiệm với cộng đồng.\n\nChúng tôi trân trọng những đối tác cùng chung tầm nhìn, cùng kiến tạo giá trị bằng sự tử tế và hiệu quả.", category: "Thông điệp lãnh đạo", status: "published", active: true, date: "2026-06-08", image: PUBLIC_IMAGES[1], relatedIds: [], isDemo: true, order: 2 },
  { id: "news-he-sinh-thai-06-linh-vuc", slug: "he-sinh-thai-06-linh-vuc", title: "Hệ sinh thái Nghieng Complex gồm 06 lĩnh vực", summary: "Sáu lĩnh vực kết nối thành một hệ sinh thái đa ngành, cùng mở rộng giá trị cho đối tác và cộng đồng.", body: "Hệ sinh thái Nghieng Complex gồm Nghieng Travel, Khoáng sản, Công nghệ – AI, Phát triển cộng đồng, Giải pháp đồng hành và Nghieng Media.\n\nMỗi lĩnh vực có phạm vi hoạt động riêng, đồng thời chia sẻ nguồn lực và kinh nghiệm để thúc đẩy những cơ hội phát triển bền vững.", category: "Giới thiệu lĩnh vực", status: "published", active: true, date: "2026-06-15", image: PUBLIC_IMAGES[3], relatedIds: [], isDemo: true, order: 3 },
  { id: "news-muc-tieu-2026-2030", slug: "muc-tieu-2026-2030", title: "Tầm nhìn và mục tiêu 2026–2030", summary: "Lộ trình phát triển tập trung vào năng lực kết nối, chất lượng vận hành và trách nhiệm cộng đồng.", body: "Trong giai đoạn 2026–2030, Nghieng Complex tập trung củng cố năng lực kết nối, hoàn thiện các mô hình hợp tác và mở rộng giá trị bền vững.\n\nCác mục tiêu được triển khai theo từng giai đoạn, gắn với trách nhiệm của mỗi đơn vị và nhu cầu thực tế của cộng đồng.", category: "Định hướng", status: "published", active: true, date: "2026-06-22", image: PUBLIC_IMAGES[2], relatedIds: [], isDemo: true, order: 4 },
  { id: "news-cong-dong-thien-nguyen", slug: "cong-dong-thien-nguyen", title: "Sẻ chia và nâng đỡ cộng đồng", summary: "Giá trị của hệ sinh thái được thể hiện qua khả năng đồng hành cùng những sáng kiến địa phương.", body: "Giá trị của một hệ sinh thái không chỉ nằm ở quy mô mà còn ở khả năng sẻ chia và nâng đỡ cộng đồng.\n\nNghieng Complex đồng hành cùng đối tác địa phương trong các hoạt động giáo dục, phát triển sinh kế, bảo tồn văn hóa và kết nối nguồn lực thiện nguyện.", category: "Cộng đồng & thiện nguyện", status: "published", active: true, date: "2026-06-29", image: PUBLIC_IMAGES[4], relatedIds: [], isDemo: true, order: 5 },
  { id: "news-phat-trien-ben-vung", slug: "phat-trien-ben-vung", title: "Kết nối giá trị mới trong hệ sinh thái Nghieng", summary: "Góc nhìn về cách các lĩnh vực cùng cộng hưởng để tạo giá trị dài hạn.", body: "Phát triển bền vững bắt đầu từ việc kết nối đúng nguồn lực, lắng nghe nhu cầu địa phương và tạo ra những mô hình hợp tác có trách nhiệm.\n\nNghieng Complex tiếp tục xây dựng hệ sinh thái nơi con người, doanh nghiệp, công nghệ và cộng đồng cùng phát triển.", category: "Hoạt động", status: "published", active: true, date: "2026-07-06", image: PUBLIC_IMAGES[5], relatedIds: [], isDemo: true, order: 6 },
];

const projectItems: CmsArticle[] = [
  { id: "project-nghieng-travel", slug: "phat-trien-he-sinh-thai-nghieng-travel", title: "Phát triển hệ sinh thái Nghieng Travel", summary: "Kết nối điểm đến, dịch vụ nghỉ dưỡng và các hành trình văn hóa vùng miền.", body: "Dự án kết nối các dịch vụ du lịch, nghỉ dưỡng và trải nghiệm địa phương trong hệ sinh thái Nghieng Travel.\n\nMục tiêu là tạo thêm cơ hội hợp tác giữa doanh nghiệp, điểm đến và cộng đồng. Phạm vi gồm phát triển sản phẩm tour, kết nối cơ sở lưu trú và nâng cao trải nghiệm du khách.\n\nTrạng thái: Triển khai. Đây là dữ liệu minh họa.", category: "Nghieng Travel", status: "Triển khai", active: true, date: "2026-08-01", image: PUBLIC_IMAGES[0], relatedIds: [], isDemo: true, order: 1 },
  { id: "project-ha-tang-dia-phuong", slug: "dau-tu-ha-tang-dia-phuong", title: "Đầu tư phát triển hạ tầng địa phương", summary: "Tìm kiếm mô hình đồng hành cùng địa phương và đối tác phát triển hạ tầng.", body: "Dự án nghiên cứu các phương án kết nối nguồn lực và đối tác để hỗ trợ phát triển hạ tầng địa phương.\n\nPhạm vi và tiến độ sẽ được cập nhật theo từng giai đoạn phê duyệt. Trạng thái: Nghiên cứu. Đây là dữ liệu minh họa.", category: "Giải pháp đồng hành", status: "Nghiên cứu", active: true, date: "2026-08-12", image: PUBLIC_IMAGES[1], relatedIds: [], isDemo: true, order: 2 },
  { id: "project-chuoi-gia-tri", slug: "so-hoa-chuoi-gia-tri", title: "Số hóa chuỗi giá trị cùng đối tác", summary: "Nghiên cứu công cụ số hỗ trợ kết nối dịch vụ và cải thiện vận hành.", body: "Sáng kiến hướng đến việc kết nối dữ liệu và quy trình giữa các đơn vị trong hệ sinh thái.\n\nCác chỉ tiêu và số liệu tài chính chỉ được công bố khi đã được phê duyệt. Trạng thái: Tìm đối tác. Đây là dữ liệu minh họa.", category: "Công nghệ – AI", status: "Tìm đối tác", active: true, date: "2026-08-20", image: PUBLIC_IMAGES[5], relatedIds: [], isDemo: true, order: 3 },
];

projectItems.push(
  { id: "project-community", slug: "phat-trien-cong-dong", title: "Chương trình đồng hành cùng cộng đồng", summary: "Kết nối kỹ năng, giáo dục và nguồn lực với các tổ chức địa phương.", body: "Chương trình hướng đến hợp tác dài hạn với đối tác tại địa phương, tập trung vào giáo dục, kỹ năng và sinh kế bền vững.\n\nMỗi hoạt động được xây dựng cùng cộng đồng và chỉ công bố kết quả sau khi được xác nhận. Đây là dữ liệu minh họa.", category: "Phát triển cộng đồng", status: "Nghiên cứu", active: true, date: "2026-08-25", image: PUBLIC_IMAGES[2], relatedIds: [], isDemo: true, order: 4 },
  { id: "project-cultural-values", slug: "ket-noi-gia-tri-van-hoa", title: "Kết nối giá trị văn hóa địa phương", summary: "Hợp tác cùng đơn vị văn hóa để giới thiệu di sản và sản phẩm bản địa.", body: "Dự án nghiên cứu các hình thức hợp tác với cộng đồng, đơn vị văn hóa và doanh nghiệp địa phương nhằm lan tỏa di sản một cách tôn trọng, có trách nhiệm.\n\nPhạm vi cụ thể được cập nhật theo tiến độ phê duyệt. Đây là dữ liệu minh họa.", category: "Văn hóa vùng miền", status: "Tìm đối tác", active: true, date: "2026-09-02", image: PUBLIC_IMAGES[3], relatedIds: [], isDemo: true, order: 5 },
  { id: "project-digital-operations", slug: "nen-tang-van-hanh-so", title: "Nền tảng hỗ trợ vận hành số", summary: "Khảo sát giải pháp giúp các đơn vị phối hợp và quản lý nội dung hiệu quả.", body: "Sáng kiến xem xét quy trình vận hành và nhu cầu của các đơn vị để đề xuất công cụ số phù hợp.\n\nKhông đưa ra chỉ tiêu tài chính chưa được duyệt. Đây là dữ liệu minh họa.", category: "Công nghệ – AI", status: "Nghiên cứu", active: true, date: "2026-09-10", image: PUBLIC_IMAGES[4], relatedIds: [], isDemo: true, order: 6 },
);

const menuItems: CmsMenuItem[] = [
  { id: "menu-home", label: "Trang Chủ", url: "/", parentId: null, target: "_self", active: true, kind: "link", order: 1 },
  { id: "menu-about", label: "Giới Thiệu", url: "/gioi-thieu", parentId: null, target: "_self", active: true, kind: "link", order: 2 },
  { id: "menu-ecosystem", label: "Hệ Sinh Thái", url: "/nghieng-travel", parentId: null, target: "_self", active: true, kind: "link", order: 3 },
  { id: "menu-travel", label: "Nghieng Travel", url: "/nghieng-travel", parentId: "menu-ecosystem", target: "_self", active: true, kind: "link", order: 1 },
  { id: "menu-mining", label: "Khoáng Sản", url: "/khoang-san", parentId: "menu-ecosystem", target: "_self", active: true, kind: "link", order: 2 },
  { id: "menu-ai", label: "Công Nghệ – AI", url: "/cong-nghe-ai", parentId: "menu-ecosystem", target: "_self", active: true, kind: "link", order: 3 },
  { id: "menu-community-growth", label: "Phát Triển Cộng Đồng", url: "/phat-trien-cong-dong", parentId: "menu-ecosystem", target: "_self", active: true, kind: "link", order: 4 },
  { id: "menu-partner-solutions", label: "Giải Pháp Đồng Hành", url: "/giai-phap-dong-hanh", parentId: "menu-ecosystem", target: "_self", active: true, kind: "link", order: 5 },
  { id: "menu-media", label: "Nghieng Media", url: "/nghieng-media", parentId: "menu-ecosystem", target: "_self", active: true, kind: "link", order: 6 },
  { id: "menu-venues", label: "Nhà Hàng – Khách Sạn", url: "/nha-hang-khach-san", parentId: "menu-ecosystem", target: "_self", active: true, kind: "link", order: 7 },
  { id: "menu-tours", label: "Tour Du Lịch", url: "/tour", parentId: "menu-ecosystem", target: "_self", active: true, kind: "link", order: 8 },
  { id: "menu-projects", label: "Dự Án", url: "/du-an", parentId: null, target: "_self", active: true, kind: "link", order: 4 },
  { id: "menu-community", label: "Cộng Đồng", url: "/cong-dong", parentId: null, target: "_self", active: true, kind: "link", order: 5 },
  { id: "menu-news", label: "Tin Tức", url: "/tin-tuc", parentId: null, target: "_self", active: true, kind: "link", order: 6 },
  { id: "menu-partners", label: "Đối Tác", url: "/doi-tac", parentId: null, target: "_self", active: true, kind: "link", order: 7 },
  { id: "menu-contact", label: "Liên Hệ", url: "/lien-he", parentId: null, target: "_self", active: true, kind: "link", order: 8 },
  { id: "menu-cta", label: "Hợp tác cùng chúng tôi", url: "/lien-he", parentId: null, target: "_self", active: true, kind: "cta", order: 9 },
];

const documents: CmsDocument[] = [
  { id: "doc-tong-nv-n", title: "TỔNG NV&N", type: "PPTX", category: "Slide", url: "https://docs.google.com/presentation/d/1pSB5Vi2SP63PJXbDijva-GPQApliIovS/edit?slide=id.p1#slide=id.p1", status: "published", order: 1 },
  { id: "doc-welink-community", title: "Mô hình WeLink Community", type: "PPTX", category: "Danh mục tin tức", url: "https://drive.google.com/drive/folders/1vhei3S6fBQaQ6bAKNdXD9LkKghVezRRn?usp=sharing", status: "published", order: 2 },
  { id: "doc-vhux-khach-hang", title: "SLIDE VHUX Khách hàng", type: "PPTX", category: "Slide", url: "https://drive.google.com/file/d/1IKspTeNdmF50qV7YrzXHdlGRXdTUM3al/view", status: "published", order: 3 },
  { id: "doc-he-sinh-thai", title: "SLIDE 03 – HỆ SINH THÁI NGHIÊNG COMPLEX", type: "PPTX", category: "Slide", url: "https://drive.google.com/file/d/1DSFvfYjI_60y0JdfWMMzlcolmIBoDkC7/view", status: "published", order: 4 },
  { id: "doc-giai-phap-dong-hanh", title: "SLIDE (19) GIẢI PHÁP ĐỒNG HÀNH", type: "Slide", category: "Slide", url: "https://drive.google.com/file/d/1TyoF8Puy_6EQ_JTHjoGed-TdDqu33hzD/view", status: "published", order: 5 },
  { id: "doc-doc-vhux", title: "ĐỌC – VHUX khách hàng", type: "PDF", category: "Danh mục tin tức", url: "https://drive.google.com/file/d/10kVjjfxTLUZoJd6nB6OaIKrPlUdToYMb/view", status: "published", order: 6 },
  { id: "doc-trac-nghiem-vhux", title: "Trắc nghiệm VHUX với Khách hàng", type: "PDF", category: "Danh mục tin tức", url: "https://drive.google.com/file/d/1N027T0GooAzIIlmimTTlbnKvjrgglHu2/view", status: "published", order: 7 },
];

const users: CmsAccount[] = [
  { id: "user-ketoan", name: "WeLink Kế toán", email: "ketoan@welink.vn", role: "Admin", status: "Active", passwordChangeRequired: false },
  { id: "user-media", name: "media welink", email: "media@welink.vn", role: "Admin", status: "Active", passwordChangeRequired: false },
  { id: "user-support", name: "Welink Hỗ trợ", email: "support@welink.vn", role: "User", status: "Active", passwordChangeRequired: false },
  { id: "user-nhung", name: "Nhung Nguyễn", email: "nhungnguyen1722@gmail.com", role: "User", status: "Active", passwordChangeRequired: false },
  { id: "user-an", name: "(IT) WeLink Nguyễn Đăng An", email: "annd@welink.vn", role: "Admin", status: "Active", passwordChangeRequired: false },
];

const media: CmsMedia[] = [
  ...BRAND_LOGOS,
  ...PUBLIC_IMAGES.map((url, index) => ({ id: "media-public-" + (index + 1), title: "Nghieng Complex – Ảnh " + (index + 1), url, type: "image" as const, source: "external" as const })),
];

const venueCategories = [
  { id: "venue-category-restaurant", slug: "nha-hang", title: "Nhà hàng", kind: "restaurant" as const, description: "Hệ thống nhà hàng ẩm thực vùng miền.", order: 1, active: true },
  { id: "venue-category-hotel", slug: "khach-san", title: "Khách sạn", kind: "hotel" as const, description: "Khách sạn thành phố và nghỉ dưỡng.", order: 2, active: true },
  { id: "venue-category-resort", slug: "resort", title: "Resort", kind: "resort" as const, description: "Resort ven biển và thiên nhiên.", order: 3, active: true },
  { id: "venue-category-retreat", slug: "khu-nghi-duong", title: "Khu nghỉ dưỡng", kind: "retreat" as const, description: "Khu nghỉ dưỡng sinh thái.", order: 4, active: true },
  { id: "venue-category-bungalow", slug: "bungalow", title: "Bungalow", kind: "bungalow" as const, description: "Bungalow nghỉ dưỡng gần gũi thiên nhiên.", order: 5, active: true },
];

export const CMS_SEEDS: { [K in keyof CmsRecordMap]: CmsRecordMap[K][] } = {
  tours: tourItems,
  tourCategories,
  venues: venueItems,
  venueCategories,
  news: newsItems,
  projects: projectItems,
  menu: menuItems,
  documents,
  users,
  media,
  pageContents: [],
};

export const TOUR_HOTELS = ["Nghieng Oceanview Hotel & Resort", "Nghieng Central Hotel", "Nghieng Heritage Hotel"];

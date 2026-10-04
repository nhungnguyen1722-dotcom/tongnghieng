export type ResourceItem = { id: string; title: string; status: string; detail: string };

export type ResourceConfig = { title: string; singular: string; description: string; items: ResourceItem[] };

const makeItems = (prefix: string, titles: string[]): ResourceItem[] => titles.map((title, index) => ({ id: `${prefix}-${index + 1}`, title, status: index === titles.length - 1 ? "Bản nháp" : "Đang hiển thị", detail: "Cập nhật nội dung và thông tin chi tiết." }));

export const RESOURCE_CONFIG: Record<string, ResourceConfig> = {
  projects: { title: "Quản lý Dự án", singular: "dự án", description: "Theo dõi các dự án và cơ hội hợp tác của Nghieng Complex.", items: makeItems("project", ["Phát triển hệ sinh thái Nghieng Travel", "Đầu tư hạ tầng địa phương", "Số hóa chuỗi giá trị cùng đối tác"]) },
  venues: { title: "Quản lý Nhà hàng – Khách sạn", singular: "địa điểm", description: "Quản lý các điểm đến, nhà hàng, khách sạn và dịch vụ trong hệ sinh thái.", items: makeItems("venue", ["Nhà hàng Nghieng", "Khách sạn đối tác", "Khu nghỉ dưỡng cộng đồng"]) },
  "venue-categories": { title: "Danh mục Nhà hàng – Khách sạn", singular: "danh mục", description: "Phân nhóm các địa điểm thuộc hệ sinh thái.", items: makeItems("venue-category", ["Nhà hàng", "Khách sạn", "Resort", "Khu nghỉ dưỡng", "Bungalow"]) },
  tours: { title: "Quản lý Tour", singular: "tour", description: "Quản lý bài viết và chương trình tour.", items: makeItems("tour", ["Tour Hệ Sinh Thái Nghieng", "Tour Văn Hóa Vùng Miền", "Tour Doanh Nghiệp & Hội Nhóm", "Tour Team Building & Đào Tạo"]) },
  "tour-categories": { title: "Danh mục Tour", singular: "danh mục", description: "Quản lý các nhóm tour hiển thị trên website.", items: makeItems("tour-category", ["Hệ sinh thái", "Văn hóa vùng miền", "Doanh nghiệp & hội nhóm", "Team building & đào tạo"]) },
  news: { title: "Quản lý Tin tức", singular: "bài viết", description: "Quản lý tin tức, sự kiện và nội dung cập nhật.", items: makeItems("news", ["Nghieng Complex đồng hành cùng cộng đồng", "Kết nối những giá trị mới", "Tin tức và sự kiện nổi bật"]) },
  media: { title: "Quản lý Media", singular: "tệp media", description: "Thư viện hình ảnh và tài nguyên phục vụ nội dung.", items: makeItems("media", ["slider-1-home.jpg", "slider-3-home.jpg", "banner-trang-chu-nghieng.webp"]) },
  library: { title: "Quản lý Thư viện", singular: "tài liệu", description: "Tổ chức tài liệu và các nội dung tham chiếu.", items: makeItems("library", ["Brand guideline", "Bộ nhận diện Nghieng Complex", "Tài liệu đối tác"]) },
  menu: { title: "Quản lý Menu", singular: "mục menu", description: "Cấu hình điều hướng public và các liên kết chính.", items: makeItems("menu", ["Trang chủ", "Hệ sinh thái", "Dự án", "Liên hệ"]) },
  users: { title: "Tài khoản Admin", singular: "tài khoản", description: "Quản lý người dùng và quyền truy cập quản trị.", items: makeItems("user", ["ketoan@welink.vn", "content@nghiengcomplex.vn"]) },
  contacts: { title: "Quản lý Liên hệ", singular: "liên hệ", description: "Theo dõi các yêu cầu hợp tác gửi từ website.", items: makeItems("contact", ["Yêu cầu hợp tác mới", "Đăng ký nhận thông tin"]) },
};

export const RESOURCE_SECTIONS = Object.keys(RESOURCE_CONFIG);

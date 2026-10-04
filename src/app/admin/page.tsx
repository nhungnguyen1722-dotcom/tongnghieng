import Link from "next/link";
import AdminShell from "./AdminShell";
import { ADMIN_PAGES } from "./page-data";
import styles from "./dashboard.module.css";

const quickLinks = [
  ["Quản lý các Trang", "/admin/pages", "Chỉnh sửa nội dung, slider và section trên website public."],
  ["Quản lý Dự án", "/admin/projects", "Theo dõi bài viết, trạng thái và cơ hội hợp tác."],
  ["Quản lý Tin tức", "/admin/news", "Tổ chức tin tức và sự kiện hiển thị trên website."],
  ["Quản lý Media", "/admin/media", "Kiểm soát thư viện hình ảnh dùng trong nội dung."],
];

export default function AdminDashboard() {
  return (
    <AdminShell>
      <div className={styles.content}>
        <header className={styles.heading}><div><span className={styles.kicker}>NGHIENG COMPLEX / ADMIN</span><h1>Dashboard</h1><p>Tổng quan nội dung và các khu vực đang được quản lý.</p></div><Link className={styles.preview} href="/" target="_blank" rel="noreferrer">↗ Xem website</Link></header>
        <div className={styles.stats}><article><strong>{ADMIN_PAGES.length}</strong><span>Trang public</span></article><article><strong>06</strong><span>Lĩnh vực cốt lõi</span></article><article><strong>08+</strong><span>Khu vực quản trị</span></article><article><strong className={styles.online}>●</strong><span>Hệ thống hoạt động</span></article></div>
        <section><div className={styles.sectionHeader}><h2>Truy cập nhanh</h2><span>Quy trình nội dung</span></div><div className={styles.cards}>{quickLinks.map(([title, href, text], index) => <Link className={styles.card} href={href} key={href}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div><b>→</b></Link>)}</div></section>
        <section className={styles.notice}><div><span className={styles.kicker}>ĐỒNG BỘ NỘI DUNG</span><h2>Quản lý tập trung, xuất bản nhất quán</h2><p>Các thay đổi trong editor trang được lưu theo trình duyệt và phát sự kiện cập nhật ngay cho các trang public đang mở.</p></div><Link href="/admin/pages/trang-chu">Mở editor Trang chủ →</Link></section>
      </div>
    </AdminShell>
  );
}

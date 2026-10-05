import Link from "next/link";
import AdminShell from "./AdminShell";
import styles from "./dashboard.module.css";

const stats = [
  ["▧", "6", "Dự án"],
  ["▤", "6", "Tin tức"],
  ["♧", "8", "Đối tác"],
  ["♙", "0", "Liên hệ (Lead)"],
  ["▱", "41", "Section trang chủ"],
  ["▧", "2", "File media"],
  ["♙", "7", "Tài khoản"],
];

const quickLinks = [
  ["▤", "Quản lý Landing Page", "/admin/pages/trang-chu", "Chỉnh sửa tiêu đề, nội dung, ảnh, CTA, bật/tắt và sắp xếp section trang chủ."],
  ["▧", "Quản lý Dự án", "/admin/projects", "Thêm, sửa, xóa, ẩn/hiện bài đăng dự án."],
  ["▤", "Quản lý Tin tức", "/admin/news", "Thêm, sửa, xóa, ẩn/hiện bài viết tin tức."],
  ["↗", "Xem website", "/", "Mở website đang chạy."],
];

export default function AdminDashboard() {
  return (
    <AdminShell>
      <div className={styles.content}>
        <header className={styles.heading}>
          <div><h1>Dashboard</h1><p>Tổng quan nội dung website Nghieng Complex.</p></div>
        </header>
        <div className={styles.stats}>
          {stats.map(([icon, value, label]) => <article key={label}><i aria-hidden="true">{icon}</i><strong>{value}</strong><span>{label}</span></article>)}
        </div>
        <section>
          <div className={styles.sectionHeader}><h2>Truy cập nhanh</h2><span>Quy trình nội dung</span></div>
          <div className={styles.cards}>
            {quickLinks.map(([icon, title, href, text]) => <Link className={styles.card} href={href} key={href} target={href === "/" ? "_blank" : undefined} rel={href === "/" ? "noreferrer" : undefined}><span aria-hidden="true">{icon}</span><div><h3>{title}</h3><p>{text}</p></div></Link>)}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

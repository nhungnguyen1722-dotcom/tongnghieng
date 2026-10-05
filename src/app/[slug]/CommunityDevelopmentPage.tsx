import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import styles from "./community-development.module.css";

const pillars = [
  { icon: "♧", title: "Xây Dựng Cộng Đồng", points: ["Liên minh cộng đồng", "Phát triển thành viên", "Kết nối đa ngành", "Phát triển kinh tế vùng miền", "Tham gia Nghieng Complex"] },
  { icon: "♙", title: "Quyền Lợi Thành Viên", points: ["Doanh nghiệp: Hỗ trợ kinh doanh & quảng bá thương hiệu", "Người tiêu dùng: Tiện ích tìm kiếm cửa hàng, mua sắm tiết kiệm", "Người kết nối: Gia tăng thu nhập thụ động, tạo tài sản kế thừa", "Lãnh đạo đồng hành: Quản lý & phát triển khu vực kinh doanh"] },
  { icon: "▣", title: "Hoạt Động Phát Triển", points: ["Tổ chức giao thương tại các điểm Franchise Center Nghieng & đối tác toàn quốc", "Sự kiện Văn hóa, nghệ thuật", "Trưng bày & bán chéo sản phẩm", "Giáo dục & đào tạo nguồn nhân lực"] },
];

const members = [
  ["B2B", "Doanh Nghiệp", "Hỗ trợ kinh doanh & quảng bá thương hiệu trên toàn quốc"],
  ["B2C", "Người Tiêu Dùng", "Tiện ích tìm kiếm cửa hàng, mua sắm tiết kiệm thông minh"],
  ["C2C", "Người Kết Nối", "Gia tăng thu nhập thụ động, tạo tài sản kế thừa bền vững"],
  ["Leader", "Lãnh Đạo Đồng Hành", "Quản lý & phát triển khu vực kinh doanh của riêng mình"],
];

export default function CommunityDevelopmentPage() {
  return (
    <main className={styles.site}>
      <SiteHeader />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span>GIÁ TRỊ BỀN VỮNG</span>
          <h1>CÙNG HỌC<br /><strong>CÙNG LÀM</strong></h1>
          <p>Các hoạt động xã hội, giáo dục và nâng đỡ cộng đồng hướng tới giá trị bền vững.</p>
          <div className={styles.actions}><a href="#hoat-dong">XEM HOẠT ĐỘNG <b>→</b></a><Link href="/lien-he">ĐÓNG GÓP CÙNG CHÚNG TÔI</Link></div>
        </div>
        <div className={styles.dots} aria-hidden="true"><i /><i /><i /></div>
      </section>
      <section className={styles.pillars}>
        <div className={styles.heading}><span>3 TRỤ CỘT</span><h2>CẤU TRÚC CỘNG ĐỒNG</h2></div>
        <div className={styles.pillarGrid}>{pillars.map((pillar, index) => <article key={pillar.title} className={index === 1 ? styles.goldCard : ""}><b className={styles.icon}>{pillar.icon}</b><h3>{pillar.title}</h3><ul>{pillar.points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}</div>
      </section>
      <section className={styles.members} id="hoat-dong">
        <div className={styles.heading}><h2>THAM GIA WELINK COMMUNITY</h2><p>Khi cùng hướng về một mục tiêu chung, thành công của mỗi người sẽ góp phần tạo nên thành công của cả hệ sinh thái.</p></div>
        <div className={styles.memberGrid}>{members.map(([tag, title, description]) => <article key={tag}><span>{tag}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>
      <section className={styles.join}><h2>GIA NHẬP CỘNG ĐỒNG</h2><p>Trở thành thành viên của hệ sinh thái Nghieng Complex, cùng nhau xây dựng và phát triển cộng đồng bền vững.</p><Link href="/lien-he">Đăng Ký Thành Viên <b>→</b></Link></section>
      <SiteFooter />
    </main>
  );
}

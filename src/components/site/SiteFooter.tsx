"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND_LOGOS, CMS_SEEDS, type CmsMenuItem } from "@/lib/cms-data";
import { loadCmsRecords } from "@/lib/cms-client";
import useBrandLogo from "./useBrandLogo";
import styles from "./site-footer.module.css";

type IconName = "chevron" | "arrow" | "facebook" | "linkedin" | "youtube" | "send" | "pin" | "mail" | "globe";

function Icon({ name, size = 14 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {name === "chevron" && <path d="m9 18 6-6-6-6" />}
      {name === "arrow" && <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>}
      {name === "facebook" && <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />}
      {name === "linkedin" && <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></>}
      {name === "youtube" && <><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0" /><path d="m10 15 5-3-5-3z" /></>}
      {name === "send" && <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>}
      {name === "pin" && <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>}
      {name === "mail" && <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>}
      {name === "globe" && <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" /></>}
    </svg>
  );
}

const navLinks = [
  ["Trang Chủ", "/"],
  ["Giới Thiệu", "/gioi-thieu"],
  ["Dự Án", "/du-an"],
  ["Cộng Đồng", "/cong-dong"],
  ["Tin Tức", "/tin-tuc"],
  ["Đối Tác", "/doi-tac"],
  ["Mục Tiêu 2026–2030", "/muc-tieu"],
  ["Liên Hệ", "/lien-he"],
] as const;

export default function SiteFooter() {
  const logo = useBrandLogo();
  const [menu, setMenu] = useState<CmsMenuItem[]>(CMS_SEEDS.menu);
  useEffect(() => {
    let active = true;
    loadCmsRecords("menu").then((items) => { if (active) setMenu(items); });
    return () => { active = false; };
  }, []);
  const ecosystems = menu.filter((item) => item.parentId === "menu-ecosystem" && item.active).sort((a, b) => a.order - b.order);

  return (
    <footer className={styles.footer}>
      <section className={styles.invite} aria-label="Cùng tham gia, cùng kết nối, cùng phát triển">
        <div className={styles.inviteCopy}>
          <strong>CÙNG THAM GIA – CÙNG KẾT NỐI – CÙNG PHÁT TRIỂN</strong>
          <span>Nghieng Complex trân trọng chào đón Quý Đối tác, Thành viên và Cộng đồng cùng đồng hành.</span>
        </div>
        <Link href="/lien-he" className={styles.inviteButton}>Liên Hệ Ngay <Icon name="arrow" size={14} /></Link>
      </section>
      <div className={styles.main}>
        <div className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo || BRAND_LOGOS[0].url} alt="Nghieng Complex" />
          <p>Tổ hợp Liên kết Đa ngành — Kiến tạo hệ sinh thái phát triển bền vững. Kết nối Nguồn lực, Cộng hưởng Giá trị.</p>
          <div className={styles.socials} aria-label="Kênh truyền thông">
            <span className={styles.socialIcon} role="img" aria-label="Facebook"><Icon name="facebook" size={14} /></span>
            <span className={styles.socialIcon} role="img" aria-label="LinkedIn"><Icon name="linkedin" size={14} /></span>
            <span className={styles.socialIcon} role="img" aria-label="YouTube"><Icon name="youtube" size={14} /></span>
            <span className={styles.socialIcon} role="img" aria-label="Gửi liên hệ"><Icon name="send" size={14} /></span>
          </div>
        </div>
        <div className={styles.linkColumn}>
          <h2>Hệ Sinh Thái</h2>
          {ecosystems.slice(0, 6).map((item) => <Link href={item.url} key={item.id}><Icon name="chevron" size={12} />{item.label}</Link>)}
        </div>
        <div className={styles.linkColumn}>
          <h2>Điều Hướng</h2>
          {navLinks.map(([label, href]) => <Link href={href} key={href}><Icon name="chevron" size={12} />{label}</Link>)}
        </div>
        <div className={styles.contactColumn}>
          <h2>Liên Hệ</h2>
          <div className={styles.contactDetail}><Icon name="pin" /><span>Công Ty Cổ Phần Tập Đoàn Nghieng Complex, Việt Nam</span></div>
          <div className={styles.contactDetail}><Icon name="mail" /><a href="mailto:info@nghiengcomplex.vn">info@nghiengcomplex.vn</a></div>
          <div className={styles.contactDetail}><Icon name="globe" /><a href="https://nghiengcomplex.vn" target="_blank" rel="noreferrer">nghiengcomplex.vn</a></div>
          <div className={styles.motto}><p>“Kết nối Nguồn lực — Cộng hưởng Giá trị — Kiến tạo Tương lai”</p></div>
        </div>
      </div>
      <div className={styles.legal}>
        <span>© 2024 Công Ty Cổ Phần Tập Đoàn Nghieng Complex. Bảo lưu mọi quyền.</span>
        <div><Link href="/chinh-sach-bao-mat">Chính Sách Bảo Mật</Link><span aria-hidden="true">|</span><Link href="/dieu-khoan-su-dung">Điều Khoản Sử Dụng</Link></div>
      </div>
    </footer>
  );
}

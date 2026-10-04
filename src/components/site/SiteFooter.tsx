"use client";

import Link from "next/link";
import styles from "./site-footer.module.css";
import { useEffect, useState } from "react";
import { BRAND_LOGOS, CMS_SEEDS, type CmsMenuItem } from "@/lib/cms-data";
import { loadCmsRecords } from "@/lib/cms-client";
import useBrandLogo from "./useBrandLogo";

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
      <div className={styles.main}>
        <div className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo || BRAND_LOGOS[0].url} alt="Nghieng Complex" />
          <p>Tổ hợp liên kết đa ngành, kết nối con người, công nghệ và cộng đồng để cùng phát triển bền vững.</p>
        </div>
        <div><h2>Hệ sinh thái</h2>{ecosystems.slice(0, 6).map((item) => <Link href={item.url} key={item.id}>{item.label}</Link>)}</div>
        <div><h2>Điều hướng</h2><Link href="/">Trang Chủ</Link><Link href="/gioi-thieu">Giới Thiệu</Link><Link href="/du-an">Dự Án</Link><Link href="/cong-dong">Cộng Đồng</Link><Link href="/tin-tuc">Tin Tức</Link><Link href="/muc-tieu">Mục Tiêu 2026–2030</Link></div>
        <div><h2>Liên hệ</h2><span>Công ty Cổ phần Tập đoàn Nghiêng Complex</span><a href="mailto:info@nghiengcomplex.vn">info@nghiengcomplex.vn</a><a href="https://nghiengcomplex.vn" target="_blank" rel="noreferrer">nghiengcomplex.vn</a><Link className={styles.contact} href="/lien-he">Kết nối cùng Nghieng Complex <span aria-hidden="true">→</span></Link></div>
      </div>
      <div className={styles.legal}><span>© 2026 Công ty Cổ phần Tập đoàn Nghiêng Complex. Bảo lưu mọi quyền.</span><div><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link><Link href="/dieu-khoan-su-dung">Điều khoản sử dụng</Link></div></div>
    </footer>
  );
}

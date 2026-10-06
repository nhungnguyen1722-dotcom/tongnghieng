"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { loadCmsRecords } from "@/lib/cms-client";
import { BRAND_LOGOS, CMS_SEEDS, type CmsMenuItem } from "@/lib/cms-data";
import { useSiteTheme } from "./ThemeProvider";
import useBrandLogo from "./useBrandLogo";
import styles from "./site-header.module.css";
import themeStyles from "./site-header-theme.module.css";

const initialMenu = CMS_SEEDS.menu;

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export default function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const pathname = usePathname();
  const [items, setItems] = useState<CmsMenuItem[]>(initialMenu);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useSiteTheme();
  const selectedLogo = useBrandLogo(theme);

  useEffect(() => {
    let mounted = true;
    loadCmsRecords("menu").then((records) => { if (mounted) setItems(records); });
    return () => { mounted = false; };
  }, []);

  const visible = items.filter((item) => item.active);
  const roots = visible.filter((item) => item.parentId === null && item.kind !== "cta").sort((a, b) => a.order - b.order);
  const cta = visible.find((item) => item.kind === "cta");
  const logo = selectedLogo || BRAND_LOGOS[0].url;

  return (
    <header className={styles.header + " " + themeStyles.themeable} data-over-hero={overHero ? "true" : undefined}>
      <Link href="/" className={styles.brand} aria-label="Nghieng Complex, Trang chủ">
        <img src={logo} alt="Nghieng Complex" />
      </Link>
      <button className={styles.menuToggle} type="button" aria-label={menuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {menuOpen ? <path d="m18 6-12 12M6 6l12 12" /> : <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>}
        </svg>
      </button>
      <nav className={menuOpen ? styles.navigationOpen : styles.navigation} aria-label="Điều hướng chính">
        {roots.map((item) => {
          const children = visible.filter((child) => child.parentId === item.id).sort((a, b) => a.order - b.order);
          const active = isCurrent(pathname, item.url);
          return children.length ? (
            <details className={styles.dropdown} key={item.id}>
              <summary className={active ? styles.active : ""}>
                {item.label}
                <svg aria-hidden="true" className={styles.chevron} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className={styles.submenu}>
                <Link href={item.url} className={active ? styles.active : ""}>{item.label} – Tổng quan</Link>
                {children.map((child) => <Link href={child.url} key={child.id} className={isCurrent(pathname, child.url) ? styles.active : ""}>{child.label}</Link>)}
              </div>
            </details>
          ) : <Link href={item.url} key={item.id} className={active ? styles.active : ""}>{item.label}</Link>;
        })}
      </nav>
      <div className={styles.actions}>
        <button className={styles.themeToggle} type="button" aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"} title={theme === "dark" ? "Giao diện sáng" : "Giao diện tối"} onClick={toggleTheme}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {theme === "dark" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.14-12.14 1.41-1.41" /></> : <><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /></>}
          </svg>
        </button>
        {cta && <Link className={styles.cta} href={cta.url}>{cta.label}<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></Link>}
      </div>
    </header>
  );
}

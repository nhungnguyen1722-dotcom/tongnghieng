"use client";

/* eslint-disable @next/next/no-img-element */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./admin-shell.module.css";
import navStyles from "./admin-shell-nav.module.css";
import useBrandLogo from "@/components/site/useBrandLogo";

type NavigationEntry = { label: string; href: string; icon: string } | { label: string; icon: string; children: Array<{ label: string; href: string }> };
const AdminRoleContext = createContext<"Admin" | "User">("User");

export function useAdminRole() {
  return useContext(AdminRoleContext);
}

const navigation: NavigationEntry[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Quản lý các Trang", href: "/admin/pages", icon: "pages" },
  { label: "Quản lý Dự án", href: "/admin/projects", icon: "folder" },
  { label: "Nhà hàng – Khách sạn", icon: "venue", children: [{ label: "Danh mục", href: "/admin/venue-categories" }, { label: "Bài viết", href: "/admin/venues" }] },
  { label: "Tour", icon: "map", children: [{ label: "Danh mục", href: "/admin/tour-categories" }, { label: "Bài viết", href: "/admin/tours" }] },
  { label: "Quản lý Tin tức", href: "/admin/news", icon: "news" },
  { label: "Quản lý Media", href: "/admin/media", icon: "image" },
  { label: "Quản lý Thư viện", href: "/admin/library", icon: "gallery" },
  { label: "Quản lý Menu Header", href: "/admin/menu", icon: "menu" },
  { label: "Tài khoản Admin", href: "/admin/users", icon: "users" },
];

function Icon({ name }: { name: string }) {
  const props = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "dashboard": return <svg {...props}><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/><rect x="3" y="14" width="8" height="7" rx="1"/></svg>;
    case "pages": return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>;
    case "folder": return <svg {...props}><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
    case "venue": return <svg {...props}><path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M17 3v18M17 3c-3 2-3 7 0 9"/></svg>;
    case "map": return <svg {...props}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/></svg>;
    case "news": return <svg {...props}><path d="M4 4h16v16H4zM8 8h8v4H8zM8 16h8M8 13h8"/></svg>;
    case "image":
    case "gallery": return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>;
    case "menu": return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case "users": return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "external": return <svg {...props}><path d="M14 3h7v7M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>;
    case "logout": return <svg {...props}><path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>;
    default: return null;
  }
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const brandLogo = useBrandLogo();
  const [auth, setAuth] = useState<{ loading: boolean; user: { name: string; email: string; role: string; passwordChangeRequired: boolean } | null }>({ loading: true, user: null });

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" }).then((response) => response.json()).then((result) => {
      if (active) setAuth({ loading: false, user: result.user ?? null });
    }).catch(() => { if (active) setAuth({ loading: false, user: null }); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!auth.loading && auth.user?.passwordChangeRequired && pathname !== "/admin/login") router.replace("/admin/login?next=" + encodeURIComponent(pathname));
  }, [auth, pathname, router]);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuth({ loading: false, user: null });
    router.replace("/admin/login");
  };

  if (auth.loading) return <div className={styles.main} role="status">Đang kiểm tra phiên quản trị…</div>;
  if (!auth.user) return <div className={styles.main}><h1>Đăng nhập để tiếp tục</h1><Link href="/admin/login">Mở trang đăng nhập</Link></div>;
  if (auth.user.passwordChangeRequired) return <div className={styles.main}><h1>Yêu cầu đổi mật khẩu</h1><Link href="/admin/login">Tiếp tục</Link></div>;

  return (
    <AdminRoleContext.Provider value={auth.user.role === "Admin" ? "Admin" : "User"}>
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/admin/pages" aria-label="Nghieng Complex, trang quản trị"><img src={brandLogo} alt="Nghieng Complex" /></Link>
        <nav aria-label="Điều hướng quản trị">
          {navigation.map((item) => {
            if ("children" in item) {
              const active = item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));
              return <details className={navStyles.group} key={item.label} open={active}>
                <summary className={active ? navStyles.groupActive : ""}><Icon name={item.icon} />{item.label}<span aria-hidden="true">⌄</span></summary>
                <div>{item.children.map((child) => {
                  const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                  return <Link className={childActive ? styles.active : ""} href={child.href} key={child.href} aria-current={childActive ? "page" : undefined}>{child.label}</Link>;
                })}</div>
              </details>;
            }
            const active = item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
            return <Link className={active ? styles.active : ""} href={item.href} key={item.href} aria-current={active ? "page" : undefined}><Icon name={item.icon} />{item.label}</Link>;
          })}
        </nav>
        <footer><small>{auth.user.email} · {auth.user.role}</small><Link href="/" target="_blank" rel="noreferrer"><Icon name="external" /> Xem website</Link><button type="button" onClick={() => void signOut()}><Icon name="logout" /> Đăng xuất</button></footer>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
    </AdminRoleContext.Provider>
  );
}

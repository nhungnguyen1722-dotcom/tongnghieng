"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type ChangeEvent } from "react";
import AdminShell from "@/app/admin/AdminShell";
import MediaPicker from "./MediaPicker";
import { loadCmsRecords, saveCmsRecords } from "@/lib/cms-client";
import { BRAND_LOGOS, type CmsMedia } from "@/lib/cms-data";
import styles from "./admin-media-manager.module.css";

type Variant = "dark" | "light" | "ecosystem";
const variants: { key: Variant; title: string; note: string; background: string }[] = [
  { key: "dark", title: "Logo Dark Mode", note: "Dùng cho nền tối (chế độ mặc định)", background: "#03172b" },
  { key: "light", title: "Logo Light Mode", note: "Dùng khi website bật Light Mode", background: "#f5f7f8" },
];
const initialMedia = BRAND_LOGOS as CmsMedia[];

export default function AdminMediaManager() {
  const [items, setItems] = useState<CmsMedia[]>(initialMedia);
  const [gallery, setGallery] = useState<CmsMedia[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([loadCmsRecords("media"), fetch("/api/media", { cache: "no-store" }).then((response) => response.ok ? response.json() : { items: [] }).catch(() => ({ items: [] }))])
      .then(([media, library]) => {
        if (!active) return;
        if (media.length) setItems(media);
        setGallery((library.items ?? []).filter((item: CmsMedia) => item.type === "image" || item.type === "logo"));
      });
    return () => { active = false; };
  }, []);

  const saveItems = async (next: CmsMedia[], success: string) => {
    setBusy(true); setError(""); setMessage("");
    const result = await saveCmsRecords("media", next);
    setBusy(false);
    if (!result.persisted) { setError(result.denied ? "Phiên đăng nhập không có quyền lưu cấu hình logo." : "Không thể lưu dữ liệu media vào cơ sở dữ liệu."); return; }
    setItems(next); setMessage(success);
    window.dispatchEvent(new Event("nghieng:content-updated"));
  };

  const setLogo = (variant: Variant, url: string, title?: string) => {
    const logos = items.filter((item) => item.type === "logo");
    const existing = logos.find((item) => item.variant === variant) ?? (variant === "dark" ? logos[0] : variant === "light" ? logos[1] : undefined);
    const logo: CmsMedia = { id: existing?.id ?? `logo-${variant}`, title: title ?? existing?.title ?? `Logo ${variant}`, url, type: "logo", source: url.startsWith("/") ? "library" : "external", variant, active: variant === "dark" };
    const next = existing ? items.map((item) => item.id === existing.id ? logo : item) : [...items, logo];
    void saveItems(next, "Đã đồng bộ logo với cơ sở dữ liệu và website.");
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>, variant?: Variant) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(""); setMessage("");
    const form = new FormData(); form.set("file", file);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Không tải được ảnh lên.");
      const next = [...items];
      const uploaded: CmsMedia = { id: `media-${crypto.randomUUID()}`, title: result.title ?? file.name, url: result.url, type: "image", source: "library" };
      if (variant) {
        const logos = next.filter((item) => item.type === "logo");
        const existing = logos.find((item) => item.variant === variant) ?? (variant === "dark" ? logos[0] : variant === "light" ? logos[1] : undefined);
        const logo: CmsMedia = { ...uploaded, id: existing?.id ?? `logo-${variant}`, type: "logo", variant, active: variant === "dark" };
        const updated = existing ? next.map((item) => item.id === existing.id ? logo : item) : [...next, logo];
        const saved = await saveCmsRecords("media", updated);
        if (!saved.persisted) throw new Error("Ảnh đã tải lên nhưng không lưu được cấu hình logo vào cơ sở dữ liệu.");
        setItems(updated);
      } else {
        const updated = [...next, uploaded];
        const saved = await saveCmsRecords("media", updated);
        if (!saved.persisted) throw new Error("Ảnh đã tải lên nhưng không thể thêm vào thư viện cơ sở dữ liệu.");
        setItems(updated);
      }
      const library = await fetch("/api/media", { cache: "no-store" }).then((res) => res.json()).catch(() => ({ items: [] }));
      setGallery(library.items ?? []); setMessage("Đã tải ảnh và lưu vào cơ sở dữ liệu.");
      window.dispatchEvent(new Event("nghieng:content-updated"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tải ảnh lên."); }
    finally { setBusy(false); event.target.value = ""; }
  };

  const logoFor = (variant: Variant) => {
    const logos = items.filter((item) => item.type === "logo");
    return (logos.find((item) => item.variant === variant) ?? (variant === "dark" ? logos[0] : variant === "light" ? logos[1] : undefined))?.url
    ?? (variant === "light" ? BRAND_LOGOS[1].url : BRAND_LOGOS[0].url);
  };

  return <AdminShell><main className={styles.content}>
    <header className={styles.heading}><div><h1>Quản lý Hình ảnh / Media</h1><p>Tải lên và quản lý ảnh dùng cho website. Copy URL để chèn vào bài viết.</p></div><label className={styles.primary}>⇧&nbsp; Tải ảnh lên<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void upload(event)} disabled={busy} /></label></header>
    <section className={styles.panel}><h2>Logo Website (Light / Dark Mode)</h2><p>Tải lên logo riêng cho từng chế độ — Header, Footer và toàn website tự động dùng đúng logo theo theme đang bật.</p><div className={styles.logoGrid}>
      {variants.map(({ key, title, note, background }) => <article className={styles.logoCard} key={key}><div className={styles.preview} style={{ background }}><img src={logoFor(key)} alt={title} /></div><strong>{title}</strong><small>{note}</small><div className={styles.actions}><label className={styles.primary}>⇧&nbsp; Tải logo lên<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void upload(event, key)} disabled={busy} /></label><MediaPicker value={logoFor(key)} onChange={(url) => setLogo(key, Array.isArray(url) ? url[0] ?? "" : url, title)} label="Chọn từ Thư viện" /><button type="button" onClick={() => setLogo(key, key === "light" ? BRAND_LOGOS[1].url : BRAND_LOGOS[0].url, title)} disabled={busy}>Dùng mặc định</button></div></article>)}
    </div></section>
    <section className={styles.panel}><h2>Logo trung tâm Hệ Sinh Thái (Trang chủ)</h2><p>Logo hiển thị ở tâm mạng lưới 06 lĩnh vực trên trang chủ. Chọn từ máy hoặc từ Thư viện.</p><div className={styles.ecosystem}><div className={styles.ecosystemPreview}><img src={logoFor("ecosystem")} alt="Logo trung tâm hệ sinh thái" /></div><span>Ảnh được đồng bộ và lưu vào Thư viện — thay thế tại đây bất kỳ lúc nào.</span><label className={styles.primary}>⇧&nbsp; Chọn từ máy<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void upload(event, "ecosystem")} disabled={busy} /></label><MediaPicker value={logoFor("ecosystem")} onChange={(url) => setLogo("ecosystem", Array.isArray(url) ? url[0] ?? "" : url, "Logo trung tâm Hệ Sinh Thái")} label="Chọn từ Thư viện" /><button type="button" onClick={() => setLogo("ecosystem", BRAND_LOGOS[0].url, "Logo trung tâm Hệ Sinh Thái")} disabled={busy}>Dùng mặc định</button></div></section>
    {(message || error) && <p className={error ? styles.error : styles.message} role="status">{error || message}</p>}
    {gallery.length > 0 && <section className={styles.gallery} aria-label="Thư viện ảnh">{gallery.map((item) => <article key={item.id}><img src={item.url} alt={item.title} /><strong title={item.title}>{item.title}</strong><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(item.url); setMessage("Đã copy URL ảnh."); } catch { setError("Không thể copy URL trên trình duyệt này."); } }}>▢&nbsp; Copy URL</button></article>)}</section>}
  </main></AdminShell>;
}

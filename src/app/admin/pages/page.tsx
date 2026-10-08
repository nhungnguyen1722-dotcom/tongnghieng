"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import AdminShell, { useAdminRole } from "../AdminShell";
import { ADMIN_PAGES, type AdminPageContent } from "../page-data";
import { loadCmsRecords, saveCmsRecords } from "@/lib/cms-client";
import type { CmsPageContent } from "@/lib/cms-data";
import styles from "./page.module.css";

type PageDraft = {
  name: string;
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  active: boolean;
};

const emptyDraft: PageDraft = {
  name: "",
  slug: "",
  title: "",
  description: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  active: true,
};

function slugify(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ExternalIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
}

export default function AdminPages() {
  const router = useRouter();
  const role = useAdminRole();
  const canEdit = role === "Admin";
  const [records, setRecords] = useState<CmsPageContent[]>([]);
  const [ready, setReady] = useState(false);
  const [creating, setCreating] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [draft, setDraft] = useState<PageDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    loadCmsRecords("pageContents").then((items) => {
      if (!mounted) return;
      setRecords(items);
      setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  const customPages = useMemo(() => {
    const builtInSlugs = new Set(ADMIN_PAGES.map((page) => page.slug));
    return records
      .filter((record) => !builtInSlugs.has(record.slug))
      .sort((left, right) => left.order - right.order);
  }, [records]);

  const rows = [
    ...ADMIN_PAGES.map((page) => ({ ...page, number: page.number })),
    ...customPages.map((record, index) => {
      const content = record.content as Partial<AdminPageContent>;
      return {
        number: String(ADMIN_PAGES.length + index + 1).padStart(2, "0"),
        name: content.name || record.slug,
        slug: record.slug,
        path: content.path || "/" + record.slug,
      };
    }),
  ];

  const closeForm = () => {
    setCreating(false);
    setDraft(emptyDraft);
    setSlugEdited(false);
    setError("");
  };

  const createPage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || saving) return;
    const slug = slugify(draft.slug || draft.name);
    if (!draft.name.trim() || !slug) {
      setError("Nhập tên trang và slug hợp lệ.");
      return;
    }
    if (ADMIN_PAGES.some((page) => page.slug === slug) || records.some((record) => record.slug === slug)) {
      setError("Slug này đã tồn tại. Hãy chọn slug khác.");
      return;
    }

    const name = draft.name.trim();
    const title = draft.title.trim() || name;
    const description = draft.description.trim();
    const order = Math.max(0, ...records.map((record) => record.order)) + 1;
    const content: AdminPageContent = {
      name,
      path: "/" + slug,
      title,
      description,
      seoTitle: draft.seoTitle.trim() || title,
      seoDescription: draft.seoDescription.trim() || description,
      seoKeywords: draft.seoKeywords.trim(),
      heroTitle: title.toLocaleUpperCase("vi-VN"),
      heroDescription: description,
      active: draft.active,
      order,
      sliders: [],
      sections: [{ id: "section-" + slug + "-1", title: "Nội dung trang", description, enabled: true }],
    };
    const record: CmsPageContent = { id: "page-" + slug, slug, content: content as unknown as Record<string, unknown>, order };

    setSaving(true);
    setError("");
    const result = await saveCmsRecords("pageContents", [...records, record]);
    setSaving(false);
    if (!result.persisted) {
      setError("Không thể lưu trang vào PostgreSQL. Hãy đăng nhập bằng tài khoản Admin và thử lại.");
      return;
    }
    setRecords((current) => [...current, record]);
    closeForm();
    router.push("/admin/pages/" + slug);
  };

  return (
    <AdminShell>
      <div className={styles.content}>
        <header className={styles.heading}>
          <div><h1>Quản lý các Trang</h1><p>Khu vực quản trị trung tâm, chọn một trang để quản lý thông tin, slider và Landing Page / Sections trong cùng một nơi.</p></div>
          <button type="button" className={styles.createButton} disabled={!canEdit || !ready} onClick={() => setCreating(true)}>＋ TẠO PAGE MỚI</button>
        </header>
        {!ready && <p className={styles.loading} role="status">Đang tải danh sách trang…</p>}
        <div className={styles.grid}>{rows.map((page) => <article className={styles.pageRow} key={page.slug}><span className={styles.number}>{page.number}</span><div className={styles.pageInfo}><strong>{page.name}</strong><small>{page.path}</small></div><Link className={styles.open} href={page.path} target="_blank" rel="noreferrer"><ExternalIcon /> Mở trang</Link><Link className={styles.details} href={"/admin/pages/" + page.slug}>Quản lý <span aria-hidden="true">›</span></Link></article>)}</div>
      </div>
      {creating && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
        <form className={styles.createForm} onSubmit={(event) => void createPage(event)} aria-labelledby="create-page-title">
          <header><div><span>QUẢN TRỊ NỘI DUNG</span><h2 id="create-page-title">Tạo Page mới</h2></div><button type="button" aria-label="Đóng" onClick={closeForm}>×</button></header>
          <label>Tên Page<input autoFocus value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value, ...(!slugEdited ? { slug: slugify(event.target.value) } : {}) }))} required /></label>
          <label>Slug<input value={draft.slug} onChange={(event) => { setSlugEdited(true); setDraft((current) => ({ ...current, slug: slugify(event.target.value) })); }} required /><small>URL Public: /{draft.slug || "slug-page"}</small></label>
          <label>Tiêu đề<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Mô tả<textarea rows={3} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
          <label>SEO Title<input value={draft.seoTitle} onChange={(event) => setDraft((current) => ({ ...current, seoTitle: event.target.value }))} /></label>
          <label>SEO Description<textarea rows={2} value={draft.seoDescription} onChange={(event) => setDraft((current) => ({ ...current, seoDescription: event.target.value }))} /></label>
          <label>SEO Keywords<input value={draft.seoKeywords} onChange={(event) => setDraft((current) => ({ ...current, seoKeywords: event.target.value }))} /></label>
          <label className={styles.statusField}><input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} /> Đang hiển thị Public</label>
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <footer><button type="button" onClick={closeForm}>Hủy</button><button type="submit" disabled={saving || !canEdit}>{saving ? "Đang lưu…" : "Tạo Page"}</button></footer>
        </form>
      </div>}
    </AdminShell>
  );
}

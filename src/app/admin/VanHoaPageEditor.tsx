"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell, { useAdminRole } from "./AdminShell";
import MediaPicker from "@/components/admin/MediaPicker";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { loadCmsRecords, saveCmsRecords } from "@/lib/cms-client";
import type { CmsMedia, CmsPageContent } from "@/lib/cms-data";
import type { CulturePageContent, CultureSlide } from "./page-data";
import styles from "./page-editor.module.css";

const slug = "van-hoa-va-quy-dinh";

function assetIdFromUrl(url: string) {
  return url.match(/\/api\/media-assets\/([0-9a-f-]{36})/i)?.[1];
}

export default function VanHoaPageEditor() {
  const role = useAdminRole();
  const canEdit = role === "Admin";
  const [records, setRecords] = useState<CmsPageContent[]>([]);
  const [media, setMedia] = useState<CmsMedia[]>([]);
  const [record, setRecord] = useState<CmsPageContent | null>(null);
  const [content, setContent] = useState<CulturePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [dragging, setDragging] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([loadCmsRecords("pageContents"), loadCmsRecords("media")]).then(([pages, mediaItems]) => {
      if (!mounted) return;
      const found = pages.find((item) => item.slug === slug) ?? null;
      setRecords(pages);
      setMedia(mediaItems);
      setRecord(found);
      setContent(found ? found.content as CulturePageContent : null);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const update = (changes: Partial<CulturePageContent>) => {
    setContent((current) => current ? { ...current, ...changes } : current);
    setSaved("");
  };

  const updateTopSlide = (id: string, changes: Partial<CulturePageContent["sliders"][number]>) => {
    if (!content) return;
    update({ sliders: content.sliders.map((slide) => slide.id === id ? { ...slide, ...changes } : slide) });
  };

  const updatePresentationSlide = (id: string, changes: Partial<CultureSlide>) => {
    if (!content) return;
    update({ presentationSlides: content.presentationSlides.map((slide) => slide.id === id ? { ...slide, ...changes } : slide) });
  };

  const movePresentationSlide = (targetId: string) => {
    if (!content || !dragging || dragging === targetId) return;
    const slides = [...content.presentationSlides];
    const from = slides.findIndex((slide) => slide.id === dragging);
    const to = slides.findIndex((slide) => slide.id === targetId);
    if (from < 0 || to < 0) return;
    const [moving] = slides.splice(from, 1);
    slides.splice(to, 0, moving);
    update({ presentationSlides: slides.map((slide, index) => ({ ...slide, order: index + 1 })) });
    setDragging("");
  };

  const save = async () => {
    if (!record || !content || !canEdit || saving) return;
    setSaving(true);
    setSaved("");
    const now = new Date().toISOString();
    const presentationSlides = content.presentationSlides.map((slide, index) => ({
      ...slide,
      name: slide.name || slide.title || "slide-vhux-kh-" + (index + 1),
      order: index + 1,
      status: slide.enabled ? "enabled" as const : "disabled" as const,
      assetId: assetIdFromUrl(slide.image),
      updatedAt: now,
    }));
    const nextContent = { ...content, presentationSlides };
    const nextRecord: CmsPageContent = { ...record, content: nextContent as unknown as Record<string, unknown> };
    const nextPages = records.map((item) => item.slug === slug ? nextRecord : item);
    const nextMedia = [...media];
    for (const [index, slide] of presentationSlides.entries()) {
      const current = nextMedia.find((item) => item.id === slide.id);
      const mediaRecord: CmsMedia = {
        ...current,
        id: slide.id,
        title: slide.name,
        url: slide.image,
        type: "image",
        source: "library",
        active: slide.enabled,
        pageId: slide.pageId,
        order: index + 1,
        status: slide.status,
        createdAt: slide.createdAt,
        updatedAt: now,
      };
      const foundIndex = nextMedia.findIndex((item) => item.id === slide.id);
      if (foundIndex < 0) nextMedia.push(mediaRecord);
      else nextMedia[foundIndex] = mediaRecord;
    }

    const mediaResult = await saveCmsRecords("media", nextMedia);
    if (!mediaResult.persisted) {
      setSaving(false);
      setSaved("Không thể lưu ảnh vào thư viện Media.");
      return;
    }
    const pageResult = await saveCmsRecords("pageContents", nextPages);
    setSaving(false);
    if (!pageResult.persisted) {
      setSaved("Ảnh đã được lưu, nhưng nội dung trang chưa lưu được.");
      return;
    }
    setMedia(nextMedia);
    setRecords(nextPages);
    setRecord(nextRecord);
    setContent(nextContent);
    setSaved("Đã lưu Slider, nội dung và thông tin trang vào PostgreSQL.");
  };

  if (loading) return <AdminShell><div className={styles.content}><p role="status">Đang tải trang…</p></div></AdminShell>;
  if (!content || !record) return <AdminShell><div className={styles.content}><p>Chưa có bản ghi trang Văn hóa và Quy định trong PostgreSQL.</p><Link href="/admin/pages">← Quản lý các Trang</Link></div></AdminShell>;

  return <AdminShell><div className={styles.content}>
    <div className={styles.topline}><Link href="/admin/pages">← Quản lý các Trang</Link><div className={styles.toplineActions}><Link className={styles.preview} href="/van-hoa-va-quy-dinh" target="_blank" rel="noreferrer">↗ Mở trang</Link>{canEdit && <button className={styles.topSave} type="button" disabled={saving} onClick={() => void save()}>{saving ? "\u0110ang l\u01b0u\u2026" : "L\u01b0u th\u00f4ng tin"}</button>}</div></div>
    <div className={styles.pageTitle}><div><h1>Văn hóa và Quy định</h1><span>/van-hoa-va-quy-dinh</span></div></div>

    <section className={styles.panel}>
      <h2>Thông tin Trang</h2>
      <div className={styles.fields}><label>Tên Trang<input value={content.name} disabled={!canEdit} onChange={(event) => update({ name: event.target.value })} /></label><label>Slug / URL Public<input value={content.path} readOnly /></label></div>
      <label>Tiêu đề<input value={content.title} disabled={!canEdit} onChange={(event) => update({ title: event.target.value })} /></label>
      <label>Mô tả<textarea rows={2} value={content.description} disabled={!canEdit} onChange={(event) => update({ description: event.target.value })} /></label>
      <div className={styles.fields}><label>SEO Title<input value={content.seoTitle ?? ""} disabled={!canEdit} onChange={(event) => update({ seoTitle: event.target.value })} /></label><label>SEO Keywords<input value={content.seoKeywords ?? ""} disabled={!canEdit} onChange={(event) => update({ seoKeywords: event.target.value })} /></label></div>
      <label>SEO Description<textarea rows={2} value={content.seoDescription ?? ""} disabled={!canEdit} onChange={(event) => update({ seoDescription: event.target.value })} /></label>
      <div className={styles.panelFooter}><div className={styles.pageStatus}><button className={styles.toggle + " " + (content.active ? styles.toggleOn : "")} type="button" role="switch" aria-checked={content.active} aria-label="Trang đang hiển thị" disabled={!canEdit} onClick={() => update({ active: !content.active })}><i /></button><span>{content.active ? "Đang hiển thị Public" : "Đang ẩn"}</span></div></div>
    </section>

    <section className={styles.panel}>
      <div className={styles.sectionHeading}><div><h2>Slider Top của Page</h2><p>Ảnh full-width độc lập với bộ ảnh ở Tab Thuyết trình.</p></div><button className={styles.addButton} type="button" disabled={!canEdit} onClick={() => update({ sliders: [...content.sliders, { id: "van-hoa-top-" + Date.now(), title: content.name.toLocaleUpperCase("vi-VN"), description: content.description, image: "", enabled: true }] })}>＋ Thêm ảnh Top</button></div>
      <div className={styles.items}>{content.sliders.map((slide, index) => <article className={styles.item} key={slide.id}>
        <span className={styles.itemNumber}>{String(index + 1).padStart(2, "0")}</span>
        {slide.image ? <img className={styles.thumbnail} src={slide.image} alt="" /> : <div className={styles.thumbnailEmpty}>Ảnh</div>}
        <div className={styles.itemFields}><input aria-label="Tiêu đề Slider Top" value={slide.title} disabled={!canEdit} onChange={(event) => updateTopSlide(slide.id, { title: event.target.value })} /><input aria-label="Mô tả Slider Top" value={slide.description} disabled={!canEdit} onChange={(event) => updateTopSlide(slide.id, { description: event.target.value })} /><MediaPicker value={slide.image} onChange={(value) => updateTopSlide(slide.id, { image: Array.isArray(value) ? value[0] ?? "" : value })} label="Ảnh Slider Top" /></div>
        <button className={styles.toggle + " " + (slide.enabled ? styles.toggleOn : "")} type="button" role="switch" aria-checked={slide.enabled} aria-label="Slider Top đang hoạt động" disabled={!canEdit} onClick={() => updateTopSlide(slide.id, { enabled: !slide.enabled })}><i /></button>
        <button className={styles.iconButton} type="button" aria-label="Xóa ảnh Top" disabled={!canEdit} onClick={() => update({ sliders: content.sliders.filter((item) => item.id !== slide.id) })}>×</button>
      </article>)}</div>
    </section>

    <section className={styles.panel}>
      <div className={styles.sectionHeading}><div><h2>Section Tab</h2><p>Tab Thuyết trình quản lý bộ 17 ảnh; Tab Nội dung dùng Rich Text Editor.</p></div></div>
      <div className={styles.fields}><label>Tab 1<input readOnly value="THUYẾT TRÌNH" /></label><label>Tab 2<input readOnly value="NỘI DUNG" /></label></div>
      <div className={styles.sectionHeading}><div><h3>THUYẾT TRÌNH · {content.presentationSlides.length}/17 ảnh</h3><p>Kéo thả để sắp xếp; từng ảnh có thể bật/tắt, thay thế hoặc xóa.</p></div><button className={styles.addButton} type="button" disabled={!canEdit} onClick={() => {
        const order = content.presentationSlides.length + 1;
        const now = new Date().toISOString();
        const slide: CultureSlide = { id: "slide-vhux-kh-" + order, pageId: "page-" + slug, name: "slide-vhux-kh-" + order, title: "slide-vhux-kh-" + order, description: "", image: "", enabled: true, order, status: "enabled", createdAt: now, updatedAt: now };
        update({ presentationSlides: [...content.presentationSlides, slide] });
      }}>＋ Thêm Slide</button></div>
      <div className={styles.items}>{content.presentationSlides.map((slide, index) => <article className={styles.item} key={slide.id} draggable={canEdit} onDragStart={() => setDragging(slide.id)} onDragEnd={() => setDragging("")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); movePresentationSlide(slide.id); }}>
        <span className={styles.itemNumber}>{String(index + 1).padStart(2, "0")}</span>
        {slide.image ? <img className={styles.thumbnail} src={slide.image} alt="" /> : <div className={styles.thumbnailEmpty}>Ảnh</div>}
        <div className={styles.itemFields}><input aria-label="Tên file ảnh" value={slide.name} disabled={!canEdit} onChange={(event) => updatePresentationSlide(slide.id, { name: event.target.value, title: event.target.value })} /><MediaPicker value={slide.image} onChange={(value) => updatePresentationSlide(slide.id, { image: Array.isArray(value) ? value[0] ?? "" : value, assetId: assetIdFromUrl(Array.isArray(value) ? value[0] ?? "" : value) })} label="Chọn ảnh từ Media" /></div>
        <button className={styles.toggle + " " + (slide.enabled ? styles.toggleOn : "")} type="button" role="switch" aria-checked={slide.enabled} aria-label={slide.name + " đang hoạt động"} disabled={!canEdit} onClick={() => updatePresentationSlide(slide.id, { enabled: !slide.enabled, status: slide.enabled ? "disabled" : "enabled" })}><i /></button>
        <button className={styles.iconButton} type="button" aria-label={"Xóa " + slide.name} disabled={!canEdit} onClick={() => window.confirm("Xóa " + slide.name + " khỏi Tab Thuyết trình?") && update({ presentationSlides: content.presentationSlides.filter((item) => item.id !== slide.id) })}>×</button>
      </article>)}</div>
    </section>

    <section className={styles.panel}>
      <div className={styles.sectionHeading}><div><h2>NỘI DUNG</h2><p>Chỉnh sửa bài viết và bảng ứng xử bằng Rich Text Editor.</p></div></div>
      <RichTextEditor value={content.contentHtml} onChange={(contentHtml) => update({ contentHtml })} />
    </section>

    {canEdit && <div className={styles.saveBar}><span role="status">{saved}</span><button type="button" disabled={saving} onClick={() => void save()}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</button></div>}
  </div></AdminShell>;
}

"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminShell, { useAdminRole } from "./AdminShell";
import MediaPicker from "@/components/admin/MediaPicker";
import { loadCmsRecords, saveCmsRecords } from "@/lib/cms-client";
import type { CmsPageContent } from "@/lib/cms-data";
import type { AdminPageContent, AdminSection, AdminSlider } from "./page-data";
import styles from "./page-editor.module.css";

export default function CustomPageEditor({ slug }: { slug: string }) {
  return <AdminShell><CustomPageEditorContent slug={slug} /></AdminShell>;
}

function CustomPageEditorContent({ slug }: { slug: string }) {
  const role = useAdminRole();
  const canEdit = role === "Admin";
  const router = useRouter();
  const [records, setRecords] = useState<CmsPageContent[]>([]);
  const [record, setRecord] = useState<CmsPageContent | null>(null);
  const [content, setContent] = useState<AdminPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState("");

  useEffect(() => {
    let mounted = true;
    loadCmsRecords("pageContents").then((items) => {
      if (!mounted) return;
      const found = items.find((item) => item.slug === slug) ?? null;
      setRecords(items);
      setRecord(found);
      setContent(found ? found.content as AdminPageContent : null);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [slug]);

  const update = (changes: Partial<AdminPageContent>) => {
    setContent((current) => current ? { ...current, ...changes } : current);
    setSaved("");
  };

  const updateSlider = (id: string, changes: Partial<AdminSlider>) => {
    if (!content) return;
    update({ sliders: content.sliders.map((slider) => slider.id === id ? { ...slider, ...changes } : slider) });
  };

  const moveSlider = (targetId: string) => {
    if (!content || !dragging || dragging === targetId) return;
    const items = [...content.sliders];
    const from = items.findIndex((item) => item.id === dragging);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const moving = items.splice(from, 1)[0];
    items.splice(to, 0, moving);
    update({ sliders: items });
    setDragging("");
  };

  const updateSection = (id: string, changes: Partial<AdminSection>) => {
    if (!content) return;
    update({ sections: content.sections.map((section) => section.id === id ? { ...section, ...changes } : section) });
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    if (!content) return;
    const target = index + direction;
    if (target < 0 || target >= content.sections.length) return;
    const sections = [...content.sections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    update({ sections });
  };

  const save = async () => {
    if (!content || !record || !canEdit || saving) return;
    setSaving(true);
    setSaved("");
    const nextRecord: CmsPageContent = { ...record, content: content as unknown as Record<string, unknown> };
    const nextRecords = records.map((item) => item.slug === slug ? nextRecord : item);
    const result = await saveCmsRecords("pageContents", nextRecords);
    setSaving(false);
    if (!result.persisted) {
      setSaved("Không thể lưu vào cơ sở dữ liệu; vui lòng thử lại.");
      return;
    }
    setRecords(nextRecords);
    setRecord(nextRecord);
    setSaved("Đã lưu thông tin trang vào PostgreSQL.");
  };

  const deletePage = async () => {
    if (!record || !canEdit || !window.confirm("Xóa trang “" + content?.name + "”? Dữ liệu của trang sẽ được đánh dấu đã xóa.")) return;
    const response = await fetch("/api/cms/pageContents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: record.id }),
    });
    if (!response.ok) {
      setSaved("Không thể xóa trang khỏi cơ sở dữ liệu.");
      return;
    }
    router.replace("/admin/pages");
  };

  if (loading) return <div className={styles.content}><p role="status">Đang tải trang…</p></div>;
  if (!content || !record) return <div className={styles.content}><p>Không tìm thấy trang trong cơ sở dữ liệu.</p><Link href="/admin/pages">← Quản lý các Trang</Link></div>;

  return <div className={styles.content}>
    <div className={styles.topline}><Link href="/admin/pages">← Quản lý các Trang</Link><div className={styles.toplineActions}><Link className={styles.preview} href={content.path} target="_blank" rel="noreferrer">↗ Mở trang</Link>{canEdit && <button className={styles.topSave} type="button" disabled={saving} onClick={() => void save()}>{saving ? "\u0110ang l\u01b0u\u2026" : "L\u01b0u th\u00f4ng tin"}</button>}</div></div>
    <div className={styles.pageTitle}><div><h1>{content.name}</h1><span>{content.path}</span></div></div>

    <section className={styles.panel}>
      <h2>Thông tin Trang</h2>
      <div className={styles.fields}><label>Tên Trang<input value={content.name} disabled={!canEdit} onChange={(event) => update({ name: event.target.value })} /></label><label>Slug / URL Public<input value={content.path} readOnly /></label></div>
      <label>Tiêu đề<input value={content.title} disabled={!canEdit} onChange={(event) => update({ title: event.target.value })} /></label>
      <label>Mô tả<textarea rows={3} value={content.description} disabled={!canEdit} onChange={(event) => update({ description: event.target.value })} /></label>
      <div className={styles.fields}><label>SEO Title<input value={content.seoTitle ?? ""} disabled={!canEdit} onChange={(event) => update({ seoTitle: event.target.value })} /></label><label>SEO Keywords<input value={content.seoKeywords ?? ""} disabled={!canEdit} onChange={(event) => update({ seoKeywords: event.target.value })} /></label><label>Thứ tự<input type="number" min={1} value={content.order ?? record.order} disabled={!canEdit} onChange={(event) => update({ order: Number(event.target.value) })} /></label></div>
      <label>SEO Description<textarea rows={2} value={content.seoDescription ?? ""} disabled={!canEdit} onChange={(event) => update({ seoDescription: event.target.value })} /></label>
      <div className={styles.panelFooter}><div className={styles.pageStatus}><button className={styles.toggle + " " + (content.active ? styles.toggleOn : "")} type="button" role="switch" aria-checked={content.active} aria-label="Trang đang hiển thị" disabled={!canEdit} onClick={() => update({ active: !content.active })}><i /></button><span>{content.active ? "Đang hiển thị Public" : "Đang ẩn"}</span></div><button className={styles.panelSave} type="button" disabled={!canEdit || saving} onClick={() => void save()}>{saving ? "Đang lưu…" : "Lưu thông tin"}</button></div>
    </section>

    <section className={styles.panel}>
      <div className={styles.sectionHeading}><div><h2>Slider của Trang</h2><p>Quản lý ảnh, thứ tự và trạng thái từng slide.</p></div><button className={styles.addButton} type="button" disabled={!canEdit} onClick={() => update({ sliders: [...content.sliders, { id: slug + "-slide-" + Date.now(), title: "Banner mới", description: "", image: "", enabled: true }] })}>＋ Thêm Slide</button></div>
      {content.sliders.length === 0 && <div className={styles.emptyState}>Trang chưa có slide. Thêm slide để hiển thị banner đầu trang.</div>}
      <div className={styles.items}>{content.sliders.map((slider, index) => <article className={styles.item} key={slider.id} draggable={canEdit} onDragStart={() => setDragging(slider.id)} onDragEnd={() => setDragging("")} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveSlider(slider.id); }}>
        <span className={styles.itemNumber}>{String(index + 1).padStart(2, "0")}</span>
        {slider.image ? <img className={styles.thumbnail} src={slider.image} alt="" /> : <div className={styles.thumbnailEmpty}>Ảnh</div>}
        <div className={styles.itemFields}><input aria-label="Tiêu đề slide" value={slider.title} disabled={!canEdit} onChange={(event) => updateSlider(slider.id, { title: event.target.value })} /><input aria-label="Mô tả slide" value={slider.description} disabled={!canEdit} onChange={(event) => updateSlider(slider.id, { description: event.target.value })} /><MediaPicker value={slider.image} onChange={(value) => updateSlider(slider.id, { image: Array.isArray(value) ? value[0] ?? "" : value })} label="Ảnh slide" /></div>
        <button className={styles.toggle + " " + (slider.enabled ? styles.toggleOn : "")} type="button" role="switch" aria-checked={slider.enabled} aria-label={"Slide " + (index + 1) + " đang hoạt động"} disabled={!canEdit} onClick={() => updateSlider(slider.id, { enabled: !slider.enabled })}><i /></button>
        <button className={styles.iconButton} type="button" aria-label="Xóa slide" disabled={!canEdit} onClick={() => update({ sliders: content.sliders.filter((item) => item.id !== slider.id) })}>×</button>
      </article>)}</div>
    </section>

    <section className={styles.panel}>
      <div className={styles.sectionHeading}><div><h2>Các Section</h2><p>Thêm và chỉnh sửa section độc lập của trang.</p></div><button className={styles.addButton} type="button" disabled={!canEdit} onClick={() => update({ sections: [...content.sections, { id: slug + "-section-" + Date.now(), title: "Section mới", description: "", body: "", image: "", enabled: true }] })}>＋ Thêm Section</button></div>
      {content.sections.length === 0 && <div className={styles.emptyState}>Trang chưa có section nào.</div>}
      <div className={styles.items}>{content.sections.map((section, index) => <article className={styles.item} key={section.id}>
        <div className={styles.reorder}><button type="button" aria-label="Đưa section lên" disabled={!canEdit || index === 0} onClick={() => moveSection(index, -1)}>↑</button><span>⋮⋮</span><button type="button" aria-label="Đưa section xuống" disabled={!canEdit || index === content.sections.length - 1} onClick={() => moveSection(index, 1)}>↓</button></div>
        <div className={styles.itemFields}><input aria-label="Tên section" value={section.title} disabled={!canEdit} onChange={(event) => updateSection(section.id, { title: event.target.value })} /><textarea aria-label="Mô tả section" rows={3} value={section.description} disabled={!canEdit} onChange={(event) => updateSection(section.id, { description: event.target.value })} /><textarea aria-label="Nội dung section" rows={4} value={section.body ?? ""} disabled={!canEdit} onChange={(event) => updateSection(section.id, { body: event.target.value })} /><MediaPicker value={section.image ?? ""} onChange={(value) => updateSection(section.id, { image: Array.isArray(value) ? value[0] ?? "" : value })} label="Ảnh section" /></div>
        <button className={styles.toggle + " " + (section.enabled ? styles.toggleOn : "")} type="button" role="switch" aria-checked={section.enabled} aria-label={"Section " + section.title + " đang hiển thị"} disabled={!canEdit} onClick={() => updateSection(section.id, { enabled: !section.enabled })}><i /></button>
        <button className={styles.iconButton} type="button" aria-label="Xóa section" disabled={!canEdit} onClick={() => update({ sections: content.sections.filter((item) => item.id !== section.id) })}>×</button>
      </article>)}</div>
    </section>

    {canEdit && <div className={styles.saveBar}><span role="status">{saved}</span><button type="button" onClick={() => void save()} disabled={saving}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</button><button className={styles.iconButton} type="button" onClick={() => void deletePage()}>Xóa Page</button></div>}
  </div>;
}

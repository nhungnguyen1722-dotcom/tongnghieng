"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import AdminShell, { useAdminRole } from "./AdminShell";
import MediaPicker from "@/components/admin/MediaPicker";
import { defaultPageContent, hydratePageContent, readPageContent, savePageContent, type AdminPageContent, type AdminSection, type AdminSlider } from "./page-data";
import styles from "./page-editor.module.css";

function StatusToggle({ value, onChange, label, disabled = false }: { value: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }) {
  return <button className={`${styles.toggle} ${value ? styles.toggleOn : ""}`} type="button" role="switch" aria-checked={value} aria-label={label} disabled={disabled} onClick={() => onChange(!value)}><i /></button>;
}

function subscribePageContent(onChange: () => void) {
  window.addEventListener("nghieng:content-updated", onChange);
  window.addEventListener("storage", onChange);
  return () => { window.removeEventListener("nghieng:content-updated", onChange); window.removeEventListener("storage", onChange); };
}

export default function PageEditor({ slug }: { slug: string }) {
  return <AdminShell><PageEditorContent slug={slug} /></AdminShell>;
}

function PageEditorContent({ slug }: { slug: string }) {
  const canEdit = useAdminRole() === "Admin";
  const snapshot = useSyncExternalStore(subscribePageContent, () => JSON.stringify(readPageContent(slug)), () => JSON.stringify(defaultPageContent(slug)));
  const content = useMemo(() => JSON.parse(snapshot) as AdminPageContent, [snapshot]);
  useEffect(() => { void hydratePageContent(slug); }, [slug]);
  const [draft, setDraft] = useState<Partial<AdminPageContent> | null>(null);
  const current = useMemo(() => ({ ...content, ...draft }), [content, draft]);
  const [saved, setSaved] = useState("");
  const [editingSlider, setEditingSlider] = useState<string | null>(null);
  const [draggingSlider, setDraggingSlider] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const isHome = slug === "trang-chu";

  const update = (changes: Partial<AdminPageContent>) => { setDraft((previous) => ({ ...current, ...previous, ...changes })); setSaved(""); };
  const updateSection = (id: string, changes: Partial<AdminSection>) => update({ sections: current.sections.map((item) => item.id === id ? { ...item, ...changes } : item) });
  const updateSlider = (id: string, changes: Partial<AdminSlider>) => update({ sliders: current.sliders.map((item) => item.id === id ? { ...item, ...changes } : item) });
  const moveSlider = (targetId: string) => {
    if (!draggingSlider || draggingSlider === targetId) return;
    const sliders = [...current.sliders];
    const sourceIndex = sliders.findIndex((item) => item.id === draggingSlider);
    const targetIndex = sliders.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moving] = sliders.splice(sourceIndex, 1);
    sliders.splice(targetIndex, 0, moving);
    update({ sliders });
    setDraggingSlider(null);
  };
  const addSection = () => update({ sections: [...current.sections, { id: `${slug}-section-${Date.now()}`, title: "Phần mới", description: "", body: "", image: "", ctaLabel: "", ctaUrl: "", enabled: true }] });
  const addSlider = () => update({ sliders: [...current.sliders, { id: `${slug}-slide-${Date.now()}`, title: "Banner mới", description: "", image: "", enabled: true }] });
  const moveSection = (index: number, direction: -1 | 1) => { const target = index + direction; if (target < 0 || target >= current.sections.length) return; const sections = [...current.sections]; [sections[index], sections[target]] = [sections[target], sections[index]]; update({ sections }); };
  const save = async () => {
    const result = await savePageContent(slug, current);
    if (!result.persisted) {
      setSaved("Không thể lưu vào cơ sở dữ liệu; vui lòng thử lại.");
      return;
    }
    setDraft(null);
    setSaved("Đã lưu vào cơ sở dữ liệu.");
    setEditingSlider(null);
    setEditingSection(null);
  };

  return (
      <div className={styles.content}>
        <div className={styles.topline}><Link href="/admin/pages">← Quản lý các Trang</Link><Link className={styles.preview} href={current.path} target="_blank" rel="noreferrer">↗ Mở trang</Link></div>
        <div className={styles.pageTitle}><div><h1>{current.name}</h1><span>{current.path}</span></div></div>

        <section className={styles.panel}>
          <h2>Thông tin Trang</h2>
          <div className={styles.fields}><label>Tên Trang<input value={current.name} readOnly={!canEdit} onChange={(event) => update({ name: event.target.value })} /></label><label>Slug (đường dẫn của trang)<input className={styles.slugInput} value={current.path} readOnly /></label></div>
          <label>Tiêu đề<input value={current.title} readOnly={!canEdit} onChange={(event) => update({ title: event.target.value })} /></label>
          <label>Mô tả<textarea rows={2} value={current.description} readOnly={!canEdit} onChange={(event) => update({ description: event.target.value })} /></label>
          <div className={styles.panelFooter}><div className={styles.pageStatus}><StatusToggle value={current.active} onChange={(active) => update({ active })} disabled={!canEdit} label="Trang đang hoạt động" /><span>Active</span></div><button className={styles.panelSave} type="button" disabled={!canEdit} onClick={save}>Lưu thông tin</button></div>
        </section>

        <section className={styles.panel}><div className={styles.sectionHeading}><div><h2>Slider của Trang</h2><p>Banner slide đầu trang, hiển thị theo thứ tự và trạng thái Active.</p></div><button className={styles.addButton} onClick={addSlider} type="button" disabled={!canEdit || current.sliders.length >= 3}>＋ Thêm Slide</button></div><p className={styles.hint}>Kéo thả để đổi thứ tự hoặc mở từng slide để chỉnh sửa nội dung và ảnh.</p>{current.sliders.length === 0 && <div className={styles.emptyState}>Trang này chưa có Slide nào. Nhấn “Thêm Slide” để tạo banner.</div>}<div className={styles.items}>{current.sliders.map((slider, index) => <article className={styles.item} key={slider.id} draggable={canEdit} onDragStart={() => canEdit && setDraggingSlider(slider.id)} onDragEnd={() => setDraggingSlider(null)} onDragOver={(event) => canEdit && event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (canEdit) moveSlider(slider.id); }}><div className={styles.reorderGrip} aria-hidden="true">⋮⋮</div><span className={styles.itemNumber}>{String(index + 1).padStart(2, "0")}</span>{slider.image ? <img className={styles.thumbnail} src={slider.image} alt="" /> : <div className={styles.thumbnailEmpty}>Ảnh</div>}<div className={styles.itemFields}>{editingSlider === slider.id ? <><input aria-label="Tiêu đề banner" value={slider.title} onChange={(event) => updateSlider(slider.id, { title: event.target.value })} /><input aria-label="Mô tả banner" value={slider.description} onChange={(event) => updateSlider(slider.id, { description: event.target.value })} /><MediaPicker value={slider.image} onChange={(value) => updateSlider(slider.id, { image: Array.isArray(value) ? value[0] ?? "" : value })} label="Ảnh banner" /></> : <div className={styles.itemCopy}><strong>{slider.title}</strong><small>{slider.description}</small></div>}</div><StatusToggle value={slider.enabled} onChange={(enabled) => updateSlider(slider.id, { enabled })} disabled={!canEdit} label={`Banner ${index + 1} đang hoạt động`} /><button className={styles.iconButton} type="button" disabled={!canEdit} aria-label={`Chỉnh sửa banner ${index + 1}`} onClick={() => setEditingSlider(editingSlider === slider.id ? null : slider.id)}>✎</button><button className={styles.iconButton} type="button" disabled={!canEdit} aria-label={`Xóa banner ${index + 1}`} onClick={() => window.confirm("Xóa banner này?") && update({ sliders: current.sliders.filter((item) => item.id !== slider.id) })}>×</button></article>)}</div></section>

        <section className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div><h2>{isHome ? "Landing Page / Sections của Trang" : "Các phần nội dung"}</h2><p>Sắp xếp, bật/tắt hiển thị và chỉnh sửa nội dung từng section.</p></div>
            <button className={styles.addButton} onClick={addSection} type="button" disabled={!canEdit}>＋ Thêm section</button>
          </div>
          <p className={styles.hint}>Thứ tự và nội dung section được lưu riêng theo từng trang.</p>
          {current.sections.length === 0 && <div className={styles.emptyState}>Trang này chưa có section nào trong CMS. Nhấn “Thêm section” để tạo section tự do (tiêu đề, mô tả, ảnh, nội dung, nút CTA).</div>}
          <div className={styles.items}>
            {current.sections.map((section, index) => (
              <article className={styles.item} key={section.id}>
                <div className={styles.reorder}>
                  <button type="button" aria-label="Đưa section lên" disabled={!canEdit || index === 0} onClick={() => moveSection(index, -1)}>↑</button>
                  <span aria-hidden="true">⋮⋮</span>
                  <button type="button" aria-label="Đưa section xuống" disabled={!canEdit || index === current.sections.length - 1} onClick={() => moveSection(index, 1)}>↓</button>
                </div>
                <span className={styles.itemNumber}>{String(index + 1).padStart(2, "0")}</span>
                <div className={`${styles.itemFields} ${editingSection === section.id ? styles.sectionEditorFields : ""}`}>
                  {editingSection === section.id ? <>
                    <input aria-label="Tên section" value={section.title} onChange={(event) => updateSection(section.id, { title: event.target.value })} />
                    <textarea aria-label="Mô tả section" placeholder="Mô tả section" rows={2} value={section.description} onChange={(event) => updateSection(section.id, { description: event.target.value })} />
                    <textarea aria-label="Nội dung section" placeholder="Nội dung section" rows={4} value={section.body ?? ""} onChange={(event) => updateSection(section.id, { body: event.target.value })} />
                    <MediaPicker value={section.image ?? ""} onChange={(value) => updateSection(section.id, { image: Array.isArray(value) ? value[0] ?? "" : value })} label="Ảnh section" />
                    <input aria-label="Nhãn nút CTA" placeholder="Nhãn nút CTA" value={section.ctaLabel ?? ""} onChange={(event) => updateSection(section.id, { ctaLabel: event.target.value })} />
                    <input aria-label="Liên kết nút CTA" placeholder="Liên kết nút CTA" value={section.ctaUrl ?? ""} onChange={(event) => updateSection(section.id, { ctaUrl: event.target.value })} />
                  </> : <div className={styles.itemCopy}><strong>{section.title}</strong><small>{section.description || "Section chuẩn · nội dung đang hiển thị"}</small></div>}
                </div>
                <StatusToggle value={section.enabled} onChange={(enabled) => updateSection(section.id, { enabled })} disabled={!canEdit} label={`${section.title} đang hiển thị`} />
                <button className={styles.iconButton} type="button" disabled={!canEdit} aria-label={`Chỉnh sửa ${section.title}`} onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}>✎</button>
                <button className={styles.iconButton} type="button" disabled={!canEdit} aria-label={`Xóa ${section.title}`} onClick={() => window.confirm(`Xóa section “${section.title}”?`) && update({ sections: current.sections.filter((item) => item.id !== section.id) })}>×</button>
              </article>
            ))}
          </div>
        </section>

        {canEdit && <div className={styles.saveBar}><span role="status">{saved}</span><button type="button" onClick={save}>Lưu thông tin</button></div>}
      </div>
  );
}

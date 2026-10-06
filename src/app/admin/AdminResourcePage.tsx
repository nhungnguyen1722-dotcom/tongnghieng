"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "./AdminShell";
import { RESOURCE_CONFIG, type ResourceItem } from "./resource-data";
import styles from "./resource.module.css";

export default function AdminResourcePage({ section }: { section: string }) {
  const config = RESOURCE_CONFIG[section];
  const [items, setItems] = useState<ResourceItem[]>(config.items);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(`nghieng-admin-resource-${section}`);
        if (stored) setItems(JSON.parse(stored) as ResourceItem[]);
      } catch {
        // Keep the server-provided starter data when local storage is unavailable.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [config.items, section]);

  const persist = (next: ResourceItem[]) => {
    setItems(next);
    window.localStorage.setItem(`nghieng-admin-resource-${section}`, JSON.stringify(next));
    setSaved(true);
  };

  const saveItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentEditing = editing;
    if (!currentEditing || !currentEditing.title.trim()) return;
    const next = items.some((item) => item.id === currentEditing.id) ? items.map((item) => item.id === currentEditing.id ? currentEditing : item) : [...items, currentEditing];
    persist(next);
    setEditing(null);
  };

  const createItem = () => setEditing({ id: `${section}-${Date.now()}`, title: "", status: "Bản nháp", detail: "" });
  const removeItem = (id: string) => { if (window.confirm("Xóa mục này?")) persist(items.filter((item) => item.id !== id)); };

  return <AdminShell><div className={styles.content}><header className={styles.heading}><div><span className={styles.kicker}>NỘI DUNG / ADMIN</span><h1>{config.title}</h1><p>{config.description}</p></div><button className={styles.primary} type="button" onClick={createItem}>＋ Thêm {config.singular}</button></header><div className={styles.toolbar}><span>{items.length} {config.singular}</span><span>{saved ? "Đã lưu thay đổi" : "Dữ liệu sẵn sàng"}</span></div><div className={styles.list}>{items.map((item) => <article className={styles.row} key={item.id}><span className={styles.rowNumber}>#{item.id.split("-").at(-1)}</span><div className={styles.rowInfo}><h2>{item.title || "Chưa có tiêu đề"}</h2><p>{item.detail || "Chưa có mô tả"}</p></div><span className={`${styles.status} ${item.status === "Đang hiển thị" ? styles.published : ""}`}>{item.status}</span><button className={styles.iconButton} type="button" onClick={() => setEditing(item)} aria-label={`Sửa ${item.title}`}>Sửa</button><button className={styles.deleteButton} type="button" onClick={() => removeItem(item.id)} aria-label={`Xóa ${item.title}`}>Xóa</button></article>)}</div>{editing && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><section className={styles.editorPanel} role="dialog" aria-modal="true" aria-labelledby="resource-editor-title"><div className={styles.editorHeading}><div><span className={styles.kicker}>CHỈNH SỬA</span><h2 id="resource-editor-title">{editing.title ? `Sửa ${config.singular}` : `Thêm ${config.singular}`}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Đóng">×</button></div><form onSubmit={saveItem}><label>Tên / tiêu đề<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} required /></label><label>Mô tả<textarea rows={3} value={editing.detail} onChange={(event) => setEditing({ ...editing, detail: event.target.value })} /></label><label>Trạng thái<select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value })}><option>Đang hiển thị</option><option>Bản nháp</option></select></label><div className={styles.formActions}><button type="button" onClick={() => setEditing(null)}>Hủy</button><button className={styles.primary} type="submit">Lưu thay đổi</button></div></form></section></div>}<p className={styles.back}><Link href="/admin">← Về Dashboard</Link></p></div></AdminShell>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell, { useAdminRole } from "@/app/admin/AdminShell";
import { CMS_SEEDS, type CmsMenuItem } from "@/lib/cms-data";
import { loadCmsRecords, saveCmsRecords } from "@/lib/cms-client";
import styles from "./admin-menu-manager.module.css";

function newItem(order: number, parentId: string | null = null): CmsMenuItem {
  return { id: "menu-" + crypto.randomUUID(), label: "Mục mới", url: "/", parentId, target: "_self", active: true, kind: "link", order };
}

export default function AdminMenuManager() {
  const canEdit = Boolean(useAdminRole());
  const [items, setItems] = useState<CmsMenuItem[]>(CMS_SEEDS.menu);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [dragId, setDragId] = useState("");
  const [draft, setDraft] = useState({ label: "", url: "" });

  useEffect(() => { let live = true; loadCmsRecords("menu").then((rows) => { if (live) setItems(rows); }); return () => { live = false; }; }, []);

  const roots = useMemo(() => items.filter((item) => item.parentId === null).sort((a, b) => a.order - b.order), [items]);
  const update = (id: string, change: Partial<CmsMenuItem>) => { setItems((current) => current.map((item) => item.id === id ? { ...item, ...change } : item)); setSaved(""); };
  const addRoot = () => {
    const item = { ...newItem(Math.max(0, ...items.filter((row) => !row.parentId).map((row) => row.order)) + 1), label: draft.label.trim() || "Mục mới", url: draft.url.trim() || "/" };
    setItems((current) => [...current, item]); setDraft({ label: "", url: "" });
  };
  const addChild = (parentId: string) => setItems((current) => [...current, newItem(Math.max(0, ...current.filter((item) => item.parentId === parentId).map((item) => item.order)) + 1, parentId)]);
  const remove = (id: string) => { setItems((current) => current.filter((item) => item.id !== id && item.parentId !== id)); setSaved(""); };
  const move = (target: CmsMenuItem) => {
    const source = items.find((item) => item.id === dragId);
    if (!source || source.parentId !== target.parentId || source.id === target.id) return;
    const siblings = items.filter((item) => item.parentId === source.parentId).sort((a, b) => a.order - b.order);
    const from = siblings.findIndex((item) => item.id === source.id);
    const to = siblings.findIndex((item) => item.id === target.id);
    siblings.splice(to, 0, siblings.splice(from, 1)[0]);
    const byId = new Map(siblings.map((item, index) => [item.id, { ...item, order: index + 1 }]));
    setItems((current) => current.map((item) => byId.get(item.id) ?? item));
    setDragId("");
  };
  const save = async () => {
    const result = await saveCmsRecords("menu", items);
    if (!result.persisted) { setError("Không lưu được menu vào PostgreSQL. Vui lòng đăng nhập bằng tài khoản Admin và thử lại."); return; }
    setError(""); setSaved("Đã lưu cấu trúc menu vào PostgreSQL.");
  };
  const resetDefaults = async () => {
    setItems(CMS_SEEDS.menu);
    const result = await saveCmsRecords("menu", CMS_SEEDS.menu);
    if (!result.persisted) { setError("Không đồng bộ được cấu trúc menu mặc định vào PostgreSQL."); return; }
    setError(""); setSaved("Đã đồng bộ cấu trúc menu mặc định.");
  };
  const renderRow = (item: CmsMenuItem, child = false) => <div className={`${styles.row} ${child ? styles.child : ""}`} key={item.id} draggable={canEdit} onDragStart={() => setDragId(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => move(item)}>
    <span className={styles.grip} aria-hidden="true">⠿</span>
    <input aria-label="Tên mục menu" value={item.label} disabled={!canEdit} onChange={(event) => update(item.id, { label: event.target.value })} />
    <input aria-label="Đường dẫn menu" value={item.url} disabled={!canEdit} onChange={(event) => update(item.id, { url: event.target.value })} />
    <select aria-label="Mục cha" value={item.parentId ?? ""} disabled={!canEdit} onChange={(event) => update(item.id, { parentId: event.target.value || null })}>
      <option value="">— Cấp 1 (menu chính) —</option>{roots.filter((root) => root.id !== item.id).map((root) => <option key={root.id} value={root.id}>Con của: {root.label}</option>)}
    </select>
    <label className={styles.active}><input type="checkbox" checked={item.active} disabled={!canEdit} onChange={(event) => update(item.id, { active: event.target.checked })} /> Hiển thị</label>
    <div className={styles.actions}>{!child && <button type="button" title="Thêm mục con" disabled={!canEdit} onClick={() => addChild(item.id)}>＋</button>}<button type="button" title="Xóa mục" disabled={!canEdit} onClick={() => remove(item.id)}>×</button></div>
  </div>;

  return <AdminShell><main className={styles.content}>
    <header className={styles.heading}><div><h1>Quản lý Menu Header</h1><p>Kéo thả để sắp xếp thứ tự, cấu hình mục cha/con và trạng thái hiển thị.</p></div><div className={styles.headingActions}><button type="button" onClick={() => void resetDefaults()} disabled={!canEdit}>↻ Đồng bộ cấu trúc mặc định</button><button type="button" className={styles.save} onClick={() => void save()} disabled={!canEdit}>Lưu thứ tự & thay đổi</button></div></header>
      <nav className={styles.preview} aria-label="Xem trước menu website">{roots.filter((item) => item.active && item.kind !== "cta").map((item) => <span key={item.id}>{item.label}{items.some((child) => child.parentId === item.id && child.active) && <small>⌄</small>}</span>)}{roots.find((item) => item.kind === "cta" && item.active) && <b>{roots.find((item) => item.kind === "cta")?.label}</b>}</nav>
    <section className={styles.manager}>
      <div className={styles.addRow}><input placeholder="Nhãn hiển thị (vd: Tuyển dụng)" value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter") addRoot(); }} /><input placeholder="Đường dẫn (vd: /tuyen-dung)" value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter") addRoot(); }} /><button type="button" onClick={addRoot} disabled={!canEdit}>＋ Thêm mục cấp 1</button></div>
      {roots.flatMap((root) => [renderRow(root), ...items.filter((item) => item.parentId === root.id).sort((a, b) => a.order - b.order).map((child) => renderRow(child, true))])}
    </section>
    {(saved || error) && <p className={error ? styles.error : styles.saved} role="status">{error || saved}</p>}
  </main></AdminShell>;
}

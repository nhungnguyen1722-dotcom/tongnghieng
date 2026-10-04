"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import type { CmsMedia } from "@/lib/cms-data";
import styles from "./media-picker.module.css";

type Props = {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
};

export default function MediaPicker({ value, onChange, multiple = false, label = "Ảnh" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CmsMedia[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const values = Array.isArray(value) ? value : value ? [value] : [];

  const openLibrary = async () => {
    setError("");
    try {
      const response = await fetch("/api/media", { cache: "no-store" });
      if (!response.ok) throw new Error("Không tải được thư viện media.");
      const result = await response.json() as { items: CmsMedia[] };
      setItems(result.items);
      setSelected(multiple ? values : []);
      setOpen(true);
    } catch {
      setError("Không tải được thư viện media. Hãy thử tải ảnh từ máy.");
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const result = await response.json() as { url?: string; error?: string };
        if (!response.ok || !result.url) throw new Error(result.error ?? "Tải ảnh không thành công.");
        uploaded.push(result.url);
      }
      onChange(multiple ? [...values, ...uploaded] : uploaded[0]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Tải ảnh không thành công.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const toggleSelected = (url: string) => {
    if (!multiple) {
      setSelected([url]);
      return;
    }
    setSelected((current) => current.includes(url) ? current.filter((item) => item !== url) : [...current, url]);
  };

  const applySelection = () => {
    if (selected.length) onChange(multiple ? selected : selected[0]);
    setOpen(false);
  };

  const filtered = items.filter((item) => item.title.toLocaleLowerCase("vi-VN").includes(query.toLocaleLowerCase("vi-VN")));

  return (
    <div className={styles.root}>
      {values.length > 0 && <div className={styles.previewList}>{values.map((url) => <div className={styles.preview} key={url}><img src={url} alt={label} /><button type="button" aria-label={"Xóa " + label} onClick={() => onChange(multiple ? values.filter((item) => item !== url) : "")}>×</button></div>)}</div>}
      <div className={styles.actions}>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? "Đang tải…" : "Chọn từ máy"}</button>
        <button type="button" onClick={openLibrary}>Chọn từ thư viện</button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple={multiple} hidden onChange={(event) => void uploadFiles(event.target.files)} />
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {open && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="media-picker-title">
          <header><div><span>MEDIA</span><h2 id="media-picker-title">Chọn ảnh từ thư viện</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Đóng thư viện">×</button></header>
          <label className={styles.search}>Tìm ảnh<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên ảnh" /></label>
          <div className={styles.library}>{filtered.map((item) => <button type="button" className={selected.includes(item.url) ? styles.selected : ""} key={item.id} onClick={() => toggleSelected(item.url)}><img src={item.url} alt="" /><span>{item.title}</span></button>)}</div>
          <footer><span>{selected.length} ảnh đã chọn</span><button type="button" onClick={() => setOpen(false)}>Hủy</button><button type="button" className={styles.apply} onClick={applySelection} disabled={!selected.length}>Dùng ảnh</button></footer>
        </section>
      </div>}
    </div>
  );
}

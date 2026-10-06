"use client";

import { useEffect, useRef, useState } from "react";
import AdminShell, { useAdminRole } from "@/app/admin/AdminShell";
import { CMS_SEEDS, type CmsDocument, type CmsLibraryImage, type CmsVideo } from "@/lib/cms-data";
import { loadCmsRecords, saveCmsRecords } from "@/lib/cms-client";
import styles from "./admin-library-manager.module.css";

const videosSeed = CMS_SEEDS.videos;
const imagesSeed = CMS_SEEDS.libraryImages;
const documentsSeed = CMS_SEEDS.documents;

export default function AdminLibraryManager() {
  const canEdit = Boolean(useAdminRole());
  const uploadRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<CmsLibraryImage[]>(imagesSeed);
  const [videos, setVideos] = useState<CmsVideo[]>(videosSeed);
  const [documents, setDocuments] = useState<CmsDocument[]>(documentsSeed);
  const [newVideo, setNewVideo] = useState({ title: "", url: "", description: "" });
  const [newDocument, setNewDocument] = useState({ title: "", type: "Slide" as CmsDocument["type"], url: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    Promise.all([loadCmsRecords("libraryImages"), loadCmsRecords("videos"), loadCmsRecords("documents")]).then(([imageRows, videoRows, docRows]) => {
      if (!live) return;
      setImages(imageRows); setVideos(videoRows); setDocuments(docRows);
    });
    return () => { live = false; };
  }, []);

  const saveCollection = async <T extends CmsDocument | CmsLibraryImage | CmsVideo>(collection: "documents" | "libraryImages" | "videos", rows: T[]) => {
    setError(""); setMessage("");
    const result = await saveCmsRecords(collection, rows as never);
    if (!result.persisted) { setError("Không lưu được dữ liệu vào PostgreSQL. Hãy đăng nhập bằng tài khoản Admin rồi thử lại."); return false; }
    setMessage("Đã đồng bộ dữ liệu vào PostgreSQL."); return true;
  };

  const updateImage = (id: string, patch: Partial<CmsLibraryImage>) => setImages((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  const uploadImage = async (file?: File) => {
    if (!file) return;
    const form = new FormData(); form.set("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const result = await response.json() as { url?: string; title?: string; error?: string };
    if (!response.ok || !result.url) { setError(result.error ?? "Không tải được ảnh."); return; }
    const next = [...images, { id: "library-image-" + crypto.randomUUID(), title: result.title ?? file.name, url: result.url, order: (images.length + 1) * 10, active: true }];
    setImages(next); await saveCollection("libraryImages", next);
  };
  const addVideo = async () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) return;
    const id = newVideo.url.match(/[?&]v=([^&]+)/)?.[1] ?? newVideo.url.split("/").at(-1) ?? "";
    const next = [...videos, { id: "library-video-" + crypto.randomUUID(), ...newVideo, thumbnail: "https://img.youtube.com/vi/" + id + "/hqdefault.jpg", order: (videos.length + 1) * 10, active: true }];
    setVideos(next); if (await saveCollection("videos", next)) setNewVideo({ title: "", url: "", description: "" });
  };
  const addDocument = async () => {
    if (!newDocument.title.trim() || !newDocument.url.trim()) return;
    const next = [...documents, { id: "doc-" + crypto.randomUUID(), ...newDocument, category: newDocument.type === "Link" ? "Tài liệu" : newDocument.type, status: "published" as const, order: documents.length + 1 }];
    setDocuments(next); if (await saveCollection("documents", next)) setNewDocument({ title: "", type: "Slide", url: "" });
  };
  const saveAll = async () => {
    const results = await Promise.all([saveCollection("libraryImages", images), saveCollection("videos", videos), saveCollection("documents", documents)]);
    if (results.every(Boolean)) setMessage("Đã đồng bộ ảnh, video và tài liệu vào PostgreSQL.");
  };

  return <AdminShell><main className={styles.content}>
    <header className={styles.heading}><div><h1>Quản lý Thư viện</h1><p>Nội dung hiển thị trong khu vực Thư viện của trang Nghieng Media (Tab Ảnh & Tab Video).</p></div><button className={styles.primary} type="button" onClick={() => uploadRef.current?.click()} disabled={!canEdit}>⇧ Tải ảnh lên</button><input ref={uploadRef} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void uploadImage(event.target.files?.[0])} /></header>
    <section className={styles.section}><h2>▧ Ảnh Thư viện ({images.length})</h2><div className={styles.imageGrid}>{images.map((item) => <article className={styles.imageCard} key={item.id}>{item.url ? <img src={item.url} alt={item.title} /> : <div className={styles.placeholder} aria-label="Chưa có ảnh"/>}<input value={item.title} disabled={!canEdit} onChange={(event) => updateImage(item.id, { title: event.target.value })} aria-label="Tiêu đề ảnh"/><input value={item.url} disabled={!canEdit} onChange={(event) => updateImage(item.id, { url: event.target.value })} aria-label="Đường dẫn ảnh" placeholder="URL ảnh"/><div className={styles.imageActions}><input type="number" value={item.order} disabled={!canEdit} onChange={(event) => updateImage(item.id, { order: Number(event.target.value) })} aria-label="Thứ tự hiển thị"/><label><input type="checkbox" checked={item.active} disabled={!canEdit} onChange={(event) => updateImage(item.id, { active: event.target.checked })}/> Hiển thị</label><button type="button" aria-label="Xóa ảnh" disabled={!canEdit} onClick={() => setImages((rows) => rows.filter((row) => row.id !== item.id))}>▤</button></div></article>)}</div><button className={styles.saveSection} type="button" disabled={!canEdit} onClick={() => void saveCollection("libraryImages", images)}>Lưu ảnh</button></section>
    <section className={styles.section}><h2>▷ Video YouTube ({videos.length})</h2><div className={styles.addVideo}><input placeholder="Tiêu đề video *" value={newVideo.title} disabled={!canEdit} onChange={(event) => setNewVideo({ ...newVideo, title: event.target.value })}/><input placeholder="URL YouTube *" value={newVideo.url} disabled={!canEdit} onChange={(event) => setNewVideo({ ...newVideo, url: event.target.value })}/><input placeholder="Mô tả ngắn" value={newVideo.description} disabled={!canEdit} onChange={(event) => setNewVideo({ ...newVideo, description: event.target.value })}/><button type="button" className={styles.primary} disabled={!canEdit} onClick={() => void addVideo()}>＋ Thêm Video</button></div><div className={styles.list}>{videos.slice().sort((a,b)=>a.order-b.order).map((item) => <article className={styles.videoRow} key={item.id}><img src={item.thumbnail} alt=""/><div className={styles.videoFields}><input value={item.title} disabled={!canEdit} onChange={(event) => setVideos((rows) => rows.map((row) => row.id === item.id ? { ...row, title: event.target.value } : row))}/><input value={item.url} disabled={!canEdit} onChange={(event) => setVideos((rows) => rows.map((row) => row.id === item.id ? { ...row, url: event.target.value } : row))}/><input value={item.description} disabled={!canEdit} onChange={(event) => setVideos((rows) => rows.map((row) => row.id === item.id ? { ...row, description: event.target.value } : row))}/><div className={styles.inlineActions}>Thứ tự <input type="number" value={item.order} disabled={!canEdit} onChange={(event) => setVideos((rows) => rows.map((row) => row.id === item.id ? { ...row, order: Number(event.target.value) } : row))}/><label><input type="checkbox" checked={item.active} disabled={!canEdit} onChange={(event) => setVideos((rows) => rows.map((row) => row.id === item.id ? { ...row, active: event.target.checked } : row))}/> Hiển thị</label><button type="button" disabled={!canEdit} onClick={() => setVideos((rows) => rows.filter((row) => row.id !== item.id))}>Xóa</button></div></div></article>)}</div><button type="button" className={styles.saveSection} disabled={!canEdit} onClick={() => void saveCollection("videos", videos)}>Lưu video</button></section>
    <section className={styles.section}><h2>▤ Tài liệu ({documents.length})</h2><div className={styles.addDocument}><input placeholder="Tên tài liệu *" value={newDocument.title} disabled={!canEdit} onChange={(event) => setNewDocument({ ...newDocument, title: event.target.value })}/><select value={newDocument.type} disabled={!canEdit} onChange={(event) => setNewDocument({ ...newDocument, type: event.target.value as CmsDocument["type"] })}><option>Slide</option><option>PPTX</option><option>PDF</option><option>Link</option></select><input placeholder="Link xem tài liệu" value={newDocument.url} disabled={!canEdit} onChange={(event) => setNewDocument({ ...newDocument, url: event.target.value })}/><button type="button" className={styles.primary} disabled={!canEdit} onClick={() => void addDocument()}>＋ Thêm Tài liệu</button></div><div className={styles.docs}>{documents.slice().sort((a,b)=>a.order-b.order).map((item) => <article key={item.id}><select aria-label="Thể loại" value={item.type} disabled={!canEdit} onChange={(event) => setDocuments((rows) => rows.map((row) => row.id === item.id ? { ...row, type: event.target.value as CmsDocument["type"] } : row))}><option>Slide</option><option>PPTX</option><option>PDF</option><option>Link</option></select><div><input aria-label="Tên tài liệu" value={item.title} disabled={!canEdit} onChange={(event) => setDocuments((rows) => rows.map((row) => row.id === item.id ? { ...row, title: event.target.value } : row))}/><input aria-label="URL tài liệu" value={item.url} disabled={!canEdit} onChange={(event) => setDocuments((rows) => rows.map((row) => row.id === item.id ? { ...row, url: event.target.value } : row))}/></div><a href={item.url} target="_blank" rel="noreferrer">Mở ↗</a><button type="button" disabled={!canEdit} onClick={() => setDocuments((rows) => rows.filter((row) => row.id !== item.id))}>Xóa</button></article>)}</div><button type="button" className={styles.saveSection} disabled={!canEdit} onClick={() => void saveCollection("documents", documents)}>Lưu tài liệu</button></section>
    <footer className={styles.footer}><span role="status" className={error ? styles.error : styles.message}>{error || message}</span><button type="button" className={styles.primary} disabled={!canEdit} onClick={() => void saveAll()}>Lưu toàn bộ thư viện</button></footer>
  </main></AdminShell>;
}

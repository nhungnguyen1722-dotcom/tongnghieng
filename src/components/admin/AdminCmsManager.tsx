"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import AdminShell, { useAdminRole } from "@/app/admin/AdminShell";
import MediaPicker from "./MediaPicker";
import { loadCmsRecords, saveCmsRecords } from "@/lib/cms-client";
import { CMS_SEEDS, normalizeNewsCategory, type CmsCollection, type CmsRecord } from "@/lib/cms-data";
import styles from "./admin-cms-manager.module.css";
import pagingStyles from "./admin-cms-pagination.module.css";
import richStyles from "./rich-text-editor.module.css";
import AdminMenuManager from "./AdminMenuManager";
import AdminLibraryManager from "./AdminLibraryManager";
import AdminMediaManager from "./AdminMediaManager";

export type AdminCmsSection = "tours" | "tour-categories" | "venues" | "venue-categories" | "news" | "projects" | "menu" | "library" | "users" | "media";
type FieldType = "text" | "number" | "select" | "textarea" | "lines" | "json" | "image" | "images" | "toggle";
type Field = { key: string; label: string; type?: FieldType; options?: string[]; help?: string };

const categoryNames = CMS_SEEDS.tourCategories.map((item) => item.title);
const venueNames = CMS_SEEDS.venueCategories.map((item) => item.title);
const serviceKinds = ["restaurant", "hotel", "resort", "retreat", "bungalow"];
const mediaTypes = ["PPTX", "Slide", "PDF", "Link"];
const projectStates = ["Ý tưởng", "Nghiên cứu", "Tìm đối tác", "Triển khai", "Vận hành", "Hoàn thành"];

const configurations: Record<AdminCmsSection, { collection: CmsCollection; title: string; description: string; singular: string; fields: Field[] }> = {
  tours: {
    collection: "tours", title: "Quản lý Tour", description: "Nội dung tour, lịch trình, media, giá và khách sạn liên kết.", singular: "tour",
    fields: [
      { key: "title", label: "Tên tour" }, { key: "slug", label: "Slug" }, { key: "category", label: "Hạng mục", type: "select", options: categoryNames },
      { key: "location", label: "Địa điểm / lộ trình" }, { key: "duration", label: "Thời gian" }, { key: "guestRange", label: "Số khách" },
      { key: "summary", label: "Mô tả ngắn", type: "textarea" }, { key: "description", label: "Mô tả đầy đủ", type: "textarea" },
      { key: "priceFrom", label: "Giá từ (VNĐ)", type: "number" }, { key: "rating", label: "Đánh giá", type: "number" }, { key: "reviewCount", label: "Số lượt đánh giá", type: "number" },
      { key: "departureDate", label: "Ngày khởi hành", type: "text" }, { key: "hotelOptions", label: "Khách sạn liên kết (mỗi dòng một lựa chọn)", type: "lines" },
      { key: "highlights", label: "Điểm nổi bật (mỗi dòng một mục)", type: "lines" }, { key: "itinerary", label: "Lịch trình JSON", type: "json", help: "Mỗi mục gồm day, title và activities." },
      { key: "image", label: "Ảnh đại diện", type: "image" }, { key: "gallery", label: "Thư viện ảnh", type: "images" },
      { key: "seoTitle", label: "SEO title" }, { key: "seoDescription", label: "SEO description", type: "textarea" },
      { key: "state", label: "Trạng thái xuất bản", type: "select", options: ["published", "draft"] }, { key: "order", label: "Thứ tự hiển thị", type: "number" },
    ],
  },
  "tour-categories": {
    collection: "tourCategories", title: "Danh mục Tour", description: "Bốn hạng mục tour được liên kết từ Nghieng Travel.", singular: "danh mục",
    fields: [{ key: "title", label: "Tên danh mục" }, { key: "slug", label: "Slug" }, { key: "description", label: "Mô tả", type: "textarea" }, { key: "image", label: "Ảnh danh mục", type: "image" }, { key: "active", label: "Đang hiển thị", type: "toggle" }, { key: "order", label: "Thứ tự", type: "number" }],
  },
  venues: {
    collection: "venues", title: "Nhà hàng – Khách sạn", description: "Quản lý nhà hàng, khách sạn, resort, khu nghỉ dưỡng và bungalow.", singular: "địa điểm",
    fields: [
      { key: "title", label: "Tên địa điểm" }, { key: "slug", label: "Slug" }, { key: "kind", label: "Loại hình", type: "select", options: serviceKinds },
      { key: "category", label: "Danh mục", type: "select", options: venueNames }, { key: "location", label: "Địa điểm" }, { key: "address", label: "Địa chỉ" },
      { key: "summary", label: "Mô tả ngắn", type: "textarea" }, { key: "description", label: "Mô tả đầy đủ", type: "textarea" }, { key: "quote", label: "Trích dẫn", type: "textarea" },
      { key: "rating", label: "Đánh giá", type: "number" }, { key: "reviewCount", label: "Số lượt đánh giá", type: "number" }, { key: "priceFrom", label: "Giá từ (VNĐ)", type: "number" },
      { key: "checkIn", label: "Giờ nhận phòng" }, { key: "checkOut", label: "Giờ trả phòng" }, { key: "amenities", label: "Tiện nghi (mỗi dòng một mục)", type: "lines" },
      { key: "rooms", label: "Loại phòng JSON", type: "json", help: "Mỗi loại phòng gồm name, price, capacity, image và amenities." },
      { key: "image", label: "Ảnh đại diện", type: "image" }, { key: "gallery", label: "Gallery", type: "images" },
      { key: "seoTitle", label: "SEO title" }, { key: "seoDescription", label: "SEO description", type: "textarea" },
      { key: "state", label: "Trạng thái", type: "select", options: ["published", "draft"] }, { key: "order", label: "Thứ tự hiển thị", type: "number" },
    ],
  },
  "venue-categories": {
    collection: "venueCategories", title: "Danh mục Nhà hàng – Khách sạn", description: "Quản lý nhóm Nhà hàng, Khách sạn, Resort, Khu nghỉ dưỡng và Bungalow.", singular: "danh mục",
    fields: [{ key: "title", label: "Tên danh mục" }, { key: "slug", label: "Slug" }, { key: "kind", label: "Loại dữ liệu", type: "select", options: serviceKinds }, { key: "description", label: "Mô tả", type: "textarea" }, { key: "active", label: "Đang hiển thị", type: "toggle" }, { key: "order", label: "Thứ tự", type: "number" }],
  },
  news: {
    collection: "news", title: "Quản lý Tin tức", description: "Biên tập, phân loại và xuất bản tin tức, sự kiện.", singular: "bài viết",
    fields: [{ key: "title", label: "Tiêu đề" }, { key: "slug", label: "Slug" }, { key: "category", label: "Phân loại" }, { key: "summary", label: "Mô tả ngắn", type: "textarea" }, { key: "body", label: "Nội dung", type: "textarea" }, { key: "date", label: "Ngày đăng" }, { key: "image", label: "Ảnh đại diện", type: "image" }, { key: "status", label: "Trạng thái", type: "select", options: ["published", "draft"] }, { key: "active", label: "Đang hiển thị", type: "toggle" }, { key: "isDemo", label: "Dữ liệu demo", type: "toggle" }, { key: "order", label: "Thứ tự", type: "number" }],
  },
  projects: {
    collection: "projects", title: "Quản lý Dự án", description: "Nội dung cơ hội hợp tác và trạng thái dự án.", singular: "dự án",
    fields: [{ key: "title", label: "Tên dự án" }, { key: "slug", label: "Slug" }, { key: "category", label: "Lĩnh vực" }, { key: "summary", label: "Mô tả ngắn", type: "textarea" }, { key: "body", label: "Nội dung chi tiết", type: "textarea" }, { key: "status", label: "Trạng thái dự án", type: "select", options: projectStates }, { key: "date", label: "Ngày cập nhật" }, { key: "image", label: "Ảnh đại diện", type: "image" }, { key: "active", label: "Đang hiển thị", type: "toggle" }, { key: "isDemo", label: "Dữ liệu demo", type: "toggle" }, { key: "order", label: "Thứ tự", type: "number" }],
  },
  menu: {
    collection: "menu", title: "Quản lý Menu Header", description: "Sắp xếp mục menu, liên kết cấp cha/con và trạng thái hiển thị.", singular: "mục menu",
    fields: [{ key: "label", label: "Tên hiển thị" }, { key: "url", label: "URL / Slug" }, { key: "parentId", label: "Mục cha", type: "select" }, { key: "target", label: "Mở liên kết", type: "select", options: ["_self", "_blank"] }, { key: "kind", label: "Loại mục", type: "select", options: ["link", "cta"] }, { key: "active", label: "Đang hiển thị", type: "toggle" }, { key: "order", label: "Thứ tự", type: "number" }],
  },
  library: {
    collection: "documents", title: "Quản lý Thư viện", description: "Tổ chức tài liệu, slide, PDF và liên kết tham chiếu.", singular: "tài liệu",
    fields: [{ key: "title", label: "Tên tài liệu" }, { key: "type", label: "Thể loại", type: "select", options: mediaTypes }, { key: "category", label: "Danh mục" }, { key: "url", label: "Liên kết tài liệu" }, { key: "status", label: "Trạng thái", type: "select", options: ["published", "draft"] }, { key: "order", label: "Thứ tự", type: "number" }],
  },
  users: {
    collection: "users", title: "Tài khoản Admin", description: "Danh sách người dùng quản trị và phân quyền.", singular: "tài khoản",
    fields: [{ key: "name", label: "Tên người dùng" }, { key: "email", label: "Email" }, { key: "role", label: "Vai trò", type: "select", options: ["Admin", "User"] }, { key: "status", label: "Trạng thái", type: "select", options: ["Active", "Inactive"] }],
  },
  media: {
    collection: "media", title: "Quản lý Media", description: "Thư viện logo và hình ảnh sử dụng trong nội dung.", singular: "tệp media",
    fields: [{ key: "title", label: "Tên media" }, { key: "type", label: "Loại media", type: "select", options: ["image", "logo"] }, { key: "url", label: "Ảnh / đường dẫn", type: "image" }, { key: "active", label: "Logo đang hiển thị", type: "toggle" }],
  },
};

const writingPrompts = [
  { title: "Giới thiệu tập đoàn", prompt: "Viết bài giới thiệu Nghieng Complex với giọng văn trang trọng, uy tín. Nêu định vị Tổ hợp Liên kết Đa ngành; triết lý Con người – Công nghệ – Cộng đồng; thông điệp Kết nối – Cộng hưởng – Kiến tạo Thịnh vượng. Độ dài 400–600 từ." },
  { title: "Thông điệp Chủ tịch", prompt: "Viết bài dựa trên thông điệp của Chủ tịch HĐQT – CEO Nguyễn Thị Hương Thảo. Giọng văn ấm áp, truyền cảm hứng, nhấn mạnh niềm tin, sẻ chia giá trị và phát triển bền vững." },
  { title: "Hệ sinh thái 06 lĩnh vực", prompt: "Viết bài giới thiệu Hệ sinh thái Nghieng Complex gồm 06 lĩnh vực. Với mỗi lĩnh vực nêu ngắn gọn định vị và phạm vi hoạt động." },
  { title: "Mục tiêu 2026–2030", prompt: "Viết bài về Tầm nhìn và Mục tiêu 2026–2030 của Nghieng Complex. Không đưa số liệu tài chính chưa được phê duyệt." },
  { title: "Cộng đồng", prompt: "Viết bài về hoạt động Cộng đồng và Thiện nguyện. Nhấn mạnh khả năng sẻ chia, nâng đỡ cộng đồng và phát triển bền vững." },
  { title: "Chuyên sâu lĩnh vực", prompt: "Viết bài chuyên sâu về lĩnh vực [TÊN LĨNH VỰC], lấy thông tin từ tài liệu giới thiệu Nghieng Complex và giữ đúng tên thương hiệu." },
];

function freshRecord(section: AdminCmsSection, order: number): Record<string, unknown> {
  const id = section + "-" + Date.now();
  const base = { id, order };
  switch (section) {
    case "tours": return { ...base, slug: "", title: "", category: "van-hoa-vung-mien", location: "", duration: "", guestRange: "", summary: "", description: "", priceFrom: 0, rating: 0, reviewCount: 0, state: "draft", image: "", gallery: [], highlights: [], itinerary: [], hotelOptions: [], departureDate: "", seoTitle: "", seoDescription: "" };
    case "tour-categories": return { ...base, slug: "", title: "", description: "", image: "", active: true };
    case "venues": return { ...base, slug: "", title: "", kind: "restaurant", category: "nha-hang", location: "", address: "", summary: "", description: "", quote: "", rating: 0, reviewCount: 0, priceFrom: 0, state: "draft", image: "", gallery: [], amenities: [], rooms: [], checkIn: "", checkOut: "", seoTitle: "", seoDescription: "" };
    case "venue-categories": return { ...base, slug: "", title: "", kind: "restaurant", description: "", active: true };
    case "news": return { ...base, slug: "", title: "", summary: "", body: "", category: "Tin tức", status: "draft", active: true, date: new Date().toISOString().slice(0, 10), image: "", relatedIds: [], isDemo: false };
    case "projects": return { ...base, slug: "", title: "", summary: "", body: "", category: "", status: "Ý tưởng", active: true, date: new Date().toISOString().slice(0, 10), image: "", relatedIds: [], isDemo: true };
    case "menu": return { ...base, label: "", url: "/", parentId: "", target: "_self", active: true, kind: "link" };
    case "library": return { ...base, title: "", type: "PDF", category: "Danh mục tin tức", url: "", status: "published" };
    case "users": return { ...base, name: "", email: "", role: "User", status: "Active", passwordChangeRequired: false };
    case "media": return { ...base, title: "", url: "", type: "image", source: "library", active: false };
  }
}

function fieldText(value: unknown, type?: FieldType) {
  if (type === "lines" && Array.isArray(value)) return value.join("\n");
  if (type === "json") return JSON.stringify(value ?? [], null, 2);
  if (type === "toggle") return Boolean(value);
  return value === undefined || value === null ? "" : String(value);
}

function normalizeRecord(section: AdminCmsSection, source: Record<string, unknown>) {
  const result = { ...source };
  for (const field of configurations[section].fields) {
    const value = result[field.key];
    if (field.type === "lines") result[field.key] = String(value ?? "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    if (field.type === "json") {
      try { result[field.key] = JSON.parse(String(value || "[]")); } catch { return { error: "Kiểm tra lại JSON tại mục “" + field.label + "”." }; }
    }
    if (field.type === "number") result[field.key] = Number(value || 0);
    if (field.key === "parentId" && value === "") result[field.key] = null;
  }
  return { record: result };
}

export default function AdminCmsManager({ section }: { section: AdminCmsSection }) {
  if (section === "menu") return <AdminMenuManager />;
  if (section === "library") return <AdminLibraryManager />;
  if (section === "media") return <AdminMediaManager />;
  return <AdminShell><AdminCmsManagerContent section={section} /></AdminShell>;
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(value);
  useEffect(() => { setHtml(value); }, [value]);
  const initialHtml = /<\/?[a-z][\s\S]*?>/i.test(html) ? html : html.split(/\n\s*\n/).map((line) => "<p>" + line.replace(/\n/g, "<br>") + "</p>").join("");
  const format = (command: string, block?: string) => {
    editor.current?.focus();
    document.execCommand(command, false, block);
    if (editor.current) setHtml(editor.current.innerHTML);
  };
  return <div className={richStyles.editor}>
    <div className={richStyles.toolbar} aria-label="Định dạng nội dung">
      <select aria-label="Kiểu đoạn" defaultValue="p" onChange={(event) => format("formatBlock", event.target.value)}><option value="p">Thường</option><option value="h2">Tiêu đề 2</option><option value="h3">Tiêu đề 3</option></select>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("bold")} aria-label="In đậm"><strong>B</strong></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("italic")} aria-label="In nghiêng"><em>I</em></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("underline")} aria-label="Gạch chân"><u>U</u></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertUnorderedList")} aria-label="Danh sách">• List</button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertOrderedList")} aria-label="Danh sách số">1. List</button>
    </div>
    <div ref={editor} className={richStyles.body} contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: initialHtml }} onInput={(event) => setHtml(event.currentTarget.innerHTML)} onBlur={(event) => onChange(event.currentTarget.innerHTML)} />
  </div>;
}

function AdminCmsManagerContent({ section }: { section: AdminCmsSection }) {
  const role = useAdminRole();
  const canEdit = role === "Admin" || (role === "User" && section === "news");
  const config = configurations[section];
  const collection = config.collection;
  const [items, setItems] = useState<Record<string, unknown>[]>(CMS_SEEDS[collection] as unknown as Record<string, unknown>[]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [saved, setSaved] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(writingPrompts[0].title);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let active = true;
    loadCmsRecords(collection).then((records) => { if (active) setItems(records as unknown as Record<string, unknown>[]); });
    return () => { active = false; };
  }, [collection]);

  const filteredItems = useMemo(() => items
    .filter((item) => JSON.stringify(item).toLocaleLowerCase("vi-VN").includes(query.toLocaleLowerCase("vi-VN")))
    .filter((item) => !filter || String(section === "venues" ? item.kind : item.category ?? item.kind ?? item.type ?? item.role ?? "") === filter)
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)), [filter, items, query, section]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const shownItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const persist = async (next: Record<string, unknown>[]) => {
    const previous = items;
    setItems(next);
    setPage(1);
    const result = await saveCmsRecords(collection, next as unknown as CmsRecord[]);
    if ("denied" in result && result.denied) {
      setItems(previous);
      setFormError("Phiên đăng nhập hoặc quyền Admin không hợp lệ; dữ liệu chưa được lưu.");
      return false;
    }
    setSaved("Đã lưu vào cơ sở dữ liệu.");
    if (!result.persisted) {
      setItems(previous);
      setSaved("");
      setFormError("Không thể lưu vào cơ sở dữ liệu; thay đổi chưa được lưu.");
      return false;
    }
    window.dispatchEvent(new Event("nghieng:content-updated"));
    return true;
  };

  const save = async () => {
    if (!editing) return;
    const normalized = normalizeRecord(section, editing);
    if ("error" in normalized) {
      setFormError(normalized.error ?? "Kiểm tra lại dữ liệu JSON.");
      return;
    }
    const record = normalized.record;
    const title = String(record.title ?? record.label ?? record.name ?? record.email ?? "").trim();
    if (!title) {
      setFormError("Nhập tên hoặc tiêu đề trước khi lưu.");
      return;
    }
    let next = items.some((item) => item.id === record.id)
      ? items.map((item) => item.id === record.id ? record : item)
      : [...items, record];
    if (section === "media" && record.type === "logo" && record.active === true) {
      next = next.map((item) => item.type === "logo" ? { ...item, active: item.id === record.id } : item);
    }
    if (await persist(next)) {
      setEditing(null);
      setFormError("");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Xóa nội dung này?")) return;
    await persist(items.filter((item) => item.id !== id));
  };

  const moveRecord = async (targetId: string) => {
    if (!dragging || dragging === targetId) return;
    const source = items.find((item) => item.id === dragging);
    const target = items.find((item) => item.id === targetId);
    if (!source || !target) return;
    let next = [...items];
    if (section === "menu" && source.kind !== "cta" && target.kind === "cta") return;
    if (section === "menu" && source.kind !== "cta" && source.parentId !== target.parentId) {
      const destination = target.parentId ?? target.id;
      if (destination === source.id) return;
      const order = Math.max(0, ...next.filter((item) => item.parentId === destination).map((item) => Number(item.order ?? 0))) + 1;
      next = next.map((item) => item.id === source.id ? { ...item, parentId: destination, order } : item);
    } else if (section === "menu") {
      const targetSibling = source.kind === "cta" && target.parentId !== null ? target.parentId : target.id;
      const siblings = next.filter((item) => item.parentId === source.parentId);
      const from = siblings.findIndex((item) => item.id === source.id);
      const to = siblings.findIndex((item) => item.id === targetSibling);
      if (from < 0 || to < 0) return;
      const [moving] = siblings.splice(from, 1);
      siblings.splice(to, 0, moving);
      next = next.map((item) => {
        const index = siblings.findIndex((sibling) => sibling.id === item.id);
        return index < 0 ? item : { ...item, order: index + 1 };
      });
    } else {
      const sourceIndex = next.findIndex((item) => item.id === dragging);
      const targetIndex = next.findIndex((item) => item.id === targetId);
      const [moving] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moving);
      next = next.map((item, index) => ({ ...item, order: index + 1 }));
    }
    setDragging(null);
    await persist(next);
  };

  const addPrompt = () => {
    const selected = writingPrompts.find((item) => item.title === prompt);
    if (selected) setEditing((current) => current ? { ...current, body: (String(current.body ?? "") + "\n\n" + selected.prompt).trim() } : current);
  };

  const filterOptions = section === "tours" ? CMS_SEEDS.tourCategories.map((item) => ({ value: item.slug, label: item.title }))
    : section === "venues" ? CMS_SEEDS.venueCategories.map((item) => ({ value: item.kind, label: item.title }))
    : section === "news" ? [...new Set(items.map((item) => normalizeNewsCategory(String(item.category ?? ""))))].map((value) => ({ value, label: value }))
    : section === "library" ? mediaTypes.map((value) => ({ value, label: value }))
    : section === "users" ? ["Admin", "User"].map((value) => ({ value, label: value }))
    : [];

  const statusText = (item: Record<string, unknown>) => String(item.state ?? item.status ?? (item.active === false ? "Inactive" : "Active"));
  const displayTitle = (item: Record<string, unknown>) => String(item.title ?? item.label ?? item.name ?? item.email ?? item.id);
  const editorFields = config.fields;

  return (
      <div className={styles.content}>
        <header className={styles.heading}>
          <div><span className={styles.kicker}>CMS / NGHIENG COMPLEX</span><h1>{config.title}</h1><p>{config.description}</p></div>
          {canEdit && <button type="button" className={styles.primary} onClick={() => { setEditing(freshRecord(section, items.length + 1)); setFormError(""); }}>＋ Thêm {config.singular}</button>}
        </header>
        {section === "users" && <p className={styles.accountNote}>Tất cả tài khoản sử dụng mật khẩu mặc định 123456.</p>}
        <div className={styles.toolbar}>
          <label>Tìm kiếm<input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tên, địa điểm, slug…" /></label>
          {filterOptions.length > 0 && <label>Lọc danh mục<select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }}><option value="">Tất cả</option>{filterOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>}
          <span>{filteredItems.length} mục</span>
          <span role="status">{saved || "Dữ liệu sẵn sàng"}</span>
        </div>
        {section === "news" && <div className={styles.promptBar}><label>Mẫu prompt<select value={prompt} onChange={(event) => setPrompt(event.target.value)}>{writingPrompts.map((item) => <option key={item.title}>{item.title}</option>)}</select></label><span>Nội dung AI cần được biên tập và duyệt trước khi xuất bản.</span></div>}
        <div className={styles.list} role="table" aria-label={config.title}>
          {shownItems.map((item) => <article className={styles.row} key={String(item.id)} draggable={canEdit} onDragStart={() => canEdit && setDragging(String(item.id))} onDragEnd={() => setDragging(null)} onDragOver={(event) => canEdit && event.preventDefault()} onDrop={() => canEdit && void moveRecord(String(item.id))}>
            <span className={styles.dragHandle} aria-label="Kéo để sắp xếp">⠿</span>
            <span className={styles.order}>{String(item.order ?? "–").padStart(2, "0")}</span>
            {typeof item.image === "string" && item.image && <img className={styles.thumbnail} src={item.image} alt="" />}
            <div className={styles.rowInfo}><strong>{displayTitle(item)}</strong><small>{String(item.slug ?? item.url ?? item.location ?? item.email ?? item.category ?? "")}</small></div>
            <span className={styles.status}>{statusText(item)}</span>
            {canEdit && <button type="button" className={styles.iconButton} onClick={() => { setEditing({ ...item }); setFormError(""); }} aria-label={"Sửa " + displayTitle(item)}>Sửa</button>}
            {canEdit && <button type="button" className={styles.deleteButton} onClick={() => void remove(String(item.id))} aria-label={"Xóa " + displayTitle(item)}>Xóa</button>}
          </article>)}
          {filteredItems.length === 0 && <p className={styles.empty}>Không có nội dung phù hợp.</p>}
        </div>
        {pageCount > 1 && <nav className={pagingStyles.pagination} aria-label="Phân trang nội dung"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button><span>{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)}>›</button></nav>}
        {editing && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <section className={styles.editor} role="dialog" aria-modal="true" aria-labelledby="cms-editor-title">
            <header className={styles.editorHeader}><div><span className={styles.kicker}>CHỈNH SỬA NỘI DUNG</span><h2 id="cms-editor-title">{items.some((item) => item.id === editing.id) ? "Sửa " + config.singular : "Thêm " + config.singular}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Đóng">×</button></header>
            {section === "news" && <div className={styles.promptEditor}><label>Prompt<select value={prompt} onChange={(event) => setPrompt(event.target.value)}>{writingPrompts.map((item) => <option key={item.title}>{item.title}</option>)}</select></label><button type="button" onClick={addPrompt}>Chèn mẫu prompt</button></div>}
            <div className={styles.fields}>
              {editorFields.map((field) => <label className={field.type === "textarea" || field.type === "json" || field.type === "lines" || field.type === "images" ? styles.wideField : ""} key={field.key}>
                <span>{field.label}</span>
                {field.type === "toggle" ? <input type="checkbox" checked={Boolean(editing[field.key])} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.checked })} />
                  : field.type === "image" || field.type === "images" ? <MediaPicker value={editing[field.key] as string | string[] ?? (field.type === "images" ? [] : "")} onChange={(value) => setEditing({ ...editing, [field.key]: value })} multiple={field.type === "images"} label={field.label}
                  />
                  : field.type === "select" ? <select value={String(editing[field.key] ?? "")} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })}>
                    {field.key === "parentId" && <option value="">Không có mục cha</option>}
                    {(field.key === "parentId" ? items.filter((record) => record.id !== editing.id && record.parentId === null).map((record) => ({ value: String(record.id), label: displayTitle(record) })) : (field.options ?? []).map((value) => ({ value, label: value }))).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                  </select>
                  : section === "news" && field.key === "body" ? <RichTextEditor value={String(editing.body ?? "")} onChange={(body) => setEditing((current) => current ? { ...current, body } : current)} />
                  : field.type === "textarea" || field.type === "lines" || field.type === "json" ? <textarea rows={field.type === "json" ? 7 : field.type === "textarea" ? 4 : 3} value={String(fieldText(editing[field.key], field.type))} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setEditing({ ...editing, [field.key]: event.target.value })} />
                  : <input type={field.type === "number" ? "number" : "text"} value={String(editing[field.key] ?? "")} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })} />}
                {field.help && <small>{field.help}</small>}
              </label>)}
            </div>
            {formError && <p className={styles.error} role="alert">{formError}</p>}
            <footer className={styles.editorFooter}><span>{section === "users" ? "Admin được quản trị; User chỉ có quyền xem." : ""}</span><button type="button" onClick={() => setEditing(null)}>Hủy</button><button className={styles.primary} type="button" onClick={() => void save()}>Lưu thay đổi</button></footer>
          </section>
        </div>}
        <p className={styles.back}><Link href="/admin">← Về Dashboard</Link></p>
      </div>
  );
}

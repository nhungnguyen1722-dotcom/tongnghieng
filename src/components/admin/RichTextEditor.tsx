"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import richStyles from "./rich-text-editor.module.css";

function toEditorHtml(value: string) {
  return /<\/?[a-z][\s\S]*?>/i.test(value)
    ? value
    : value.split(/\n\s*\n/).map((line) => "<p>" + line.replace(/\n/g, "<br>") + "</p>").join("");
}

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editor.current && document.activeElement !== editor.current) editor.current.innerHTML = toEditorHtml(value);
  }, [value]);

  const sync = () => {
    if (!editor.current) return;
    const next = editor.current.innerHTML;
    setHtml(next);
    onChange(next);
  };

  const format = (command: string, argument?: string) => {
    editor.current?.focus();
    document.execCommand(command, false, argument);
    if (editor.current) {
      setHtml(editor.current.innerHTML);
      onChange(editor.current.innerHTML);
    }
  };

  const addLink = () => {
    const value = window.prompt("Nhập đường dẫn liên kết");
    if (!value) return;
    if (!/^(https?:\/\/|\/)/i.test(value) || value.startsWith("//")) {
      setError("Liên kết cần bắt đầu bằng https:// hoặc /.");
      return;
    }
    setError("");
    format("createLink", value);
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Không tải được ảnh lên.");
      editor.current?.focus();
      document.execCommand("insertImage", false, result.url);
      sync();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được ảnh lên.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeSelectedImage = () => {
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const image = node instanceof HTMLImageElement ? node : node?.parentElement?.closest("img");
    if (!image) return;
    image.remove();
    sync();
  };

  return <div className={richStyles.editor}>
    <div className={richStyles.toolbar} aria-label="Định dạng nội dung">
      <select aria-label="Kiểu đoạn" defaultValue="p" onChange={(event) => format("formatBlock", event.target.value)}><option value="p">Thường</option><option value="h2">Tiêu đề 2</option><option value="h3">Tiêu đề 3</option></select>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("bold")} aria-label="In đậm"><strong>B</strong></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("italic")} aria-label="In nghiêng"><em>I</em></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("underline")} aria-label="Gạch chân"><u>U</u></button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertUnorderedList")} aria-label="Danh sách">• List</button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertOrderedList")} aria-label="Danh sách số">1. List</button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("justifyLeft")} aria-label="Căn trái">⇤</button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("justifyCenter")} aria-label="Căn giữa">↔</button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("justifyRight")} aria-label="Căn phải">⇥</button>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={addLink} aria-label="Chèn liên kết">Liên kết</button>
      <label className={richStyles.uploadButton}>Ảnh<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void uploadImage(event)} disabled={uploading} /></label>
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={removeSelectedImage} aria-label="Xóa ảnh đang chọn">Xóa ảnh</button>
    </div>
    {error && <p className={richStyles.error} role="alert">{error}</p>}
    <div ref={editor} className={richStyles.body} contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: toEditorHtml(html) }} onInput={(event) => setHtml(event.currentTarget.innerHTML)} onBlur={(event) => onChange(event.currentTarget.innerHTML)} />
  </div>;
}

import Link from "next/link";
import AdminShell from "../AdminShell";
import { ADMIN_PAGES } from "../page-data";
import styles from "./page.module.css";

function ExternalIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
}

export default function AdminPages() {
  return (
    <AdminShell>
      <div className={styles.content}>
        <header className={styles.heading}><h1>Quản lý các Trang</h1><p>Khu vực quản trị trung tâm, chọn một trang để quản lý thông tin, slider và Landing Page / Sections trong cùng một nơi.</p></header>
        <div className={styles.grid}>{ADMIN_PAGES.map((page) => <article className={styles.pageRow} key={page.slug}><span className={styles.number}>{page.number}</span><div className={styles.pageInfo}><strong>{page.name}</strong><small>{page.path}</small></div><Link className={styles.open} href={page.path} target="_blank" rel="noreferrer"><ExternalIcon /> Mở trang</Link><Link className={styles.details} href={`/admin/pages/${page.slug}`}>Chi tiết <span aria-hidden="true">›</span></Link></article>)}</div>
      </div>
    </AdminShell>
  );
}

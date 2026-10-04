import type { ReactNode } from "react";
import styles from "./layout.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className={styles.fonts}>{children}</div>;
}

"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./admin-login.module.css";

type User = { id: string; name: string; email: string; role: string; passwordChangeRequired: boolean };

export default function AdminAccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" }).then((response) => response.json()).then((result) => {
      if (result.user) {
        setUser(result.user);
        if (!result.user.passwordChangeRequired) router.replace(searchParams.get("next") || "/admin");
      }
      else setUser(null);
    }).catch(() => setUser(null));
  }, [router, searchParams]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(user ? "/api/auth/password" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user ? { currentPassword: password, newPassword } : { email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Không thể xác thực tài khoản.");
      if (user) {
        setUser(result.user);
        router.replace(searchParams.get("next") || "/admin");
      } else {
        setUser(result.user);
        if (!result.user.passwordChangeRequired) router.replace(searchParams.get("next") || "/admin");
      }
      setPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể xác thực tài khoản.");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirm) { setError("Mật khẩu xác nhận chưa khớp."); return; }
    await submit(event);
  };

  return <main className={styles.page}>
    <form className={styles.form} onSubmit={user ? changePassword : submit}>
      <Link className={styles.brand} href="/" aria-label="Nghieng Complex"><img src="https://base44.app/api/apps/6a867a0f31b1d902ab55332d/files/mp/public/6a867a0f31b1d902ab55332d/7d454ef94_nghieng_complex_logo_dark_transparent.png" alt="Nghieng Complex" /></Link>
      <span className={styles.kicker}>NGHIENG COMPLEX / ADMIN</span>
      <h1>{user?.passwordChangeRequired ? "Đổi mật khẩu khởi tạo" : user ? "Đổi mật khẩu" : "Đăng nhập"}</h1>
      {user && <p>{user.email} · {user.role}</p>}
      {!user && <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>}
      <label>{user ? "Mật khẩu hiện tại" : "Mật khẩu"}<input type="password" autoComplete={user ? "current-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {user && <>
        <label>Mật khẩu mới<input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
        <label>Nhập lại mật khẩu mới<input type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} required /></label>
      </>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button disabled={busy} type="submit">{busy ? "Đang xử lý…" : user ? "Cập nhật mật khẩu" : "Đăng nhập"}</button>
    </form>
  </main>;
}

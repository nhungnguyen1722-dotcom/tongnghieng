import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nghieng Complex | Tổ hợp liên kết đa ngành",
    template: "%s | Nghieng Complex",
  },
  description: "Nghieng Complex kết nối con người, doanh nghiệp, công nghệ và cộng đồng để cùng phát triển bền vững.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("nghieng-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`,
          }}
        />
      </head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}

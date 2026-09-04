import "./globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "議事録要約" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

// ルートレイアウト。App Router では必須で、html と body タグを含む必要がある。
import "./globals.css";

export const metadata = {
  title: "ToDo リスト",
  description: "Phase 1 で作る ToDo アプリ（Next.js 版）",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

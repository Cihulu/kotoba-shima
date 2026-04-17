import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { UserProvider } from "./context/UserContext";

export const metadata: Metadata = {
  title: "ことば島 | 日语学习",
  description: "像素风日语学习游戏 — 五十音、单词、解谜",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <Navbar />
          <main className="flex-1 pt-14">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}

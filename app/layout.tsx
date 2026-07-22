import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAP ATLAS — карта интернет-рэпа",
  description: "Карта жанров, сцен и продюсерских тегов интернет-рэпа: от cloud и plugg до digicore, HexD и rage.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

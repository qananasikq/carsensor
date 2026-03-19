import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CarSensor — Каталог авто из Японии",
  description: "Поиск и просмотр автомобилей с японских аукционов"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}

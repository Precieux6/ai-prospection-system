import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "IA Prospection - Dashboard",
  description: "Validation quotidienne des candidatures et prospections",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <Link href="/" className="text-xl font-bold text-blue-600">
             IA Prospection
          </Link>
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-500">Cycle 24h • Quotas: 10/10</div>
            <div className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-blue-600">
                👤 Mon Profil
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
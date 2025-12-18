import type { Metadata } from "next";
import Link from 'next/link'
import "./globals.css";

export const metadata: Metadata = {
  title: "Solargraph",
  description: "Visualise Solar Data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ul className="navmenu">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/samples">Samples</Link></li>
          <li><Link href="/daily">Daily</Link></li>
        </ul>
        <div className="content">{children}</div>
      </body>
    </html>
  );
}

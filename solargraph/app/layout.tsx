import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solargraph",
  description: "Visualise Solar Data",
};

import NavMenu from './components/NavMenu';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavMenu />
        <div className="content">{children}</div>
      </body>
    </html>
  );
}

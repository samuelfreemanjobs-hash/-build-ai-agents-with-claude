import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logistics Marketing Factory | Build Complete Marketing Systems",
  description:
    "Generate complete marketing systems for logistics businesses — brand identity, websites, campaigns, SEO, email sequences, and sales enablement in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}

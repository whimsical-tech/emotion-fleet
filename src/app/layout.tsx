import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Charging Aggregator",
  description: "Vehicle Charging Session Aggregator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

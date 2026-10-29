import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Simple personal expense tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body className="min-h-screen antialiased">
        <Nav />
        <main className="mx-auto w-full max-w-md px-4 pb-16 pt-5">{children}</main>
      </body>
    </html>
  );
}

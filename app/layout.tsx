import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import RegisterSW from "@/components/RegisterSW";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Simple personal expense and income tracker",
  appleWebApp: { capable: true, title: "Expenses", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <main className="mx-auto w-full max-w-md px-4 pb-36 pt-6">{children}</main>
          <Nav />
          <RegisterSW />
        </ToastProvider>
      </body>
    </html>
  );
}

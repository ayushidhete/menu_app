import Link from "next/link";
import { Geist, Geist_Mono, Macondo } from "next/font/google";
import "./globals.css";
import { TiHome } from "react-icons/ti";
import { FaCoffee } from "react-icons/fa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const macondo = Macondo({
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Food Ordering",
  description: "App Designed for food ordering at restaurant.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
        {/* HEADER */}
        <header className="nav">
          <div className="nav-left">
          <FaCoffee size={24} color="white" />
            <p className={`home-logo ${macondo.className}`}>Smart Café</p>
          </div>

          <Link href="/" aria-label="Home">
            <TiHome size={26} color="white" />
          </Link>
        </header>

        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}

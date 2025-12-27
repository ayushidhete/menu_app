import "./globals.css";
import Link from "next/link";
import { Macondo } from "next/font/google";
import { TiHome } from "react-icons/ti";
import { FaCoffee } from "react-icons/fa";

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
      <body className={macondo.className}>
        {/* HEADER */}
        <header className="nav">
          <div className="nav-left">
            <FaCoffee className="coffee-icon" />
            <p className="home-logo">Smart Café</p>
          </div>

          <Link href="/" aria-label="Home" className="home-icon">
            <TiHome />
          </Link>
        </header>

        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}

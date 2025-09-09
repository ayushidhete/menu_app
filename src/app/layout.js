import Link from "next/link";
import { Geist, Geist_Mono, Macondo } from "next/font/google";
import "./globals.css";
import { TiHome } from "react-icons/ti";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <div className="video-container">
          <video autoPlay loop muted playsInline className="bg-video">
            <source src="/bgFogVideo.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="nav">
          <p
            className={macondo.className}
            style={{ color: "white", fontSize: "48px" }}
          >
            {"Boss's Cafe"}
          </p>
          <Link href="/">
            <TiHome className="home-logo" />
          </Link>
        </div>
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}

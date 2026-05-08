import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ayin for Student Council President 2027 | Sentinel Secondary",
  description:
    "Your Voice Shapes Sentinel. A premium, student-first campaign for transparent, democratic student council leadership at Sentinel Secondary School (West Vancouver, BC).",
  openGraph: {
    title: "Your Voice Shapes Sentinel",
    description:
      "Sentinel deserves a stronger student voice. A campaign built around students, not promises.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="antialiased">
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}


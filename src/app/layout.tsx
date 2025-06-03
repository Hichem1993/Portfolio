import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Home/Navbar/Navbar";
import { Montserrat } from 'next/font/google';
import { Footer } from "@/components/Home/Footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});


export const metadata: Metadata = {
  title: "Hichem Ben Ayed - Portfolio UI Designer & Développeur Front-End",
  description: "Découvrez le portfolio de Hichem Ben Ayed, UI Designer et Développeur Frontend. Projets de design créatif et développement web performant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${montserrat.className} ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-black text-white">
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

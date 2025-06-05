import type { Metadata } from "next";
// ... autres imports de polices ...
import { Montserrat } from 'next/font/google';
import "./globals.css";
import Navbar from "@/components/Home/Navbar/Navbar"; // Ajustez le chemin
import { Footer } from "@/components/Home/Footer/Footer"; // Ajustez le chemin
import { AuthProvider } from "@/contexts/AuthContext"; // <--- AJOUTÉ (Ajustez le chemin)

// ... configuration des polices (Geist, Montserrat) ...
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
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
    <html lang="fr" className={`${montserrat.variable} /* ...autres variables de police... */`}>
      <body className="bg-black text-white">
        <AuthProvider> {/* <--- ENVELOPPEMENT */}
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </AuthProvider> {/* <--- FIN ENVELOPPEMENT */}
      </body>
    </html>
  );
}
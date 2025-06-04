import { LoginForm } from "@/components/Connexion/Connexion-form"
import Link from "next/link"

export default function ConnexionPage() {
  return (
    <div className=" bg-black flex items-center justify-center py-26 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-[#e30e1b] mb-4">Connexion</h1>
          <p className="text-gray-300 text-lg">
            Connectez-vous à votre espace personnel pour accéder à vos projets et gérer votre profil.
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <LoginForm />

          {/* Lien d'inscription */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Si vous n'êtes pas inscrit,{" "}
              <Link href="/inscription" className="text-[#e30e1b] hover:text-[#c50d18] font-medium transition-colors">
                inscrivez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

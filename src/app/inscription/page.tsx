
import { RegisterForm } from "@/components/Inscription/inscription-form"
import Link from "next/link"

export default function InscriptionPage() {
  return (
    <div className=" bg-black flex items-center justify-center py-26 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-[#e30e1b] mb-4">Inscription</h1>
          <p className="text-gray-300 text-lg">
            Créez votre compte pour accéder à tous nos services et suivre vos projets.
          </p>
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <RegisterForm />

          {/* Lien de connexion */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link href="/connexion" className="text-[#e30e1b] hover:text-[#c50d18] font-medium transition-colors">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

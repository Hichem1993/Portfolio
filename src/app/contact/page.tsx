import { ContactForm } from "@/components/Contact/ContactForm/ContactForm";
import { ContactInfo } from "@/components/Contact/ContactInfo/ContactInfo";


export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-[#e30e1b] mb-4">Contactez-moi</h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Vous avez un projet en tête ? N'hésitez pas à me contacter pour discuter de vos besoins en design UI et
            développement front-end.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Formulaire de contact */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Envoyez-moi un message</h2>
            <ContactForm />
          </div>

          {/* Informations de contact */}
          <div className="space-y-8">
            <ContactInfo />
          </div>
        </div>
      </div>
    </div>
  )
}

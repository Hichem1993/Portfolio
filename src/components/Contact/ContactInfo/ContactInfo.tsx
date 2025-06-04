import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLinkedinIn, faBehance, faGithub } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope, faPhone, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons"
import { Card } from "@/components/ui/card"

export function ContactInfo() {
  return (
    <>
      {/* Carte des coordonnées */}
      <Card className="p-4 bg-white shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Mes coordonnées</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-[#e30e1b]" />
            <a href="mailto:benayedhicham@gmail.com" className="text-gray-700 hover:text-[#e30e1b] transition-colors">
              benayedhicham@gmail.com
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faPhone} className="h-5 w-5 text-[#e30e1b]" />
            <a href="tel:+33744967207" className="text-gray-700 hover:text-[#e30e1b] transition-colors">
              +33 07 44 96 72 07
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="h-5 w-5 text-[#e30e1b]" />
            <span className="text-gray-700">France</span>
          </div>
        </div>
      </Card>

        {/* Carte google */}
        <Card className="p-4 bg-white shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Localisation</h3>
        <div className="relative w-full rounded-lg overflow-hidden">
            <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5676520.109665501!2d-2.6922407492722678!3d45.9964535490304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd54a02933785731%3A0x6bfd3f96c747d9f7!2sFrance!5e0!3m2!1sfr!2sfr!4v1749023377643!5m2!1sfr!2sfr"
            width="100%"
            height="220px"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
        </Card>

      {/* Réseaux sociaux */}
      <Card className="p-4 bg-white shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Suivez-moi</h3>
        <div className="flex space-x-4">
          <Link
            href="https://www.linkedin.com/in/hichem-benayed/"
            target="_blank"
            className="flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-[#e30e1b] text-gray-700 hover:text-white rounded-full transition-all duration-300"
          >
            <FontAwesomeIcon icon={faLinkedinIn} className="h-5 w-5" />
          </Link>
          <Link
            href="https://www.behance.net/Hichem1993"
            target="_blank"
            className="flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-[#e30e1b] text-gray-700 hover:text-white rounded-full transition-all duration-300"
          >
            <FontAwesomeIcon icon={faBehance} className="h-5 w-5" />
          </Link>
          <Link
            href="https://github.com/Hichem1993"
            target="_blank"
            className="flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-[#e30e1b] text-gray-700 hover:text-white rounded-full transition-all duration-300"
          >
            <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
          </Link>
        </div>
      </Card>
    </>
  )
}

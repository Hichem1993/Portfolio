import Link from "next/link"
// Import des composants Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// Import des icônes spécifiques
import { faLinkedinIn, faBehance, faGithub } from "@fortawesome/free-brands-svg-icons"

export function Footer() {
  return (
    <footer className="w-full bg-black text-white py-8 md:py-12 shadow-[0_-4px_10px_0px_rgba(255,255,255,0.15)]">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center px-14">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-[#e30e1b]">Hichem Ben Ayed</h2>
            <p className="text-sm text-gray-300 mt-1">UI Designer & Développeur Front-End</p>
            <div className="mt-2 text-sm text-gray-400">
                <p>
                    <a href="mailto:benayedhicham@gmail.com" className="hover:text-[#e30e1b] transition-colors">
                    benayedhicham@gmail.com
                    </a>
                </p>
                <p>
                    <a href="tel:+33744967207" className="hover:text-[#e30e1b] transition-colors">
                    +33 07 44 96 72 07
                    </a>
                </p>
            </div>
            
          </div>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link href="/" className="text-white hover:text-[#e30e1b] transition-colors">
              Accueil
            </Link>
            <Link href="/a-propos" className="text-white hover:text-[#e30e1b] transition-colors">
              A propos
            </Link>
            <Link href="/portfolio" className="text-white hover:text-[#e30e1b] transition-colors">
              Portfolio
            </Link>
            <Link href="/services/design-graphique" className="text-white hover:text-[#e30e1b] transition-colors">
              Services
            </Link>
            <Link href="/contact" className="text-white hover:text-[#e30e1b] transition-colors">
              Contact
            </Link>
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center px-14">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="https://www.linkedin.com/in/hichem-benayed/" target="_blank" className="text-white hover:text-[#e30e1b] transition-colors">
              <span className="sr-only">LinkedIn</span>
              <FontAwesomeIcon icon={faLinkedinIn} className="h-5 w-5" />
            </Link>
            <Link href="https://www.behance.net/Hichem1993" target="_blank" className="text-white hover:text-[#e30e1b] transition-colors">
              <span className="sr-only">Behance</span>
              <FontAwesomeIcon icon={faBehance} className="h-5 w-5" />
            </Link>
            <Link href="https://github.com/Hichem1993" target="_blank" className="text-white hover:text-[#e30e1b] transition-colors">
              <span className="sr-only">GitHub</span>
              <FontAwesomeIcon icon={faGithub}  className="h-5 w-5" />
            </Link>
          </div>
          <div>
            <p className="mt-2 text-sm text-gray-400">© {new Date().getFullYear()} Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Calendar } from "lucide-react"

const education = [
  {
    title: "Titre professionnel Développeur Web et Web Mobile",
    school: "Greta des Hauts-de-Seine",
    period: "2025",
    status: "Diplômé",
  },
  {
    title: "Licence appliquée en Art et Multimédias",
    subtitle: "Spécialité : Communication multimédias",
    school: "Institut Supérieur des Arts Multimédias",
    period: "2015",
    status: "Diplômé",
  },
  {
    title: "Baccalauréat en Sciences informatique",
    subtitle: "Session Principale",
    school: "",
    period: "2012",
    status: "Diplômé",
  },
]

export default function AboutEducation() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 font-[var(--font-montserrat)]">
            <span className="text-[#e30e1b]">FORMATION</span>
          </h2>

          <div className="space-y-6">
            {education.map((edu, index) => (
              <Card key={index} className="bg-white border-gray-300">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="text-[#e30e1b] mt-1" size={24} />
                      <div>
                        <CardTitle className="text-black mb-1 font-[var(--font-montserrat)]">{edu.title}</CardTitle>
                        {edu.subtitle && (
                          <p className="text-gray-500 text-sm font-[var(--font-montserrat)]">{edu.subtitle}</p>
                        )}
                        {edu.school && <p className="text-gray-600 font-[var(--font-montserrat)]">{edu.school}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="border-gray-400 text-gray-700 font-[var(--font-montserrat)]">
                        <Calendar size={14} className="mr-1" />
                        {edu.period}
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-200 text-gray-700 font-[var(--font-montserrat)]">
                        {edu.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

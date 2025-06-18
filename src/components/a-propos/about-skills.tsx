import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const skillCategories = [
  {
    title: "Compétences Graphiques",
    icon: "🎨",
    skills: ["Figma", "Photoshop", "Illustrator", "InDesign", "Premiere Pro", "After Effects"],
  },
  {
    title: "Compétences Front-End",
    icon: "💻",
    skills: ["WordPress", "HTML", "CSS", "Tailwind", "Bootstrap", "JavaScript", "ReactJS", "Next.js"],
  },
  {
    title: "Compétences Back-End",
    icon: "⚙️",
    skills: ["PHP", "Symfony", "SQLite", "MySQL", "Supabase"],
  },
]

export default function AboutSkills() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 font-[var(--font-montserrat)]">
            COMPÉTENCES <span className="text-[#e30e1b]">TECHNIQUES</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {skillCategories.map((category, index) => (
              <Card key={index} className="bg-white border-gray-300 hover:border-[#e30e1b] transition-colors">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <CardTitle className="text-[#e30e1b] font-[var(--font-montserrat)]">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="secondary"
                        className="bg-gray-100 text-black border border-gray-300 hover:border-[#e30e1b] transition-colors font-[var(--font-montserrat)]"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
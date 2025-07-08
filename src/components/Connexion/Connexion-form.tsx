"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm() {
  
  // State local pour stocker les valeurs du formulaire (email et mot de passe)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // State pour afficher un message de retour (succès ou erreur)
  const [feedback, setFeedback] = useState<string | null>(null)
  // State pour indiquer si la requête est en cours (chargement)
  const [isLoading, setIsLoading] = useState(false)
  // Récupération de l'objet router pour navigation programmatique
  const router = useRouter()
  // Récupération de la fonction login depuis le contexte d'authentification
  const { login } = useAuth()

  // Fonction appelée à chaque changement dans un champ du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Fonction appelée lors de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Empêche le comportement par défaut du formulaire (rechargement de page)
    setIsLoading(true) // Active le loader pendant la requête
    setFeedback(null) // Réinitialise le message de retour
 
    try {
      const response = await fetch("/api/login", { // Envoi de la requête POST vers l'API de login
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Envoi des données du formulaire au format JSON
      })

      const result = await response.json()  // Lecture de la réponse JSON de l'API

      if (response.ok && result.success && result.user) {
        login(result.user) // On appelle la fonction login du contexte avec les infos utilisateur
        setFeedback("Connexion réussie ! Redirection vers l'accueil...") // Message de succès
        router.push("/")
      } else {
        setFeedback(result.error || "Email ou mot de passe incorrect.") // Sinon, afficher l'erreur
      }
    } catch (error) { // Gestion d'erreur en cas de problème réseau ou autre
      console.error("Erreur de connexion:", error)
      setFeedback("Une erreur est survenue lors de la connexion.")
    } finally {
      setIsLoading(false) // Arrêt du loader, que la requête réussisse ou échoue
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-900 font-semibold">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full text-black" placeholder="votre@email.com" required disabled={isLoading} />
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-900 font-semibold">Mot de passe</Label>
        <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="w-full text-black" placeholder="••••••••" required disabled={isLoading} />
      </div>

      {/* Bouton de connexion */}
      <Button type="submit" className="w-full bg-[#e30e1b] hover:bg-[#c50d18] text-white py-3 text-lg font-semibold" disabled={isLoading}>
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>

      {feedback && (
        <p className={`mt-2 text-center text-sm ${feedback?.includes("réussie") ? "text-green-600" : "text-red-600"}`}>
          {feedback}
        </p>
      )}
    </form>
  )
}
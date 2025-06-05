"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext" // <--- IMPORTER useAuth

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth() // <--- UTILISER le hook

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetch("/api/login", { // Assurez-vous que cette API existe
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success && result.user) {
        login(result.user) // <--- APPELER login du contexte avec les données utilisateur
        setFeedback("Connexion réussie ! Redirection vers l'accueil...")
        router.push("/")
      } else {
        setFeedback(result.error || "Email ou mot de passe incorrect.")
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)
      setFeedback("Une erreur est survenue lors de la connexion.")
    } finally {
      setIsLoading(false)
    }
  }

  // ... reste du JSX ...
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-900 font-semibold">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full text-black"
          placeholder="votre@email.com"
          required
          disabled={isLoading}
        />
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-900 font-semibold">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full text-black"
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>

      {/* Bouton de connexion */}
      <Button
        type="submit"
        className="w-full bg-[#e30e1b] hover:bg-[#c50d18] text-white py-3 text-lg font-semibold"
        disabled={isLoading}
      >
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
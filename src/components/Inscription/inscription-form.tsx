"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button" // Ajustez le chemin
import { Input } from "@/components/ui/input"   // Ajustez le chemin
import { Label } from "@/components/ui/label"   // Ajustez le chemin

export function RegisterForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);


    if (formData.password !== formData.confirmPassword) {
      setFeedback("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setFeedback("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setFormData({ nom: "", prenom: "", email: "", password: "", confirmPassword: "" });
      } else {
        setFeedback(result.error || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setFeedback("Erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom" className="text-gray-900 font-semibold">Nom</Label>
          <Input id="nom" name="nom" type="text" value={formData.nom} onChange={handleChange} className="text-black" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prenom" className="text-gray-900 font-semibold">Prénom</Label>
          <Input id="prenom" name="prenom" type="text" value={formData.prenom} onChange={handleChange} className="text-black" required disabled={isLoading} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-900 font-semibold">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="text-black" required disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-900 font-semibold">Mot de passe</Label>
        <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="text-black" required disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-900 font-semibold">Confirmez le mot de passe</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="text-black" required disabled={isLoading} />
      </div>
      <Button type="submit" className="w-full bg-[#e30e1b] hover:bg-[#c50d18] text-white py-3 text-lg font-semibold" disabled={isLoading}>
        {isLoading ? "Inscription en cours..." : "S'inscrire"}
      </Button>
      {feedback && ( <p className={`mt-2 text-center text-sm ${feedback.includes("réussie") ? "text-green-600" : "text-red-600"}`}>{feedback}</p> )}
    </form>
  )
}
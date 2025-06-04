"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ContactForm() {
  // État local pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    objet: "",
    message: "",
  })

  // État pour le message de retour (succès ou erreur)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Met à jour l'état lorsqu'un champ change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Envoie les données du formulaire à l'API Next.js
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Empêche le rechargement de la page
    setFeedbackMessage(null) // Reset feedback message

    try {
      // Envoie les données au backend via l'API route /api/contact
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // On indique qu'on envoie du JSON
        },
        body: JSON.stringify(formData), // Transforme les données en JSON
      })

      const result = await response.json()

      if (response.ok) {
        setFeedbackMessage("Message envoyé avec succès !")

        // Réinitialise le formulaire
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          objet: "",
          message: "",
        })
      } else {
        setFeedbackMessage("Erreur lors de l'envoi : " + result.error)
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire :", error)
      setFeedbackMessage("Une erreur est survenue. Veuillez réessayer.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom et Prénom */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom" className="text-sm font-semibold text-gray-900">Nom</Label>
          <Input
            id="nom"
            name="nom"
            type="text"
            value={formData.nom}
            onChange={handleChange}
            className="w-full text-black"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prenom" className="text-sm font-semibold text-gray-900">Prénom</Label>
          <Input
            id="prenom"
            name="prenom"
            type="text"
            value={formData.prenom}
            onChange={handleChange}
            className="w-full text-black"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full text-black"
          required
        />
      </div>

      {/* Téléphone */}
      <div className="space-y-2">
        <Label htmlFor="telephone" className="text-sm font-semibold text-gray-900">Téléphone</Label>
        <Input
          id="telephone"
          name="telephone"
          type="tel"
          value={formData.telephone}
          onChange={handleChange}
          className="w-full text-black"
        />
      </div>

      {/* Objet */}
      <div className="space-y-2">
        <Label htmlFor="objet" className="text-sm font-semibold text-gray-900">Objet</Label>
        <Input
          id="objet"
          name="objet"
          type="text"
          value={formData.objet}
          onChange={handleChange}
          className="w-full text-black"
          required
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-semibold text-gray-900">Message</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full min-h-[120px] text-black"
          placeholder="Décrivez votre projet ou votre demande..."
          required
        />
      </div>

      {/* Bouton d'envoi */}
      <Button
        type="submit"
        className="w-full bg-[#e30e1b] hover:bg-[#c50d18] text-white py-3 text-lg font-semibold"
      >
        Envoyer le message
      </Button>

      {/* Message de retour sous le bouton */}
      {feedbackMessage && (
        <p className="mt-2 text-center text-sm text-gray-700">
          {feedbackMessage}
        </p>
      )}
    </form>
  )
}

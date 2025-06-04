"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ici vous pouvez ajouter la logique d'inscription
    console.log("Inscription:", formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom et Prénom */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom" className="text-gray-900 font-semibold">Nom</Label>
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
          <Label htmlFor="prenom" className="text-gray-900 font-semibold">Prénom</Label>
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
        />
      </div>

      {/* Bouton d'inscription */}
      <Button type="submit" className="w-full bg-[#e30e1b] hover:bg-[#c50d18] text-white py-3 text-lg font-semibold">
        S'inscrire
      </Button>
    </form>
  )
}

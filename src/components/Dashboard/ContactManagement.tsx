// src/components/Dashboard/ContactManagement.tsx
"use client";

import { useState, useEffect } from 'react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Optionnel si vous préférez un tableau
// import { Button } from "@/components/ui/button"; // Pour futures actions
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, User, CalendarDays, MessageSquare as MessageIcon, Type } from 'lucide-react'; // Type pour l'objet

// Interface pour correspondre à la réponse de l'API /api/contacts
interface ContactMessageAdmin {
  id: number;
  nom: string;
  prenom: string;
  telephone: string | null;
  objet: string;
  email: string;
  message: string;
  date_envoyee: string; // Sera une chaîne après JSON.parse(new Date(...)) si formaté côté client
}

const ContactManagement = () => {
  const [messages, setMessages] = useState<ContactMessageAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await fetch('/api/contact');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({error: "Réponse d'erreur API non JSON"}));
        throw new Error(errData.error || 'Échec de la récupération des messages de contact');
      }
      const data: any[] = await response.json(); // Recevoir comme any[] pour le parsing de date
      // Formater la date ici pour l'affichage
      const formattedData = data.map(msg => ({
        ...msg,
        date_envoyee: new Date(msg.date_envoyee).toLocaleDateString('fr-FR', {
          year: 'numeric', month: '2-digit', day: '2-digit', 
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        })
      }));
      setMessages(formattedData);
      console.log("ContactManagement: Messages reçus et formatés:", formattedData);
    } catch (err: any) { 
        console.error("ContactManagement: Erreur dans fetchMessages:", err);
        setError(err.message); 
        setMessages([]);
    } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  // TODO: handleDeleteMessage si vous ajoutez la fonctionnalité de suppression

  if (isLoading) {
    return <div className="text-center py-10 text-white"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#e30e1b] mx-auto mb-3"></div>Chargement des messages...</div>;
  }
  if (error) {
    return <div className="text-center text-[#e30e1b] py-10 bg-red-900/20 p-4 rounded-md">Erreur lors du chargement: {error}</div>;
  }

  return (
    <div className="bg-gray-800/30 p-4 md:p-6 rounded-lg border border-gray-700/50 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Contacts</h1>
        {/* Pas de bouton "Ajouter" ici, les contacts viennent du formulaire public */}
      </div>

      {messages.length === 0 && !isLoading ? (
        <p className="text-center text-gray-400 py-10">Aucun message de contact reçu pour le moment.</p>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-3">
          {messages.map((msg) => (
            <AccordionItem key={msg.id} value={`message-${msg.id}`} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-[#e30e1b]/50 transition-all">
              <AccordionTrigger className="hover:no-underline px-4 sm:px-6 py-4 text-left data-[state=open]:bg-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-2 text-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg text-white truncate flex items-center" title={msg.objet}>
                        <Type size={18} className="mr-2 text-[#e30e1b] shrink-0" /> {msg.objet}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center">
                      <User size={14} className="mr-1.5 text-gray-500 shrink-0" /> De: {msg.prenom} {msg.nom} 
                      <span className="mx-1 text-gray-600">|</span>
                      <Mail size={14} className="mr-1.5 text-gray-500 shrink-0" /> {msg.email}
                    </p>
                  </div>
                  <div className="text-right mt-2 sm:mt-0 shrink-0">
                    <p className="text-sm text-gray-300 flex items-center">
                        <CalendarDays size={14} className="mr-1.5 text-gray-500 shrink-0" /> {msg.date_envoyee}
                    </p>
                    {/* Optionnel: Statut du message (ex: Nouveau, Lu, Répondu) */}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 sm:px-6 pb-4 pt-3 bg-gray-700/20 border-t border-gray-700/50">
                {msg.telephone && (
                    <p className="text-sm text-gray-300 mb-3 flex items-center">
                        <Phone size={16} className="mr-2 text-gray-400 shrink-0"/> Téléphone: <a href={`tel:${msg.telephone}`} className="hover:text-[#e30e1b] hover:underline">{msg.telephone}</a>
                    </p>
                )}
                <h4 className="text-md font-semibold text-gray-200 mb-1 mt-2 flex items-center"><MessageIcon size={18} className="mr-2 text-gray-400"/>Message :</h4>
                <div className="text-sm text-gray-300 bg-gray-700/40 p-3 rounded whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {msg.message}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                    {/* TODO: Boutons d'action (Répondre par email, Supprimer) */}
                    {/* <Button size="sm" variant="outline" className="text-xs">Répondre</Button> */}
                    {/* <Button size="sm" variant="destructive" className="text-xs">Supprimer</Button> */}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default ContactManagement;
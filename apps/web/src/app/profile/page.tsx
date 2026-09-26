"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [profileText, setProfileText] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const response = await fetch("http://localhost:3001/api/users/me/cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const data = await response.json();
      setProfileText(data.profileText);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Erreur lors de l'extraction. Utilise la saisie manuelle ci-dessous.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleManualSave = async () => {
    if (!profileText.trim()) {
      setError("Le profil ne peut pas être vide.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3001/api/users/me/profile", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ baseProfileText: profileText }),
});

// 204 No Content est un succès
if (response.status === 204 || response.ok) {
  setSaved(true);
  setError("");
  setTimeout(() => setSaved(false), 3000);
} else {
  throw new Error("Erreur lors de la sauvegarde");
}
    } catch (err) {
      setError("Erreur lors de la sauvegarde.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Mon Profil</h2>
        <p className="text-gray-500 mt-1">
          Uploade ton CV ou saisis manuellement ton profil pour que l'IA te propose des offres sur mesure.
        </p>
      </div>

      {/* Upload CV */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">📄 Upload de CV (optionnel)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Sélectionne ton CV au format PDF. L'IA extraira automatiquement tes compétences.
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="cv-upload"
          />
          <label htmlFor="cv-upload" className="cursor-pointer">
            <div className="text-4xl mb-2">📎</div>
            <div className="text-gray-600 font-medium mb-1">
              {fileName ? `Fichier sélectionné : ${fileName}` : "Clique pour sélectionner ton CV"}
            </div>
            <div className="text-sm text-gray-400">PDF uniquement, max 5MB</div>
          </label>
        </div>

        {uploading && (
          <div className="mt-4 text-center text-blue-600">⏳ Traitement en cours...</div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">⚠️ {error}</div>
        )}

        {saved && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg">✅ Profil sauvegardé !</div>
        )}
      </div>

      {/* ÉDITION MANUELLE - Toujours visible */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">✏️ Ton profil professionnel</h3>
        <p className="text-sm text-gray-500 mb-4">
          Saisis ou modifie ton profil : compétences, expériences, formations, projets.
          L'IA utilisera ces informations pour scorer les offres et générer des CV adaptés.
        </p>

        <textarea
          value={profileText}
          onChange={(e) => setProfileText(e.target.value)}
          rows={15}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder={`Exemple de format :

COMPÉTENCES
- Développement : React, TypeScript, Node.js, NestJS
- Base de données : PostgreSQL, MongoDB
- Cloud : AWS, Docker, Kubernetes

EXPÉRIENCES
- Développeur Fullstack chez TechCorp (2022-2024)
  • Développement d'applications web avec React et Node.js
  • Migration de l'architecture vers des microservices

FORMATION
- Master Informatique, Université Paris-Saclay (2020)

LANGUES
- Français (natif), Anglais (courant C1)`}
        />

        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={() => setProfileText("")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ️ Effacer
          </button>
          <button
            onClick={handleManualSave}
            disabled={uploading || !profileText.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50"
          >
            {uploading ? " Sauvegarde..." : "💾 Sauvegarder le profil"}
          </button>
        </div>
      </div>
    </div>
  );
}
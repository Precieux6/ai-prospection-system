"use client";
import { useState } from "react";

type Tab = "dashboard" | "review" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [keywords, setKeywords] = useState<string[]>(["Développeur Fullstack"]);
  const [locations, setLocations] = useState<string[]>(["Paris", "Remote"]);
  const [sources, setSources] = useState<string[]>(["linkedin", "indeed", "wttj"]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [saved, setSaved] = useState(false);
  const [targets, setTargets] = useState<any[]>([
    { id: 1, title: "Développeur Fullstack", company: "TechCorp", location: "Paris", score: 92, reasoning: "Match parfait avec votre stack React/Node.", status: "pending_review" },
    { id: 2, title: "Lead Frontend", company: "StartupXYZ", location: "Remote", score: 85, reasoning: "Bonne adéquation, manque un peu d'expérience management.", status: "pending_review" },
  ]);

  // --- Actions Validation ---
  const handleApprove = (id: number) => {
    alert(`✅ Opportunité ${id} approuvée et programmée pour 09h30 !`);
    setTargets(targets.filter(t => t.id !== id));
  };
  const handleReject = (id: number) => {
    setTargets(targets.filter(t => t.id !== id));
  };

  // --- Actions Paramètres ---
  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };
  const removeKeyword = (kw: string) => setKeywords(keywords.filter(k => k !== kw));
  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation("");
    }
  };
  const removeLocation = (loc: string) => setLocations(locations.filter(l => l !== loc));
  const toggleSource = (source: string) => {
    if (sources.includes(source)) setSources(sources.filter(s => s !== source));
    else setSources([...sources, source]);
  };
  const handleSave = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobSearchKeywords: keywords, jobSearchLocations: locations, jobSearchSources: sources }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div>
      {/* Navigation par onglets */}
      <div className="flex gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
        {[
          { id: "dashboard", label: " Dashboard", },
          { id: "review", label: "✅ Validation", },
          { id: "settings", label: "️ Paramètres", },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* === ONGLET DASHBOARD === */}
      {activeTab === "dashboard" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vue d'ensemble</h2>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">Offres scrapées aujourd'hui</div>
              <div className="text-3xl font-bold text-blue-600">0</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">En attente de validation</div>
              <div className="text-3xl font-bold text-yellow-600">{targets.length}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">Candidatures envoyées</div>
              <div className="text-3xl font-bold text-green-600">0</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">🚀 Actions rapides</h3>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab("review")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Voir les offres à valider
              </button>
              <button onClick={() => setActiveTab("settings")} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Configurer mes critères
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === ONGLET VALIDATION === */}
      {activeTab === "review" && (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Validation du jour (08h30 - 09h30)</h2>
            <p className="text-gray-500 mt-1">Relisez et approuvez les candidatures générées cette nuit.</p>
          </div>
          <div className="space-y-4">
            {targets.map((target) => (
              <div key={target.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{target.title}</h3>
                    <p className="text-gray-600 text-sm">{target.company} • {target.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${target.score >= 90 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {target.score}% Match
                  </span>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-800 italic">💡 Analyse IA : "{target.reasoning}"</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleApprove(target.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                    ✅ Approuver & Programmer
                  </button>
                  <button onClick={() => handleReject(target.id)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    ❌ Rejeter
                  </button>
                </div>
              </div>
            ))}
            {targets.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Aucune opportunité en attente de validation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === ONGLET PARAMÈTRES === */}
      {activeTab === "settings" && (
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Paramètres de recherche</h2>
            <p className="text-gray-500 mt-1">Configure tes critères pour recevoir les offres les plus pertinentes.</p>
          </div>

          {/* Mots-clés */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4">🔍 Mots-clés de recherche</h3>
            <p className="text-sm text-gray-500 mb-4">Les termes utilisés pour scraper les offres d'emploi.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {keywords.map((kw) => (
                <span key={kw} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="hover:text-blue-900">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                placeholder="Ex: Développeur React, Node.js..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addKeyword} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Ajouter</button>
            </div>
          </div>

          {/* Localisations */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4"> Localisations</h3>
            <p className="text-sm text-gray-500 mb-4">Où cherches-tu à travailler ?</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {locations.map((loc) => (
                <span key={loc} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {loc}
                  <button onClick={() => removeLocation(loc)} className="hover:text-green-900">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLocation()}
                placeholder="Ex: Paris, Remote, Lyon..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <button onClick={addLocation} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Ajouter</button>
            </div>
          </div>

          {/* Sources */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4">🌐 Sources de scraping</h3>
            <p className="text-sm text-gray-500 mb-4">Choisis les plateformes à scraper.</p>
            <div className="space-y-3">
              {[
                { id: "linkedin", name: "LinkedIn", desc: "Offres professionnelles et réseau" },
                { id: "indeed", name: "Indeed", desc: "Agrégateur d'offres d'emploi" },
                { id: "wttj", name: "Welcome to the Jungle", desc: "Startups et entreprises tech" },
              ].map((source) => (
                <label key={source.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <div className="font-medium">{source.name}</div>
                    <div className="text-sm text-gray-500">{source.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sources.includes(source.id)}
                    onChange={() => toggleSource(source.id)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Sauvegarder */}
          <div className="flex justify-end gap-3">
            {saved && <span className="text-green-600 self-center">✅ Paramètres sauvegardés !</span>}
            <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">
              💾 Sauvegarder les paramètres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
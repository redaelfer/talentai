import React, { useState, useEffect } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom"; // <--- 1. Importer useNavigate

export default function CandidateProfile() {
  const [candidateId, setCandidateId] = useState(localStorage.getItem("userId"));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState(""); // Nouveau champ
  const [titre, setTitre] = useState(""); // Nouveau champ (ex: "Développeur React")
  const [cv, setCv] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate(); // <--- 2. Initialiser le hook

  // Charger les données du candidat au démarrage
  useEffect(() => {
    if (!candidateId) {
      setMessage({ type: "danger", text: "Erreur: ID Candidat non trouvé. Veuillez vous reconnecter." });
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await API.get(`/candidates/${candidateId}`);
        const { data } = res;
        setFullName(data.fullName);
        setEmail(data.email);
        setTelephone(data.telephone || "");
        setTitre(data.titre || "");
      } catch (err) {
        console.error(err);
        setMessage({ type: "info", text: "Complétez votre profil pour postuler." });
      }
    };
    loadProfile();
  }, [candidateId]);

  // Mettre à jour les informations ET le CV
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Étape A: Mettre à jour les infos textuelles
    try {
      await API.put(`/candidates/${candidateId}`, {
        fullName,
        email,
        telephone,
        titre,
      });
      setMessage({ type: "success", text: "✅ Profil mis à jour !" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "danger", text: "❌ Erreur lors de la mise à jour du profil." });
      return;
    }

    // Étape B: Si un nouveau CV est joint, l'uploader
    if (cv) {
      try {
        const data = new FormData();
        data.append("file", cv);

        // Note: L'upload de fichier FormData fonctionne mieux avec l'URL complète
        await axios.post(
          `http://localhost:8080/api/candidates/${candidateId}/cv`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setMessage({ type: "success", text: "✅ Profil et CV mis à jour !" });
        setCv(null);
      } catch (err) {
        console.error(err);
        setMessage({ type: "danger", text: "❌ Profil mis à jour, mais erreur lors de l'envoi du CV." });
      }
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      {/* --- 3. Bouton de retour ajouté --- */}
      <button className="btn btn-link px-0 mb-2" onClick={() => navigate("/")}>
        ⬅ Retour au Dashboard
      </button>

      <h3>🧍 Profil candidat</h3>

      {message && <div className={`alert alert-${message.type} mt-3`}>{message.text}</div>}

      <form onSubmit={handleProfileUpdate}>
        <div className="mb-3">
          <label className="form-label">Nom complet</label>
          <input
            className="form-control"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Titre (ex: Développeur Fullstack)</label>
          <input
            className="form-control"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Téléphone</label>
          <input
            className="form-control"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
        </div>

        <hr />

        <div className="mb-3">
          <label className="form-label">Changer mon CV (PDF)</label>
          <input
            type="file"
            className="form-control"
            accept="application/pdf"
            onChange={(e) => setCv(e.target.files[0])}
          />
          <div className="form-text">Laissez vide pour conserver votre CV actuel.</div>
        </div>

        <button type="submit" className="btn btn-primary">Enregistrer les modifications</button>
      </form>
    </div>
  );
}
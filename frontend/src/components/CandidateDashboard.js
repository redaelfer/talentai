import React, { useEffect, useMemo, useState } from "react";
import { API } from "../api";
// import axios from "axios"; // Plus besoin si on n'uploade plus le CV ici
import { useNavigate } from "react-router-dom";

export default function CandidateDashboard() {
  const [offers, setOffers] = useState([]);
  const [candidateId, setCandidateId] = useState(localStorage.getItem("userId")); // <-- Utiliser l'ID du login
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!candidateId) {
      // Si l'utilisateur n'a pas d'ID (peut-être pas de profil?), on le force à en créer un.
      alert("Veuillez compléter votre profil avant de postuler.");
      navigate("/profile");
    }
    loadOffers();
  }, [candidateId, navigate]);

  const loadOffers = async () => {
    const res = await API.get("/offers");
    setOffers(res.data);
  };

  const filtered = useMemo(() => {
    // ... (votre code de filtre est bon, pas de changement)
    const q = query.toLowerCase();
    return offers.filter(o =>
      o.title?.toLowerCase().includes(q) ||
      o.skills?.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q)
    );
  }, [offers, query]);


  // Fonction de candidature simplifiée
  const handleApply = async (offer) => {
    if (!candidateId) {
      alert("Veuillez d'abord compléter votre profil.");
      navigate("/profile");
      return;
    }

    // On suppose que le candidat a déjà uploadé un CV sur son profil
    // L'endpoint "evaluate" va maintenant servir d'endpoint "postuler"
    try {
      await API.post(`/candidates/${candidateId}/evaluate`, {
        jobDescription: offer.description,
        offerId: offer.id,
      });

      alert("✅ Candidature envoyée avec succès ! Le recruteur va l'examiner.");
    } catch (err) {
      console.error(err);
      // Gérer le cas où le candidat n'a pas de CV
      if (err.response?.data?.includes("CV not found")) {
         alert("❌ Vous devez d'abord ajouter un CV à votre profil pour postuler.");
         navigate("/profile");
      } else {
         alert("❌ Erreur lors de la candidature.");
      }
    }
  };

  return (
    <div className="container my-4">
      {/* ... (votre JSX pour le header du dashboard est bon) ... */}
       <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>🔎 Offres disponibles</h2>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={() => navigate("/profile")}>
            Gérer mon profil
          </button>
          <button className="btn btn-outline-secondary"
                  onClick={() => { localStorage.clear(); window.location.reload(); }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ... (votre input de filtre est bon) ... */}
      <input className="form-control mb-3"
             placeholder="Filtrer par titre / compétence / description"
             value={query}
             onChange={e => setQuery(e.target.value)} />

      <div className="row">
        {filtered.map(o => (
          <div key={o.id} className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                {/* ... (affichage de l'offre) ... */}
                <h5 className="card-title">{o.title}</h5>
                {/* ... */}
                <button className="btn btn-success" onClick={() => handleApply(o)}>
                  Postuler avec mon profil
                </button>
              </div>
            </div>
          </div>
        ))}
        {!filtered.length && <div className="text-muted">Aucune offre trouvée.</div>}
      </div>
    </div>
  );
}
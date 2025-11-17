import React, { useEffect, useMemo, useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function CandidateDashboard() {
  const [offers, setOffers] = useState([]);
  const [candidateId] = useState(localStorage.getItem("userId"));
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // L'état 'selectedOffer' n'est plus nécessaire

  useEffect(() => {
    if (!candidateId) {
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
    const q = query.toLowerCase();
    return offers.filter(o =>
      o.title?.toLowerCase().includes(q) ||
      o.skills?.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q)
    );
  }, [offers, query]);

  // --- MODIFIÉ ---
  // La fonction prend maintenant l'offre en paramètre
  const handleApply = async (offer) => {
    if (!candidateId) {
      alert("Veuillez d'abord compléter votre profil.");
      navigate("/profile");
      return;
    }

    if (!offer) return;

    try {
      // On utilise l'offre passée en paramètre
      await API.post(`/candidates/${candidateId}/evaluate`, {
        jobDescription: offer.description,
        offerId: offer.id,
      });

      alert("✅ Candidature envoyée avec succès ! Le recruteur va l'examiner.");
      // On n'a plus besoin de fermer le modal
    } catch (err) {
      console.error(err);
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

      <input className="form-control mb-3"
             placeholder="Filtrer par titre / compétence / description"
             value={query}
             onChange={e => setQuery(e.target.value)} />

      {/* --- LISTE DES OFFRES ENTIÈREMENT DÉTAILLÉE --- */}
      <div className="row">
        {filtered.map(o => (
          // J'utilise col-md-12 pour qu'une offre prenne toute la largeur,
          // c'est plus lisible avec tous les détails.
          <div key={o.id} className="col-md-12">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">{o.title}</h5>

                {/* Badges pour les compétences */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {o.skills && o.skills.split(',').filter(s => s).map(skill => (
                    <span key={skill} className="badge bg-primary fw-normal">{skill}</span>
                  ))}
                </div>

                {/* Infos clés (Contrat, Durée, etc.) */}
                <div className="row small text-muted border-top border-bottom py-3 mb-3 mx-0">
                  <div className="col-sm-6 col-lg-3 mb-2">
                    <strong>Contrat :</strong> {o.typeContrat || 'Non spécifié'}
                  </div>
                  <div className="col-sm-6 col-lg-3 mb-2">
                    <strong>Durée :</strong> {o.duree || 'Non spécifié'}
                  </div>
                  <div className="col-sm-6 col-lg-3 mb-2">
                    <strong>Rémunération :</strong> {o.remuneration || 'Non spécifié'}
                  </div>
                  <div className="col-sm-6 col-lg-3 mb-2">
                    <strong>Expérience :</strong> {o.experience || 'Non spécifié'}
                  </div>
                </div>

                {/* Description du poste */}
                <h6 className="card-subtitle mb-2">Description du poste</h6>
                <p
                  className="card-text mb-4"
                  style={{
                    whiteSpace: 'pre-wrap',
                    maxHeight: '250px', // Hauteur max avec scrollbar
                    overflowY: 'auto',
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '5px'
                  }}
                >
                  {o.description || 'Aucune description fournie.'}
                </p>

                {/* Bouton Postuler */}
                <button
                  className="btn btn-success"
                  onClick={() => handleApply(o)} // Passe l'objet 'o'
                >
                  Postuler avec mon profil
                </button>
              </div>
            </div>
          </div>
        ))}
        {!filtered.length && <div className="text-muted">Aucune offre trouvée.</div>}
      </div>

      {/* Le Modal a été entièrement supprimé */}
    </div>
  );
}
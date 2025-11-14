import React, { useEffect, useMemo, useState, useCallback } from "react";
import { API } from "../api";

export default function RhDashboard() {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // formulaire création offre
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");

  const [evaluations, setEvaluations] = useState([]); // scores sauvegardés pour l'offre sélectionnée

  // --- CORRECTION useEffect / useCallback ---
  const loadOffers = useCallback(async () => {
    try {
      const res = await API.get("/offers");
      setOffers(res.data);
      if (res.data.length && !selectedOffer) {
        setSelectedOffer(res.data[0]);
      }
    } catch (err) {
      console.error("Erreur chargement offres:", err);
    }
  }, [selectedOffer]); // On dépend de selectedOffer pour ne pas le re-sélectionner inutilement

  const loadEvaluations = useCallback(async (offerId) => {
    try {
      const res = await API.get(`/evaluations/offer/${offerId}`);
      setEvaluations(res.data); // [{candidateId,candidateName,email,score}]
    } catch (err) {
      console.error("Erreur chargement évaluations:", err);
      setEvaluations([]);
    }
  }, []); // Cette fonction ne dépend d'aucun state

  useEffect(() => {
    loadOffers();
  }, [loadOffers]); // <- Correction warning ESLint

  useEffect(() => {
    if (selectedOffer) {
      loadEvaluations(selectedOffer.id);
    } else {
      setEvaluations([]);
    }
  }, [selectedOffer, loadEvaluations]); // <- Correction warning ESLint
  // --- FIN CORRECTION ---


  const createOffer = async (e) => {
    e.preventDefault();
    await API.post("/offers", { title, description, skills });
    setTitle(""); setSkills(""); setDescription("");
    await loadOffers();
  };

  // La fonction 'evaluate' est supprimée, car c'est le candidat qui postule.
  // La fonction 'scoreFor' est supprimée, on lira 'evalData.score' directement.

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>👔 Espace RH</h2>
        <button className="btn btn-outline-secondary"
                onClick={() => { localStorage.clear(); window.location.reload(); }}>
          Déconnexion
        </button>
      </div>

      <div className="row">
        {/* Colonne Offres */}
        <div className="col-md-5">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Offres d’emploi</h5>
              <ul className="list-group">
                {offers.map(o => (
                  <li key={o.id}
                      className={`list-group-item list-group-item-action ${selectedOffer?.id===o.id ? "active text-white":""}`}
                      style={{cursor:"pointer"}}
                      onClick={() => setSelectedOffer(o)}>
                    <strong>{o.title}</strong>
                    <div className="small">{o.skills}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Création d'offre */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Créer une offre</h5>
              <form onSubmit={createOffer}>
                <input className="form-control mb-2" placeholder="Titre" value={title} onChange={e=>setTitle(e.target.value)} required/>
                <input className="form-control mb-2" placeholder="Compétences (ex: Java,React)" value={skills} onChange={e=>setSkills(e.target.value)}/>
                <textarea className="form-control mb-2" placeholder="Description" rows="4"
                          value={description} onChange={e=>setDescription(e.target.value)}/>
                <button className="btn btn-primary">Créer</button>
              </form>
            </div>
          </div>
        </div>

        {/* --- CORRECTION Colonne Candidats ---
           On utilise 'evaluations' (les candidatures)
           au lieu de 'candidates' (tous les candidats)
        */}
        <div className="col-md-7">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                Candidats pour : {selectedOffer ? `« ${selectedOffer.title} »` : "Aucune offre"}
              </h5>
              
              {selectedOffer && evaluations.length > 0 && (
                <ul className="list-group">
                  {evaluations
                    .sort((a, b) => b.score - a.score) // Trier par score
                    .map(evalData => (
                      <li key={evalData.candidateId} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{evalData.candidateName}</strong>
                          <div className="text-muted small">{evalData.email}</div>
                          {/* TODO: Vous pouvez ajouter un lien vers le CV ici, par ex:
                            <a href={`http://localhost:8080/api/candidates/${evalData.candidateId}/cv`} target="_blank" rel="noopener noreferrer">
                              Voir CV
                            </a>
                          */}
                        </div>
                        <span className={`badge fs-6 ${evalData.score > 75 ? "bg-success" : "bg-warning text-dark"}`}>
                          Score IA : {evalData.score}/100
                        </span>
                      </li>
                  ))}
                </ul>
              )}
              
              {selectedOffer && !evaluations.length && (
                <div className="text-muted">Aucun candidat n'a encore postulé à cette offre.</div>
              )}

              {!selectedOffer && (
                <div className="text-muted">Sélectionnez une offre pour voir les candidatures.</div>
              )}
            </div>
          </div>
        </div>
        {/* --- FIN CORRECTION --- */}
      </div>
    </div>
  );
}
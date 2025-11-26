import React, { useEffect, useMemo, useState, useCallback } from "react";
import { API } from "../api";

export default function CandidateDashboard() {
  const [offers, setOffers] = useState([]);
  const [candidateId] = useState(() => localStorage.getItem("userId"));
  const [query, setQuery] = useState("");

  const [candidateProfile, setCandidateProfile] = useState(null);

  const [appliedOfferIds, setAppliedOfferIds] = useState([]);

  const [applyingOfferId, setApplyingOfferId] = useState(null);

  // --- NOUVEAUX ÉTATS POUR LA VUE CANDIDATURES & IA ---
  const [view, setView] = useState("OFFERS"); // 'OFFERS' ou 'APPLICATIONS'
  const [myApplications, setMyApplications] = useState([]);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingData, setTrainingData] = useState(null);

  // --- États pour le modal de profil ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [titre, setTitre] = useState("");
  const [telephone, setTelephone] = useState("");
  const [cv, setCv] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState(null);

  // --- Chargement des données ---
  const loadData = useCallback(async () => {
    try {
      // 1. Récupérer les offres
      const offersRes = await API.get("/offers");
      setOffers(offersRes.data);

      // 2. Si connecté, récupérer profil et candidatures
      if (candidateId) {
        const profileRes = await API.get(`/candidates/${candidateId}`);
        setCandidateProfile(profileRes.data);

        if (profileRes.data) {
            setFullName(profileRes.data.fullName || "");
            setEmail(profileRes.data.email || "");
            setTitre(profileRes.data.titre || "");
            setTelephone(profileRes.data.telephone || "");
        }

        // --- Récupérer les IDs pour désactiver les boutons ---
        try {
            const appliedRes = await API.get(`/evaluations/candidate/${candidateId}/offer-ids`);
            setAppliedOfferIds(appliedRes.data);
        } catch (err) { console.error(err); }

        // --- NOUVEAU : Charger les détails complets des candidatures ---
        try {
            const myAppsRes = await API.get(`/evaluations/candidate/${candidateId}/applications`);
            setMyApplications(myAppsRes.data);
        } catch(err) { console.error("Erreur chargement mes candidatures", err); }
      }
    } catch (err) { console.error(err); }
  }, [candidateId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Logique de Filtrage et Matching ---
  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    let result = offers.filter(o =>
      o.title?.toLowerCase().includes(q) ||
      o.skills?.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q) ||
      (o.rh?.nomEntreprise?.toLowerCase().includes(q))
    );

    if (candidateProfile && candidateProfile.titre) {
        const myTitle = candidateProfile.titre.toLowerCase();
        result.sort((a, b) => {
            let scoreA = a.title.toLowerCase().includes(myTitle) ? 10 : 0;
            let scoreB = b.title.toLowerCase().includes(myTitle) ? 10 : 0;
            return scoreB - scoreA;
        });
    }
    return result;
  }, [offers, query, candidateProfile]);


  // --- ACTION POSTULER ---
  const handleApply = async (offer) => {
    if (!candidateId) {
      alert("Erreur: ID Candidat non trouvé. Veuillez vous reconnecter.");
      return;
    }

    if (appliedOfferIds.includes(offer.id)) {
        alert("⚠️ Vous avez déjà postulé à cette offre.");
        return;
    }

    setApplyingOfferId(offer.id);

    try {
      await API.post(`/candidates/${candidateId}/evaluate`, {
        jobDescription: offer.description,
        offerId: offer.id,
      });

      alert(`✅ Candidature envoyée avec succès pour "${offer.title}" !`);

      setAppliedOfferIds(prev => [...prev, offer.id]);
      // On recharge les données pour mettre à jour la liste "Mes candidatures"
      loadData();

    } catch (err) {
      console.error(err);
      const errorResponse = err.response?.data;
      const errorMsg = typeof errorResponse === "string"
        ? errorResponse
        : (errorResponse?.message || JSON.stringify(errorResponse));

      if (errorMsg && errorMsg.includes("ALREADY_APPLIED")) {
         alert("⚠️ Vous avez DÉJÀ postulé à cette offre.");
         setAppliedOfferIds(prev => [...prev, offer.id]);
      } else if (errorMsg && errorMsg.includes("CV not found")) {
         alert("❌ CV manquant. Veuillez compléter votre profil.");
         handleOpenProfileModal();
      } else {
         alert("❌ Une erreur est survenue lors de la candidature.");
      }
    } finally {
      setApplyingOfferId(null);
    }
  };

// --- FONCTION MANQUANTE : Lancer l'entraînement IA ---
  const handleStartTraining = async (application) => {
    setTrainingData({ questions: application.interviewQuestions, loading: !application.interviewQuestions });
    setShowTrainingModal(true);

    if (!application.interviewQuestions) {
        try {
            const res = await API.post(`/evaluations/${application.evaluationId}/questions`);
            const newQuestions = res.data;

            setTrainingData({ questions: newQuestions, loading: false });

            // Mise à jour locale pour ne pas rappeler l'IA la prochaine fois
            setMyApplications(prev => prev.map(app =>
                app.evaluationId === application.evaluationId
                ? { ...app, interviewQuestions: newQuestions }
                : app
            ));
        } catch (err) {
            console.error(err);
            setTrainingData({ questions: "Erreur lors de la génération.", loading: false });
        }
    }
  };

  // --- Gestion Modal Profil ---
  const handleOpenProfileModal = () => {
    loadData();
    setProfileMessage(null);
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage(null);

    try {
      await API.put(`/candidates/${candidateId}`, { fullName, email, titre, telephone });
      setProfileMessage({ type: "success", text: "Profil mis à jour !" });
      loadData();
    } catch (err) {
      console.error("Erreur MAJ Profil:", err);
      setProfileMessage({ type: "danger", text: "Erreur lors de la mise à jour." });
      return;
    }

    if (cv) {
      try {
        const data = new FormData();
        data.append("file", cv);
        await API.post(`/candidates/${candidateId}/cv`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setProfileMessage({ type: "success", text: "Profil et CV mis à jour !" });
        setCv(null);
      } catch (err) {
        console.error("Erreur Upload CV:", err);
        setProfileMessage({ type: "danger", text: "Erreur lors de l'envoi du CV." });
      }
    }
  };

  return (
    <div className="container my-4">
       <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
            {candidateProfile ? `Bonjour ${candidateProfile.fullName.split(' ')[0]} 👋` : "Offres disponibles"}
        </h2>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={handleOpenProfileModal}>
            Gérer mon profil
          </button>
          <button className="btn btn-outline-secondary" onClick={() => { localStorage.clear(); window.location.reload(); }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* --- NOUVEAU : Navigation par onglets --- */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
            <button
                className={`nav-link ${view === 'OFFERS' ? 'active' : ''}`}
                onClick={() => setView('OFFERS')}
            >
                🔍 Offres d'emploi
            </button>
        </li>
        <li className="nav-item">
            <button
                className={`nav-link ${view === 'APPLICATIONS' ? 'active' : ''}`}
                onClick={() => setView('APPLICATIONS')}
            >
                📂 Mes Candidatures <span className="badge bg-secondary">{myApplications.length}</span>
            </button>
        </li>
      </ul>

      {/* --- VUE 1 : LISTE DES OFFRES (VOTRE CODE EXISTANT) --- */}
      {view === 'OFFERS' && (
        <>
            <input className="form-control mb-3"
                placeholder="Filtrer par titre / compétence / entreprise"
                value={query}
                onChange={e => setQuery(e.target.value)} />

            {candidateProfile && candidateProfile.titre && !query && (
                <div className="mb-3 text-muted small">
                    💡 Les offres sont triées par pertinence avec votre titre : <strong>{candidateProfile.titre}</strong>
                </div>
            )}

            <div className="row">
                {filtered.map(o => {
                const isMatch = candidateProfile?.titre && o.title.toLowerCase().includes(candidateProfile.titre.toLowerCase());

                const isLoading = applyingOfferId === o.id;
                const isGlobalLoading = applyingOfferId !== null;

                const hasApplied = appliedOfferIds.includes(o.id);

                return (
                <div key={o.id} className="col-md-12">
                    <div className={`card mb-4 shadow-sm ${isMatch ? 'border-primary border-2' : ''}`}>
                    <div className="card-body">

                        <div className="d-flex justify-content-between">
                            <h5 className="card-title text-primary">
                                {o.title}
                                {isMatch && <span className="badge bg-primary ms-2" style={{fontSize: '0.6em'}}>⭐ Recommandé</span>}
                            </h5>
                            <small className="text-muted">Publié le {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Récemment'}</small>
                        </div>

                        {o.rh && (
                            <div className="alert alert-light border py-2 px-3 small mb-3">
                                <strong className="text-dark">🏢 {o.rh.nomEntreprise || "Entreprise confidentielle"}</strong>
                                <div className="mt-1 text-muted">
                                    {o.rh.siteWebEntreprise && (
                                        <span className="me-3">
                                            🌐 <a href={o.rh.siteWebEntreprise} target="_blank" rel="noreferrer" className="text-decoration-none">{o.rh.siteWebEntreprise}</a>
                                        </span>
                                    )}
                                    {o.rh.adresseEntreprise && <span>📍 {o.rh.adresseEntreprise}</span>}
                                </div>
                            </div>
                        )}

                        <div className="d-flex flex-wrap gap-2 mb-3">
                        {o.skills && o.skills.split(',').filter(s => s).map(skill => (
                            <span key={skill} className="badge bg-secondary fw-normal">{skill}</span>
                        ))}
                        </div>

                        <div className="row small text-muted border-top border-bottom py-3 mb-3 mx-0 bg-light rounded">
                        <div className="col-sm-6 col-lg-3 mb-2"><strong>Contrat :</strong> {o.typeContrat || 'Non spécifié'}</div>
                        <div className="col-sm-6 col-lg-3 mb-2"><strong>Durée :</strong> {o.duree || 'Non spécifié'}</div>
                        <div className="col-sm-6 col-lg-3 mb-2"><strong>Rémunération :</strong> {o.remuneration || 'Non spécifié'}</div>
                        <div className="col-sm-6 col-lg-3 mb-2"><strong>Expérience :</strong> {o.experience || 'Non spécifié'}</div>
                        </div>

                        <p className="card-text mb-4" style={{whiteSpace: 'pre-wrap', maxHeight: '250px', overflowY: 'auto', padding: '10px'}}>
                        {o.description || 'Aucune description fournie.'}
                        </p>

                        {hasApplied ? (
                            <button className="btn btn-secondary" disabled style={{ minWidth: '180px' }}>
                                ✅ Déjà postulé
                            </button>
                        ) : (
                            <button
                            className="btn btn-success"
                            onClick={() => handleApply(o)}
                            disabled={isGlobalLoading}
                            style={{ minWidth: '180px' }}
                            >
                            {isLoading ? (
                                <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Envoi en cours...
                                </>
                            ) : (
                                "Postuler avec mon profil"
                            )}
                            </button>
                        )}

                    </div>
                    </div>
                </div>
                )})}

                {!filtered.length && (
                    <div className="text-center py-5">
                        <h5 className="text-muted">Aucune offre ne correspond à votre recherche.</h5>
                    </div>
                )}
            </div>
        </>
      )}

      {view === "APPLICATIONS" && (
              <div className="row">
                  {myApplications.length === 0 && (
                      <div className="text-center py-5 text-muted">Vous n'avez pas encore postulé.</div>
                  )}
                  {myApplications.map(app => (
                      <div key={app.evaluationId} className="col-md-6">
                          <div className="card mb-3 shadow-sm h-100">
                              <div className="card-body d-flex flex-column">
                                  <h5 className="card-title text-primary">{app.offerTitle}</h5>
                                  <h6 className="card-subtitle mb-2 text-muted">{app.companyName}</h6>
                                  <div className="mb-3">
                                      <span className={`badge ${app.status === 'ACCEPTED' ? 'bg-success' : app.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                          Statut : {app.status === 'NEW' ? 'En attente' : app.status}
                                      </span>
                                  </div>
                                  <button className="btn btn-outline-primary w-100 mt-auto" onClick={() => handleStartTraining(app)}>
                                      🤖 Entraînement à l'entretien
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
            )}

            {/* --- MODAL IA --- */}
            {showTrainingModal && trainingData && (
              <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                  <div className="modal-dialog modal-lg modal-dialog-scrollable">
                      <div className="modal-content">
                          <div className="modal-header bg-primary text-white">
                              <h5 className="modal-title">🤖 Coach IA</h5>
                              <button className="btn-close btn-close-white" onClick={() => setShowTrainingModal(false)}></button>
                          </div>
                          <div className="modal-body">
                              {trainingData.loading ? (
                                  <div className="text-center py-5"><div className="spinner-border text-primary"></div><p>Génération des questions...</p></div>
                              ) : (
                                  <div className="p-3 bg-light border rounded" dangerouslySetInnerHTML={{ __html: trainingData.questions }} />
                              )}
                          </div>
                      </div>
                  </div>
              </div>
            )}

            {/* --- MODAL PROFIL (inchangé) --- */}
            {isProfileModalOpen && (
              /* ... Votre modal profil existant ... */
              <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <form onSubmit={handleProfileUpdate}>
                        <div className="modal-header"><h5 className="modal-title">Mon Profil</h5><button type="button" className="btn-close" onClick={() => setIsProfileModalOpen(false)}></button></div>
                        <div className="modal-body">
                          <div className="mb-3"><label>Titre</label><input className="form-control" value={titre} onChange={(e) => setTitre(e.target.value)} /></div>
                          <div className="mb-3"><label>Téléphone</label><input className="form-control" value={telephone} onChange={(e) => setTelephone(e.target.value)} /></div>
                          <div className="mb-3"><label>CV (PDF)</label><input type="file" className="form-control" accept="application/pdf" onChange={(e) => setCv(e.target.files[0])} /></div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-primary" type="submit">Enregistrer</button></div>
                      </form>
                    </div>
                </div>
              </div>
            )}
          </div>
        );
      }
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { API } from "../api";

export default function RhDashboard() {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // --- États pour le formulaire de CRÉATION ---
  const [showCreateForm, setShowCreateForm] = useState(false); // <-- NOUVEAU : Gère l'affichage du formulaire
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState("");
  const [remuneration, setRemuneration] = useState("");
  const [experience, setExperience] = useState("");
  const [typeContrat, setTypeContrat] = useState("");

  const [evaluations, setEvaluations] = useState([]);

  // --- États pour LA MODIFICATION ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // --- Chargement des données ---
  const loadOffers = useCallback(async () => {
    try {
      const res = await API.get("/offers");
      setOffers(res.data);
      // Si une offre était sélectionnée, on rafraîchit ses données
      if (selectedOffer) {
        setSelectedOffer(prev => res.data.find(o => o.id === prev.id) || null);
      } else if (res.data.length > 0) {
        // Sinon, on sélectionne la première
        setSelectedOffer(res.data[0]);
      }
    } catch (err) {
      console.error("Erreur chargement offres:", err);
    }
  }, [selectedOffer]); // On garde selectedOffer pour la logique de rafraîchissement

  const loadEvaluations = useCallback(async (offerId) => {
    try {
      const res = await API.get(`/evaluations/offer/${offerId}`);
      setEvaluations(res.data);
    } catch (err) {
      console.error("Erreur chargement évaluations:", err);
      setEvaluations([]);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, []); // Chargé une seule fois au démarrage

  useEffect(() => {
    if (selectedOffer) {
      loadEvaluations(selectedOffer.id);
    } else {
      setEvaluations([]); // Vide la liste si aucune offre n'est sélectionnée
    }
  }, [selectedOffer, loadEvaluations]);


  // --- Logique de CRÉATION (Create) ---
  const createOffer = async (e) => {
    e.preventDefault();
    await API.post("/offers", {
      title,
      description,
      skills,
      duree,
      remuneration,
      experience,
      typeContrat,
    });
    // Réinitialiser le formulaire de création
    setTitle("");
    setSkills("");
    setDescription("");
    setDuree("");
    setRemuneration("");
    setExperience("");
    setTypeContrat("");
    setShowCreateForm(false); // <-- NOUVEAU : Cache le formulaire après création
    await loadOffers();
  };

  // --- Logique de SUPPRESSION (Delete) ---
  const handleDelete = async (offerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.")) {
      try {
        await API.delete(`/offers/${offerId}`);
        await loadOffers();
        if (selectedOffer?.id === offerId) {
          setSelectedOffer(null);
        }
      } catch (err) {
        console.error("Erreur suppression offre:", err);
        alert("Erreur lors de la suppression de l'offre.");
      }
    }
  };

  // --- Logique de MISE À JOUR (Update) ---
  const handleEditClick = (offer) => {
    setEditingOffer(offer);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingOffer(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingOffer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    if (!editingOffer) return;
    try {
      const res = await API.put(`/offers/${editingOffer.id}`, editingOffer);
      setOffers(prevOffers =>
        prevOffers.map(o => (o.id === editingOffer.id ? res.data : o))
      );
      if (selectedOffer?.id === editingOffer.id) {
        setSelectedOffer(res.data);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Erreur MAJ offre:", err);
      alert("Erreur lors de la mise à jour de l'offre.");
    }
  };


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

          {/* --- NOUVEAU BOUTON "NOUVELLE OFFRE" --- */}
          {!showCreateForm && (
            <div className="d-grid mb-3">
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                + Nouvelle Offre
              </button>
            </div>
          )}
          {/* --- FIN NOUVEAU BOUTON --- */}


          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Offres d’emploi</h5>
              <ul className="list-group">

                {/* --- LISTE SIMPLIFIÉE (sans les boutons) --- */}
                {offers.map(o => (
                  <li
                    key={o.id}
                    style={{ cursor: "pointer" }}
                    className={`list-group-item list-group-item-action ${selectedOffer?.id === o.id ? "active text-white" : ""}`}
                    onClick={() => setSelectedOffer(o)}
                  >
                    <strong>{o.title}</strong>
                    <div className="small">{o.skills}</div>
                  </li>
                ))}
                {/* --- FIN LISTE SIMPLIFIÉE --- */}

              </ul>
            </div>
          </div>

          {/* --- FORMULAIRE DE CRÉATION (maintenant conditionnel) --- */}
          {showCreateForm && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Créer une offre</h5>
                <form onSubmit={createOffer}>
                  <input className="form-control mb-2" placeholder="Titre" value={title} onChange={e=>setTitle(e.target.value)} required/>
                  <input className="form-control mb-2" placeholder="Compétences (ex: Java,React)" value={skills} onChange={e=>setSkills(e.target.value)}/>
                  <textarea className="form-control mb-2" placeholder="Description" rows="4"
                            value={description} onChange={e=>setDescription(e.target.value)}/>

                  <input className="form-control mb-2" placeholder="Type de contrat (ex: Stage, CDI...)" value={typeContrat} onChange={e => setTypeContrat(e.target.value)} />
                  <input className="form-control mb-2" placeholder="Durée (ex: 6 mois)" value={duree} onChange={e => setDuree(e.target.value)} />
                  <input className="form-control mb-2" placeholder="Rémunération (ex: 1000€/mois)" value={remuneration} onChange={e => setRemuneration(e.target.value)} />
                  <input className="form-control mb-2" placeholder="Expérience (ex: 2 ans min)" value={experience} onChange={e => setExperience(e.target.value)} />

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">Créer</button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* --- FIN FORMULAIRE DE CRÉATION --- */}
        </div>

        {/* Colonne Détails de l'offre et Candidats */}
        <div className="col-md-7">
          <div className="card">
            <div className="card-body">

              {/* --- SECTION : DÉTAILS DE L'OFFRE --- */}
              {selectedOffer ? (
                <div className="mb-4">

                  {/* --- NOUVEAU : TITRE + BOUTONS D'ACTION --- */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 className="mb-0">{selectedOffer.title}</h4>
                    <div className="d-flex gap-2 flex-shrink-0">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="Modifier l'offre"
                        onClick={() => handleEditClick(selectedOffer)}
                      >
                        {/* Icône SVG Stylo */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V12h2.293z"/>
                        </svg>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Supprimer l'offre"
                        onClick={() => handleDelete(selectedOffer.id)}
                      >
                        {/* Icône SVG Poubelle */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* --- FIN TITRE + BOUTONS --- */}


                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {selectedOffer.skills && selectedOffer.skills.split(',').filter(s => s).map(skill => (
                      <span key={skill} className="badge bg-primary fw-normal">{skill}</span>
                    ))}
                  </div>

                  <div className="row small text-muted border-top border-bottom py-3 mb-3">
                    <div className="col-sm-6 mb-2">
                      <strong>Contrat :</strong> {selectedOffer.typeContrat || 'Non spécifié'}
                    </div>
                    <div className="col-sm-6 mb-2">
                      <strong>Durée :</strong> {selectedOffer.duree || 'Non spécifié'}
                    </div>
                    <div className="col-sm-6 mb-2">
                      <strong>Rémunération :</strong> {selectedOffer.remuneration || 'Non spécifié'}
                    </div>
                    <div className="col-sm-6 mb-2">
                      <strong>Expérience :</strong> {selectedOffer.experience || 'Non spécifié'}
                    </div>
                  </div>

                  <h6 className="card-subtitle mb-2">Description du poste</h6>
                  <p
                    className="card-text"
                    style={{
                      whiteSpace: 'pre-wrap',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '5px'
                    }}
                  >
                    {selectedOffer.description || 'Aucune description fournie.'}
                  </p>

                  <hr />
                  <h5>Candidatures reçues</h5>
                </div>
              ) : (
                <h5 className="text-muted">Sélectionnez une offre pour voir les détails et les candidatures.</h5>
              )}
              {/* --- FIN DE LA SECTION DÉTAILS --- */}


              {selectedOffer && evaluations.length > 0 && (
                <ul className="list-group">
                  {evaluations
                    .sort((a, b) => b.score - a.score)
                    .map(evalData => (
                      <li key={evalData.candidateId} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{evalData.candidateName}</strong>
                          <div className="text-muted small">{evalData.email}</div>
                          <a href={`http://localhost:8080/api/candidates/${evalData.candidateId}/cv`} target="_blank" rel="noopener noreferrer">
                              Voir CV
                          </a>
                        </div>
                        <span className={`badge fs-6 ${evalData.score > 75 ? "bg-success" : evalData.score > 50 ? "bg-warning text-dark" : "bg-danger"}`}>
                          Score IA : {evalData.score}/100
                        </span>
                      </li>
                  ))}
                </ul>
              )}

              {selectedOffer && !evaluations.length && (
                <div className="text-muted">Aucun candidat n'a encore postulé à cette offre.</div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE MODIFICATION (inchangé) --- */}
      {isEditModalOpen && editingOffer && (
        <>
          <div className="modal-backdrop fade show" style={{ display: 'block' }}></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleUpdateOffer}>
                  <div className="modal-header">
                    <h5 className="modal-title">Modifier l'offre</h5>
                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-2">
                      <label className="form-label small">Titre</label>
                      <input className="form-control" name="title" value={editingOffer.title} onChange={handleEditFormChange} required/>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small">Compétences</label>
                      <input className="form-control" name="skills" value={editingOffer.skills || ''} onChange={handleEditFormChange}/>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small">Description</label>
                      <textarea className="form-control" name="description" rows="5" value={editingOffer.description || ''} onChange={handleEditFormChange}/>
                    </div>
                    <hr/>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <label className="form-label small">Type de contrat</label>
                        <input className="form-control" name="typeContrat" value={editingOffer.typeContrat || ''} onChange={handleEditFormChange}/>
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label small">Durée</label>
                        <input className="form-control" name="duree" value={editingOffer.duree || ''} onChange={handleEditFormChange}/>
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label small">Rémunération</label>
                        <input className="form-control" name="remuneration" value={editingOffer.remuneration || ''} onChange={handleEditFormChange}/>
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label small">Expérience</label>
                        <input className="form-control" name="experience" value={editingOffer.experience || ''} onChange={handleEditFormChange}/>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button typebutton="button" className="btn btn-secondary" onClick={handleCloseModal}>Annuler</button>
                    <button type="submit" className="btn btn-primary">Enregistrer</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      {/* --- FIN DU MODAL --- */}

    </div>
  );
}
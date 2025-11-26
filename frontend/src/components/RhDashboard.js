import React, { useEffect, useState, useCallback } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import RhNotifications from "./RhNotifications";

export default function RhDashboard() {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const [rhId] = useState(localStorage.getItem("userId"));
  const navigate = useNavigate();

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState("");
  const [remuneration, setRemuneration] = useState("");
  const [experience, setExperience] = useState("");
  const [typeContrat, setTypeContrat] = useState("");

  const [evaluations, setEvaluations] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const loadOffers = useCallback(async () => {
    if (!rhId) return;
    try {
      const res = await API.get(`/offers/rh/${rhId}`);
      setOffers(res.data);

      if (selectedOffer) {
        const stillExists = res.data.find(o => o.id === selectedOffer.id);
        setSelectedOffer(stillExists || null);
      }
    } catch (err) {
      console.error("Erreur chargement offres:", err);
    }
  }, [rhId, selectedOffer]);

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
  }, [rhId]);

  useEffect(() => {
    if (selectedOffer) {
      loadEvaluations(selectedOffer.id);
    } else {
      setEvaluations([]);
    }
  }, [selectedOffer, loadEvaluations]);

  const createOffer = async (e) => {
    e.preventDefault();
    try {
      await API.post("/offers", {
        title,
        description,
        skills,
        duree,
        remuneration,
        experience,
        typeContrat,
        rhId: rhId
      });

      setTitle(""); setSkills(""); setDescription("");
      setDuree(""); setRemuneration(""); setExperience(""); setTypeContrat("");
      setShowCreateForm(false);

      await loadOffers();
    } catch (err) {
      console.error("Erreur création:", err);
      alert("Erreur lors de la création de l'offre");
    }
  };

  const handleDelete = async (offerId) => {
    if (window.confirm("Supprimer cette offre ?")) {
      try {
        await API.delete(`/offers/${offerId}`);
        if (selectedOffer?.id === offerId) setSelectedOffer(null);
        await loadOffers();
      } catch (err) {
        console.error(err);
        alert("Erreur suppression.");
      }
    }
  };

  const handleEditClick = (offer) => { setEditingOffer(offer); setIsEditModalOpen(true); };
  const handleCloseModal = () => { setIsEditModalOpen(false); setEditingOffer(null); };
  const handleEditFormChange = (e) => { const { name, value } = e.target; setEditingOffer(prev => ({ ...prev, [name]: value })); };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    try {
        const payload = { ...editingOffer, rhId: rhId };
        await API.put(`/offers/${editingOffer.id}`, payload);
        handleCloseModal();
        await loadOffers();
    } catch(err) { console.error(err); alert("Erreur MAJ"); }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>👔 Espace RH</h2>
        <div className="d-flex align-items-center">
            <RhNotifications />
            <button className="btn btn-primary ms-3 me-2" onClick={() => navigate("/rh/kanban")}>
                📊 Voir Workflow Kanban
            </button>
            <button className="btn btn-outline-secondary" onClick={() => { localStorage.clear(); window.location.reload(); }}>
                Déconnexion
            </button>
        </div>
      </div>

      <div className="row">
        {/* Colonne GAUCHE : Liste des offres */}
        <div className="col-md-5">
          {!showCreateForm && (
            <div className="d-grid mb-3">
              <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>+ Nouvelle Offre</button>
            </div>
          )}

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Mes Offres</h5>
              <ul className="list-group">
                {offers.length === 0 && <li className="list-group-item text-muted">Aucune offre créée.</li>}
                {offers.map(o => (
                  <li key={o.id}
                      style={{ cursor: "pointer" }}
                      className={`list-group-item list-group-item-action ${selectedOffer?.id === o.id ? "active text-white" : ""}`}
                      onClick={() => setSelectedOffer(o)}>
                    <strong>{o.title}</strong>
                    <div className="small">{o.skills}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {showCreateForm && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Créer une offre</h5>
                <form onSubmit={createOffer}>
                  <input className="form-control mb-2" placeholder="Titre" value={title} onChange={e=>setTitle(e.target.value)} required/>
                  <input className="form-control mb-2" placeholder="Compétences (ex: Java)" value={skills} onChange={e=>setSkills(e.target.value)}/>
                  <textarea className="form-control mb-2" placeholder="Description" rows="3" value={description} onChange={e=>setDescription(e.target.value)}/>
                  <div className="row g-2">
                    <div className="col-6"><input className="form-control mb-2" placeholder="Contrat" value={typeContrat} onChange={e => setTypeContrat(e.target.value)} /></div>
                    <div className="col-6"><input className="form-control mb-2" placeholder="Durée" value={duree} onChange={e => setDuree(e.target.value)} /></div>
                    <div className="col-6"><input className="form-control mb-2" placeholder="Rémunération" value={remuneration} onChange={e => setRemuneration(e.target.value)} /></div>
                    <div className="col-6"><input className="form-control mb-2" placeholder="Expérience" value={experience} onChange={e => setExperience(e.target.value)} /></div>
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <button type="submit" className="btn btn-primary">Créer</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Annuler</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Colonne DROITE : Détails & Candidats */}
        <div className="col-md-7">
          <div className="card">
            <div className="card-body">
              {selectedOffer ? (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h4 className="mb-0">{selectedOffer.title}</h4>
                    <div className="btn-group">
                       <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(selectedOffer)}>✎</button>
                       <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(selectedOffer.id)}>🗑</button>
                    </div>
                  </div>

                  {selectedOffer.rh && (
                    <div className="alert alert-info py-2 px-3 small mb-3">
                        <strong>Entreprise :</strong> {selectedOffer.rh.nomEntreprise || "Non spécifié"} <br/>
                        {selectedOffer.rh.siteWebEntreprise && <span>🌐 <a href={selectedOffer.rh.siteWebEntreprise} target="_blank" rel="noreferrer">{selectedOffer.rh.siteWebEntreprise}</a> &nbsp;</span>}
                        {selectedOffer.rh.adresseEntreprise && <span>📍 {selectedOffer.rh.adresseEntreprise}</span>}
                    </div>
                  )}

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {selectedOffer.skills && selectedOffer.skills.split(',').map(s => <span key={s} className="badge bg-primary fw-normal">{s}</span>)}
                  </div>

                  <div className="row small text-muted border-top border-bottom py-2 mb-3">
                    <div className="col-6"><strong>Contrat:</strong> {selectedOffer.typeContrat}</div>
                    <div className="col-6"><strong>Durée:</strong> {selectedOffer.duree}</div>
                    <div className="col-6"><strong>Salaire:</strong> {selectedOffer.remuneration}</div>
                    <div className="col-6"><strong>Exp:</strong> {selectedOffer.experience}</div>
                  </div>

                  <p className="bg-light p-2 rounded" style={{whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto'}}>
                    {selectedOffer.description}
                  </p>

                  <hr/>
                  <h5>Candidatures ({evaluations.length})</h5>
                  <ul className="list-group list-group-flush">
                    {evaluations.length === 0 && <li className="list-group-item text-muted">Aucun candidat.</li>}
                    {evaluations.sort((a, b) => b.score - a.score).map(ev => (
                      <li key={ev.candidateId} className="list-group-item d-flex justify-content-between align-items-center">
                         <div>
                            <strong>{ev.candidateName}</strong> <br/>
                            {ev.titre && <span className="badge bg-light text-dark ms-2 border">{ev.titre}</span>}
                            <div className="small text-muted mt-1">
                                    📧 {ev.email}
                                    {ev.telephone && <span className="ms-3">📞 {ev.telephone}</span>}
                                </div>
                            <a href={`http://localhost:8080/api/candidates/${ev.candidateId}/cv`} target="_blank" rel="noreferrer" className="small">Voir CV</a>
                         </div>
                         <span className={`badge ${ev.score > 70 ? 'bg-success' : ev.score > 40 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                           Score: {ev.score}/100
                         </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-center text-muted py-5">Sélectionnez une offre pour voir les détails.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {isEditModalOpen && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header"><h5 className="modal-title">Modifier</h5></div>
                    <div className="modal-body">
                        <form id="editForm" onSubmit={handleUpdateOffer}>
                            <input className="form-control mb-2" name="title" value={editingOffer.title} onChange={handleEditFormChange} />
                            <textarea className="form-control mb-2" name="description" rows="5" value={editingOffer.description} onChange={handleEditFormChange} />
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={handleCloseModal}>Annuler</button>
                        <button className="btn btn-primary" form="editForm">Enregistrer</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
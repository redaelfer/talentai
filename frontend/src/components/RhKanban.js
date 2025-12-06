import React, { useEffect, useState, useCallback } from "react";
import { API } from "../api";
import { useNavigate, useLocation } from "react-router-dom";

export default function RhKanban() {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [rhId] = useState(() => localStorage.getItem("userId"));

  const navigate = useNavigate();
  const location = useLocation();

  const [evaluations, setEvaluations] = useState([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedCandidateAi, setSelectedCandidateAi] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const loadOffers = useCallback(async () => {
    if (!rhId) return;
    try {
      const res = await API.get(`/offers/rh/${rhId}`);
      setOffers(res.data);
    } catch (err) { console.error(err); }
  }, [rhId]);

  const loadEvaluations = useCallback(async (offerId) => {
    if (!offerId) return;
    try {
      const res = await API.get(`/evaluations/offer/${offerId}`);
      setEvaluations(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    if (offers.length > 0 && location.state?.offerId) {
        const preSelected = offers.find(o => o.id === location.state.offerId);
        if (preSelected) {
            setSelectedOffer(preSelected);
        }
    }
  }, [offers, location.state]);

  useEffect(() => {
    if (selectedOffer) loadEvaluations(selectedOffer.id);
    else setEvaluations([]);
  }, [selectedOffer, loadEvaluations]);

  const changeStatus = async (evalId, newStatus) => {
    try {
      await API.put(`/evaluations/${evalId}/status`, newStatus, {
          headers: { 'Content-Type': 'application/json' }
      });
      setEvaluations(prev => prev.map(ev => ev.id === evalId ? { ...ev, status: newStatus } : ev));
    } catch (err) { console.error(err); }
  };

  const handleGenerateSummary = async (e, evalData) => {
    e.stopPropagation();
    if (evalData.summary) return;

    try {
        const res = await API.post(`/evaluations/${evalData.id}/summary`);
        setEvaluations(prev => prev.map(ev => ev.id === evalData.id ? { ...ev, summary: res.data } : ev));
    } catch (err) { console.error(err); }
  };

  const handleGenerateQuestions = async (evalData) => {
    setSelectedCandidateAi(evalData);
    setShowAiModal(true);

    if (!evalData.interviewQuestions) {
        setAiLoading(true);
        try {
            const res = await API.post(`/evaluations/${evalData.id}/questions`);
            const newQuestions = res.data;
            setEvaluations(prev => prev.map(ev => ev.id === evalData.id ? { ...ev, interviewQuestions: newQuestions } : ev));
            setSelectedCandidateAi(prev => ({ ...prev, interviewQuestions: newQuestions }));
        } catch (err) { console.error(err); }
        finally { setAiLoading(false); }
    }
  };

  const columns = [
    { id: "NEW", title: "✨ Nouveaux", color: "bg-light" },
    { id: "INTERVIEW", title: "📅 Entretien", color: "bg-info-subtle" },
    { id: "ACCEPTED", title: "✅ Retenu", color: "bg-success-subtle" },
    { id: "REJECTED", title: "❌ Rejeté", color: "bg-danger-subtle" }
  ];

  return (
    <div className="container-fluid my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
            <button className="btn btn-outline-secondary me-3" onClick={() => navigate("/rh")}>
                ⬅ Retour
            </button>
            <h2 className="mb-0">🚀 Workflow Recrutement</h2>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => { localStorage.clear(); window.location.reload(); }}>Déconnexion</button>
      </div>

      <div className="mb-4">
        <select
            className="form-select"
            value={selectedOffer ? selectedOffer.id : ""}
            onChange={(e) => {
                const offer = offers.find(o => o.id === parseInt(e.target.value));
                setSelectedOffer(offer || null);
            }}
        >
            <option value="">-- Choisir une offre pour voir le tableau --</option>
            {offers.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
        </select>
      </div>

      {selectedOffer ? (
        <div className="row g-3">
            {columns.map(col => (
                <div key={col.id} className="col-md-3">
                    <div className={`card h-100 ${col.color} border-0 shadow-sm`}>
                        <div className="card-header bg-transparent fw-bold text-uppercase small border-0">
                            {col.title} ({evaluations.filter(e => e.status === col.id).length})
                        </div>
                        <div className="card-body p-2" style={{minHeight: '400px', maxHeight: '70vh', overflowY: 'auto'}}>
                            {evaluations.filter(e => e.status === col.id).map(ev => (
                                <div key={ev.id} className="card mb-2 border-0 shadow-sm">
                                    <div className="card-body p-2">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h6 className="card-title mb-1">{ev.candidateName}</h6>
                                            <span className={`badge ${ev.score > 70 ? 'bg-success' : 'bg-warning text-dark'}`}>{ev.score}</span>
                                        </div>
                                        <div className="small text-muted mb-1">{ev.titre}</div>

                                        {ev.skills && (
                                            <div className="mb-2" style={{fontSize: '0.75rem', color: '#555'}}>
                                                <strong>Exp:</strong> {ev.yearsOfExperience} ans <br/>
                                                <strong>Skills:</strong> {JSON.parse(ev.skills || "[]").slice(0, 3).join(", ")}...
                                            </div>
                                        )} 

                                        {ev.summary ? (
                                            <div className="alert alert-secondary p-1 mb-2 small" style={{fontSize: '0.75em', lineHeight: '1.2'}}>
                                                🤖 {ev.summary}
                                            </div>
                                        ) : (
                                            <button className="btn btn-sm btn-link text-decoration-none p-0 mb-2 small" onClick={(e) => handleGenerateSummary(e, ev)}>
                                                ✨ Générer résumé IA
                                            </button>
                                        )}

                                        <a href={`http://localhost:8080/api/candidates/${ev.candidateId}/cv`} target="_blank" rel="noreferrer" className="d-block small mb-2">📄 Voir CV</a>

                                        <div className="d-grid gap-1">
                                            <button className="btn btn-sm btn-outline-dark" onClick={() => handleGenerateQuestions(ev)}>🤖 Questions Entretien</button>
                                            <div className="btn-group btn-group-sm">
                                                {col.id !== 'INTERVIEW' && <button className="btn btn-outline-info" onClick={() => changeStatus(ev.id, 'INTERVIEW')}>📅</button>}
                                                {col.id !== 'ACCEPTED' && <button className="btn btn-outline-success" onClick={() => changeStatus(ev.id, 'ACCEPTED')}>✅</button>}
                                                {col.id !== 'REJECTED' && <button className="btn btn-outline-danger" onClick={() => changeStatus(ev.id, 'REJECTED')}>❌</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      ) : <div className="text-center py-5 text-muted"><h4>Sélectionnez une offre pour afficher le tableau.</h4></div>}

      {showAiModal && selectedCandidateAi && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header"><h5 className="modal-title">🤖 Assistant IA</h5><button className="btn-close" onClick={() => setShowAiModal(false)}></button></div>
                    <div className="modal-body">
                        {aiLoading ? <div className="text-center"><div className="spinner-border text-primary"></div><p>L'IA analyse le CV...</p></div> :
                        <div dangerouslySetInnerHTML={{ __html: selectedCandidateAi.interviewQuestions || "Erreur." }} className="p-3 bg-light border rounded"/>}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
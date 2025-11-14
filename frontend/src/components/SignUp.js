import React, { useState } from "react";
import axios from "axios";

export default function SignUp({ onBackToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ROLE_CANDIDAT");
  const [message, setMessage] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        username,
        email,
        password,
        role,
      });
      setMessage({ type: "success", text: "✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter." });
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage({ type: "danger", text: "❌ Erreur : " + (err.response?.data || "Impossible de créer le compte") });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 480 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="text-center mb-4">Créer un compte</h3>

          {message && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.text}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Nom d’utilisateur</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Adresse e-mail</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Rôle</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ROLE_CANDIDAT">Candidat</option>
                <option value="ROLE_RH">Ressources Humaines (RH)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              S’inscrire
            </button>
          </form>

          <div className="text-center mt-3">
            <button className="btn btn-link" onClick={onBackToLogin}>
              ⬅ Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

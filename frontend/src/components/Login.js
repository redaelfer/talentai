import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin, onSignUp }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ROLE_CANDIDAT");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });

      // --- CORRECTION AJOUTÉE ---
      // Vérification que le backend renvoie bien les données attendues
      if (!res.data.userId) {
        alert("❌ Erreur: L'ID utilisateur (userId) est manquant dans la réponse du serveur. Le backend doit renvoyer { role, username, userId }.");
        return;
      }
      // --- Fin de la correction ---

      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("userId", res.data.userId); // <- Donnée cruciale

      onLogin(res.data.role);
    } catch (err) {
      alert("❌ " + (err.response?.data || "Erreur de connexion"));
    }
  };


  const handleRegister = async () => {
    // Note: Ce handleRegister est simple et ne connecte pas l'utilisateur.
    // L'utilisateur devra se connecter après s'être inscrit.
    // C'est correct pour l'instant, mais votre 'SignUp.js' fait un meilleur travail.
    await axios.post("http://localhost:8080/api/auth/register", {
      username,
      email: `${username}@example.com`,
      password,
      role,
    });
    alert("Compte créé ! Vous pouvez vous connecter.");
  };

  return (
    <div className="container text-center mt-5">
      <h2>Connexion / Inscription</h2>
      <input className="form-control mt-3" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="form-control mt-3" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
      <select className="form-select mt-3" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="ROLE_CANDIDAT">Candidat</option>
        <option value="ROLE_RH">RH</option>
      </select>
      <div className="mt-3">
        <button className="btn btn-primary me-2" onClick={handleLogin}>Se connecter</button>
        <button className="btn btn-secondary" onClick={onSignUp}>Créer un compte</button>
      </div>
    </div>
  );
}

export default Login;
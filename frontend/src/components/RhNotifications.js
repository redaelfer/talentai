import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function RhNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const rhId = localStorage.getItem("userId");

  useEffect(() => {
    if (!rhId) return;

    // Configuration du client STOMP moderne
    const client = new Client({
      // Utilisation de SockJS comme transport (car le backend a .withSockJS())
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),

      // Fonction appelée lors de la connexion réussie
      onConnect: () => {
        console.log("Connecté aux notifications !");
        client.subscribe(`/topic/rh/${rhId}/notifications`, (message) => {
          if (message.body) {
            const notif = JSON.parse(message.body);
            setNotifications((prev) => [notif, ...prev]);
          }
        });
      },
      // Options de reconnexion automatique
      reconnectDelay: 5000,
      // debug: (str) => console.log(str), // Décommentez pour voir les logs
    });

    // Activer la connexion
    client.activate();

    // Nettoyage lors du démontage du composant
    return () => {
      client.deactivate();
    };
  }, [rhId]);

  return (
    <div className="position-relative d-inline-block ms-2">
      {/* --- BOUTON CLOCHE --- */}
      <button
        className="btn btn-light position-relative border"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {notifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notifications.length}
          </span>
        )}
      </button>

      {/* --- LISTE DÉROULANTE --- */}
      {isOpen && (
        <div
            className="card position-absolute end-0 mt-2 shadow"
            style={{ width: "320px", zIndex: 1000 }}
        >
          <div className="card-header d-flex justify-content-between align-items-center bg-white">
            <strong className="small">Notifications</strong>
            <button className="btn btn-sm btn-link text-decoration-none p-0" onClick={() => setNotifications([])}>Tout lu</button>
          </div>
          <div className="list-group list-group-flush" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div className="list-group-item text-center text-muted small py-3">
                Aucune nouvelle notification
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between align-items-center">
                    <small className="text-primary fw-bold">Nouveau Candidat !</small>
                    {n.score > 70 && <span className="badge bg-success">Top Profil</span>}
                  </div>
                  <p className="mb-1 small mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
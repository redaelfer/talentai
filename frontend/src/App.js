import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import RhDashboard from "./components/RhDashboard";
import CandidateDashboard from "./components/CandidateDashboard";
import CandidateProfile from "./components/CandidateProfile";

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [page, setPage] = useState("login");

  return (
    <BrowserRouter>
      <Routes>
        {!role && (
          <>
            {page === "login" && (
              <Route
                path="*"
                element={<Login onLogin={setRole} onSignUp={() => setPage("signup")} />}
              />
            )}
            {page === "signup" && (
              <Route
                path="*"
                element={<SignUp onBackToLogin={() => setPage("login")} />}
              />
            )}
          </>
        )}
        {role === "ROLE_RH" && <Route path="*" element={<RhDashboard />} />}
        {role === "ROLE_CANDIDAT" && (
          <>
            <Route path="/" element={<CandidateDashboard />} />
            <Route path="/profile" element={<CandidateProfile />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

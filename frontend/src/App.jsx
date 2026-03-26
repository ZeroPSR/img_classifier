import React, { useState } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Annotation from "./components/annotation/Annotation";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return showRegister ? (
      <Register onRegisterSuccess={() => setShowRegister(false)} switchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLoginSuccess={setUser} switchToRegister={() => setShowRegister(true)} />
    );
  }

  if (activeProject) {
    return <Annotation project={activeProject} onBack={() => setActiveProject(null)} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} onOpenProject={setActiveProject} />;
}

export default App;
import React, { useState } from "react";
import Login from "./components/auth/login";
import Register from "./components/auth/Register";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    return showRegister ? (
      <Register
        onRegisterSuccess={() => setShowRegister(false)}
        switchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login onLoginSuccess={setUser} switchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      Welcome, {user.name}!
    </div>
  );
}

export default App;
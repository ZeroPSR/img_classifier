import React, { useState } from "react";

export default function Register({ onRegisterSuccess, switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = { name, email };
    localStorage.setItem("user", JSON.stringify(user));
    onRegisterSuccess();
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", borderRadius: "10px", boxShadow: "0 0 15px rgba(0,0,0,0.2)", textAlign: "center" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <span style={{ color: "#007bff", cursor: "pointer" }} onClick={switchToLogin}>Login</span></p>
    </div>
  );
}
import React, { useState } from "react";

export default function Login({ onLoginSuccess, switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Dummy login (replace with backend API call)
    if (email === "user@example.com" && password === "123456") {
      const user = { name: "Demo User", email };
      localStorage.setItem("user", JSON.stringify(user));
      onLoginSuccess(user);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", borderRadius: "10px", boxShadow: "0 0 15px rgba(0,0,0,0.2)", textAlign: "center" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <span style={{ color: "#007bff", cursor: "pointer" }} onClick={switchToRegister}>Sign Up</span></p>
    </div>
  );
}
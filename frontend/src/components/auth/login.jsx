import React, { useState } from "react";

export default function Login({ onLoginSuccess, switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Dummy login
    if (email === "user@example.com" && password === "123456") {
      const user = { name: "Demo User", email };
      localStorage.setItem("user", JSON.stringify(user));
      onLoginSuccess(user);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      <p style={styles.switchText}>
        Don't have an account?{" "}
        <span style={styles.link} onClick={switchToRegister}>
          Sign Up
        </span>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 0 15px rgba(0,0,0,0.2)",
    backgroundColor: "#fff",
    textAlign: "center",
  },
  title: { marginBottom: "20px", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
    transition: "0.3s",
  },
  error: { color: "red", fontSize: "14px" },
  switchText: { marginTop: "15px", fontSize: "14px", color: "#555" },
  link: { color: "#007bff", cursor: "pointer" },
};
import React, { useState } from "react";

export default function Register({ onRegisterSuccess, switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (name && email && password) {
      const user = { name, email };
      localStorage.setItem("user", JSON.stringify(user));
      onRegisterSuccess();
    } else {
      setError("Please fill all fields");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styles.input}
        />
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
          Sign Up
        </button>
      </form>
      <p style={styles.switchText}>
        Already have an account?{" "}
        <span style={styles.link} onClick={switchToLogin}>
          Login
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
    backgroundColor: "#28a745",
    color: "white",
    cursor: "pointer",
    transition: "0.3s",
  },
  error: { color: "red", fontSize: "14px" },
  switchText: { marginTop: "15px", fontSize: "14px", color: "#555" },
  link: { color: "#007bff", cursor: "pointer" },
};
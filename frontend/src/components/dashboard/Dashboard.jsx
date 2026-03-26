import React, { useState } from "react";

export default function Dashboard({ user, onLogout, onOpenProject }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const project = { name: newProjectName, id: Date.now() };
    setProjects([...projects, project]);
    setNewProjectName("");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
      <h2>Welcome, {user.name}!</h2>
      <button onClick={onLogout} style={{ backgroundColor: "red", color: "white", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>Logout</button>

      <div style={{ margin: "20px 0" }}>
        <input type="text" placeholder="New Project Name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
        <button onClick={handleCreateProject}>Create Project</button>
      </div>

      <h3>Your Projects:</h3>
      {projects.length === 0 ? <p>No projects yet!</p> :
        <ul style={{ listStyle: "none", padding: 0 }}>
          {projects.map(p => (
            <li key={p.id} style={{ padding: "10px", borderBottom: "1px solid #ccc", cursor: "pointer", color: "#007bff" }} onClick={() => onOpenProject(p)}>
              {p.name}
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
import { useState } from "react";
import "./Login.css";

const demoUsers = ["Ram", "Shyam", "Rahul", "Priya"];

function Login({ setUsername }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const input = name.trim();

    if (!input) {
      setError("Please enter a username");
      return;
    }

    const user = demoUsers.find(
      (u) => u.toLowerCase() === input.toLowerCase()
    );

    if (!user) {
      setError("User not found");
      return;
    }

    setUsername(user);
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>Chatting_App</h1>

        <p>Connect and start chatting instantly.</p>

        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleLogin}>
          Join Chat
        </button>

      </div>
    </div>
  );
}

export default Login;
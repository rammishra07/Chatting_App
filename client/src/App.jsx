import { useEffect, useState } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import socket from "./services/socket";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    if (username) {
      socket.emit("login", username);
    }
  }, [username]);

  if (!username) {
    return <Login setUsername={setUsername} />;
  }

  return (
    <div className="app">
      <Sidebar
        username={username}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <ChatWindow
        username={username}
        selectedUser={selectedUser}
      />
    </div>
  );
}

export default App;
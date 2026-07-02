import { useEffect, useState } from "react";
import socket from "../services/socket";
import "./Sidebar.css";

function Sidebar({ username, selectedUser, setSelectedUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handleUserList = (users) => {
      setUsers(users);
    };

    socket.on("userList", handleUserList);

    return () => {
      socket.off("userList", handleUserList);
    };
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chatting_App</h2>
      </div>

      <div className="user-list">
        {users.map((user) => (
          <div
            key={user}
            className={`user-item ${
              selectedUser === user ? "active" : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            <div className="avatar">
              {user.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <span>{user}</span>
              <small>Click to chat</small>
            </div>
          </div>
        ))}
      </div>

      {/* Logged in user */}
      <div className="current-user">
        <div className="avatar">
          {username.charAt(0).toUpperCase()}
        </div>

        <div className="user-info">
          <span>{username}</span>
          <small className="online-status">
            ● Online
          </small>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
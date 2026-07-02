import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";
import "./ChatWindow.css";

function ChatWindow({ username, selectedUser }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});

  const bottomRef = useRef(null);

  const chatKey = selectedUser.toLowerCase();

  // Load history
  useEffect(() => {
    if (!selectedUser) return;

    socket.emit("getConversation", {
      sender: username,
      receiver: selectedUser,
    });
  }, [selectedUser, username]);

  // Receive history
  useEffect(() => {
    const handleHistory = (history) => {
      if (!selectedUser) return;

      setMessages((prev) => ({
        ...prev,
        [selectedUser.toLowerCase()]: history,
      }));
    };

    socket.on("conversationHistory", handleHistory);

    return () =>
      socket.off("conversationHistory", handleHistory);
  }, [selectedUser]);

  // Receive new messages
  useEffect(() => {
    const handleMessage = (msg) => {
      const other =
        msg.sender.toLowerCase() === username.toLowerCase()
          ? msg.receiver.toLowerCase()
          : msg.sender.toLowerCase();

      setMessages((prev) => ({
        ...prev,
        [other]: [...(prev[other] || []), msg],
      }));
    };

    socket.on("receiveMessage", handleMessage);

    return () =>
      socket.off("receiveMessage", handleMessage);
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, selectedUser]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    socket.emit("sendMessage", {
      sender: username,
      receiver: selectedUser,
      text: message,
    });

    setMessage("");
  };

  const currentChat = messages[chatKey] || [];

  if (!selectedUser) {
    return (
      <div className="chat-window empty-chat">
        <h2>Select a user to start chatting</h2>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{selectedUser}</h3>
      </div>

      <div className="messages">
        {currentChat.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender.toLowerCase() === username.toLowerCase()
                ? "message sent"
                : "message received"
            }
          >
            <div>{msg.text}</div>
            <small>{msg.time}</small>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="message-input">
        <input
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
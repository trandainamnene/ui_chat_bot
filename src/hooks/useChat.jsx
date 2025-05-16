import { useEffect, useRef, useState } from "react";
import { getImageBase64, createSummary } from "../utils/helpers";

export function useChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const inputFile = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLogin(true);
      return;
    }

    fetch("http://localhost:8080/chat-history", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(res => res.ok ? res.json() : [])
      .then(setRecentChats)
      .catch(() => setRecentChats([]));
  }, [showLogin]);

  const onFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (inputFile.current) inputFile.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Refactor phần xử lý gửi tin nhắn ở đây...
  };

  const fetchChatDetails = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8080/question/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    const formatted = data.flatMap(d => [
      { sender: "user", text: d.questiontext },
      { sender: "bot", text: d.responsetext }
    ]);
    setMessages(formatted);
    setSelectedChat(id);
  };

  return {
    input, setInput,
    messages, setMessages,
    isStreaming, setIsStreaming,
    handleSubmit,
    showLogin, setShowLogin,
    selectedImage, setSelectedImage,
    onFileSelect,
    handleRemoveImage,
    recentChats,
    fetchChatDetails,
    selectedChat,
    inputFile
  };
}
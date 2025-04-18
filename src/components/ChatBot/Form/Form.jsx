import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
export default function ChatForm() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage, { sender: "bot", text: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("http://localhost:5000/generative_ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "bot", text: accumulated };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "bot", text: "Lỗi khi streaming." };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="d-flex vw-100">
            <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <div className="border rounded p-3 mb-3 bg-light" style={{ height: "300px", overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.sender === "user" ? "text-end" : "text-start"}`}>
            <span className={`fw-bold ${msg.sender === "user" ? "text-primary" : "text-success"}`}>
              {msg.sender === "user" ? "Bạn: " : "Bot: "}
            </span>
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
        />
        <button type="submit" className="btn btn-primary" disabled={isStreaming}>
          {isStreaming ? "Đang gửi..." : "Gửi"}
        </button>
      </form>
      </div>
    </div>
  );
}

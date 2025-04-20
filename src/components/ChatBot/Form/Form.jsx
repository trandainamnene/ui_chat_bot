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
      // eslint-disable-next-line no-unused-vars
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
      <div className="d-flex flex-column vw-100 vh-100 chatContainer align-items-center" style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        backgroundAttachment: "fixed"
      }}>
        <div className="container my-4 py-2 d-flex flex-column" style={{ maxWidth: "1000px", height: "95%" }}>
          {/* Header chính - có cùng độ rộng với container chat */}
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-body bg-primary text-white py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-chat-dots me-2" viewBox="0 0 16 16">
                    <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                    <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
                  </svg>
                  <h4 className="mb-0 fw-bold">ChatBot AI</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Chat container */}
          <div className="card shadow-lg border-0 flex-grow-1">
            <div className="card-header bg-white py-3 border-bottom">
              <div className="d-flex align-items-center">
                <div className="position-relative me-3">
                  <div className="rounded-circle bg-primary d-flex justify-content-center align-items-center" style={{ width: "38px", height: "38px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" className="bi bi-robot" viewBox="0 0 16 16">
                      <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219z"/>
                      <path d="M4.468 10.068a.5.5 0 1 0-.866.5A4.498 4.498 0 0 0 8 12.5a4.5 4.5 0 0 0 4.398-2.432.5.5 0 0 0-.866-.5A3.5 3.5 0 0 1 8 11.5a3.498 3.498 0 0 1-3.532-1.432"/>
                      <path d="M8.5 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm4-5H9v-.5A1.5 1.5 0 0 0 7.5 0h-1A1.5 1.5 0 0 0 5 1.5V3H3.5A1.5 1.5 0 0 0 2 4.5v1.884a2.5 2.5 0 0 1-1.99 2.45A1.5 1.5 0 0 0 0 10.286V13.5A1.5 1.5 0 0 0 1.5 15h13a1.5 1.5 0 0 0 1.5-1.5V10.286a1.5 1.5 0 0 0-.874-1.358 2.5 2.5 0 0 1-1.94-2.3A1.5 1.5 0 0 0 11.5 5h-3zm-1-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5V3h-2z"/>
                    </svg>
                  </div>
                  <span className="position-absolute bottom-0 start-75 translate-middle p-1 bg-success border border-light rounded-circle">
            </span>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">Trợ lý HealthAI</h6>

                </div>
              </div>
            </div>

            <div className="border-0 p-3 mb-0 bg-white flex-grow-1" style={{
              overflowY: "auto",
              background: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\" fill=\"%23f1f5f8\" fill-opacity=\"0.68\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')",
              backgroundAttachment: "fixed"
            }}>
              {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-3 ${msg.sender === "user" ? "d-flex justify-content-end" : "d-flex justify-content-start"}`}>
                    <div className={`px-3 py-2 rounded-3 ${msg.sender === "user" ? "bg-primary text-white shadow-sm" : "bg-white shadow-sm border"}`}
                         style={{ maxWidth: "75%" }}>
                      <div className={`${msg.sender === "user" ? "text-white-50" : "text-muted"} small mb-1`}>
                        {msg.sender === "user" ? "Bạn" : "Bot"}
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  </div>
              ))}
            </div>

            <div className="card-footer" style={{
              background: "linear-gradient(to right, #f9f9f9, #ffffff, #f9f9f9)",
              borderTop: "1px solid rgba(0,0,0,0.05)"
            }}>
              <form onSubmit={handleSubmit} className="d-flex gap-2">
                <div className="input-group" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <input
                      type="text"
                      className="form-control border py-3"
                      placeholder="Nhập tin nhắn..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isStreaming}
                      style={{
                        background: "linear-gradient(to right, #ffffff, #f8f9fa)",
                        borderRight: "none"
                      }}
                  />
                  <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={isStreaming}
                      style={{
                        background: "linear-gradient(135deg, #007bff, #0056b3)",
                        border: "none"
                      }}
                  >
                    {isStreaming ?
                        <><span className="spinner-border spinner-border-sm me-1"></span> Đang gửi...</> :
                        <>
                          Gửi
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send ms-2" viewBox="0 0 16 16">
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                          </svg>
                        </>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

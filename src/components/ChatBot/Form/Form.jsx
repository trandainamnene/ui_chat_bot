import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane, faRobot, faMagnifyingGlass, faPlus, faChevronLeft, faCircleChevronDown, faComment, faUserCircle, faTimes , faTrash} from '@fortawesome/free-solid-svg-icons';
import FormLogin from "../../User/Form/FormLogin";
import List from "./List";

export default function ChatForm() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State để lưu hình ảnh được chọn
  const [recentChats, setRecentChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const inputFile = useRef();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowLogin(true);
      }

      fetch("http://localhost:8080/chat-history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status === 403) {
            setShowLogin(true);
            return [];
          }
          if (!response.ok) {
            throw new Error("Lỗi khi lấy dữ liệu lịch sử chat");
          }
          return response.json();
        })
        .then((data) => {
          setRecentChats(data);
        })
        .catch((error) => {
          console.error("Lỗi khi lấy lịch sử chat:", error);
          setRecentChats([]);
        });
    }, [showLogin]);


  const onHandleSubmitFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // Tạo URL tạm thời để xem trước
    }
    console.dir(e.target);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null); // Xóa hình ảnh đã chọn
    if (inputFile.current) {
      inputFile.current.value = ""; // Reset input file
    }
  };

  function onRemoveHistoryChat(selectedChat) {
    const jwtToken = localStorage.getItem("token");
    fetch(`http://localhost:8080/chat-history/${selectedChat}` , {
      method: "DELETE",
      headers : {
        "Content-Type" : "application/son",
        Authorization : `Bearer ${jwtToken}`
      }
    })
    .then(respone => setRecentChats(prev => prev.filter(e => e.idHistory != selectedChat)))
  }

  function checkValidToken(jwtToken) {
    const token = jwtToken;
    console.log("token ", token);
    if (!token) {
      setShowLogin(true);
      return false;
    } else {
      return fetch("http://localhost:8080/auth/check", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          if (response.status === 403) {
            setShowLogin(true);
          } else {
            return response.json();
          }
        })
        .then(status => status);
    }
  }

  async function createNewChatHistory(jwtToken, summary) {
    const response = await fetch("http://localhost:8080/chat-history", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: summary,
      })
    });

    if (!response.ok) {
      throw new Error("Lỗi khi tạo lịch sử chat mới");
    }

    const data = await response.json();
    return data.idHistory;
  }

  function createNewChat(e) {
    setSelectedChat(null);
    setMessages([]);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jwtToken = localStorage.getItem("token");
    console.log("jwt token from local storage : ", jwtToken);
    let isValidToken = await checkValidToken(jwtToken);
    console.log(`isValidToken ${isValidToken}`);
    if (!isValidToken) {
      return;
    }
    let currentChatId = selectedChat;
    if (!currentChatId) {
      try {
        const summary = await createSummary(input, jwtToken);
        const newChatId = await createNewChatHistory(jwtToken, summary);
        setSelectedChat(newChatId);
        currentChatId = newChatId;
      } catch (err) {
        console.log(err);
        console.error("Không thể tạo lịch sử chat mới:", err);
      }
    }

    if (!input.trim() && !inputFile.current?.files?.[0]) return;

    const file = inputFile.current?.files?.[0];

    const getImageBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    let userMessage = { sender: "user", text: input };
    if (file) {
      const base64 = await getImageBase64(file);
      userMessage = { ...userMessage, image: base64 };
    }
    if (messages.length == 0) {

    }
    setMessages((prev) => [...prev, userMessage, { sender: "bot", text: "" }]);
    setInput("");
    setSelectedImage(null); // Xóa hình ảnh xem trước sau khi gửi
    if (inputFile.current) {
      inputFile.current.value = ""; // Reset input file
    }
    setIsStreaming(true);
    let body = JSON.stringify({ question: input, image: null });

    if (file) {
      const base64 = await getImageBase64(file);
      body = JSON.stringify({
        question: input,
        image: {
          url: base64.split(',')[1],
          type: file.type
        }
      });
    }
    try {
      const res = await fetch("http://localhost:5000/generative_ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
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
      console.log("168 : ", input);
      insertChatToDb(currentChatId, jwtToken, input, accumulated)
    } catch (err) {
      console.log("error : ", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "bot", text: "Lỗi khi streaming." };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
    console.log(messages);
  };

  function insertChatToDb(idSelectedChat, jwtToken, question, answer) {
    console.log("JWT Token : ", jwtToken);
    const getInput = messages[messages.length - 1];
    fetch(`http://localhost:8080/question/${idSelectedChat}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(
        {

          questiontext: question,
          responsetext: answer,
          idHistory: {
            idHistory: idSelectedChat
          }
        }
      ),
    })
  }

  const fetchChatDetails = async (idHistory) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLogin(true);
      return;
    }
    console.log(idHistory)
    try {
      const response = await fetch(`http://localhost:8080/question/${idHistory}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 403) {
        setShowLogin(true);
        return;
      }
      if (!response.ok) {
        throw new Error("Lỗi khi lấy chi tiết chat");
      }
      const data = await response.json();
      // Chuyển đổi dữ liệu thành định dạng messages
      const chatMessages = data.map((item) => [
        { sender: "user", text: item.questiontext },
        { sender: "bot", text: item.responsetext }
      ]).flat();
      setMessages(chatMessages);
      setSelectedChat(idHistory)
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết chat:", error);
      setMessages([]);
    }
  };

  async function createSummary(input, jwtToken) {
    return fetch("http://localhost:5000/summarize", {
      method : "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: input,
        image: null
      })
    })
      .then(response => response.json())
      .then(result => result.answer)

  }

  return (
    <div className="app-container vw-100">
      {/* <List /> */}
      <FormLogin hidden={showLogin} setShowLogin={setShowLogin} />

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-header-left">
            <span className="icon logo-icon">
              <FontAwesomeIcon icon={faRobot} />
            </span>
            <input type="text" className="contents-input" placeholder="Content..." />
            <span className="icon item-icon">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
          </div>
          <div className="sidebar-header-right">
            <button className="icon-button search-icon" title="Thêm chat mới" onClick={createNewChat}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button className="icon-button plus-icon">
              <span className="icon item-icon">
                <FontAwesomeIcon icon={faChevronLeft} />
              </span>
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          <section className="nav-section">
            <div className="nav-section-header">
              <h3>
                <span className="icon item-icon">
                  <FontAwesomeIcon icon={faCircleChevronDown} />
                </span>
                History
              </h3>
            </div>
            <ul className="nav-list">
              {recentChats.length > 0 ? (
                recentChats.map((chat) => (
                  <li title={chat.summary} key={chat.idHistory} onClick={() => { fetchChatDetails(chat.idHistory) }} className={selectedChat == chat.idHistory ? "active" : ""}>
                    <span className="icon item-icon">
                      <FontAwesomeIcon icon={faComment} />
                    </span>
                    {chat.summary && chat.summary.length > 30
                      ? `${chat.summary.substring(0, 30)}...`
                      : chat.summary || "Không có tóm tắt"}
                    <span title="Xóa lịch sử chat" className="icon item-delete" onClick={function() {onRemoveHistoryChat(chat.idHistory)}}>
                      <FontAwesomeIcon icon={faTrash} />
                    </span>
                  </li>
                ))
              ) : (
                <li>Không có lịch sử chat. <span className="icon item-icon">
                      <FontAwesomeIcon icon={faTrash} />
                    </span></li>
              )}
            </ul>
          </section>
        </nav>
      </aside>

      <main className="main-content">
        <div className="main-content-header-icons">
          <button className="icon-button">
            <FontAwesomeIcon icon={faUserCircle} className="icon-user" />
          </button>
        </div>
        <div className="chat-area">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${msg.sender === "user" ? "initial-prompt-container" : "chat-response"}`}
            >
              <p className={msg.sender === "user" ? "user-prompt-question" : "chat-response"}>
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded"
                    style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", marginBottom: "8px" }}
                  />
                )}
                {msg.text}
              </p>
            </div>
          ))}
        </div>
        <div className="chat-input-area">
          <label htmlFor="img" className="icon-button file-button">
            <FontAwesomeIcon icon={faPaperclip} />
          </label>
          <input
            id="img"
            type="file"
            accept="image/png, image/jpeg"
            ref={inputFile}
            onChange={onHandleSubmitFile}
            style={{ display: "none" }}
          />
          <form onSubmit={handleSubmit} className="chat-input-form">
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="How can I help you?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isStreaming}
              />
              {selectedImage && (
                <div className="image-preview">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "4px", marginTop: "8px" }}
                  />
                  <button
                    type="button"
                    className="icon-button remove-image"
                    onClick={handleRemoveImage}
                    style={{ marginLeft: "8px" }}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="icon-button send-button"
              disabled={isStreaming}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

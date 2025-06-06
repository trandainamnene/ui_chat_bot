import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from './Form.module.css'
import {
  faPaperclip,
  faPaperPlane,
  faMagnifyingGlass,
  faPlus,
  faCircleChevronDown,
  faComment,
  faArrowDown,
  faUserDoctor,
  faTimes,
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import FormLogin from "./FormLogin.jsx";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea.jsx";
import ChatInput from "./ChatInput.jsx";
// Hằng số cho API và cấu hình
const API_URL = "http://localhost:8080";
const AI_URL = "http://localhost:8080/api/chat";
const TOKEN_KEY = "token";
const SCROLL_THRESHOLD = 10;

// Hàm tiện ích để gọi API với xác thực
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 403) {
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    throw new Error(`Lỗi HTTP! Mã trạng thái: ${response.status}`);
  }
  return response;
};




export default function ChatForm() {
  // Quản lý trạng thái
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchHistory, setSearchHistory] = useState("");
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Ref cho các phần tử DOM
  const chatAreaRef = useRef(null);
  const inputFileRef = useRef(null);
  const labelChatHistoryRef = useRef({});
  
  // Lấy lịch sử chat khi component mount hoặc trạng thái đăng nhập thay đổi
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setShowLogin(true);
    }
    fetchWithAuth(`${API_URL}/chat-history`)
      .then((response) => response.json())
      .then((data) => setRecentChats(data))
      .catch((error) => {
        console.error("Lỗi khi lấy lịch sử chat:", error);
        setRecentChats([]);
      });
  }, [showLogin, selectedChat]);

   // Sửa useEffect để chỉ cuộn khi người dùng không cuộn lên
  useEffect(() => {
    if (chatAreaRef.current && !isUserScrolling) {
      const isAtBottom =
        chatAreaRef.current.scrollHeight - chatAreaRef.current.scrollTop <=
        chatAreaRef.current.clientHeight + SCROLL_THRESHOLD;
      if (isAtBottom) {
        chatAreaRef.current.scrollTo({
          top: chatAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
        setShowScrollToBottom(false);
      }
    }
  }, [messages, selectedChat, isUserScrolling]);

  useEffect(() => {
    const chatArea = chatAreaRef.current;
    const handleScroll = () => {
      if (chatArea) {
        const isAtBottom =
          chatArea.scrollHeight - chatArea.scrollTop <=
          chatArea.clientHeight + SCROLL_THRESHOLD;
        setShowScrollToBottom(!isAtBottom);
        if (!isAtBottom && isStreaming) {
          setIsUserScrolling(true);
        } else if (isAtBottom) {
          setIsUserScrolling(false); 
        }
      }
    };

    chatArea?.addEventListener("scroll", handleScroll);
    return () => chatArea?.removeEventListener("scroll", handleScroll);
  }, [isStreaming]);

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollToBottom(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  const checkValidToken = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setShowLogin(true);
      return false;
    }
    try {
      const response = await fetchWithAuth(`${API_URL}/auth/check`, {
        method: "POST",
      });
      return await response.json();
    } catch {
      setShowLogin(true);
      return false;
    }
  };

  const createSummary = async (question) => {
    // const response = await fetchWithAuth(`${AI_URL}/summarize`, {
    //   method: "POST",
    //   body: JSON.stringify({ question, image: null }),
    // });
    // const { answer } = await response.json();
    return "123123";
  };

  const createNewChatHistory = async (summary) => {
    const response = await fetchWithAuth(`${API_URL}/chat-history`, {
      method: "POST",
      body: JSON.stringify({ summary }),
    });
    const { idHistory } = await response.json();
    return idHistory;
  };

  const createNewChat = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  const fetchChatDetails = async (idHistory) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/question/${idHistory}`);
      const data = await response.json();
      const chatMessages = data
        .map((item) => [
          { sender: "user", text: item.questiontext, image: item.base64URLImage },
          { sender: "bot", text: item.responsetext },
        ])
        .flat();
      setMessages(chatMessages);
      setSelectedChat(idHistory);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết chat:", error);
      setMessages([]);
      if (error.message === "Unauthorized") setShowLogin(true);
    }
  };

  const insertChatToDb = async (idHistory, question, answer, base64Image) => {
    await fetchWithAuth(`${API_URL}/question/${idHistory}`, {
      method: "POST",
      body: JSON.stringify({
        questiontext: question,
        responsetext: answer,
        base64URLImage: base64Image,
        idHistory: { idHistory },
      }),
    });
  };

  const handleRemoveHistoryChat = async (idHistory) => {
    try {
      await fetchWithAuth(`${API_URL}/chat-history/${idHistory}`, {
        method: "DELETE",
      });
      setRecentChats((prev) => prev.filter((chat) => chat.idHistory !== idHistory));
      setMessages([]);
      setSelectedChat(null);
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử chat:", error);
    }
  };

  const handleEditLabelChatHistory = (idHistory) => {
    const element = labelChatHistoryRef.current[idHistory];
    if (element) {
      element.contentEditable = true;
      element.focus();
    }
  };

  const handleKeydownLabelHistory = (idHistory, e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchWithAuth(`${API_URL}/chat-history/${idHistory}`, {
        method: "PATCH",
        body: JSON.stringify({ summary: e.target.innerText }),
      }).then(() => e.target.blur());
    }
  };

  const getImageBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !inputFileRef.current?.files?.[0]) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!(await checkValidToken())) return;

    let currentChatId = selectedChat;
    if (!currentChatId) {
      try {
        const summary = await createSummary(input, token);
        currentChatId = await createNewChatHistory(summary);
        setSelectedChat(currentChatId);
      } catch (error) {
        console.error("Lỗi khi tạo lịch sử chat mới:", error);
        return;
      }
    }

    const file = inputFileRef.current?.files?.[0];
    let userMessage = { sender: "user", text: input };
    let base64Image = null;
    console.log(file);

    if (file) {
      base64Image = await getImageBase64(file);
      userMessage = { ...userMessage, image: base64Image };
    }

    setMessages((prev) => [...prev, userMessage, { sender: "bot", text: "" }]);
    setInput("");
    setSelectedImage(null);
    if (inputFileRef.current) inputFileRef.current.value = "";
    setIsStreaming(true);

    const body = JSON.stringify({
      question: input,
      image: file ? { url: base64Image.split(",")[1], type: file.type } : null,
    });

    try {
      const response = await fetch(`${AI_URL}/generative_ai/${currentChatId}`, {
        method: "POST",
        headers: { 
          Authorization : `Bearer ${token}`,
          Accept: "text/event-stream",
          "Content-Type": "application/json"
        },
        body : body,
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "bot", text: accumulated };
          return updated;
        });
      }

      await insertChatToDb(currentChatId, input, accumulated, base64Image);
    } catch (error) {
      console.error("Lỗi khi streaming:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "bot",
          text: error.message === "Unauthorized" ? "Không có quyền truy cập. Vui lòng đăng nhập lại." : "Lỗi khi streaming.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setShowLogin(true);
  };

  return (
    <div className="app-container vw-100">
      <FormLogin hidden={showLogin} setShowLogin={setShowLogin} />
      <Sidebar
        recentChats={recentChats}
        selectedChat={selectedChat}
        searchHistory={searchHistory}
        setSearchHistory={setSearchHistory}
        fetchChatDetails={fetchChatDetails}
        handleRemoveHistoryChat={handleRemoveHistoryChat}
        handleEditLabelChatHistory={handleEditLabelChatHistory}
        handleKeydownLabelHistory={handleKeydownLabelHistory}
        createNewChat={createNewChat}
        labelChatHistoryRef={labelChatHistoryRef}
      />
      <main className="main-content">
        <h1 className="main-content__heading">
          {messages.length > 0 ? "" : <div className={style['rgb-text']}>CHAT BOT HỖ TRỢ BÁC SỸ ĐƯA RA QUYẾT ĐỊNH LÂM SÀNG</div>}
        </h1>
        <div className="main-content-header-icons">
          <button className="icon-button main-content__log-out" onClick={handleLogout}>
            {showLogin ? "" : "Đăng xuất"}
          </button>
        </div>
        <ChatArea
          messages={messages}
          showScrollToBottom={showScrollToBottom}
          scrollToBottom={scrollToBottom}
          chatAreaRef={chatAreaRef}
          isStreaming={isStreaming}
        />
        <ChatInput
          input={input}
          setInput={setInput}
          isStreaming={isStreaming}
          selectedImage={selectedImage}
          handleFileChange={handleFileChange}
          handleRemoveImage={handleRemoveImage}
          handleSubmit={handleSubmit}
          inputFileRef={inputFileRef}
        />
      </main>
    </div>
  );
}
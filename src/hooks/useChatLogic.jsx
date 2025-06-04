import { useEffect, useRef, useState } from 'react';
import {
  fetchChatHistory,
  deleteChatHistory,
  createChatHistory,
  updateChatHistory,
  fetchChatDetails,
  insertChatToDb,
  checkValidToken,
  createSummary,
  sendMessageToAI,
} from '../api';

const useChatApi = (token) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChats = async () => {
    if (!token) return { status: 403, data: [] };
    setIsLoading(true);
    try {
      const result = await fetchChatHistory(token);
      return result;
    } catch (err) {
      setError('Lỗi khi lấy lịch sử chat');
      return { status: 500, data: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await deleteChatHistory(chatId, token);
    } catch (err) {
      setError('Lỗi khi xóa chat');
    } finally {
      setIsLoading(false);
    }
  };

  const createChat = async (summary) => {
    if (!token) return null;
    setIsLoading(true);
    try {
      const result = await createChatHistory(summary, token);
      return result.idHistory;
    } catch (err) {
      setError('Lỗi khi tạo chat mới');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateChat = async (chatId, summary) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await updateChatHistory(chatId, summary, token);
    } catch (err) {
      setError('Lỗi khi cập nhật tóm tắt');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChat = async (chatId) => {
    if (!token) return { status: 403, data: [] };
    setIsLoading(true);
    try {
      const result = await fetchChatDetails(chatId, token);
      return result;
    } catch (err) {
      setError('Lỗi khi lấy chi tiết chat');
      return { status: 500, data: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const saveChat = async (chatId, question, answer) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await insertChatToDb(chatId, question, answer, token);
    } catch (err) {
      setError('Lỗi khi lưu chat vào cơ sở dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async () => {
    if (!token) return { status: 403, valid: false };
    try {
      const result = await checkValidToken(token);
      return result;
    } catch (err) {
      setError('Lỗi khi kiểm tra token');
      return { status: 500, valid: false };
    }
  };

  const summarize = async (input) => {
    if (!token) return null;
    try {
      return await createSummary(input, token);
    } catch (err) {
      setError('Lỗi khi tạo tóm tắt');
      return null;
    }
  };

  const sendMessage = async (input, file) => {
    try {
      return await sendMessageToAI(input, file, token);
    } catch (err) {
      setError('Lỗi khi gửi tin nhắn đến AI');
      return null;
    }
  };

  return {
    fetchChats,
    deleteChat,
    createChat,
    updateChat,
    fetchChat,
    saveChat,
    validateToken,
    summarize,
    sendMessage,
    isLoading,
    error,
  };
};

export const useChatLogic = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchHistory, setSearchHistory] = useState('');
  const labelChatHistory = useRef({});
  const inputFile = useRef(null);
  const historyChatList = useRef([]);
  const token = localStorage.getItem('token');
  const {
    fetchChats,
    deleteChat,
    createChat,
    updateChat,
    fetchChat,
    saveChat,
    validateToken,
    summarize,
    sendMessage,
    isLoading,
    error,
  } = useChatApi(token);

  useEffect(() => {
    console.log("re-render");
    if (!token) {
      setShowLogin(true);
      return;
    }

    let isMounted = true;

    const initializeChats = async () => {
      const { status, data } = await fetchChats();
      if (isMounted) {
        if (status === 403) {
          setShowLogin(true);
        } else {
          setRecentChats(data);
          historyChatList.current = data;
        }
      }
    };

    initializeChats();

    return () => {
      isMounted = false;
    };
  }, [showLogin]);

  const handleSubmitFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (inputFile.current) {
      inputFile.current.value = '';
    }
  };

  const handleDeleteChat = async (chatId) => {
    await deleteChat(chatId);
    setRecentChats((prev) => prev.filter((c) => c.idHistory !== chatId));
    if (selectedChat === chatId) {
      setSelectedChat(null);
      setMessages([]);
    }
  };

  const handleCreateNewChat = () => {
    setSelectedChat(null);
    setMessages([]);
    setInput('');
    setSelectedImage(null);
  };

  const handleEditLabel = (chatId) => {
    console.log(chatId);
    console.log(labelChatHistory.current[chatId])
    if (labelChatHistory.current[chatId]) {
      labelChatHistory.current[chatId].contentEditable = true;
      labelChatHistory.current[chatId].focus();
    }
  };

  const handleKeydownLabel = async (chatId, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newSummary = e.target.innerText;
      await updateChat(chatId, newSummary);
      setRecentChats((prev) =>
        prev.map((chat) =>
          chat.idHistory === chatId ? { ...chat, summary: newSummary } : chat
        )
      );
      e.target.blur();
    }
  };

  const handleSelectChat = async (chatId) => {
    console.log('handle selected chat')
    const { status, data } = await fetchChat(chatId);
    if (status === 403) {
      setShowLogin(true);
      return;
    }
    const chatMessages = data
      .map((item) => [
        { sender: 'user', text: item.questiontext },
        { sender: 'bot', text: item.responsetext },
      ])
      .flat();
    setMessages(chatMessages);
    setSelectedChat(chatId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !inputFile.current?.files?.[0]) return;

    const { valid } = await validateToken();
    if (!valid) {
      setShowLogin(true);
      return;
    }

    let currentChatId = selectedChat;
    if (!currentChatId) {
      const summary = await summarize(input);
      if (summary) {
        currentChatId = await createChat(summary);
        setSelectedChat(currentChatId);
        setRecentChats((prev) => [
          { idHistory: currentChatId, summary },
          ...prev,
        ]);
      } else {
        return;
      }
    }

    const file = inputFile.current?.files?.[0];
    let userMessage = { sender: 'user', text: input };
    if (file) {
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      userMessage = { ...userMessage, image: base64 };
    }

    setMessages((prev) => [...prev, userMessage, { sender: 'bot', text: '' }]);
    setInput('');
    setSelectedImage(null);
    if (inputFile.current) {
      inputFile.current.value = '';
    }
    setIsStreaming(true);

    try {
      const reader = await sendMessage(input, file ? { base64, type: file.type } : null);
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: 'bot', text: accumulated };
          return updated;
        });
      }

      await saveChat(currentChatId, input, accumulated);
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: 'bot', text: 'Lỗi khi streaming.' };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setShowLogin(true);
    setMessages([]);
    setSelectedChat(null);
    setRecentChats([]);
  };

  return {
    input,
    setInput,
    messages,
    setMessages,
    isStreaming,
    showLogin,
    setShowLogin,
    selectedImage,
    setSelectedImage,
    recentChats,
    selectedChat,
    setSelectedChat,
    searchHistory,
    setSearchHistory,
    labelChatHistory,
    inputFile,
    isLoading,
    error,
    handleSubmitFile,
    handleRemoveImage,
    handleDeleteChat,
    handleCreateNewChat,
    handleEditLabel,
    handleKeydownLabel,
    handleSelectChat,
    handleSubmit,
    handleLogout,
  };
};